
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getJobs, getAllUsers, banUser } from "@/lib/mock-data";
import { JobRequest, User } from "@/lib/types";
import { Users, Briefcase, CheckCircle2, AlertTriangle, Ban, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<JobRequest[]>([]);

  useEffect(() => {
    setUsers(getAllUsers());
    setJobs(getJobs());
  }, []);

  const handleBanUser = (userId: string) => {
    const updated = banUser(userId);
    setUsers(updated);
    toast({
      title: "User Banned",
      description: "Access has been restricted for this account.",
    });
  };

  const stats = {
    totalUsers: users.length,
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.status === 'accepted' || j.status === 'in-progress').length,
    completedJobs: jobs.filter(j => j.status === 'completed').length,
  };

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
        <p className="text-muted-foreground">Monitor platform activity and manage community safety.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">Total Users</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Briefcase className="h-5 w-5 text-secondary" />
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">Total Service Requests</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">Active Jobs</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div className="text-2xl font-bold">{stats.completedJobs}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">Completed Tasks</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Review and manage access for platform participants.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{u.name}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                    <TableCell>
                      {u.isBanned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        disabled={u.isBanned || u.role === 'admin'}
                        onClick={() => handleBanUser(u.id)}
                      >
                        <Ban className="h-4 w-4 mr-1" /> Ban
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Job Activity</CardTitle>
            <CardDescription>Tracking real-time service requests and status changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.slice(-5).reverse().map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                  <div className="space-y-1">
                    <div className="font-semibold text-sm">{job.serviceType}</div>
                    <div className="text-xs text-muted-foreground">For: {job.customerName}</div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {job.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
