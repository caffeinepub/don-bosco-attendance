import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    role : Text; // "admin" or "teacher"
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Data Models
  module Entities {
    public module Student {
      public type Student = {
        id : Nat;
        name : Text;
        rollNo : Text;
        year : Nat;
        semester : Nat;
        section : Text;
        batch : Nat;
        parentContact : Text;
        isActive : Bool;
      };

      public func compareById(student1 : Student, student2 : Student) : Order.Order {
        Nat.compare(student1.id, student2.id);
      };
    };

    public module Teacher {
      public type Teacher = {
        id : Nat;
        name : Text;
        email : Text;
        isActive : Bool;
      };

      public func compareById(teacher1 : Teacher, teacher2 : Teacher) : Order.Order {
        Nat.compare(teacher1.id, teacher2.id);
      };
    };

    public type CourseType = { #theory; #practical };

    public module Course {
      public type Course = {
        id : Nat;
        name : Text;
        code : Text;
        semester : Nat;
        year : Nat;
        courseType : CourseType;
        isActive : Bool;
      };

      public func compareById(course1 : Course, course2 : Course) : Order.Order {
        Nat.compare(course1.id, course2.id);
      };
    };

    public type AttendanceStatus = { #present; #absent };

    public module AttendanceRecord {
      public type AttendanceRecord = {
        id : Nat;
        studentId : Nat;
        courseId : Nat;
        teacherId : Nat;
        date : Text;
        period : Nat;
        sectionOrBatch : Text;
        status : AttendanceStatus;
        createdAt : Int;
      };

      public func compareById(record1 : AttendanceRecord, record2 : AttendanceRecord) : Order.Order {
        Nat.compare(record1.id, record2.id);
      };
    };

    public type LeaveType = { #leave; #permission; #onDuty };

    public module LeaveEntry {
      public type LeaveEntry = {
        id : Nat;
        studentId : Nat;
        courseId : Text;
        date : Text;
        leaveType : LeaveType;
        isApproved : Bool;
        approvedBy : Text;
      };

      public func compareById(leave1 : LeaveEntry, leave2 : LeaveEntry) : Order.Order {
        Nat.compare(leave1.id, leave2.id);
      };
    };

    public module Notification {
      public type Notification = {
        id : Nat;
        studentId : Nat;
        message : Text;
        date : Text;
        isRead : Bool;
      };

      public func compareById(notif1 : Notification, notif2 : Notification) : Order.Order {
        Nat.compare(notif1.id, notif2.id);
      };
    };

    public type AttendanceInput = {
      studentId : Nat;
      isPresent : Bool;
    };

    public type AttendanceSubmission = {
      date : Text;
      period : Nat;
      courseId : Nat;
      teacherId : Nat;
      sectionOrBatch : Text;
      records : [AttendanceInput];
    };

    public type StudentFilters = {
      year : ?Nat;
      semester : ?Nat;
      section : ?Text;
      batch : ?Nat;
    };

    public type DashboardStats = {
      totalStudents : Nat;
      totalTeachers : Nat;
      totalCourses : Nat;
      todayAttendanceCount : Nat;
    };
  };

  // Storage
  let students = Map.empty<Nat, Entities.Student.Student>();
  let teachers = Map.empty<Nat, Entities.Teacher.Teacher>();
  let courses = Map.empty<Nat, Entities.Course.Course>();
  let attendanceRecords = Map.empty<Nat, Entities.AttendanceRecord.AttendanceRecord>();
  let leaveEntries = Map.empty<Nat, Entities.LeaveEntry.LeaveEntry>();
  let notifications = Map.empty<Nat, Entities.Notification.Notification>();

  // ID Counters
  var studentId = 1;
  var teacherId = 1;
  var courseId = 1;
  var attendanceId = 1;
  var leaveId = 1;
  var notificationId = 1;

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin Functions
  public shared ({ caller }) func addStudent(student : Entities.Student.Student) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add students");
    };
    let newStudent : Entities.Student.Student = {
      student with
      id = studentId;
    };
    students.add(studentId, newStudent);
    let currentId = studentId;
    studentId += 1;
    currentId;
  };

  public shared ({ caller }) func updateStudent(id : Nat, student : Entities.Student.Student) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update students");
    };
    if (not students.containsKey(id)) {
      Runtime.trap("Student not found");
    };
    let updatedStudent : Entities.Student.Student = {
      id;
      name = student.name;
      rollNo = student.rollNo;
      year = student.year;
      semester = student.semester;
      section = student.section;
      batch = student.batch;
      parentContact = student.parentContact;
      isActive = student.isActive;
    };
    students.add(id, updatedStudent);
  };

  public shared ({ caller }) func addTeacher(teacher : Entities.Teacher.Teacher) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add teachers");
    };
    let newTeacher : Entities.Teacher.Teacher = {
      teacher with
      id = teacherId;
    };
    teachers.add(teacherId, newTeacher);
    let currentId = teacherId;
    teacherId += 1;
    currentId;
  };

  public shared ({ caller }) func updateTeacher(id : Nat, teacher : Entities.Teacher.Teacher) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update teachers");
    };
    if (not teachers.containsKey(id)) {
      Runtime.trap("Teacher not found");
    };
    let updatedTeacher : Entities.Teacher.Teacher = {
      id;
      name = teacher.name;
      email = teacher.email;
      isActive = teacher.isActive;
    };
    teachers.add(id, updatedTeacher);
  };

  public shared ({ caller }) func addCourse(course : Entities.Course.Course) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add courses");
    };
    let newCourse : Entities.Course.Course = {
      course with
      id = courseId;
    };
    courses.add(courseId, newCourse);
    let currentId = courseId;
    courseId += 1;
    currentId;
  };

  public shared ({ caller }) func updateCourse(id : Nat, course : Entities.Course.Course) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update courses");
    };
    if (not courses.containsKey(id)) {
      Runtime.trap("Course not found");
    };
    let updatedCourse : Entities.Course.Course = {
      id;
      name = course.name;
      code = course.code;
      semester = course.semester;
      year = course.year;
      courseType = course.courseType;
      isActive = course.isActive;
    };
    courses.add(id, updatedCourse);
  };

  // Teacher Functions
  public shared ({ caller }) func submitAttendance(submission : Entities.AttendanceSubmission) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only teachers can submit attendance");
    };

    let records = submission.records;
    if (records.size() == 0) {
      Runtime.trap("At least one student must be present for each class/day");
    };

    switch (courses.get(submission.courseId)) {
      case (null) { Runtime.trap("This course does not exist") };
      case (?course) {
        let period = submission.period;
        if ((period > 5 and course.courseType == #theory) or (period > 7 and course.courseType == #practical)) {
          Runtime.trap("You can only submit up to 5 records per day on theory class and up to 7 records for practical class");
        };
        let currentDate = Time.now();
        for (record in records.values()) {
          let status : Entities.AttendanceStatus = switch (record.isPresent) {
            case (true) { #present };
            case (false) { #absent };
          };

          let attendanceRecord : Entities.AttendanceRecord.AttendanceRecord = {
            id = attendanceId;
            studentId = record.studentId;
            courseId = submission.courseId;
            teacherId = submission.teacherId;
            date = submission.date;
            period = submission.period;
            sectionOrBatch = submission.sectionOrBatch;
            status;
            createdAt = currentDate;
          };
          attendanceRecords.add(attendanceId, attendanceRecord);

          if (not record.isPresent) {
            let notification : Entities.Notification.Notification = {
              id = notificationId;
              studentId = record.studentId;
              message = "Absent without approved leave";
              date = submission.date;
              isRead = false;
            };
            notifications.add(notificationId, notification);
            notificationId += 1;
          };

          attendanceId += 1;
        };
      };
    };
  };

  // Query Functions
  public query ({ caller }) func getStudentsByFilter(filters : Entities.StudentFilters) : async [Entities.Student.Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view students");
    };
    students.values().toArray().filter(
      func(student) {
        switch (filters.year) {
          case (null) { true };
          case (?year) { student.year == year };
        };
      },
    ).filter(
      func(student) {
        switch (filters.semester) {
          case (null) { true };
          case (?semester) { student.semester == semester };
        };
      },
    ).filter(
      func(student) {
        switch (filters.section) {
          case (null) { true };
          case (?section) { student.section == section };
        };
      },
    ).filter(
      func(student) {
        switch (filters.batch) {
          case (null) { true };
          case (?batch) { student.batch == batch };
        };
      },
    ).sort(Entities.Student.compareById);
  };

  public query ({ caller }) func getAttendanceByStudent(studentId : Nat) : async [Entities.AttendanceRecord.AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view attendance");
    };
    attendanceRecords.values().toArray().filter(
      func(record) {
        record.studentId == studentId;
      },
    ).sort(Entities.AttendanceRecord.compareById);
  };

  public query ({ caller }) func getAttendanceByDate(date : Text) : async [Entities.AttendanceRecord.AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view attendance");
    };
    attendanceRecords.values().toArray().filter(
      func(record) {
        record.date == date;
      },
    ).sort(Entities.AttendanceRecord.compareById);
  };

  public query ({ caller }) func getAttendanceByCourse(courseId : Nat) : async [Entities.AttendanceRecord.AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view attendance");
    };
    attendanceRecords.values().toArray().filter(
      func(record) {
        record.courseId == courseId;
      },
    ).sort(Entities.AttendanceRecord.compareById);
  };

  public shared ({ caller }) func addLeaveEntry(leave : Entities.LeaveEntry.LeaveEntry) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only teachers can add leave entries");
    };
    let newLeave : Entities.LeaveEntry.LeaveEntry = {
      leave with
      id = leaveId;
    };
    leaveEntries.add(leaveId, newLeave);
    let currentId = leaveId;
    leaveId += 1;
    currentId;
  };

  public shared ({ caller }) func approveLeave(leaveId : Nat, approvedBy : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only teachers can approve leave entries");
    };
    switch (leaveEntries.get(leaveId)) {
      case (null) { Runtime.trap("Leave not found") };
      case (?leave) {
        let approvedLeave : Entities.LeaveEntry.LeaveEntry = {
          leave with
          isApproved = true;
          approvedBy;
        };
        leaveEntries.add(leaveId, approvedLeave);
      };
    };
  };

  public query ({ caller }) func getNotifications(studentId : Nat) : async [Entities.Notification.Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view notifications");
    };
    notifications.values().toArray().filter(
      func(notification) {
        notification.studentId == studentId;
      },
    ).sort(Entities.Notification.compareById);
  };

  public query ({ caller }) func getAllStudents() : async [Entities.Student.Student] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all students");
    };
    students.values().toArray().sort(Entities.Student.compareById);
  };

  public query ({ caller }) func getAllTeachers() : async [Entities.Teacher.Teacher] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all teachers");
    };
    teachers.values().toArray().sort(Entities.Teacher.compareById);
  };

  public query ({ caller }) func getAllCourses() : async [Entities.Course.Course] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all courses");
    };
    courses.values().toArray().sort(Entities.Course.compareById);
  };

  public query ({ caller }) func getDashboardStats() : async Entities.DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view dashboard stats");
    };
    
    let totalStudents = students.size();
    let totalTeachers = teachers.size();
    let totalCourses = courses.size();
    
    // Count today's attendance records (simplified - counts all records)
    let todayAttendanceCount = attendanceRecords.size();
    
    {
      totalStudents;
      totalTeachers;
      totalCourses;
      todayAttendanceCount;
    };
  };
};
