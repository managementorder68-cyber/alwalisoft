"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Gift, Users, TrendingUp, Copy, Clock, ChevronRight, Gem } from "lucide-react"
import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const earningsData = [
  { day: "Mon", earned: 15000 },
  { day: "Tue", earned: 22000 },
  { day: "Wed", earned: 18000 },
  { day: "Thu", earned: 25000 },
  { day: "Fri", earned: 32000 },
  { day: "Sat", earned: 28000 },
  { day: "Sun", earned: 35000 },
]

const activeTasks = [
  { id: 1, name: "Join Telegram Channel", reward: 5000, category: "Channel", completed: 0, total: 1, icon: Users },
  { id: 2, name: "Watch Video (3+ min)", reward: 1000, category: "Video", completed: 2, total: 3, icon: Zap },
  { id: 3, name: "Share Post to Story", reward: 2000, category: "Social", completed: 1, total: 2, icon: Gift },
  { id: 4, name: "Join Group Chat", reward: 5000, category: "Group", completed: 0, total: 1, icon: Users },
]

const referralData = [
  { level: "Level 1", count: 145, commission: "10%", earned: "1,245,000" },
  { level: "Level 2", count: 32, commission: "5%", earned: "320,000" },
  { level: "Level 3", count: 8, commission: "2%", earned: "64,000" },
]

export default function UserPortal() {
  const [currentTab, setCurrentTab] = useState("tasks")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rewards Bot</h1>
            <p className="text-sm text-muted-foreground">Earn coins by completing tasks</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Your Balance</p>
              <p className="text-2xl font-bold text-accent">24,523,450</p>
              <p className="text-xs text-muted-foreground">coins</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">Withdraw</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">175,000</div>
              <p className="text-sm text-accent text-text-pretty">+12% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Professional</div>
              <p className="text-sm text-muted-foreground">5,234 users ahead</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">185</div>
              <p className="text-sm text-accent">Earning 15% commission</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12 days</div>
              <p className="text-sm text-muted-foreground">Keep it going!</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="flex gap-2 border-b border-border">
          {[
            { id: "tasks", label: "Available Tasks", icon: Zap },
            { id: "earnings", label: "Earnings", icon: TrendingUp },
            { id: "referrals", label: "Referrals", icon: Users },
            { id: "rewards", label: "Rewards Shop", icon: Gem },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                currentTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tasks Tab */}
        {currentTab === "tasks" && (
          <div className="space-y-4">
            <div className="grid gap-4">
              {activeTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <task.icon className="text-primary" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{task.name}</h3>
                          <div className="flex gap-3 mt-2 flex-wrap">
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                              {task.category}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {task.completed}/{task.total} completed
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent mb-2">{task.reward.toLocaleString()}</div>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          Complete
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bonus Tasks Section */}
            <Card className="border-accent/50 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-accent flex items-center gap-2">
                  <Gem size={20} />
                  Limited Time Bonus Tasks
                </CardTitle>
                <CardDescription>These tasks expire in 24 hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Weekend Bonus x2", reward: 50000 },
                  { name: "Play Mini Game", reward: 15000 },
                ].map((bonus, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-background rounded-lg border border-accent/20"
                  >
                    <div>
                      <p className="font-medium">{bonus.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock size={14} /> 24h remaining
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-accent">{bonus.reward.toLocaleString()}</p>
                      <Button size="sm" variant="outline">
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Earnings Tab */}
        {currentTab === "earnings" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Earnings</CardTitle>
                <CardDescription>Your earnings over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toLocaleString()} coins`} />
                    <Line
                      type="monotone"
                      dataKey="earned"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--accent))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Earning Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { source: "Tasks Completed", amount: 285000 },
                    { source: "Referral Commissions", amount: 125000 },
                    { source: "Bonus Activities", amount: 45000 },
                    { source: "Daily Streaks", amount: 68000 },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center pb-3 border-b border-border last:border-0"
                    >
                      <span className="text-muted-foreground">{item.source}</span>
                      <span className="font-semibold">{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Withdraw Balance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Withdrawable Amount</p>
                    <p className="text-3xl font-bold text-accent">24,523,450</p>
                    <p className="text-xs text-muted-foreground mt-1">= $24,523.45 USDT</p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-primary">Withdraw Now</Button>
                    <Button variant="outline" className="px-3 bg-transparent">
                      <Copy size={18} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {currentTab === "referrals" && (
          <div className="space-y-6">
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  Your Referral Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value="https://t.me/rewardsbot?start=ref_user123"
                    readOnly
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg font-mono text-sm"
                  />
                  <Button variant="outline">
                    <Copy size={18} />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Share this link to earn commissions from your referrals</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Referral Commission Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Level</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Your Referrals</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Commission</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Earned This Month</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralData.map((row) => (
                        <tr key={row.level} className="border-b border-border hover:bg-secondary transition-colors">
                          <td className="py-3 px-4 font-semibold">{row.level}</td>
                          <td className="py-3 px-4">{row.count}</td>
                          <td className="py-3 px-4 text-accent font-semibold">{row.commission}</td>
                          <td className="py-3 px-4 font-bold">{row.earned}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rewards Shop Tab */}
        {currentTab === "rewards" && (
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Rare Card Pack", price: 50000, icon: "🎴" },
              { name: "2x Earnings Day Pass", price: 100000, icon: "⚡" },
              { name: "Rank Boost", price: 200000, icon: "⭐" },
              { name: "Premium Avatar", price: 75000, icon: "👤" },
              { name: "Gift Box", price: 150000, icon: "🎁" },
              { name: "Crypto Airdrop", price: 500000, icon: "🚀" },
            ].map((item, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4 text-center">{item.icon}</div>
                  <h3 className="font-semibold text-center mb-2">{item.name}</h3>
                  <div className="text-center mb-4">
                    <p className="text-2xl font-bold text-accent">{item.price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">coins</p>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">Buy Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
