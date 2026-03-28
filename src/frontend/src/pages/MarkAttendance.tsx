import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Student } from "../backend";
import { useActor } from "../hooks/useActor";

const today = new Date().toISOString().split("T")[0];

interface StudentRow extends Student {
  isPresent: boolean;
}

const SECTIONS = ["A", "B"];
const BATCHES = ["1", "2", "3", "4"];

export default function MarkAttendance() {
  const { actor, isFetching } = useActor();

  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState(today);
  const [period, setPeriod] = useState("");
  const [classType, setClassType] = useState<"theory" | "practical">("theory");
  const [section, setSection] = useState("A");
  const [batch, setBatch] = useState("1");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const semestersForYear = (y: string) => {
    const map: Record<string, number[]> = {
      "1": [1, 2],
      "2": [3, 4],
      "3": [5, 6],
      "4": [7, 8],
    };
    return map[y] ?? [];
  };

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => (actor ? actor.getAllCourses() : []),
    enabled: !!actor && !isFetching,
  });

  const filteredCourses = courses.filter(
    (c) =>
      year &&
      semester &&
      Number(c.year) === Number(year) &&
      Number(c.semester) === Number(semester),
  );

  const handleLoadStudents = async () => {
    if (!actor || !year || !semester) return;
    setLoadingStudents(true);
    setStudentsLoaded(false);
    setSubmitted(false);
    try {
      let fetched: Student[];
      if (classType === "theory") {
        fetched = await actor.getStudentsByFilter({
          year: BigInt(year),
          semester: BigInt(semester),
          section,
        });
      } else {
        fetched = await actor.getStudentsByFilter({
          year: BigInt(year),
          semester: BigInt(semester),
          batch: BigInt(batch),
        });
      }
      setStudents(fetched.map((s) => ({ ...s, isPresent: true })));
      setStudentsLoaded(true);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const togglePresence = (id: bigint) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPresent: !s.isPresent } : s)),
    );
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !courseId || !period) throw new Error("Missing fields");
      const sectionOrBatch =
        classType === "theory" ? `Section ${section}` : `Batch ${batch}`;
      await actor.submitAttendance({
        date,
        period: BigInt(period),
        courseId: BigInt(courseId),
        teacherId: BigInt(1),
        sectionOrBatch,
        records: students.map((s) => ({
          studentId: s.id,
          isPresent: s.isPresent,
        })),
      });
    },
    onSuccess: () => {
      toast.success("Attendance submitted successfully!");
      setSubmitted(true);
    },
    onError: () => toast.error("Failed to submit attendance"),
  });

  const absentCount = students.filter((s) => !s.isPresent).length;

  return (
    <div className="space-y-6 max-w-4xl" data-ocid="attendance.page">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mark Attendance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Select class details and mark attendance
        </p>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            Class Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Year */}
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Select
                value={year}
                onValueChange={(v) => {
                  setYear(v);
                  setSemester("");
                  setCourseId("");
                  setStudentsLoaded(false);
                }}
                data-ocid="attendance.year.select"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      Year {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Semester */}
            <div className="space-y-1.5">
              <Label>Semester</Label>
              <Select
                value={semester}
                onValueChange={(v) => {
                  setSemester(v);
                  setCourseId("");
                  setStudentsLoaded(false);
                }}
                disabled={!year}
                data-ocid="attendance.semester.select"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semestersForYear(year).map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      Semester {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label>Date</Label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                data-ocid="attendance.date.input"
              />
            </div>

            {/* Period */}
            <div className="space-y-1.5">
              <Label>Period</Label>
              <Select
                value={period}
                onValueChange={setPeriod}
                data-ocid="attendance.period.select"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      Period {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Course */}
          <div className="space-y-1.5">
            <Label>Course</Label>
            <Select
              value={courseId}
              onValueChange={setCourseId}
              disabled={!semester}
              data-ocid="attendance.course.select"
            >
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {filteredCourses.map((c) => (
                  <SelectItem key={String(c.id)} value={String(c.id)}>
                    {c.code} - {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Type */}
          <div className="space-y-2">
            <Label>Class Type</Label>
            <RadioGroup
              value={classType}
              onValueChange={(v: "theory" | "practical") => {
                setClassType(v);
                setStudentsLoaded(false);
              }}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="theory"
                  id="theory"
                  data-ocid="attendance.type.radio"
                />
                <Label htmlFor="theory" className="cursor-pointer">
                  Theory
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="practical"
                  id="practical"
                  data-ocid="attendance.type.radio"
                />
                <Label htmlFor="practical" className="cursor-pointer">
                  Practical
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Section or Batch */}
          {classType === "theory" ? (
            <div className="space-y-2">
              <Label>Section</Label>
              <RadioGroup
                value={section}
                onValueChange={(v) => {
                  setSection(v);
                  setStudentsLoaded(false);
                }}
                className="flex gap-6"
              >
                {SECTIONS.map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <RadioGroupItem
                      value={s}
                      id={`section-${s}`}
                      data-ocid="attendance.section.radio"
                    />
                    <Label htmlFor={`section-${s}`} className="cursor-pointer">
                      Section {s}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Batch</Label>
              <RadioGroup
                value={batch}
                onValueChange={(v) => {
                  setBatch(v);
                  setStudentsLoaded(false);
                }}
                className="flex gap-6"
              >
                {BATCHES.map((b) => (
                  <div key={b} className="flex items-center gap-2">
                    <RadioGroupItem
                      value={b}
                      id={`batch-${b}`}
                      data-ocid="attendance.batch.radio"
                    />
                    <Label htmlFor={`batch-${b}`} className="cursor-pointer">
                      Batch {b}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <Button
            onClick={handleLoadStudents}
            disabled={!year || !semester || loadingStudents}
            data-ocid="attendance.load.primary_button"
          >
            {loadingStudents ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load Students"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Student Table */}
      {studentsLoaded && (
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Students ({students.length})
              </CardTitle>
              <div className="flex gap-3 text-sm">
                <span
                  style={{ color: "oklch(0.58 0.15 155)" }}
                  className="font-medium"
                >
                  {students.length - absentCount} Present
                </span>
                <span className="text-destructive font-medium">
                  {absentCount} Absent
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div
                className="text-center py-8 text-muted-foreground"
                data-ocid="attendance.empty_state"
              >
                No students found for the selected filters.
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student, idx) => (
                  <div
                    key={String(student.id)}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                    data-ocid={`attendance.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: "oklch(0.35 0.09 245)" }}
                      >
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {student.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.rollNo}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePresence(student.id)}
                      data-ocid={`attendance.toggle.${idx + 1}`}
                      className={
                        student.isPresent
                          ? "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
                          : "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700"
                      }
                    >
                      {student.isPresent ? (
                        <>
                          <CheckCircle2 size={14} /> P
                        </>
                      ) : (
                        <>
                          <XCircle size={14} /> A
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {students.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                {submitted ? (
                  <div
                    className="flex items-center gap-2 font-medium"
                    style={{ color: "oklch(0.58 0.15 155)" }}
                    data-ocid="attendance.success_state"
                  >
                    <CheckCircle2 size={16} /> Attendance submitted
                    successfully!
                  </div>
                ) : (
                  <Button
                    onClick={() => submitMutation.mutate()}
                    disabled={submitMutation.isPending || !courseId || !period}
                    className="bg-primary text-primary-foreground"
                    data-ocid="attendance.submit_button"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Attendance"
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
