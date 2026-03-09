import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type AssessmentResults = {
    interests : [Text];
    subjectScores : Map.Map<Text, Nat>;
    skillRatings : Map.Map<Text, Nat>;
  };

  type Enrollment = {
    courseId : Nat;
    completedLessons : Set.Set<Nat>;
  };

  module Enrollment {
    public func compareByCourseId(a : Enrollment, b : Enrollment) : Order.Order {
      Nat.compare(a.courseId, b.courseId);
    };
  };

  type UserProfile = {
    name : Text;
    grade : Text;
    interests : [Text];
    assessments : AssessmentResults;
  };

  type UserProfileView = {
    name : Text;
    grade : Text;
    interests : [Text];
    assessments : {
      interests : [Text];
      subjectScores : [(Text, Nat)];
      skillRatings : [(Text, Nat)];
    };
  };

  type CareerPath = {
    title : Text;
    description : Text;
    requiredSkills : [Text];
  };

  type RecommendedCareer = {
    careerPath : CareerPath;
    matchPercentage : Nat;
  };

  type Course = {
    id : Nat;
    title : Text;
    description : Text;
    relatedCareer : Text;
    lessons : [Lesson];
  };

  type Lesson = {
    id : Nat;
    title : Text;
    content : Text;
  };

  type EnrollmentView = {
    courseId : Nat;
    completedLessons : [Nat];
  };

  type CertificateView = {
    studentName : Text;
    courseName : Text;
    issueDate : Time.Time;
  };

  type EnrollmentList = {
    enrollments : List.List<Enrollment>;
  };

  type CertificateList = {
    certificates : List.List<CertificateView>;
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let careerPaths = Map.empty<Text, CareerPath>();
  let courses = Map.empty<Nat, Course>();
  let enrollments = Map.empty<Principal, List.List<Enrollment>>();
  let certificates = Map.empty<Principal, List.List<CertificateView>>();
  var nextCourseId = 1 : Nat;
  var nextLessonId = 1 : Nat;

  // Prefabricated authentication system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfileView {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller).map(func(p) { toUserProfileView(p) });
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfileView {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user).map(func(p) { toUserProfileView(p) });
  };

  public shared ({ caller }) func saveCallerUserProfile(name : Text, grade : Text, interests : [Text], assessmentInterests : [Text], subjectScores : [(Text, Nat)], skillRatings : [(Text, Nat)]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let assessments : AssessmentResults = {
      interests = assessmentInterests;
      subjectScores = Map.fromIter<Text, Nat>(subjectScores.values());
      skillRatings = Map.fromIter<Text, Nat>(skillRatings.values());
    };
    let profile : UserProfile = {
      name;
      grade;
      interests;
      assessments;
    };
    userProfiles.add(caller, profile);
  };

  // Student Profile Management (Application-specific)
  public shared ({ caller }) func saveStudentProfile(name : Text, grade : Text, interests : [Text]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let profile : UserProfile = {
      name;
      grade;
      interests;
      assessments = {
        interests = [];
        subjectScores = Map.empty<Text, Nat>();
        skillRatings = Map.empty<Text, Nat>();
      };
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateAssessments(interests : [Text], subjectScores : [(Text, Nat)], skillRatings : [(Text, Nat)]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update assessments");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        let updatedAssessments : AssessmentResults = {
          interests;
          subjectScores = Map.fromIter<Text, Nat>(subjectScores.values());
          skillRatings = Map.fromIter<Text, Nat>(skillRatings.values());
        };
        let updatedProfile : UserProfile = {
          name = profile.name;
          grade = profile.grade;
          interests = profile.interests;
          assessments = updatedAssessments;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // Career Path Management (Admin Only)
  public shared ({ caller }) func addCareerPath(title : Text, description : Text, requiredSkills : [Text]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add career paths");
    };
    let careerPath : CareerPath = {
      title;
      description;
      requiredSkills;
    };
    careerPaths.add(title, careerPath);
  };

  // Course Management (Admin Only)
  public shared ({ caller }) func addCourse(title : Text, description : Text, relatedCareer : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add courses");
    };
    let courseId = nextCourseId;
    nextCourseId += 1;

    let course : Course = {
      id = courseId;
      title;
      description;
      relatedCareer;
      lessons = [];
    };
    courses.add(courseId, course);
    courseId;
  };

  public shared ({ caller }) func addLessonToCourse(courseId : Nat, title : Text, content : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add lessons");
    };
    let lessonId = nextLessonId;
    nextLessonId += 1;

    let lesson : Lesson = {
      id = lessonId;
      title;
      content;
    };

    switch (courses.get(courseId)) {
      case (null) { Runtime.trap("Course not found") };
      case (?course) {
        let updatedLessons = course.lessons.concat([lesson]);
        let updatedCourse : Course = {
          id = course.id;
          title = course.title;
          description = course.description;
          relatedCareer = course.relatedCareer;
          lessons = updatedLessons;
        };
        courses.add(courseId, updatedCourse);
      };
    };
  };

  // Course Enrollment and Progress Tracking (User Only)
  public shared ({ caller }) func enrollInCourse(courseId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can enroll in courses");
    };
    switch (courses.get(courseId)) {
      case (null) { Runtime.trap("Course not found") };
      case (?_) {
        let newEnrollment : Enrollment = {
          courseId;
          completedLessons = Set.empty<Nat>();
        };

        let userEnrollments = switch (enrollments.get(caller)) {
          case (null) { List.empty<Enrollment>() };
          case (?existing) { existing };
        };

        let hasExisting = userEnrollments.any(
          func(e) { e.courseId == courseId }
        );

        if (not hasExisting) {
          userEnrollments.add(newEnrollment);
          enrollments.add(caller, userEnrollments);
        };
      };
    };
  };

  public shared ({ caller }) func completeLesson(courseId : Nat, lessonId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can complete lessons");
    };

    switch (enrollments.get(caller)) {
      case (null) { Runtime.trap("Enrollment not found") };
      case (?userEnrollments) {
        let updatedEnrollments = userEnrollments.toArray().map(
          func(enrollment) {
            if (enrollment.courseId == courseId) {
              enrollment.completedLessons.add(lessonId);
              { courseId = enrollment.courseId; completedLessons = enrollment.completedLessons };
            } else {
              enrollment;
            };
          }
        );
        let newEnrollments = List.fromArray<Enrollment>(updatedEnrollments.reverse());
        enrollments.add(caller, newEnrollments);

        switch (courses.get(courseId)) {
          case (null) {};
          case (?course) {
            let allLessonsCompleted = course.lessons.all(func(lesson) { newEnrollments.toArray().any(func(e) { e.completedLessons.contains(lesson.id) }) });
            if (allLessonsCompleted) {
              updateCertificates(caller, course.title);
            };
          };
        };
      };
    };
  };

  func updateCertificates(user : Principal, courseName : Text) {
    switch (userProfiles.get(user)) {
      case (null) {};
      case (?profile) {
        let newCertificate : CertificateView = {
          studentName = profile.name;
          courseName;
          issueDate = Time.now();
        };

        let userCertificates = switch (certificates.get(user)) {
          case (null) { List.empty<CertificateView>() };
          case (?existing) { existing };
        };

        userCertificates.add(newCertificate);

        if (userCertificates.size() == 1) {
          certificates.add(user, userCertificates);
        };
      };
    };
  };

  // Public Queries (No authentication required - accessible to guests)
  public query func getCareerPaths() : async [CareerPath] {
    careerPaths.values().toArray();
  };

  public query func getCourses() : async [Course] {
    courses.values().toArray();
  };

  public query func getCourseDetails(courseId : Nat) : async ?Course {
    courses.get(courseId);
  };

  // Private Queries (User must access their own data)
  public query ({ caller }) func getCallerProfile() : async ?UserProfileView {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller).map(func(p) { toUserProfileView(p) });
  };

  public query ({ caller }) func getEnrollment(courseId : Nat) : async ?EnrollmentView {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view enrollments");
    };

    let userEnrollments = switch (enrollments.get(caller)) {
      case (null) { List.empty<Enrollment>() };
      case (?existing) { existing };
    };

    let foundEnrollment = userEnrollments.toArray().find(
      func(e) { e.courseId == courseId }
    );

    switch (foundEnrollment) {
      case (?enrollment) { ?toEnrollmentView(enrollment) };
      case (null) { null };
    };
  };

  public query ({ caller }) func getCallerEnrollments() : async [EnrollmentView] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view enrollments");
    };

    switch (enrollments.get(caller)) {
      case (null) { [] };
      case (?userEnrollments) { userEnrollments.toArray().map(toEnrollmentView) };
    };
  };

  public query ({ caller }) func getCertificates() : async [CertificateView] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view certificates");
    };

    switch (certificates.get(caller)) {
      case (null) { [] };
      case (?userCertificates) { userCertificates.toArray() };
    };
  };

  func toUserProfileView(profile : UserProfile) : UserProfileView {
    let assessments = profile.assessments;
    let subjectScores = assessments.subjectScores.toArray();
    let skillRatings = assessments.skillRatings.toArray();
    let assessmentResults = {
      interests = assessments.interests;
      subjectScores;
      skillRatings;
    };

    {
      name = profile.name;
      grade = profile.grade;
      interests = profile.interests;
      assessments = assessmentResults;
    };
  };

  func toEnrollmentView(enrollment : Enrollment) : EnrollmentView {
    {
      courseId = enrollment.courseId;
      completedLessons = enrollment.completedLessons.toArray();
    };
  };
};
