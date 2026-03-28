export interface Teacher {
    id: bigint;
    name: string;
    isActive: boolean;
    email: string;
}
export interface DashboardStats {
    totalStudents: bigint;
    todayAttendanceCount: bigint;
    totalTeachers: bigint;
    totalCourses: bigint;
}
export interface LeaveEntry {
    id: bigint;
    isApproved: boolean;
    studentId: bigint;
    date: string;
    approvedBy: string;
    leaveType: LeaveType;
    courseId: string;
}
export interface Course {
    id: bigint;
    semester: bigint;
    code: string;
    name: string;
    year: bigint;
    isActive: boolean;
    courseType: CourseType;
}
export interface StudentFilters {
    semester?: bigint;
    year?: bigint;
    section?: string;
    batch?: bigint;
}
export interface Notification {
    id: bigint;
    studentId: bigint;
    date: string;
    isRead: boolean;
    message: string;
}
export interface AttendanceInput {
    studentId: bigint;
    isPresent: boolean;
}
export interface AttendanceRecord {
    id: bigint;
    status: AttendanceStatus;
    studentId: bigint;
    period: bigint;
    date: string;
    createdAt: bigint;
    sectionOrBatch: string;
    teacherId: bigint;
    courseId: bigint;
}
export interface AttendanceSubmission {
    records: Array<AttendanceInput>;
    period: bigint;
    date: string;
    sectionOrBatch: string;
    teacherId: bigint;
    courseId: bigint;
}
export interface UserProfile {
    name: string;
    role: string;
}
export interface Student {
    id: bigint;
    semester: bigint;
    parentContact: string;
    name: string;
    year: bigint;
    section: string;
    isActive: boolean;
    batch: bigint;
    rollNo: string;
}
export enum AttendanceStatus {
    present = "present",
    absent = "absent"
}
export enum CourseType {
    practical = "practical",
    theory = "theory"
}
export enum LeaveType {
    permission = "permission",
    leave = "leave",
    onDuty = "onDuty"
}
export interface backendInterface {
    login(username: string, password: string): Promise<UserProfile | null>;
    createTeacherAccount(username: string, password: string, name: string): Promise<boolean>;
    changePassword(username: string, oldPassword: string, newPassword: string): Promise<boolean>;
    addCourse(course: Course): Promise<bigint>;
    addLeaveEntry(leave: LeaveEntry): Promise<bigint>;
    addStudent(student: Student): Promise<bigint>;
    addTeacher(teacher: Teacher): Promise<bigint>;
    approveLeave(leaveId: bigint, approvedBy: string): Promise<void>;
    getAllCourses(): Promise<Array<Course>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllTeachers(): Promise<Array<Teacher>>;
    getAllLeaveEntries(): Promise<Array<LeaveEntry>>;
    getAllNotifications(): Promise<Array<Notification>>;
    getAttendanceByCourse(courseId: bigint): Promise<Array<AttendanceRecord>>;
    getAttendanceByDate(date: string): Promise<Array<AttendanceRecord>>;
    getAttendanceByStudent(studentId: bigint): Promise<Array<AttendanceRecord>>;
    getDashboardStats(): Promise<DashboardStats>;
    getNotifications(studentId: bigint): Promise<Array<Notification>>;
    getStudentsByFilter(filters: StudentFilters): Promise<Array<Student>>;
    submitAttendance(submission: AttendanceSubmission): Promise<void>;
    updateCourse(id: bigint, course: Course): Promise<void>;
    updateStudent(id: bigint, student: Student): Promise<void>;
    updateTeacher(id: bigint, teacher: Teacher): Promise<void>;
}
