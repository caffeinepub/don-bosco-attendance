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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LeaveType } from "../backend";
import { useActor } from "../hooks/useActor";

const today = new Date().toISOString().split("T")[0];

export default function LeaveManagement() {
  const { actor, isFetching } = useActor();

  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState(today);
  const [leaveType, setLeaveType] = useState("leave");
  const [submitting, setSubmitting] = useState(false);

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => (actor ? actor.getAllStudents() : []),
    enabled: !!actor && !isFetching,
  });

  const [leaveEntries, setLeaveEntries] = useState<
    Array<{
      id: bigint;
      studentName: string;
      studentId: bigint;
      date: string;
      leaveType: string;
      isApproved: boolean;
    }>
  >([]);

  const leaveTypeMap: Record<string, LeaveType> = {
    leave: LeaveType.leave,
    permission: LeaveType.permission,
    onDuty: LeaveType.onDuty,
  };

  const handleAddLeave = async () => {
    if (!actor || !studentId) return;
    setSubmitting(true);
    try {
      const id = await actor.addLeaveEntry({
        id: BigInt(0),
        studentId: BigInt(studentId),
        date,
        courseId: "",
        leaveType: leaveTypeMap[leaveType] ?? LeaveType.leave,
        isApproved: false,
        approvedBy: "",
      });
      const student = students.find((s) => String(s.id) === studentId);
      setLeaveEntries((prev) => [
        ...prev,
        {
          id,
          studentName: student?.name ?? "Unknown",
          studentId: BigInt(studentId),
          date,
          leaveType,
          isApproved: false,
        },
      ]);
      toast.success("Leave entry added!");
      setStudentId("");
    } catch {
      toast.error("Failed to add leave entry");
    } finally {
      setSubmitting(false);
    }
  };

  const approveMutation = useMutation({
    mutationFn: async (leaveId: bigint) => {
      if (!actor) throw new Error();
      await actor.approveLeave(leaveId, "Admin");
    },
    onSuccess: (_, leaveId) => {
      toast.success("Leave approved!");
      setLeaveEntries((prev) =>
        prev.map((e) => (e.id === leaveId ? { ...e, isApproved: true } : e)),
      );
    },
    onError: () => toast.error("Failed to approve"),
  });

  const leaveTypeLabel: Record<string, string> = {
    leave: "Leave",
    permission: "Permission",
    onDuty: "On Duty",
  };

  return (
    <div className="space-y-6" data-ocid="leave.page">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Leave / OD Management
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage student leave, permission, and on-duty entries
        </p>
      </div>

      <Card className="shadow-card border-border max-w-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Add Leave / OD Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Student</Label>
            <Select
              value={studentId}
              onValueChange={setStudentId}
              disabled={studentsLoading}
              data-ocid="leave.student.select"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
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

          <div className="space-y-1.5">
            <Label>Date</Label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              data-ocid="leave.date.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Leave Type</Label>
            <Select
              value={leaveType}
              onValueChange={setLeaveType}
              data-ocid="leave.type.select"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leave">Leave</SelectItem>
                <SelectItem value="permission">Permission</SelectItem>
                <SelectItem value="onDuty">On Duty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAddLeave}
            disabled={submitting || !studentId}
            className="w-full"
            data-ocid="leave.submit_button"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Entry"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Leave Entries
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="leave.table">
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveEntries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="leave.empty_state"
                  >
                    No leave entries yet.
                  </TableCell>
                </TableRow>
              ) : (
                leaveEntries.map((entry, i) => (
                  <TableRow
                    key={String(entry.id)}
                    data-ocid={`leave.row.${i + 1}`}
                  >
                    <TableCell className="font-medium">
                      {entry.studentName}
                    </TableCell>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {leaveTypeLabel[entry.leaveType] ?? entry.leaveType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entry.isApproved ? (
                        <Badge
                          style={{
                            backgroundColor: "oklch(0.58 0.15 155)",
                            color: "white",
                          }}
                        >
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!entry.isApproved && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs"
                          onClick={() => approveMutation.mutate(entry.id)}
                          disabled={approveMutation.isPending}
                          data-ocid={`leave.confirm_button.${i + 1}`}
                        >
                          <CheckCircle size={13} /> Approve
                        </Button>
                      )}
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
