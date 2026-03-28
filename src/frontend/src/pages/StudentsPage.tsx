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
import { Loader2, Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

const SKEL_COLS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];
const SKEL_ROWS = ["r1", "r2", "r3", "r4", "r5"];

export default function StudentsPage() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filterYear, setFilterYear] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    year: "",
    semester: "",
    section: "A",
    batch: "1",
    parentContact: "",
  });

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => (actor ? actor.getAllStudents() : []),
    enabled: !!actor && !isFetching,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.addStudent({
        id: BigInt(0),
        name: form.name,
        rollNo: form.rollNo,
        year: BigInt(form.year || 1),
        semester: BigInt(form.semester || 1),
        section: form.section,
        batch: BigInt(form.batch || 1),
        parentContact: form.parentContact,
        isActive: true,
      });
    },
    onSuccess: () => {
      toast.success("Student added!");
      qc.invalidateQueries({ queryKey: ["students"] });
      setOpen(false);
      setForm({
        name: "",
        rollNo: "",
        year: "",
        semester: "",
        section: "A",
        batch: "1",
        parentContact: "",
      });
    },
    onError: () => toast.error("Failed to add student"),
  });

  const filtered = students.filter((s) => {
    const matchYear = filterYear ? String(s.year) === filterYear : true;
    const matchSearch = search
      ? s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchYear && matchSearch;
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

  return (
    <div className="space-y-6" data-ocid="students.page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage all enrolled students
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-ocid="students.open_modal_button">
              <Plus size={16} /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" data-ocid="students.dialog">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus size={18} /> Add New Student
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Full Name</Label>
                  <Input
                    placeholder="Student full name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    data-ocid="students.name.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Roll No</Label>
                  <Input
                    placeholder="e.g. 2024001"
                    value={form.rollNo}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, rollNo: e.target.value }))
                    }
                    data-ocid="students.rollno.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Year</Label>
                  <Select
                    value={form.year}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, year: v, semester: "" }))
                    }
                  >
                    <SelectTrigger data-ocid="students.year.select">
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
                    <SelectTrigger data-ocid="students.semester.select">
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
                <div className="space-y-1.5">
                  <Label>Section</Label>
                  <Select
                    value={form.section}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, section: v }))
                    }
                  >
                    <SelectTrigger data-ocid="students.section.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["A", "B"].map((s) => (
                        <SelectItem key={s} value={s}>
                          Section {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Batch</Label>
                  <Select
                    value={form.batch}
                    onValueChange={(v) => setForm((p) => ({ ...p, batch: v }))}
                  >
                    <SelectTrigger data-ocid="students.batch.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["1", "2", "3", "4"].map((b) => (
                        <SelectItem key={b} value={b}>
                          Batch {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Parent Contact</Label>
                  <Input
                    placeholder="Phone or email"
                    value={form.parentContact}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, parentContact: e.target.value }))
                    }
                    data-ocid="students.contact.input"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => addMutation.mutate()}
                  disabled={
                    addMutation.isPending ||
                    !form.name ||
                    !form.rollNo ||
                    !form.year ||
                    !form.semester
                  }
                  data-ocid="students.submit_button"
                >
                  {addMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Student"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-ocid="students.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search by name or roll no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
          data-ocid="students.search_input"
        />
        <Select
          value={filterYear}
          onValueChange={setFilterYear}
          data-ocid="students.filter.select"
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Years</SelectItem>
            {[1, 2, 3, 4].map((y) => (
              <SelectItem key={y} value={String(y)}>
                Year {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-card border-border">
        <CardContent className="p-0">
          <Table data-ocid="students.table">
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Parent Contact</TableHead>
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
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="students.empty_state"
                  >
                    No students found. Add your first student above.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s, i) => (
                  <TableRow
                    key={String(s.id)}
                    data-ocid={`students.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-sm">
                      {s.rollNo}
                    </TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>Year {String(s.year)}</TableCell>
                    <TableCell>Sem {String(s.semester)}</TableCell>
                    <TableCell>{s.section}</TableCell>
                    <TableCell>Batch {String(s.batch)}</TableCell>
                    <TableCell className="text-sm">
                      {s.parentContact || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.isActive ? "default" : "secondary"}>
                        {s.isActive ? "Active" : "Inactive"}
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
