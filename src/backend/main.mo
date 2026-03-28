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
import AccessControl "authorization/access-control";

actor {
  // Kept for stable variable compatibility with previous version
  let accessControlState = AccessControl.initState();

  // Kept for stable variable compatibility with previous version
  public type UserProfile = {
    name : Text;
    role : Text;
  };
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Simple credential-based auth
  public type Credential = {
    username : Text;
    password : Text;
    name : Text;
    role : Text;
  };

  let credentials = Map.empty<Text, Credential>();

  // Kept for stable variable compatibility with previous version
  var defaultAdminSeeded = false;

  // Seed default admin -- runs on every actor initialization
  credentials.add("dbca", {
    username = "dbca";
    password = "dbca123";
    name = "Administrator";
    role = "admin";
  });
  defaultAdminSeeded := true;

  // Login: returns profile if credentials match
  public shared func login(username : Text, password : Text) : async ?UserProfile {
    switch (credentials.get(username)) {
      case (null) { null };
      case (?cred) {
        if (cred.password == password) {
          ?{ name = cred.name; role = cred.role };
        } else {
          null;
        };
      };
    };
  };

  public shared func createTeacherAccount(username : Text, password : Text, name : Text) : async Bool {
    credentials.add(username, {
      username;
      password;
      name;
      role = "teacher";
    });
    true;
  };

  public shared func changePassword(username : Text, oldPassword : Text, newPassword : Text) : async Bool {
    switch (credentials.get(username)) {
      case (null) { false };
      case (?cred) {
        if (cred.password == oldPassword) {
          credentials.add(username, { cred with password = newPassword });
          true;
        } else {
          false;
        };
      };
    };
  };

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

      public func compareById(s1 : Student, s2 : Student) : Order.Order {
        Nat.compare(s1.id, s2.id);
      };
    };

    public module Teacher {
      public type Teacher = {
        id : Nat;
        name : Text;
        email : Text;
        isActive : Bool;
      };

      public func compareById(t1 : Teacher, t2 : Teacher) : Order.Order {
        Nat.compare(t1.id, t2.id);
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

      public func compareById(c1 : Course, c2 : Course) : Order.Order {
        Nat.compare(c1.id, c2.id);
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

      public func compareById(r1 : AttendanceRecord, r2 : AttendanceRecord) : Order.Order {
        Nat.compare(r1.id, r2.id);
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

      public func compareById(l1 : LeaveEntry, l2 : LeaveEntry) : Order.Order {
        Nat.compare(l1.id, l2.id);
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

      public func compareById(n1 : Notification, n2 : Notification) : Order.Order {
        Nat.compare(n1.id, n2.id);
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

  // ID Counters -- original names preserved for stable variable compatibility
  var studentId = 1;
  var teacherId = 1;
  var courseId = 1;
  var attendanceId = 1;
  var leaveId = 1;
  var notificationId = 1;

  public shared func addStudent(student : Entities.Student.Student) : async Nat {
    let newStudent : Entities.Student.Student = { student with id = studentId };
    students.add(studentId, newStudent);
    let currentId = studentId;
    studentId += 1;
    currentId;
  };

  public shared func updateStudent(id : Nat, student : Entities.Student.Student) : async () {
    if (not students.containsKey(id)) { Runtime.trap("Student not found") };
    students.add(id, {
      id;
      name = student.name;
      rollNo = student.rollNo;
      year = student.year;
      semester = student.semester;
      section = student.section;
      batch = student.batch;
      parentContact = student.parentContact;
      isActive = student.isActive;
    });
  };

  public shared func addTeacher(teacher : Entities.Teacher.Teacher) : async Nat {
    let newTeacher : Entities.Teacher.Teacher = { teacher with id = teacherId };
    teachers.add(teacherId, newTeacher);
    let currentId = teacherId;
    teacherId += 1;
    currentId;
  };

  public shared func updateTeacher(id : Nat, teacher : Entities.Teacher.Teacher) : async () {
    if (not teachers.containsKey(id)) { Runtime.trap("Teacher not found") };
    teachers.add(id, { id; name = teacher.name; email = teacher.email; isActive = teacher.isActive });
  };

  public shared func addCourse(course : Entities.Course.Course) : async Nat {
    let newCourse : Entities.Course.Course = { course with id = courseId };
    courses.add(courseId, newCourse);
    let currentId = courseId;
    courseId += 1;
    currentId;
  };

  public shared func updateCourse(id : Nat, course : Entities.Course.Course) : async () {
    if (not courses.containsKey(id)) { Runtime.trap("Course not found") };
    courses.add(id, {
      id;
      name = course.name;
      code = course.code;
      semester = course.semester;
      year = course.year;
      courseType = course.courseType;
      isActive = course.isActive;
    });
  };

  public shared func submitAttendance(submission : Entities.AttendanceSubmission) : async () {
    if (submission.records.size() == 0) {
      Runtime.trap("At least one student record is required");
    };
    switch (courses.get(submission.courseId)) {
      case (null) { Runtime.trap("Course not found") };
      case (?course) {
        let period = submission.period;
        if ((period > 5 and course.courseType == #theory) or (period > 7 and course.courseType == #practical)) {
          Runtime.trap("Period limit exceeded");
        };
        let now = Time.now();
        for (record in submission.records.values()) {
          let status : Entities.AttendanceStatus = if (record.isPresent) #present else #absent;
          attendanceRecords.add(attendanceId, {
            id = attendanceId;
            studentId = record.studentId;
            courseId = submission.courseId;
            teacherId = submission.teacherId;
            date = submission.date;
            period = submission.period;
            sectionOrBatch = submission.sectionOrBatch;
            status;
            createdAt = now;
          });
          if (not record.isPresent) {
            notifications.add(notificationId, {
              id = notificationId;
              studentId = record.studentId;
              message = "Absent without approved leave";
              date = submission.date;
              isRead = false;
            });
            notificationId += 1;
          };
          attendanceId += 1;
        };
      };
    };
  };

  public query func getStudentsByFilter(filters : Entities.StudentFilters) : async [Entities.Student.Student] {
    students.values().toArray()
      .filter(func(s) { switch (filters.year) { case (null) true; case (?y) s.year == y } })
      .filter(func(s) { switch (filters.semester) { case (null) true; case (?sem) s.semester == sem } })
      .filter(func(s) { switch (filters.section) { case (null) true; case (?sec) s.section == sec } })
      .filter(func(s) { switch (filters.batch) { case (null) true; case (?b) s.batch == b } })
      .sort(Entities.Student.compareById);
  };

  public query func getAttendanceByStudent(sid : Nat) : async [Entities.AttendanceRecord.AttendanceRecord] {
    attendanceRecords.values().toArray().filter(func(r) { r.studentId == sid }).sort(Entities.AttendanceRecord.compareById);
  };

  public query func getAttendanceByDate(date : Text) : async [Entities.AttendanceRecord.AttendanceRecord] {
    attendanceRecords.values().toArray().filter(func(r) { r.date == date }).sort(Entities.AttendanceRecord.compareById);
  };

  public query func getAttendanceByCourse(cid : Nat) : async [Entities.AttendanceRecord.AttendanceRecord] {
    attendanceRecords.values().toArray().filter(func(r) { r.courseId == cid }).sort(Entities.AttendanceRecord.compareById);
  };

  public shared func addLeaveEntry(leave : Entities.LeaveEntry.LeaveEntry) : async Nat {
    let newLeave : Entities.LeaveEntry.LeaveEntry = { leave with id = leaveId };
    leaveEntries.add(leaveId, newLeave);
    let currentId = leaveId;
    leaveId += 1;
    currentId;
  };

  public shared func approveLeave(lid : Nat, approvedBy : Text) : async () {
    switch (leaveEntries.get(lid)) {
      case (null) { Runtime.trap("Leave not found") };
      case (?leave) {
        leaveEntries.add(lid, { leave with isApproved = true; approvedBy });
      };
    };
  };

  public query func getNotifications(sid : Nat) : async [Entities.Notification.Notification] {
    notifications.values().toArray().filter(func(n) { n.studentId == sid }).sort(Entities.Notification.compareById);
  };

  public query func getAllStudents() : async [Entities.Student.Student] {
    students.values().toArray().sort(Entities.Student.compareById);
  };

  public query func getAllTeachers() : async [Entities.Teacher.Teacher] {
    teachers.values().toArray().sort(Entities.Teacher.compareById);
  };

  public query func getAllCourses() : async [Entities.Course.Course] {
    courses.values().toArray().sort(Entities.Course.compareById);
  };

  public query func getAllLeaveEntries() : async [Entities.LeaveEntry.LeaveEntry] {
    leaveEntries.values().toArray().sort(Entities.LeaveEntry.compareById);
  };

  public query func getAllNotifications() : async [Entities.Notification.Notification] {
    notifications.values().toArray().sort(Entities.Notification.compareById);
  };

  public query func getDashboardStats() : async Entities.DashboardStats {
    {
      totalStudents = students.size();
      totalTeachers = teachers.size();
      totalCourses = courses.size();
      todayAttendanceCount = attendanceRecords.size();
    };
  };
};
