"use client";

import { PageHeader } from "@/components/admin/page-header";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, UserCheck, UserX, TrendingUp, Calendar, Award } from 'lucide-react';

// Data dummy yang sinkron dengan users-roles page
const dummyUsers = [
  {
    id: "1",
    name: "Dr. Andi Wijaya, M.Kom",
    email: "andi.wijaya@ui.ac.id",
    role: "Editor-in-Chief",
    status: "active",
    registeredAt: "2023-01-15",
    lastLogin: "2024-01-20T10:30:00Z"
  },
  {
    id: "2", 
    name: "Siti Nurhaliza, S.T., M.T.",
    email: "siti.nurhaliza@ugm.ac.id",
    role: "Section Editor",
    status: "active",
    registeredAt: "2023-03-20",
    lastLogin: "2024-01-19T14:15:00Z"
  },
  {
    id: "3",
    name: "Bambang Suryadi, S.Kom., M.Kom.",
    email: "bambang.s@itb.ac.id",
    role: "Reviewer",
    status: "active", 
    registeredAt: "2023-05-10",
    lastLogin: "2024-01-18T09:45:00Z"
  },
  {
    id: "4",
    name: "Dr. Ratih Pratiwi, M.Kom.",
    email: "ratih.pratiwi@unpad.ac.id",
    role: "Copyeditor",
    status: "inactive",
    registeredAt: "2023-02-28",
    lastLogin: "2023-12-15T16:20:00Z"
  },
  {
    id: "5",
    name: "Dr. Budi Santoso",
    email: "budi.santoso@binus.ac.id",
    role: "Reviewer",
    status: "active",
    registeredAt: "2023-04-12", 
    lastLogin: "2024-01-21T11:00:00Z"
  }
];

// Hitung statistik dari data dummy
const calculateStats = () => {
  const totalUsers = dummyUsers.length;
  const activeUsers = dummyUsers.filter(u => u.status === 'active').length;
  const inactiveUsers = dummyUsers.filter(u => u.status === 'inactive').length;
  
  // Hitung per role
  const roleCount: Record<string, number> = {};
  dummyUsers.forEach(user => {
    roleCount[user.role] = (roleCount[user.role] || 0) + 1;
  });
  
  // Data untuk chart roles
  const roleData = Object.entries(roleCount).map(([role, count]) => ({
    role,
    count,
    percentage: ((count / totalUsers) * 100).toFixed(1)
  }));
  
  // Data untuk registration over time (dummy data untuk 12 bulan terakhir)
  const registrationData = [
    { month: 'Jan 2023', users: 1 },
    { month: 'Feb 2023', users: 1 },
    { month: 'Mar 2023', users: 1 },
    { month: 'Apr 2023', users: 1 },
    { month: 'May 2023', users: 1 },
    { month: 'Jun 2023', users: 0 },
    { month: 'Jul 2023', users: 0 },
    { month: 'Aug 2023', users: 0 },
    { month: 'Sep 2023', users: 0 },
    { month: 'Oct 2023', users: 0 },
    { month: 'Nov 2023', users: 0 },
    { month: 'Dec 2023', users: 0 },
  ];
  
  // Data untuk pie chart status
  const statusData = [
    { name: 'Active', value: activeUsers, color: '#10b981' },
    { name: 'Inactive', value: inactiveUsers, color: '#6b7280' },
  ];
  
  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    roleData,
    registrationData,
    statusData,
    roleCount
  };
};

const stats = calculateStats();

const COLORS = ['#002C40', '#0066CC', '#0099FF', '#00CCFF', '#33DDFF'];

export default function UsersStatisticsPage() {
  return (
    <section style={{
      width: "100%",
      maxWidth: "100%",
      minHeight: "100%",
      backgroundColor: "#eaedee",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    }}>
      {/* Page Header - OJS 3.3 Style with Safe Area */}
      <div style={{
        backgroundColor: "#ffffff",
        borderBottom: "2px solid #e5e5e5",
        padding: "1.5rem 0", // Safe padding
      }}>
        <div style={{
          padding: "0 1.5rem", // Safe padding horizontal
        }}>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            margin: 0,
            padding: "0.5rem 0",
            lineHeight: "2.25rem",
            color: "#002C40",
          }}>
            User Statistics
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            Statistik pengguna untuk jurnal.
          </p>
        </div>
      </div>

      {/* Content - OJS 3.3 Style with Safe Area */}
      <div style={{
        padding: "0 1.5rem", // Safe padding horizontal
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" style={{
          width: "100%",
          maxWidth: "100%",
        }}>
        <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">{stats.totalUsers}</div>
              <div className="text-sm text-[var(--muted)] mt-1">Total Users</div>
            </div>
            <Users className="h-8 w-8 text-[var(--primary)]" />
          </div>
        </div>
        
        <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
              <div className="text-sm text-[var(--muted)] mt-1">Active Users</div>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-600">{stats.inactiveUsers}</div>
              <div className="text-sm text-[var(--muted)] mt-1">Inactive Users</div>
            </div>
            <UserX className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        
        <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-[var(--primary)]">
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-[var(--muted)] mt-1">Active Rate</div>
            </div>
            <TrendingUp className="h-8 w-8 text-[var(--primary)]" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role - Bar Chart */}
        <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Users by Role
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.roleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="role" 
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#002C40" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Status - Pie Chart */}
        <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Registration Over Time */}
      <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          User Registration Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.registrationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#002C40" 
              strokeWidth={2}
              name="New Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Role Overview Table */}
      <div className="rounded-lg border border-[var(--border)] bg-white shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Role Overview</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--surface-muted)]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)]">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)]">Count</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)]">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {stats.roleData.map((item, index) => (
                  <tr key={item.role} className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]">
                    <td className="px-4 py-3 text-sm text-[var(--foreground)] font-medium">{item.role}</td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">{item.count}</td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${item.percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                        </div>
                        <span>{item.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
