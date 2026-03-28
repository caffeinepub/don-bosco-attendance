import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ClipboardCheck, GraduationCap, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useActor } from "../hooks/useActor";

const weeklyData = [
  { day: "Mon", present: 145, absent: 14 },
  { day: "Tue", present: 138, absent: 21 },
  { day: "Wed", present: 152, absent: 7 },
  { day: "Thu", present: 141, absent: 18 },
  { day: "Fri", present: 133, absent: 26 },
];

const recentActivity = [
  {
    text: "Attendance submitted for Crop Science - Year 2, Section A",
    time: "10 min ago",
  },
  { text: "Leave approved for student S2024-045 (3 days)", time: "45 min ago" },
  { text: "New student added: Maria Thomas (Year 1)", time: "2 hrs ago" },
  { text: "Attendance report generated for Semester III", time: "Yesterday" },
  {
    text: "OD entry added for Intra-college Cultural Events",
    time: "Yesterday",
  },
];

const kpiColors = [
  "oklch(0.94 0.03 245)",
  "oklch(0.96 0.04 78)",
  "oklch(0.94 0.05 155)",
  "oklch(0.94 0.03 245)",
];

export default function Dashboard() {
  const { actor, isFetching } = useActor();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });

  const kpis = [
    {
      title: "Total Students",
      value: stats ? Number(stats.totalStudents) : 0,
      icon: <Users size={20} className="text-primary" />,
    },
    {
      title: "Total Teachers",
      value: stats ? Number(stats.totalTeachers) : 0,
      icon: (
        <GraduationCap size={20} style={{ color: "oklch(0.73 0.14 78)" }} />
      ),
    },
    {
      title: "Total Courses",
      value: stats ? Number(stats.totalCourses) : 0,
      icon: <BookOpen size={20} style={{ color: "oklch(0.58 0.15 155)" }} />,
    },
    {
      title: "Today's Attendance",
      value: stats ? Number(stats.todayAttendanceCount) : 0,
      icon: <ClipboardCheck size={20} className="text-primary" />,
    },
  ];

  const skeletonKeys = ["sk-a", "sk-b", "sk-c", "sk-d"];

  return (
    <div className="space-y-6" data-ocid="dashboard.page">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Overview of attendance and activity
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card
            key={kpi.title}
            className="shadow-card border-border"
            data-ocid={`dashboard.kpi.item.${i + 1}`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {kpi.title}
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-9 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {kpi.value}
                    </p>
                  )}
                </div>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: kpiColors[i] }}
                >
                  {kpi.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <Card className="lg:col-span-2 shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Weekly Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {skeletonKeys.map((k) => (
                  <Skeleton key={k} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData} barSize={24} barGap={4}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      fontSize: 12,
                      border: "1px solid oklch(0.91 0.02 240)",
                    }}
                  />
                  <Bar
                    dataKey="present"
                    name="Present"
                    fill="oklch(0.58 0.15 155)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="absent"
                    name="Absent"
                    fill="oklch(0.577 0.245 27.325)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((item, i) => (
              <div
                key={item.text}
                className="flex gap-3"
                data-ocid={`dashboard.activity.item.${i + 1}`}
              >
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: "oklch(0.35 0.09 245)" }}
                />
                <div>
                  <p className="text-sm text-foreground leading-tight">
                    {item.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
