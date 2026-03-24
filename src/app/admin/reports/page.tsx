"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Download, Filter, Loader2, TrendingUp, Users, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminReports() {
  const db = useFirestore();

  // Real-time data queries
  const usersQuery = useMemoFirebase(() => collection(db, "users"), [db]);
  const jobsQuery = useMemoFirebase(() => 
    query(collection(db, "service_requests"), orderBy("createdAt", "desc")), 
  [db]);

  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(jobsQuery);

  // CSV Export Logic
  const handleExport = () => {
    if (!jobs || jobs.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "There are no service requests available to generate a report.",
      });
      return;
    }

    const headers = ["Job ID", "Service Type", "Status", "Customer", "Worker", "Cost (INR)", "Created Date"];
    const rows = jobs.map(j => {
      const date = j.createdAt?.seconds ? new Date(j.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';
      return [
        j.id,
        j.serviceType,
        j.status,
        `"${j.customerName || j.customerId}"`,
        `"${j.workerName || j.workerId || 'Unassigned'}"`,
        j.actualCost || 0,
        date
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ApnaHelper_Platform_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Report Exported",
      description: "Platform data has been downloaded as a CSV file.",
    });
  };

  // Calculate Reports Data
  const reportsData = useMemo(() => {
    if (!jobs || !users) return null;

    // 1. Service Distribution (Pie Chart)
    const counts: Record<string, number> = {};
    jobs.forEach(j => {
      counts[j.serviceType] = (counts[j.serviceType] || 0) + 1;
    });
    const serviceDistribution = Object.entries(counts).map(([name, value]) => ({ name, value }));

    // 2. Growth Data (Line Chart - Grouped by last 7 days for precision)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }).reverse();

    const volumeMap: Record<string, number> = {};
    last7Days.forEach(day => volumeMap[day] = 0);

    jobs.forEach(j => {
      const date = j.createdAt?.seconds ? new Date(j.createdAt.seconds * 1000) : new Date();
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      if (volumeMap[dayName] !== undefined) {
        volumeMap[dayName]++;
      }
    });

    const growthData = last7Days.map(name => ({ name, jobs: volumeMap[name] }));

    // 3. Summary Stats
    const completedJobs = jobs.filter(j => j.status === 'COMPLETED');
    const revenue = completedJobs.reduce((acc, j) => acc + (j.actualCost || 0), 0);
    const completionRate = jobs.length > 0 ? Math.round((completedJobs.length / jobs.length) * 100) : 0;
    
    const ratedJobs = jobs.filter(j => j.workerRating);
    const avgRating = ratedJobs.length > 0 
      ? (ratedJobs.reduce((acc, j) => acc + (j.workerRating || 0), 0) / ratedJobs.length).toFixed(1)
      : "0.0";

    return {
      serviceDistribution,
      growthData,
      revenue,
      completionRate,
      avgRating,
      totalUsers: users.length
    };
  }, [jobs, users]);

  if (isUsersLoading || isJobsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Generating real-time reports...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Intelligence</h1>
          <p className="text-muted-foreground">Dynamic analysis of platform growth and service trends.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div className="text-2xl font-bold">₹{reportsData?.revenue.toLocaleString()}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">Total Platform Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-blue-600" />
              <div className="text-2xl font-bold">{reportsData?.totalUsers}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">Active Community</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
              <div className="text-2xl font-bold">{reportsData?.completionRate}%</div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">Success Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Star className="h-5 w-5 text-yellow-500" />
              <div className="text-2xl font-bold">{reportsData?.avgRating}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">Avg. User Satisfaction</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Service Demand</CardTitle>
            <CardDescription>Market share by service category</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportsData?.serviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reportsData?.serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    backgroundColor: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Velocity</CardTitle>
            <CardDescription>Daily job request volume (Last 7 Days)</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportsData?.growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    backgroundColor: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="jobs" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4}
                  dot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/30 border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Real-Time Insight Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground leading-relaxed">
            The platform is currently operating at a <span className="font-bold text-foreground">{reportsData?.completionRate}% completion rate</span> across <span className="font-bold text-foreground">{jobs?.length} total requests</span>. 
            The most active service category is <span className="font-bold text-primary">{reportsData?.serviceDistribution[0]?.name || "N/A"}</span>. 
            Platform liquidity remains healthy with a total transacted volume of <span className="font-bold text-foreground">₹{reportsData?.revenue.toLocaleString()}</span>.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
