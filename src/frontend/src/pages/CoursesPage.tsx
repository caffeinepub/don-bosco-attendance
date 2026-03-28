import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CourseType } from "../backend";
import { useActor } from "../hooks/useActor";

const SKEL_ROWS = ["r1", "r2", "r3", "r4", "r5"];
const SKEL_COLS = ["c1", "c2", "c3", "c4", "c5", "c6"];

export default function CoursesPage() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    year: "",
    semester: "",
    courseType: "theory",
  });

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => (actor ? actor.getAllCourses() : []),
    enabled: !!actor && !isFetching,
  });

  const semestersForYear = (y: string) => {
    const map: Record<string, number[]> = {
      "1": [1, 2],
      "2": [3, 4],
      "3": [5, 6],
      "4": [7, 8],
    };
    return map[y] ?? [1, 2];
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error();
      await actor.addCourse({
        id: BigInt(0),
        name: form.name,
        code: form.code,
        year: BigInt(form.year || 1),
        semester: BigInt(form.semester || 1),
        courseType:
          form.courseType === "practical"
            ? CourseType.practical
            : CourseType.theory,
        isActive: true,
      });
    },
    onSuccess: () => {
      toast.success("Course added!");
      qc.invalidateQueries({ queryKey: ["courses"] });
      setOpen(false);
      setForm({
        name: "",
        code: "",
        year: "",
        semester: "",
        courseType: "theory",
      });
    },
    onError: () => toast.error("Failed to add course"),
  });

  return (
    <div className="space-y-6" data-ocid="courses.page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage course catalogue
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-ocid="courses.open_modal_button">
              <Plus size={16} /> Add Course
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="courses.dialog">
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Course Name</Label>
                <Input
                  placeholder="e.g. Soil Science"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  data-ocid="courses.name.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Course Code</Label>
                <Input
                  placeholder="e.g. AGR201"
                  value={form.code}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, code: e.target.value }))
                  }
                  data-ocid="courses.code.input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Year</Label>
                  <Select
                    value={form.year}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, year: v, semester: "" }))
                    }
                  >
                    <SelectTrigger data-ocid="courses.year.select">
                      <SelectValue placeholder="Year" />
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
                <div className="space-y-1.5">
                  <Label>Semester</Label>
                  <Select
                    value={form.semester}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, semester: v }))
                    }
                    disabled={!form.year}
                  >
                    <SelectTrigger data-ocid="courses.semester.select">
                      <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semestersForYear(form.year).map((s) => (
                        <SelectItem key={s} value={String(s)}>
                          Sem {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={form.courseType}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, courseType: v }))
                  }
                >
                  <SelectTrigger data-ocid="courses.type.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theory">Theory</SelectItem>
                    <SelectItem value="practical">Practical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => addMutation.mutate()}
                  disabled={
                    addMutation.isPending ||
                    !form.name ||
                    !form.code ||
                    !form.year ||
                    !form.semester
                  }
                  data-ocid="courses.submit_button"
                >
                  {addMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Course"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-ocid="courses.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card border-border">
        <CardContent className="p-0">
          <Table data-ocid="courses.table">
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                SKEL_ROWS.map((rk) => (
                  <TableRow key={rk}>
                    {SKEL_COLS.map((ck) => (
                      <TableCell key={ck}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : courses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="courses.empty_state"
                  >
                    No courses found. Add the first course.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((c, i) => (
                  <TableRow
                    key={String(c.id)}
                    data-ocid={`courses.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-sm font-medium">
                      {c.code}
                    </TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>Year {String(c.year)}</TableCell>
                    <TableCell>Sem {String(c.semester)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {c.courseType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.isActive ? "default" : "secondary"}>
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
