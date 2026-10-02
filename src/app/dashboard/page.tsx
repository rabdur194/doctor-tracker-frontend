"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getDashboardStats } from "@/lib/api";
import type { DashboardStats } from "@/types";
import { Stethoscope, Users, Activity, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

/**
 * Dashboard page - data visualization & analytics
 */
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !stats) {
    return (
      <AppLayout>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error || "Failed to load stats"}
        </div>
      </AppLayout>
    );
  }

  // Prepare chart data
  const patientsPerDoctorData = stats.patientsPerDoctor.map((d) => ({
    name: d.doctorName?.split(" ").slice(-1)[0] || "Unknown", // last name for brevity
    patients: d.patientCount,
    fullName: d.doctorName,
  }));

  const conditionData = stats.conditionStats.map((c) => ({
    name: c._id,
    value: c.count,
  }));

  // Merge date stats for line chart
  const dateMap = new Map<
    string,
    { date: string; patients: number; doctors: number }
  >();
  stats.patientsByDate.forEach((p) => {
    dateMap.set(p._id, { date: p._id, patients: p.count, doctors: 0 });
  });
  stats.doctorsByDate.forEach((d) => {
    const existing = dateMap.get(d._id);
    if (existing) {
      existing.doctors = d.count;
    } else {
      dateMap.set(d._id, { date: d._id, patients: 0, doctors: d.count });
    }
  });
  const dateData = Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Overview of doctors and patients
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Doctors"
            value={stats.totalDoctors}
            icon={<Stethoscope className="w-6 h-6" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={<Users className="w-6 h-6" />}
            color="bg-emerald-500"
          />
          <StatCard
            title="Avg Patients/Doctor"
            value={
              stats.totalDoctors
                ? (stats.totalPatients / stats.totalDoctors).toFixed(1)
                : 0
            }
            icon={<Activity className="w-6 h-6" />}
            color="bg-amber-500"
          />
          <StatCard
            title="Conditions Tracked"
            value={stats.conditionStats.length}
            icon={<TrendingUp className="w-6 h-6" />}
            color="bg-violet-500"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patients per doctor - Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Patients per Doctor
            </h2>

            {patientsPerDoctorData.length === 0 ? (
              <p className="text-slate-400 text-center py-12">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={patientsPerDoctorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />

                  {/* Simple tooltip - no `any`, no red marks */}
                  <Tooltip
                    formatter={(value) => [String(value ?? 0), "Patients"]}
                    labelFormatter={(label) => String(label)}
                  />

                  <Bar
                    dataKey="patients"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Condition distribution - Pie */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Top Conditions
            </h2>
            {conditionData.length === 0 ? (
              <p className="text-slate-400 text-center py-12">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={conditionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name ?? ""} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {conditionData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Date-based line chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Activity (Last 30 Days)
          </h2>
          {dateData.length === 0 ? (
            <p className="text-slate-400 text-center py-12">
              No recent activity
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="patients"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="New Patients"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="doctors"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="New Doctors"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

/** Small reusable stat card */
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
      <div className={`${color} text-white p-3 rounded-xl`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
