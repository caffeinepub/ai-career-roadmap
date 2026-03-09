import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Award,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProgressRing } from "../components/ProgressRing";
import {
  useCompleteLesson,
  useEnrollInCourse,
  useGetCallerEnrollments,
  useGetCourseDetails,
} from "../hooks/useQueries";

interface CourseDetailPageProps {
  courseId: bigint;
  onBack: () => void;
}

export function CourseDetailPage({ courseId, onBack }: CourseDetailPageProps) {
  const { data: course, isLoading } = useGetCourseDetails(courseId);
  const { data: enrollments } = useGetCallerEnrollments();
  const completeLesson = useCompleteLesson();
  const enroll = useEnrollInCourse();
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevProgress, setPrevProgress] = useState(0);

  const enrollment = (enrollments ?? []).find((e) => e.courseId === courseId);
  const completedIds = enrollment?.completedLessons ?? [];
  const totalLessons = course?.lessons.length ?? 0;
  const progress =
    totalLessons > 0
      ? Math.round((completedIds.length / totalLessons) * 100)
      : 0;
  const isEnrolled = !!enrollment;

  useEffect(() => {
    if (progress === 100 && prevProgress < 100 && prevProgress > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
    }
    setPrevProgress(progress);
  }, [progress, prevProgress]);

  const handleCompleteLesson = async (lessonId: bigint) => {
    try {
      await completeLesson.mutateAsync({ courseId, lessonId });
    } catch {
      toast.error("Failed to mark lesson complete.");
    }
  };

  const handleEnroll = async () => {
    try {
      await enroll.mutateAsync(courseId);
      toast.success("Enrolled successfully!");
    } catch {
      toast.error("Failed to enroll.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" data-ocid="course-detail.loading_state">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 rounded-2xl" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div
        data-ocid="course-detail.error_state"
        className="glass rounded-2xl p-16 text-center"
      >
        <p className="text-muted-foreground">Course not found.</p>
        <Button onClick={onBack} className="mt-4" variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md"
          >
            <div className="glass-bright rounded-3xl p-10 text-center max-w-sm mx-4">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="text-6xl mb-4"
              >
                🎓
              </motion.div>
              <h2 className="text-3xl font-display font-bold gradient-text">
                Course Complete!
              </h2>
              <p className="text-muted-foreground mt-2">
                Your certificate has been issued. Congratulations!
              </p>
              <Award className="w-12 h-12 text-chart-5 mx-auto mt-4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <Button
        data-ocid="course-detail.back.button"
        variant="ghost"
        onClick={onBack}
        className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Courses
      </Button>

      {/* Course header */}
      <div className="glass-bright rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex-1">
            <Badge
              variant="outline"
              className="border-accent/30 text-accent/80 mb-3"
            >
              {course.relatedCareer}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              {course.title}
            </h1>
            <p className="text-muted-foreground mt-2">{course.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                {course.lessons.length} lessons
              </div>
              {progress === 100 && (
                <Badge className="bg-chart-5/15 text-chart-5 border-chart-5/30 gap-1">
                  <Sparkles className="w-3 h-3" /> Completed
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProgressRing
              progress={progress}
              size={96}
              strokeWidth={7}
              label={`${progress}%`}
              sublabel="done"
            />
            <p className="text-xs text-muted-foreground">
              {completedIds.length}/{course.lessons.length} lessons
            </p>
          </div>
        </div>

        {!isEnrolled && (
          <div className="mt-6 pt-6 border-t border-border/40">
            <Button
              data-ocid="course-detail.enroll.primary_button"
              onClick={handleEnroll}
              disabled={enroll.isPending}
              className="bg-primary text-primary-foreground glow-cyan font-semibold gap-2"
            >
              {enroll.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Enroll to Start Learning
            </Button>
          </div>
        )}
      </div>

      {/* Lessons list */}
      <div className="space-y-3">
        <h2 className="font-display font-bold text-lg text-foreground">
          Lessons
        </h2>
        {course.lessons.length === 0 ? (
          <div
            data-ocid="course-detail.lessons.empty_state"
            className="glass rounded-xl p-8 text-center"
          >
            <p className="text-muted-foreground">No lessons added yet.</p>
          </div>
        ) : (
          course.lessons.map((lesson, i) => {
            const isCompleted = completedIds.some((id) => id === lesson.id);
            const isLocked = !isEnrolled;
            return (
              <motion.div
                key={lesson.id.toString()}
                data-ocid={`course-detail.lesson.item.${i + 1}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass rounded-xl p-4 flex items-center gap-4 ${
                  isCompleted ? "border-chart-5/30" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    isCompleted
                      ? "bg-chart-5/20 border-chart-5/40"
                      : isLocked
                        ? "bg-muted/50 border-border/40"
                        : "bg-primary/15 border-primary/30"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-chart-5" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3 text-muted-foreground/50" />
                  ) : (
                    <span className="text-xs font-mono font-bold text-primary">
                      {i + 1}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm truncate ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}
                  >
                    {lesson.title}
                  </p>
                  {lesson.content && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {lesson.content}
                    </p>
                  )}
                </div>

                {isEnrolled && !isCompleted && (
                  <Button
                    data-ocid={`course-detail.lesson.button.${i + 1}`}
                    size="sm"
                    variant="outline"
                    onClick={() => handleCompleteLesson(lesson.id)}
                    disabled={completeLesson.isPending}
                    className="shrink-0 border-primary/30 text-primary hover:bg-primary/10 text-xs"
                  >
                    {completeLesson.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Mark Done"
                    )}
                  </Button>
                )}
                {isCompleted && (
                  <Badge className="bg-chart-5/15 text-chart-5 border-chart-5/20 text-xs shrink-0">
                    Done
                  </Badge>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
