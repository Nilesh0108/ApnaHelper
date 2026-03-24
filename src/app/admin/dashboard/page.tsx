"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { Users, Briefcase, CheckCircle2, Ban, BarChart3, Loader2, ShieldCheck, MessageSquare, Clock, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const db = useFirestore();

  // Queries for real-time data
  const usersQuery = useMemoFirebase(() => collection(db, "users"), [db]);
  const jobsQuery = useMemoFirebase(() => collection(db, "service_requests"), [db]);
  const recentJobsQuery = useMemoFirebase(() => 
    query(collection(db, "service_requests"), orderBy("createdAt", "desc"), limit(5)), 
  [db]);
  const reportsQuery = useMemoFirebase(() => 
    query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(5)),
  [db]);

  const { data: allUsers, isLoading: isUsersLoading } = useCollection(usersQuery);
  const { data: allJobs, isLoading: isJobsLoading } = useCollection(jobsQuery);
  const { data: recentJobs, isLoading: isRecentLoading } = useCollection(recentJobsQuery);
  const { data: reports, isLoading: isReportsLoading } = useCollection(reportsQuery);

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Status Updated",
        description: `User account is now ${newStatus}.`,
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: e.message,
      });
    }
  };

  const handleUpdateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "reports", reportId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Query Updated",
        description: `Query status marked as ${newStatus}.`,
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: e.message,
      });
    }
  };

  const stats = useMemo(() => {
    if (!allUsers || !allJobs) return { totalUsers: 0, totalJobs: 0, activeJobs: 0, completedJobs: 0 };
    
    return {
      totalUsers: allUsers.length,
      totalJobs: allJobs.length,
      activeJobs: allJobs.filter(j => j.status === 'ACCEPTED' || j.status === 'IN_PROGRESS').length,
      completedJobs: allJobs.filter(j => j.status === 'COMPLETED').length,
    };
  }, [allUsers, allJobs]);

  if (isUsersLoading || isJobsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Synchronizing platform data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
        <p className="text-muted-foreground">Live monitoring of users and service activities across ApnaHelper.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-card border-l-4 border-l-primary shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">Registered Users</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-l-4 border-l-secondary shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Briefcase className="h-5 w-5 text-secondary" />
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">Total Service Requests</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">Active Jobs</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div className="text-2xl font-bold">{stats.completedJobs}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">Completed Tasks</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Verify accounts or restrict access for platform safety.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers?.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{u.firstName} {u.lastName}</span>
                          <span className="text-[10px] text-muted-foreground">{u.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.status === 'active' ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none dark:bg-green-900/30 dark:text-green-400">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Banned</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {u.role !== 'admin' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={u.status === 'active' ? "text-destructive" : "text-green-600 dark:text-green-400"}
                            onClick={() => handleUpdateUserStatus(u.id, u.status === 'active' ? 'banned' : 'active')}
                          >
                            {u.status === 'active' ? (
                              <><Ban className="h-3 w-3 mr-1" /> Ban</>
                            ) : (
                              <><ShieldCheck className="h-3 w-3 mr-1" /> Activate</>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" /> User Query Resolution
              </CardTitle>
              <CardDescription>Active support tickets from users.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isReportsLoading ? (
                  <Loader2 className="animate-spin h-4 w-4 mx-auto" />
                ) : !reports || reports.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-4">No active queries.</p>
                ) : (
                  reports.map(report => (
                    <div key={report.id} className="p-3 border rounded-lg bg-muted/20 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold truncate pr-2">{report.subject}</h4>
                        <Badge 
                          variant={report.status === 'RESOLVED' ? 'default' : 'outline'} 
                          className="text-[9px] h-4 px-1"
                        >
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{report.description}</p>
                      <div className="flex justify-end gap-2 pt-1">
                        {report.status !== 'RESOLVED' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-[9px]"
                              onClick={() => handleUpdateReportStatus(report.id, 'IN_PROGRESS')}
                            >
                              <Clock className="h-3 w-3 mr-1" /> Progress
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="h-6 text-[9px]"
                              onClick={() => handleUpdateReportStatus(report.id, 'RESOLVED')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" /> Resolve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Job Activity</CardTitle>
              <CardDescription>Latest service requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isRecentLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : !recentJobs || recentJobs.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-4">No job activity yet.</p>
                ) : (
                  recentJobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <div className="font-bold text-xs text-primary">{job.serviceType}</div>
                        <div className="text-[9px] text-muted-foreground">Customer: {job.customerName}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="text-[9px] px-1 h-4">
                          {job.status}
                        </Badge>
                        <span className="text-[8px] text-muted-foreground">
                          {job.createdAt?.seconds ? new Date(job.createdAt.seconds * 1000).toLocaleDateString() : 'New'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}