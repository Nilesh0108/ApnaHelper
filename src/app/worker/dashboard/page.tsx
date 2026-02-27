
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, serverTimestamp, addDoc, where } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { MapPin, Clock, Hammer, CheckCircle2, AlertCircle, Loader2, DollarSign, Send } from "lucide-react";

export default function WorkerDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);
  const { data: profile } = useDoc(userDocRef);

  // Filter available jobs by the worker's state for better relevance
  const availableJobsQuery = useMemoFirebase(() => {
    if (!db || !profile?.state) return null;
    return query(
      collection(db, 'service_requests'),
      where('status', '==', 'PENDING'),
      where('state', '==', profile.state)
    );
  }, [db, profile?.state]);

  const myJobsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'service_requests'),
      where('workerId', '==', user.uid)
    );
  }, [db, user]);

  const { data: availableJobs, isLoading: isAvailableLoading } = useCollection(availableJobsQuery);
  const { data: myJobs, isLoading: isMyJobsLoading } = useCollection(myJobsQuery);

  const [quotePrice, setQuotePrice] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [isQuoting, setIsQuoting] = useState(false);

  const handleSendQuote = async (jobId: string) => {
    if (!user || !profile || !quotePrice) return;
    setIsQuoting(true);

    try {
      const quoteData = {
        serviceRequestId: jobId,
        workerId: user.uid,
        workerName: `${profile.firstName} ${profile.lastName}`,
        price: parseFloat(quotePrice),
        message: quoteMessage,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'service_requests', jobId, 'quotes'), quoteData);
      
      toast({
        title: "Quote Sent!",
        description: "The customer has been notified of your offer.",
      });
      setQuotePrice("");
      setQuoteMessage("");
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Failed to send quote",
        description: e.message,
      });
    } finally {
      setIsQuoting(false);
    }
  };

  const handleStatusUpdate = async (jobId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'service_requests', jobId), {
        status,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Status Updated", description: `Job is now ${status}` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  if (isUserLoading || isAvailableLoading || isMyJobsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Scanning for nearby jobs in {profile?.state}...</p>
      </div>
    );
  }

  const JobCard = ({ job, isAvailable }: { job: any; isAvailable: boolean }) => (
    <Card className="hover:shadow-md transition-shadow overflow-hidden border-t-4 border-t-primary">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{job.serviceType}</CardTitle>
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Clock className="h-3 w-3" /> 
            {job.createdAt?.seconds ? new Date(job.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
          </div>
        </div>
        <Badge variant={job.status === 'PENDING' ? 'secondary' : 'default'}>
          {job.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {job.refinedDescription || job.description}
        </p>
        <div className="grid gap-1">
          <div className="flex items-center text-sm font-medium gap-1">
            <MapPin className="h-4 w-4 text-primary shrink-0" /> 
            <span>{job.areaCityPincode}</span>
          </div>
          <p className="text-xs text-muted-foreground pl-5">{job.apartment}, {job.landmark}</p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 bg-slate-50/50 pt-4">
        {isAvailable ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">
                <DollarSign className="h-4 w-4 mr-1" /> Send Quote
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Quote for {job.serviceType}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Your Price (Offer)</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 500" 
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Additional Message (Optional)</Label>
                  <Textarea 
                    placeholder="Briefly explain your offer..." 
                    value={quoteMessage}
                    onChange={(e) => setQuoteMessage(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => handleSendQuote(job.id)} disabled={!quotePrice || isQuoting}>
                  {isQuoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Submit Offer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <>
            {job.status === 'ACCEPTED' && (
              <Button className="w-full" onClick={() => handleStatusUpdate(job.id, 'IN_PROGRESS')}>Start Work</Button>
            )}
            {job.status === 'IN_PROGRESS' && (
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(job.id, 'COMPLETED')}>Complete Job</Button>
            )}
            {job.status === 'COMPLETED' && (
              <div className="flex items-center gap-2 text-green-600 font-bold text-sm w-full justify-center">
                <CheckCircle2 className="h-4 w-4" /> COMPLETED
              </div>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Worker Dashboard</h1>
          <p className="text-muted-foreground text-lg">Browsing jobs in <span className="text-primary font-bold">{profile?.state}</span></p>
        </div>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 h-12">
          <TabsTrigger value="available" className="text-base">Nearby Jobs ({availableJobs?.length || 0})</TabsTrigger>
          <TabsTrigger value="my-jobs" className="text-base">My Assignments ({myJobs?.length || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!availableJobs || availableJobs.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold">No nearby jobs in {profile?.state}</h3>
                <p className="text-muted-foreground">Keep checking for new requests in your area.</p>
              </div>
            ) : (
              availableJobs.map(job => <JobCard key={job.id} job={job} isAvailable={true} />)
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="my-jobs" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!myJobs || myJobs.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed">
                <Hammer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold">No assignments yet</h3>
                <p className="text-muted-foreground">Submit quotes to win new jobs!</p>
              </div>
            ) : (
              myJobs.map(job => <JobCard key={job.id} job={job} isAvailable={false} />)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
