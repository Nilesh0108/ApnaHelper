
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getJobs, getAllUsers } from "@/lib/mock-data";
import { JobRequest, User } from "@/lib/types";
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
import { FileText, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminReports() {
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setJobs(getJobs());
    setUsers(getAllUsers());
  }, []);

  const serviceDistribution = [
    { name: 'Plumbing', value: jobs.filter(j => j.serviceType === 'Plumbing').length },
    { name: 'Electrical', value: jobs.filter(j => j.serviceType === 'Electrical').length },
    { name: 'Cleaning', value: jobs.filter(j => j.serviceType === 'Cleaning').length },
    { name: 'Others', value: jobs.filter(j => !['Plumbing', 'Electrical', 'Cleaning'].includes(j.serviceType)).length },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const growthData = [
    { name: 'Week 1', jobs: 12 },
    { name: 'Week 2', jobs: 19 },
    { name: 'Week 3', jobs: 15 },
    { name: 'Week 4', jobs: 24 },
  ];

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
          <p className="text-muted-foreground">In-depth analysis of platform growth and service demand.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Service Demand</CardTitle>
            <CardDescription>Breakdown of requests by category</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Volume</CardTitle>
            <CardDescription>Platform activity growth over the current month</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="jobs" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Revenue Generated</div>
              <div className="text-2xl font-bold">$12,450</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">New Users</div>
              <div className="text-2xl font-bold">+84</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Completion Rate</div>
              <div className="text-2xl font-bold">92%</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Avg. Rating</div>
              <div className="text-2xl font-bold">4.8/5</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
