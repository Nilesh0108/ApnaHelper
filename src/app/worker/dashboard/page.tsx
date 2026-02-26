
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSession, getJobs, updateJobStatus } from "@/lib/mock-data";
import { JobRequest, User, JobStatus } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { MapPin, Clock, Hammer, CheckCircle2, AlertCircle } from "lucide-react";

export default function WorkerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [allJobs, setAllJobs] = useState<JobRequest[]>([]);

  useEffect(() => {
    setUser(getSession());
    setAllJobs(getJobs());
  }, []);

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    if (!user) return;
    const updated = updateJobStatus(jobId, newStatus, user);
    setAllJobs(updated);
    toast({
      title: "Job Updated",
      description: `Status changed to ${newStatus}.`,
    });
  };

  if (!user) return null;

  const availableJobs = allJobs.filter(j => j.status === 'open');
  const myJobs = allJobs.filter(j => j.workerId === user.id);

  const JobItem = ({ job, showActions = false }: { job: JobRequest, showActions?: boolean }) => (
    <Card key={job.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{job.serviceType}</CardTitle>
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Clock className="h-3 w-3" /> {new Date(job.createdAt).toLocaleDateString()}
          </div>
        </div>
        <Badge variant={job.status === 'open' ? 'secondary' : 'default'}>
          {job.status.replace('-', ' ')}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {job.refinedDescription || job.description}
        </p>
        <div className="flex items-center text-sm text-muted-foreground gap-1">
          <MapPin className="h-4 w-4" /> {job.location}
        </div>
        <div className="text-xs font-medium text-slate-500">
          Posted by: {job.customerName}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {job.status === 'open' && (
          <Button className="w-full" onClick={() => handleStatusChange(job.id, 'accepted')}>
            Accept Job
          </Button>
        )}
        {job.status === 'accepted' && (
          <Button className="w-full" variant="secondary" onClick={() => handleStatusChange(job.id, 'in-progress')}>
            Start Work
          </Button>
        )}
        {job.status === 'in-progress' && (
          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(job.id, 'completed')}>
            Mark Completed
          </Button>
        )}
        {job.status === 'completed' && (
          <div className="flex items-center gap-2 text-green-600 font-medium text-sm w-full justify-center py-2">
            <CheckCircle2 className="h-4 w-4" /> Done
          </div>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Worker Dashboard</h1>
          <p className="text-muted-foreground">Find new opportunities and manage your active jobs.</p>
        </div>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="available">Browse Jobs ({availableJobs.length})</TabsTrigger>
          <TabsTrigger value="my-jobs">My Assignments ({myJobs.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableJobs.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No new jobs currently available in your area.</p>
              </div>
            ) : (
              availableJobs.map(job => <JobItem key={job.id} job={job} />)
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="my-jobs" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myJobs.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <Hammer className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">You haven't accepted any jobs yet.</p>
              </div>
            ) : (
              myJobs.map(job => <JobItem key={job.id} job={job} />)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
