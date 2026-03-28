import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Bell, Info } from "lucide-react";
import { useActor } from "../hooks/useActor";

const SKEL_ROWS = ["r1", "r2", "r3", "r4"];
const SKEL_COLS = ["c1", "c2", "c3", "c4", "c5"];

export default function NotificationsPage() {
  const { actor, isFetching } = useActor();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (actor ? actor.getNotifications(BigInt(0)) : []),
    enabled: !!actor && !isFetching,
  });

  return (
    <div className="space-y-6" data-ocid="notifications.page">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Parent notification records
        </p>
      </div>

      {/* Info banner */}
      <div
        className="flex items-start gap-3 p-4 rounded-lg border"
        style={{
          backgroundColor: "oklch(0.94 0.03 245)",
          borderColor: "oklch(0.35 0.09 245 / 0.3)",
        }}
      >
        <Info size={18} className="text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-foreground">
          Parent notifications are recorded in the system whenever a student is
          marked absent without an approved leave, permission, or on-duty entry.{" "}
          <strong>
            Email/SMS delivery requires a paid communication plan.
          </strong>
        </p>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell size={16} /> Notification Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="notifications.table">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Message</TableHead>
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
              ) : notifications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="notifications.empty_state"
                  >
                    No notifications recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((n, i) => (
                  <TableRow
                    key={String(n.id)}
                    data-ocid={`notifications.row.${i + 1}`}
                  >
                    <TableCell className="text-muted-foreground text-sm">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {String(n.studentId)}
                    </TableCell>
                    <TableCell>{n.date}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {n.message}
                    </TableCell>
                    <TableCell>
                      <Badge variant={n.isRead ? "secondary" : "default"}>
                        {n.isRead ? "Read" : "Unread"}
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
