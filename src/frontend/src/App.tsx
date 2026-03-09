import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { Layout, LoginPrompt } from "./components/Layout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerProfile } from "./hooks/useQueries";
import { CertificatesPage } from "./pages/CertificatesPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { CoursesPage } from "./pages/CoursesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OnboardingPage } from "./pages/OnboardingPage";

type Page = "dashboard" | "courses" | "certificates";

export default function App() {
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = loginStatus === "success" && !!identity;

  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useGetCallerProfile();

  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState<bigint | null>(null);

  // If user is authenticated and profile exists, stay on dashboard
  // else show onboarding
  const showOnboarding = isAuthenticated && !profileLoading && !profile;
  const showDashboard = isAuthenticated && !profileLoading && !!profile;

  const handleOnboardingComplete = () => {
    refetchProfile();
  };

  const handleNavigateToCourse = (courseId: bigint) => {
    setSelectedCourseId(courseId);
  };

  // If loading, show skeleton
  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-8">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-40 rounded-2xl mt-8" />
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LoginPrompt onLogin={login} />
        <Toaster richColors position="top-center" />
      </>
    );
  }

  // Onboarding
  if (showOnboarding) {
    return (
      <>
        <OnboardingPage onComplete={handleOnboardingComplete} />
        <Toaster richColors position="top-center" />
      </>
    );
  }

  // Main app
  if (showDashboard) {
    return (
      <>
        <Layout
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
            setSelectedCourseId(null);
          }}
        >
          {selectedCourseId !== null ? (
            <CourseDetailPage
              courseId={selectedCourseId}
              onBack={() => setSelectedCourseId(null)}
            />
          ) : currentPage === "dashboard" ? (
            <DashboardPage
              profile={profile!}
              onNavigate={(page) => setCurrentPage(page)}
              onNavigateToCourse={handleNavigateToCourse}
            />
          ) : currentPage === "courses" ? (
            <CoursesPage onNavigateToCourse={handleNavigateToCourse} />
          ) : (
            <CertificatesPage />
          )}
        </Layout>
        <Toaster richColors position="top-center" />
      </>
    );
  }

  return null;
}
