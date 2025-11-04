"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Menu, Home, Users, Zap, Gift, Settings, LogOut, TrendingUp, DollarSign, Users2 } from "lucide-react"
import { useState } from "react"

const mockUsers = [
  { date: "Jan", users: 400, earnings: 2400 },
  { date: "Feb", users: 520, earnings: 2810 },
  { date: "Mar", users: 680, earnings: 3290 },
  { date: "Apr", users: 890, earnings: 3908 },
  { date: "May", users: 1200, earnings: 4800 },
  { date: "Jun", users: 1400, earnings: 5100 },
]

const taskCategories = [
  { name: "Channel Joins", value: 35, fill: "hsl(var(--chart-1))" },
  { name: "Video Watches", value: 25, fill: "hsl(var(--chart-2))" },
  { name: "Group Joins", value: 20, fill: "hsl(var(--chart-3))" },
  { name: "Referrals", value: 20, fill: "hsl(var(--chart-4))" },
]

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePage, setActivePage] = useState("dashboard")

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300 bg-sidebar border-r border-sidebar-border overflow-y-auto`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground font-bold">
              R
            </div>
            {sidebarOpen && <span className="font-bold text-lg text-sidebar-foreground">RewardsBot</span>}
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { id: "dashboard", icon: Home, label: "Dashboard" },
            { id: "users", icon: Users, label: "Users" },
            { id: "tasks", icon: Zap, label: "Tasks" },
            { id: "referrals", icon: Users2, label: "Referrals" },
            { id: "rewards", icon: Gift, label: "Rewards" },
            { id: "settings", icon: Settings, label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activePage === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            </div>
            <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="text-accent" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">14,235</div>
                <p className="text-sm text-muted-foreground">+8.2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                <Zap className="text-accent" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24</div>
                <p className="text-sm text-muted-foreground">+2 new this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
                <DollarSign className="text-accent" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">52.4M</div>
                <p className="text-sm text-muted-foreground">Coins distributed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium">Referral Rate</CardTitle>
                <TrendingUp className="text-accent" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">34.2%</div>
                <p className="text-sm text-muted-foreground">+5% this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Growth */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>User Growth & Earnings</CardTitle>
                <CardDescription>Monthly trends over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--chart-2))" name="New Users" />
                    <Line type="monotone" dataKey="earnings" stroke="hsl(var(--chart-1))" name="Earnings (K)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Task Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
                <CardDescription>By category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={taskCategories} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                      {taskCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks Completed</CardTitle>
              <CardDescription>Latest user activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">User ID</th>
                      <th className="text-left py-3 px-4 font-medium">Task</th>
                      <th className="text-left py-3 px-4 font-medium">Reward</th>
                      <th className="text-left py-3 px-4 font-medium">Time</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "#2851", task: "Join Channel", reward: "5,000", time: "2 min ago", status: "Completed" },
                      { id: "#2850", task: "Watch Video", reward: "3,500", time: "5 min ago", status: "Completed" },
                      { id: "#2849", task: "Referral Bonus", reward: "1,000", time: "12 min ago", status: "Completed" },
                      { id: "#2848", task: "Share Post", reward: "2,000", time: "18 min ago", status: "Pending" },
                    ].map((row) => (
                      <tr key={row.id} className="border-b border-border hover:bg-secondary transition-colors">
                        <td className="py-3 px-4 font-mono text-accent">{row.id}</td>
                        <td className="py-3 px-4">{row.task}</td>
                        <td className="py-3 px-4 font-semibold">{row.reward} coins</td>
                        <td className="py-3 px-4 text-muted-foreground">{row.time}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              row.status === "Completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button className="bg-primary hover:bg-primary/90">Create New Task</Button>
              <Button variant="outline">Add Promotion</Button>
              <Button variant="outline">Send Notification</Button>
              <Button variant="outline">Export Report</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
