import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CertificateView {
    issueDate: Time;
    studentName: string;
    courseName: string;
}
export type Time = bigint;
export interface Lesson {
    id: bigint;
    title: string;
    content: string;
}
export interface EnrollmentView {
    completedLessons: Array<bigint>;
    courseId: bigint;
}
export interface UserProfileView {
    assessments: {
        interests: Array<string>;
        skillRatings: Array<[string, bigint]>;
        subjectScores: Array<[string, bigint]>;
    };
    interests: Array<string>;
    name: string;
    grade: string;
}
export interface CareerPath {
    title: string;
    description: string;
    requiredSkills: Array<string>;
}
export interface Course {
    id: bigint;
    title: string;
    description: string;
    lessons: Array<Lesson>;
    relatedCareer: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCareerPath(title: string, description: string, requiredSkills: Array<string>): Promise<void>;
    addCourse(title: string, description: string, relatedCareer: string): Promise<bigint>;
    addLessonToCourse(courseId: bigint, title: string, content: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeLesson(courseId: bigint, lessonId: bigint): Promise<void>;
    enrollInCourse(courseId: bigint): Promise<void>;
    getCallerEnrollments(): Promise<Array<EnrollmentView>>;
    getCallerProfile(): Promise<UserProfileView | null>;
    getCallerUserProfile(): Promise<UserProfileView | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCareerPaths(): Promise<Array<CareerPath>>;
    getCertificates(): Promise<Array<CertificateView>>;
    getCourseDetails(courseId: bigint): Promise<Course | null>;
    getCourses(): Promise<Array<Course>>;
    getEnrollment(courseId: bigint): Promise<EnrollmentView | null>;
    getUserProfile(user: Principal): Promise<UserProfileView | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(name: string, grade: string, interests: Array<string>, assessmentInterests: Array<string>, subjectScores: Array<[string, bigint]>, skillRatings: Array<[string, bigint]>): Promise<void>;
    saveStudentProfile(name: string, grade: string, interests: Array<string>): Promise<void>;
    updateAssessments(interests: Array<string>, subjectScores: Array<[string, bigint]>, skillRatings: Array<[string, bigint]>): Promise<void>;
}
