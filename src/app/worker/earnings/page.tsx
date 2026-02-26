
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { getSession, getJobs } from "@/lib/mock-data";
import { JobRequest, User } from "@/lib/types";
import { Wallet, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function WorkerEarnings() {
  const [user, setUser] = useState<User | null>(null);
  const [myJobs, setMyJobs] = useState<JobRequest[]>([]);

  useEffect(() => {
    const session = getSession();
    setUser(session);
    if (session) {
      const allJobs = getJobs();
      setMyJobs(allJobs.filter(j => j.workerId === session.id && j.status === 'completed'));
    }
  }, []);

  // Mock data for chart - based on completed jobs
  const monthlyData = [
    { month: 'Jan', amount: 450 },
    { month: 'Feb', amount: 300 },
    { month: 'Mar', amount: 600 },
    { month: 'Apr', amount: 800 },
    { month: 'May', amount: 500 },
    { month: 'Jun', amount: 750 },
  ];

  const totalEarnings = myJobs.length * 150; // Mock average per job

  if (!user) return null;

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings Overview</h1>
          <p className="text-muted-foreground">Track your income and completed service performance.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium opacity-90">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">${totalEarnings}</div>
            <div className="flex items-center mt-2 text-sm opacity-80">
              <TrendingUp className="h-4 w-4 mr-1" /> +12% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Jobs Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{myJobs.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Lifetime successful tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Avg. Hourly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">$45</div>
            <p className="text-xs text-muted-foreground mt-2">Based on active hours logged</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income Trends</CardTitle>
            <CardDescription>Earnings distribution over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.05)'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Wallet className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Weekly Payout</div>
                      <div className="text-xs text-muted-foreground">Oct {15 - i}, 2024</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold">+${120 * i}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
