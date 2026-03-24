"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { 
  Plus, 
  Clock, 
  MapPin, 
  Hammer, 
  ArrowRight, 
  History, 
  UserCircle, 
  HelpCircle,
  Sparkles,
  Loader2,
  DollarSign,
  Trash2,
  CheckCircle2,
  Circle,
  Phone,
  Mail,
  Info
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CustomerDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);
  const { data: profile } = useDoc(userDocRef);

  const jobsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, 'service_requests'),
      where('customerId', '==', user.uid)
    );
  }, [user, db]);

  const { data: rawJobs, isLoading: isJobsLoading } = useCollection(jobsQuery);

  const sortedJobs = useMemo(() => {
    if (!rawJobs) return null;
    return [...rawJobs].sort((a: any, b: any) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  }, [rawJobs]);

  const handleSelectQuote = async (jobId: string, quote: any) => {
    try {
      await updateDoc(doc(db, 'service_requests', jobId), {
        status: 'ACCEPTED',
        workerId: quote.workerId,
        workerName: quote.workerName,
        actualCost: quote.price,
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Quote Accepted!",
        description: `You've selected ${quote.workerName} for this task.`,
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Selection Failed", description: e.message });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteDoc(doc(db, 'service_requests', jobId));
      toast({
        title: "Request Removed",
        description: "Your service request has been successfully deleted.",
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete Failed", description: e.message });
    }
  };

  if (isUserLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const QuotesView = ({ jobId }: { jobId: string }) => {
    const q = useMemoFirebase(() => query(collection(db, 'service_requests', jobId, 'quotes')), [jobId]);
    const { data: quotes, isLoading } = useCollection(q);

    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin mx-auto" />;
    if (!quotes || quotes.length === 0) return <p className="text-center text-muted-foreground py-4">Waiting for worker quotes...</p>;

    return (
      <div className="space-y-4 py-4">
        {quotes.map((quote: any) => (
          <div key={quote.id} className="p-4 border rounded-xl flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-2">
                {quote.workerName}
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">₹{quote.price}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{quote.message || 'Professional service at best price.'}</p>
            </div>
            <Button size="sm" onClick={() => handleSelectQuote(jobId, quote)}>Select This Quote</Button>
          </div>
        ))}
      </div>
    );
  };

  const ProviderProfileView = ({ workerId }: { workerId: string }) => {
    const wRef = useMemoFirebase(() => doc(db, 'users', workerId), [workerId]);
    const { data: provider, isLoading } = useDoc(wRef);

    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin mx-auto" />;
    if (!provider) return <p>Expert profile not found.</p>;

    return (
      <div className="space-y-6 py-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarImage src={`https://picsum.photos/seed/${workerId}/200`} />
            <AvatarFallback>{provider.firstName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-2xl font-bold">{provider.firstName} {provider.lastName}</h3>
            <Badge variant="secondary" className="mt-1">Verified Expert</Badge>
          </div>
        </div>

        <div className="grid gap-4">
          <Card className="bg-muted/50 border-none">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-medium">{provider.phoneNumber || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-medium">{provider.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">{provider.city}, {provider.state}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Hammer className="h-4 w-4" /> About Provider
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              {provider.bio || "No professional bio provided yet."}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const ProgressTracker = ({ job }: { job: any }) => {
    const steps = [
      { id: 'PENDING', label: 'Request Posted', date: job.createdAt },
      { id: 'ACCEPTED', label: 'Worker Assigned', date: job.acceptedAt },
      { id: 'IN_PROGRESS', label: 'Work Started', date: job.updatedAt },
      { id: 'COMPLETED', label: 'Completed', date: job.completedAt }
    ];

    const currentIdx = steps.findIndex(s => s.id === job.status);

    return (
      <div className="space-y-6 py-6 px-2">
        {steps.map((step, idx) => {
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          
          return (
            <div key={step.id} className="flex gap-4 items-start relative">
              {idx !== steps.length - 1 && (
                <div className={`absolute left-3 top-6 w-[2px] h-10 ${idx < currentIdx ? 'bg-primary' : 'bg-muted'}`} />
              )}
              <div className={`mt-1 z-10 p-1 rounded-full ${isDone ? 'bg-primary text-white' : 'bg-muted text-muted-foreground/30'}`}>
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              </div>
              <div className="space-y-1">
                <p className={`font-bold text-sm ${isCurrent ? 'text-primary' : 'text-foreground'}`}>{step.label}</p>
                {isDone && step.date && (
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(step.date.seconds * 1000).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10 px-4 space-y-10">
      <div className="bg-card rounded-3xl p-8 shadow-sm border border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome, <span className="text-primary">{profile?.firstName || 'Guest'}</span>!
          </h1>
          <p className="text-muted-foreground text-lg">Post a job and compare custom quotes from verified experts.</p>
        </div>
        <Link href="/customer/request">
          <Button size="lg" className="rounded-full h-14 px-8 text-lg shadow-lg group">
            <Plus className="mr-2 h-6 w-6 group-hover:rotate-90 transition-transform" /> 
            New Service Request
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Sparkles, label: 'Book Service', href: '/customer/request', color: 'bg-primary/10 text-primary' },
          { icon: History, label: 'Order History', href: '/customer/history', color: 'bg-secondary/10 text-secondary' },
          { icon: UserCircle, label: 'My Profile', href: '/customer/profile', color: 'bg-orange-500/10 text-orange-600' },
          { icon: HelpCircle, label: 'Get Support', href: '/customer/support', color: 'bg-muted text-muted-foreground' }
        ].map((action, idx) => (
          <Link key={idx} href={action.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full bg-card">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className={`${action.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <span className="font-bold">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">My Active Requests</h2>
        {isJobsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Card key={i} className="animate-pulse bg-muted h-48" />)}
          </div>
        ) : !sortedJobs || sortedJobs.length === 0 ? (
          <div className="py-20 text-center bg-card rounded-3xl border-2 border-dashed">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold">No requests yet</h3>
            <p className="text-muted-foreground">Start by creating your first one!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedJobs.map((job: any) => (
              <Card key={job.id} className="hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary relative bg-card">
                <div className="absolute top-4 right-4">
                  {job.status !== 'COMPLETED' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" title="Delete Request">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Service Request?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {job.workerId 
                              ? `A worker (${job.workerName}) is already assigned to this job. Deleting this will cancel the assignment permanently.` 
                              : `This will permanently delete your service request for ${job.serviceType}. This action cannot be undone.`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Request</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-white" onClick={() => handleDeleteJob(job.id)}>
                            Delete Permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold">{job.serviceType}</CardTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{job.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <MapPin className="h-3 w-3" /> {job.areaCityPincode}
                  </div>
                  {job.workerName && (
                    <div className="pt-3 border-t">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="flex items-center gap-2 hover:bg-muted/50 p-2 rounded-lg transition-colors w-full">
                            <Hammer className="h-4 w-4 text-secondary" />
                            <div className="text-sm text-left">Provider: <span className="font-bold text-primary hover:underline">{job.workerName}</span></div>
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Service Provider Profile</DialogTitle>
                          </DialogHeader>
                          <ProviderProfileView workerId={job.workerId} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/30 pt-4">
                  {job.status === 'PENDING' ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="default" className="w-full">
                          <DollarSign className="h-4 w-4 mr-1" /> View Quotes
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Worker Bids for {job.serviceType}</DialogTitle>
                        </DialogHeader>
                        <QuotesView jobId={job.id} />
                      </DialogContent>
                    </Dialog>
                  ) : job.status !== 'COMPLETED' ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" size="sm">
                          Track Progress <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Job Tracking: {job.serviceType}</DialogTitle>
                        </DialogHeader>
                        <ProgressTracker job={job} />
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Link href="/customer/history" className="w-full">
                      <Button variant="ghost" className="w-full" size="sm">
                        View Completed Task
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
