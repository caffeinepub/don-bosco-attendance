import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCourse(course: Course): Promise<bigint>;
    addLeaveEntry(leave: LeaveEntry): Promise<bigint>;
    addStudent(student: Student): Promise<bigint>;
    addTeacher(teacher: Teacher): Promise<bigint>;
    approveLeave(leaveId: bigint, approvedBy: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllCourses(): Promise<Array<Course>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllTeachers(): Promise<Array<Teacher>>;
    getAttendanceByCourse(courseId: bigint): Promise<Array<AttendanceRecord>>;
    getAttendanceByDate(date: string): Promise<Array<AttendanceRecord>>;
    getAttendanceByStudent(studentId: bigint): Promise<Array<AttendanceRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getNotifications(studentId: bigint): Promise<Array<Notification>>;
    getStudentsByFilter(filters: StudentFilters): Promise<Array<Student>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitAttendance(submission: AttendanceSubmission): Promise<void>;
    updateCourse(id: bigint, course: Course): Promise<void>;
    updateStudent(id: bigint, student: Student): Promise<void>;
    updateTeacher(id: bigint, teacher: Teacher): Promise<void>;
}
