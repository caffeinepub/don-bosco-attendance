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
import { useActor } from "../hooks/useActor";

const SKEL_ROWS = ["r1", "r2", "r3", "r4"];
const SKEL_COLS = ["c1", "c2", "c3", "c4", "c5"];

export default function TeachersPage() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  });

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => (actor ? actor.getAllTeachers() : []),
    enabled: !!actor && !isFetching,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error();
      await actor.addTeacher({
        id: BigInt(0),
        name: form.name,
        email: form.email,
        isActive: true,
      });
      // Create login account for the teacher
      if (form.username && form.password) {
        await actor.createTeacherAccount(
          form.username,
          form.password,
          form.name,
        );
      }
    },
    onSuccess: () => {
      toast.success("Teacher added!");
      qc.invalidateQueries({ queryKey: ["teachers"] });
      setOpen(false);
      setForm({ name: "", email: "", username: "", password: "" });
    },
    onError: () => toast.error("Failed to add teacher"),
  });

  return (
    <div className="space-y-6" data-ocid="teachers.page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teachers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage faculty members
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-ocid="teachers.open_modal_button">
              <Plus size={16} /> Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="teachers.dialog">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  placeholder="Teacher full name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  data-ocid="teachers.name.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="teacher@dbca.edu"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  data-ocid="teachers.email.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Login Username</Label>
                <Input
                  placeholder="e.g. teacher1"
                  value={form.username}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, username: e.target.value }))
                  }
                  data-ocid="teachers.username.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Login Password</Label>
                <Input
                  type="password"
                  placeholder="Set a password for this teacher"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  data-ocid="teachers.password.input"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => addMutation.mutate()}
                  disabled={addMutation.isPending || !form.name || !form.email}
                  data-ocid="teachers.submit_button"
                >
                  {addMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Adding...
                    </>
                  ) : (
                    "Add Teacher"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-ocid="teachers.cancel_button"
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
          <Table data-ocid="teachers.table">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
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
              ) : teachers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="teachers.empty_state"
                  >
                    No teachers found. Add the first faculty member.
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((t, i) => (
                  <TableRow
                    key={String(t.id)}
                    data-ocid={`teachers.row.${i + 1}`}
                  >
                    <TableCell className="text-muted-foreground text-sm">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.email}</TableCell>
                    <TableCell>
                      <Badge variant={t.isActive ? "default" : "secondary"}>
                        {t.isActive ? "Active" : "Inactive"}
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
