import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  useEnrollInCourse,
  useGetCallerEnrollments,
  useGetCourses,
} from "../hooks/useQueries";

interface CoursesPageProps {
  onNavigateToCourse: (courseId: bigint) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function CoursesPage({ onNavigateToCourse }: CoursesPageProps) {
  const { data: courses, isLoading } = useGetCourses();
  const { data: enrollments } = useGetCallerEnrollments();
  const enroll = useEnrollInCourse();

  const isEnrolled = (courseId: bigint) =>
    (enrollments ?? []).some((e) => e.courseId === courseId);

  const handleEnroll = async (courseId: bigint, title: string) => {
    try {
      await enroll.mutateAsync(courseId);
      toast.success(`Enrolled in "${title}"!`);
    } catch {
      toast.error("Failed to enroll. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold gradient-text">
          Available Courses
        </h1>
        <p className="text-muted-foreground mt-1">
          Enroll in curated courses tailored to your career goals
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className="h-52 rounded-2xl"
              data-ocid="courses.loading_state"
            />
          ))}
        </div>
      ) : !courses?.length ? (
        <div
          data-ocid="courses.empty_state"
          className="glass rounded-2xl p-16 text-center"
        >
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-lg font-display font-semibold text-muted-foreground">
            No courses available yet
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            The curriculum is being prepared — check back soon!
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {courses.map((course, i) => {
            const enrolled = isEnrolled(course.id);
            return (
              <motion.div
                key={course.id.toString()}
                variants={itemVariants}
                data-ocid={`courses.course.item.${i + 1}`}
                className="glass rounded-2xl p-6 flex flex-col gap-4 hover:border-primary/30 transition-all group"
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  {enrolled && (
                    <Badge className="bg-chart-5/15 text-chart-5 border-chart-5/30 text-xs gap-1">
                      <CheckCircle className="w-3 h-3" /> Enrolled
                    </Badge>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-display font-bold text-foreground text-lg leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Badge
                      variant="outline"
                      className="text-xs border-accent/30 text-accent/80"
                    >
                      {course.relatedCareer}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {course.lessons.length} lessons
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {enrolled ? (
                    <Button
                      data-ocid={`courses.course.button.${i + 1}`}
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateToCourse(course.id)}
                      className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      Continue Learning
                    </Button>
                  ) : (
                    <Button
                      data-ocid={`courses.enroll.button.${i + 1}`}
                      size="sm"
                      onClick={() => handleEnroll(course.id, course.title)}
                      disabled={enroll.isPending}
                      className="flex-1 bg-primary text-primary-foreground glow-cyan hover:opacity-90"
                    >
                      {enroll.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Enroll Now"
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
