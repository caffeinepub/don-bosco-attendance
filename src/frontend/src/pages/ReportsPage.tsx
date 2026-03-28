import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import type { AttendanceRecord } from "../backend";
import { useActor } from "../hooks/useActor";

const today = new Date().toISOString().split("T")[0];

export default function ReportsPage() {
  const { actor, isFetching } = useActor();

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [reportDate, setReportDate] = useState(today);

  const [studentRecords, setStudentRecords] = useState<
    AttendanceRecord[] | null
  >(null);
  const [courseRecords, setCourseRecords] = useState<AttendanceRecord[] | null>(
    null,
  );
  const [dateRecords, setDateRecords] = useState<AttendanceRecord[] | null>(
    null,
  );
  const [loadingReport, setLoadingReport] = useState(false);

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => (actor ? actor.getAllStudents() : []),
    enabled: !!actor && !isFetching,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => (actor ? actor.getAllCourses() : []),
    enabled: !!actor && !isFetching,
  });

  const fetchStudentReport = async () => {
    if (!actor || !selectedStudent) return;
    setLoadingReport(true);
    try {
      const records = await actor.getAttendanceByStudent(
        BigInt(selectedStudent),
      );
      setStudentRecords(records);
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchCourseReport = async () => {
    if (!actor || !selectedCourse) return;
    setLoadingReport(true);
    try {
      const records = await actor.getAttendanceByCourse(BigInt(selectedCourse));
      setCourseRecords(records);
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchDateReport = async () => {
    if (!actor) return;
    setLoadingReport(true);
    try {
      const records = await actor.getAttendanceByDate(reportDate);
      setDateRecords(records);
    } finally {
      setLoadingReport(false);
    }
  };

  const exportCSV = (records: AttendanceRecord[], filename: string) => {
    const header = "ID,StudentID,CourseID,Date,Period,Status,Section/Batch";
    const rows = records.map(
      (r) =>
        `${r.id},${r.studentId},${r.courseId},${r.date},${r.period},${r.status},${r.sectionOrBatch}`,
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const AttendanceTable = ({ records }: { records: AttendanceRecord[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Period</TableHead>
          <TableHead>Student ID</TableHead>
          <TableHead>Course ID</TableHead>
          <TableHead>Section/Batch</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center py-6 text-muted-foreground"
              data-ocid="reports.empty_state"
            >
              No records found.
            </TableCell>
          </TableRow>
        ) : (
          records.map((r, i) => (
            <TableRow key={String(r.id)} data-ocid={`reports.row.${i + 1}`}>
              <TableCell>{r.date}</TableCell>
              <TableCell>P{String(r.period)}</TableCell>
              <TableCell className="font-mono text-sm">
                {String(r.studentId)}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {String(r.courseId)}
              </TableCell>
              <TableCell>{r.sectionOrBatch}</TableCell>
              <TableCell>
                <Badge
                  variant={r.status === "present" ? "default" : "destructive"}
                  className="capitalize"
                >
                  {r.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  const presentPct = (records: AttendanceRecord[]) => {
    if (records.length === 0) return 0;
    return Math.round(
      (records.filter((r) => r.status === "present").length / records.length) *
        100,
    );
  };

  return (
    <div className="space-y-6" data-ocid="reports.page">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Generate attendance reports
        </p>
      </div>

      <Tabs defaultValue="student" data-ocid="reports.tab">
        <TabsList>
          <TabsTrigger value="student" data-ocid="reports.student.tab">
            By Student
          </TabsTrigger>
          <TabsTrigger value="course" data-ocid="reports.course.tab">
            By Course
          </TabsTrigger>
          <TabsTrigger value="date" data-ocid="reports.date.tab">
            By Date
          </TabsTrigger>
        </TabsList>

        {/* By Student */}
        <TabsContent value="student" className="space-y-4 mt-4">
          <Card className="shadow-card border-border">
            <CardContent className="pt-5">
              <div className="flex gap-3 items-end">
                <div className="flex-1 max-w-xs space-y-1.5">
                  <Label>Select Student</Label>
                  <Select
                    value={selectedStudent}
                    onValueChange={setSelectedStudent}
                    data-ocid="reports.student.select"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={String(s.id)} value={String(s.id)}>
                          {s.rollNo} - {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={fetchStudentReport}
                  disabled={loadingReport || !selectedStudent}
                  data-ocid="reports.student.primary_button"
                >
                  {loadingReport ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Get Report"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {studentRecords !== null && (
            <Card className="shadow-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Attendance: {presentPct(studentRecords)}% Present
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() =>
                      exportCSV(studentRecords, "student-report.csv")
                    }
                    data-ocid="reports.export.button"
                  >
                    <Download size={14} /> Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <AttendanceTable records={studentRecords} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* By Course */}
        <TabsContent value="course" className="space-y-4 mt-4">
          <Card className="shadow-card border-border">
            <CardContent className="pt-5">
              <div className="flex gap-3 items-end">
                <div className="flex-1 max-w-xs space-y-1.5">
                  <Label>Select Course</Label>
                  <Select
                    value={selectedCourse}
                    onValueChange={setSelectedCourse}
                    data-ocid="reports.course.select"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={String(c.id)} value={String(c.id)}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={fetchCourseReport}
                  disabled={loadingReport || !selectedCourse}
                  data-ocid="reports.course.primary_button"
                >
                  {loadingReport ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Get Report"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {courseRecords !== null && (
            <Card className="shadow-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Course Attendance Records
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() =>
                      exportCSV(courseRecords, "course-report.csv")
                    }
                    data-ocid="reports.export.button"
                  >
                    <Download size={14} /> Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <AttendanceTable records={courseRecords} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* By Date */}
        <TabsContent value="date" className="space-y-4 mt-4">
          <Card className="shadow-card border-border">
            <CardContent className="pt-5">
              <div className="flex gap-3 items-end">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    data-ocid="reports.date.input"
                  />
                </div>
                <Button
                  onClick={fetchDateReport}
                  disabled={loadingReport}
                  data-ocid="reports.date.primary_button"
                >
                  {loadingReport ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Get Report"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {dateRecords !== null && (
            <Card className="shadow-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Attendance on {reportDate}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() =>
                      exportCSV(dateRecords, `attendance-${reportDate}.csv`)
                    }
                    data-ocid="reports.export.button"
                  >
                    <Download size={14} /> Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <AttendanceTable records={dateRecords} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
