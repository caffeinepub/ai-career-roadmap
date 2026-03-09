import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetCareerPaths() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["careerPaths"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCareerPaths();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCourses() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCourses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCourseDetails(courseId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["courseDetails", courseId?.toString()],
    queryFn: async () => {
      if (!actor || courseId === null) return null;
      return actor.getCourseDetails(courseId);
    },
    enabled: !!actor && !isFetching && courseId !== null,
  });
}

export function useGetCallerEnrollments() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerEnrollments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCertificates() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCertificates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      grade: string;
      interests: string[];
      assessmentInterests: string[];
      subjectScores: [string, bigint][];
      skillRatings: [string, bigint][];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(
        params.name,
        params.grade,
        params.interests,
        params.assessmentInterests,
        params.subjectScores,
        params.skillRatings,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useEnrollInCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.enrollInCourse(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
}

export function useCompleteLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { courseId: bigint; lessonId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.completeLesson(params.courseId, params.lessonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
}
