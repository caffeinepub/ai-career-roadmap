import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, BookOpen, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { UserProfileView } from "../backend.d";
import { ProgressRing } from "../components/ProgressRing";
import {
  useGetCallerEnrollments,
  useGetCareerPaths,
  useGetCertificates,
  useGetCourses,
} from "../hooks/useQueries";

interface DashboardPageProps {
  profile: UserProfileView;
  onNavigate: (page: "courses" | "certificates") => void;
  onNavigateToCourse: (courseId: bigint) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function DashboardPage({
  profile,
  onNavigate,
  onNavigateToCourse,
}: DashboardPageProps) {
  const { data: careerPaths, isLoading: loadingCareers } = useGetCareerPaths();
  const { data: courses, isLoading: loadingCourses } = useGetCourses();
  const { data: enrollments } = useGetCallerEnrollments();
  const { data: certificates } = useGetCertificates();

  const enrolledCourses = (courses ?? []).filter((c) =>
    (enrollments ?? []).some((e) => e.courseId === c.id),
  );

  const getCourseProgress = (courseId: bigint) => {
    const enrollment = (enrollments ?? []).find((e) => e.courseId === courseId);
    const course = (courses ?? []).find((c) => c.id === courseId);
    if (!enrollment || !course || course.lessons.length === 0) return 0;
    return Math.round(
      (enrollment.completedLessons.length / course.lessons.length) * 100,
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      {/* Hero welcome */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-2xl overflow-hidden p-8 glass-bright"
      >
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-bg.dim_1600x900.jpg')",
          }}
        />
        <div className="relative z-10">
          <p className="text-sm font-mono uppercase tracking-widest text-primary/70 mb-1">
            Welcome back
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold gradient-text">
            {profile.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {profile.grade} • Your AI-powered career roadmap awaits
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {(profile.interests ?? []).slice(0, 4).map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
                className="bg-primary/15 text-primary border-primary/30 text-xs"
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
        <div
          className="absolute right-8 top-8 opacity-20"
          style={{ animation: "spin-slow 20s linear infinite" }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            aria-hidden="true"
          >
            <title>Decorative rings</title>
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="oklch(0.72 0.19 194)"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
            <circle
              cx="60"
              cy="60"
              r="35"
              fill="none"
              stroke="oklch(0.65 0.22 280)"
              strokeWidth="1"
              strokeDasharray="3 6"
            />
          </svg>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          {
            label: "Interests",
            value: profile.interests?.length ?? 0,
            icon: Sparkles,
            color: "text-primary",
          },
          {
            label: "Career Paths",
            value: careerPaths?.length ?? 0,
            icon: TrendingUp,
            color: "text-accent",
          },
          {
            label: "Enrolled Courses",
            value: enrolledCourses.length,
            icon: BookOpen,
            color: "text-chart-2",
          },
          {
            label: "Certificates",
            value: certificates?.length ?? 0,
            icon: Award,
            color: "text-chart-5",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-xl p-4 flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Career Paths */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold gradient-text flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Career Paths
          </h2>
        </div>

        {loadingCareers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-40 rounded-2xl"
                data-ocid="dashboard.career.loading_state"
              />
            ))}
          </div>
        ) : !careerPaths?.length ? (
          <div
            data-ocid="dashboard.career.empty_state"
            className="glass rounded-2xl p-10 text-center"
          >
            <TrendingUp className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              No career paths yet
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Check back soon — we're mapping your future!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {careerPaths.map((path, i) => (
              <motion.div
                key={path.title}
                data-ocid={`dashboard.career.item.${i + 1}`}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="glass rounded-2xl p-6 glow-cyan cursor-default"
              >
                <h3 className="font-display font-bold text-lg text-foreground">
                  {path.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {path.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {path.requiredSkills.slice(0, 4).map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="text-xs border-primary/30 text-primary/80"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {path.requiredSkills.length > 4 && (
                    <Badge
                      variant="outline"
                      className="text-xs border-muted text-muted-foreground"
                    >
                      +{path.requiredSkills.length - 4}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Enrolled courses */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold gradient-text flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> My Courses
          </h2>
          <Button
            data-ocid="dashboard.courses.button"
            variant="outline"
            size="sm"
            onClick={() => onNavigate("courses")}
            className="border-primary/30 text-primary hover:bg-primary/10 text-sm"
          >
            Browse All
          </Button>
        </div>

        {loadingCourses ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton
                key={i}
                className="h-24 rounded-xl"
                data-ocid="dashboard.courses.loading_state"
              />
            ))}
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div
            data-ocid="dashboard.courses.empty_state"
            className="glass rounded-2xl p-10 text-center"
          >
            <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              No enrolled courses yet
            </p>
            <Button
              data-ocid="dashboard.enroll.primary_button"
              onClick={() => onNavigate("courses")}
              className="mt-4 bg-primary text-primary-foreground glow-cyan"
              size="sm"
            >
              Explore Courses
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {enrolledCourses.map((course, i) => {
              const progress = getCourseProgress(course.id);
              return (
                <motion.button
                  key={course.id.toString()}
                  type="button"
                  data-ocid={`dashboard.course.item.${i + 1}`}
                  whileHover={{ x: 4 }}
                  onClick={() => onNavigateToCourse(course.id)}
                  className="w-full glass rounded-xl p-4 flex items-center gap-4 text-left hover:border-primary/30 transition-all"
                >
                  <ProgressRing
                    progress={progress}
                    size={56}
                    strokeWidth={5}
                    label={`${progress}%`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-foreground truncate">
                      {course.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {course.relatedCareer}
                    </p>
                  </div>
                  {progress === 100 && (
                    <Badge className="bg-chart-5/20 text-chart-5 border-chart-5/30 shrink-0">
                      Complete
                    </Badge>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* Certificates summary */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold gradient-text flex items-center gap-2">
            <Award className="w-5 h-5" /> Certificates
          </h2>
          <Button
            data-ocid="dashboard.certificates.button"
            variant="outline"
            size="sm"
            onClick={() => onNavigate("certificates")}
            className="border-primary/30 text-primary hover:bg-primary/10 text-sm"
          >
            View All
          </Button>
        </div>
        {!certificates?.length ? (
          <div
            data-ocid="dashboard.certificates.empty_state"
            className="glass rounded-2xl p-8 text-center"
          >
            <Award className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              No certificates yet
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Complete a course to earn your first certificate!
            </p>
          </div>
        ) : (
          <div className="glass rounded-xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-chart-5/20 border border-chart-5/30 flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-chart-5">
                {certificates.length}
              </span>
            </div>
            <div>
              <p className="font-display font-semibold text-foreground">
                You've earned {certificates.length} certificate
                {certificates.length !== 1 ? "s" : ""}!
              </p>
              <p className="text-sm text-muted-foreground">
                Keep going to unlock more
              </p>
            </div>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}
