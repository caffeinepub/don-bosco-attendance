# Don Bosco College Attendance Management System

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Full attendance management system for Don Bosco College of Agriculture
- Role-based access: Admin, Teacher, (Parent view optional)
- Student data management: 4 years x 2 semesters = 8 semesters, 10 courses per semester, 159 students per year (~636 total)
- Student sections: 2 theory sections (A, B), 4 practical batches (1-4) per year
- Teacher App: login, session selection (date, period, theory/practical, section/batch, course), student list defaulted to Present, mark absentees, submit attendance
- Parent notification: on submission, absentees whose leave/OD/permission is NOT approved get notification (stored as notification records, since email is disabled)
- Admin Panel: student management (add/edit/bulk import via CSV), teacher management, course management, leave/permission/OD approval, dashboard with stats
- Leave/Permission/OD: if approved for a student on a given date/course, suppress parent notification
- Attendance reports: student-wise, course-wise, date-wise, export CSV
- Audit trail: log all submissions

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend (Motoko):
   - Data models: Student, Teacher, Course, Semester, AttendanceRecord, LeaveEntry, Notification, AuditLog
   - CRUD for students, teachers, courses
   - Attendance submission with leave-check logic
   - Leave/OD/Permission approval
   - Query functions: by date, student, course, semester
   - Role management via authorization component

2. Frontend:
   - Landing/Login page (role selector: Admin or Teacher)
   - Teacher Dashboard: class schedule overview, attendance marking workflow
   - Attendance Marking: date picker -> period -> theory/practical -> section/batch -> course -> student list with toggle
   - Admin Dashboard: stats overview
   - Admin: Student management (add, edit, list, CSV import)
   - Admin: Teacher management
   - Admin: Course management (courses per semester)
   - Admin: Leave/OD/Permission entry and approval
   - Admin: Reports (attendance by student/course/date, CSV export)
   - Notifications log (in-app since email disabled)
