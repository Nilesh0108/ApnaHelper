
"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Wallet, TrendingUp, Loader2, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

export default function WorkerEarnings() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  // Query completed jobs for this specific worker
  const completedJobsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'service_requests'),
      where('workerId', '==', user.uid),
      where('status', '==', 'COMPLETED')
    );
  }, [db, user]);

  const { data: completedJobs, isLoading: isJobsLoading } = useCollection(completedJobsQuery);

  // Calculate totals and chart data
  const stats = useMemo(() => {
    if (!completedJobs) return { total: 0, count: 0, monthlyData: [] };

    const total = completedJobs.reduce((acc, job) => acc + (job.actualCost || 0), 0);
    const count = completedJobs.length;

    // Group by month for the chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const earningsByMonth: Record<string, number> = {};

    completedJobs.forEach(job => {
      const date = job.completedAt?.seconds ? new Date(job.completedAt.seconds * 1000) : new Date();
      const monthName = months[date.getMonth()];
      earningsByMonth[monthName] = (earningsByMonth[monthName] || 0) + (job.actualCost || 0);
    });

    const monthlyData = Object.entries(earningsByMonth).map(([month, amount]) => ({
      month,
      amount
    })).sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));

    return { total, count, monthlyData };
  }, [completedJobs]);

  if (isUserLoading || isJobsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Calculating your revenue...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings Overview</h1>
          <p className="text-muted-foreground">Track your professional income and completed service performance.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground shadow-xl border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium opacity-90">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">₹{stats.total.toLocaleString()}</div>
            <div className="flex items-center mt-2 text-sm opacity-80">
              <TrendingUp className="h-4 w-4 mr-1" /> Verified platform earnings
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Jobs Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.count}</div>
            <p className="text-xs text-muted-foreground mt-2">Lifetime successful tasks</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Avg. Per Job</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">₹{stats.count > 0 ? Math.round(stats.total / stats.count).toLocaleString() : 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Based on accepted quote prices</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-primary/10">
          <CardHeader>
            <CardTitle>Income Trends</CardTitle>
            <CardDescription>Monthly revenue distribution from completed services</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {stats.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.02)'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                <TrendingUp className="h-10 w-10 mb-2 opacity-20" />
                <p>Not enough data to show trends yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/10">
          <CardHeader>
            <CardTitle>Recent Income</CardTitle>
            <CardDescription>Last 5 completed jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {!completedJobs || completedJobs.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">No completed jobs yet.</p>
              ) : (
                [...completedJobs].sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0)).slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full group-hover:bg-green-200 transition-colors">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold truncate max-w-[120px]">{job.serviceType}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {job.completedAt?.seconds 
                            ? new Date(job.completedAt.seconds * 1000).toLocaleDateString() 
                            : 'Recently'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-green-600">+₹{job.actualCost}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
