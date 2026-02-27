"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { MapPin, Clock, Hammer, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function WorkerDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const allJobsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'service_requests'),
      orderBy('createdAt', 'desc')
    );
  }, [db]);

  const { data: allJobs, isLoading: isJobsLoading } = useCollection(allJobsQuery);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    if (!user || !db) return;
    
    const jobRef = doc(db, 'service_requests', jobId);
    const updateData: any = {
      status: newStatus,
      updatedAt: serverTimestamp()
    };

    if (newStatus === 'ACCEPTED') {
      updateData.workerId = user.uid;
      updateData.acceptedAt = serverTimestamp();
    } else if (newStatus === 'IN_PROGRESS') {
      updateData.startedAt = serverTimestamp();
    } else if (newStatus === 'COMPLETED') {
      updateData.completedAt = serverTimestamp();
    }

    try {
      await updateDoc(jobRef, updateData);
      toast({
        title: "Job Updated",
        description: `Status changed to ${newStatus.replace('_', ' ')}.`,
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update job status. Please try again.",
      });
    }
  };

  if (isUserLoading || isJobsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading jobs data...</p>
      </div>
    );
  }

  if (!user) return null;

  const availableJobs = allJobs?.filter(j => ['PENDING', 'OPEN', 'open'].includes(j.status)) || [];
  const myJobs = allJobs?.filter(j => j.workerId === user.uid) || [];

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recent';
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleDateString();
    return new Date(timestamp).toLocaleDateString();
  };

  const JobItem = ({ job }: { job: any }) => (
    <Card key={job.id} className="hover:shadow-md transition-shadow overflow-hidden border-t-4 border-t-primary">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{job.serviceType}</CardTitle>
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Clock className="h-3 w-3" /> 
            {formatDate(job.createdAt)}
          </div>
        </div>
        <Badge variant={['PENDING', 'OPEN', 'open'].includes(job.status) ? 'secondary' : 'default'}>
          {(job.status || '').replace('_', ' ').toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {job.refinedDescription || job.description}
        </p>
        <div className="flex items-center text-sm text-muted-foreground gap-1">
          <MapPin className="h-4 w-4 text-primary shrink-0" /> 
          <span className="truncate">{job.jobLocationAddress || job.location || 'Location missing'}</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 bg-slate-50/50 pt-4">
        {(['PENDING', 'OPEN', 'open'].includes(job.status)) && (
          <Button className="w-full" onClick={() => handleStatusChange(job.id, 'ACCEPTED')}>
            Accept Job
          </Button>
        )}
        {job.status === 'ACCEPTED' && (
          <Button className="w-full" variant="secondary" onClick={() => handleStatusChange(job.id, 'IN_PROGRESS')}>
            Start Work
          </Button>
        )}
        {job.status === 'IN_PROGRESS' && (
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusChange(job.id, 'COMPLETED')}>
            Mark Completed
          </Button>
        )}
        {job.status === 'COMPLETED' && (
          <div className="flex items-center gap-2 text-green-600 font-bold text-sm w-full justify-center py-2">
            <CheckCircle2 className="h-4 w-4" /> COMPLETED
          </div>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Worker Dashboard</h1>
          <p className="text-muted-foreground text-lg">Manage your service requests and find new opportunities.</p>
        </div>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 h-12">
          <TabsTrigger value="available" className="text-base">Browse Jobs ({availableJobs.length})</TabsTrigger>
          <TabsTrigger value="my-jobs" className="text-base">My Assignments ({myJobs.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableJobs.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold">No jobs available</h3>
                <p className="text-muted-foreground">New requests in your area will appear here.</p>
              </div>
            ) : (
              availableJobs.map(job => <JobItem key={job.id} job={job} />)
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="my-jobs" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myJobs.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed">
                <Hammer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold">No active jobs</h3>
                <p className="text-muted-foreground">Go to the 'Browse Jobs' tab to accept new tasks.</p>
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