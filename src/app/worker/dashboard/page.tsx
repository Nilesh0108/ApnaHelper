"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, doc, updateDoc, serverTimestamp, addDoc, where } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { MapPin, Clock, Hammer, CheckCircle2, AlertCircle, Loader2, DollarSign, Send, Star, User, Phone, Mail } from "lucide-react";

function CustomerProfileView({ customerId }: { customerId: string }) {
  const db = useFirestore();
  const cRef = useMemoFirebase(() => doc(db, 'users', customerId), [customerId]);
  const { data: customer, isLoading } = useDoc(cRef);

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin mx-auto" />;
  if (!customer) return <p>Customer profile not found.</p>;

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col items-center text-center space-y-4">
        <Avatar className="h-20 w-20 border-2 border-primary/10">
          <AvatarImage src={`https://picsum.photos/seed/${customerId}/100`} />
          <AvatarFallback>{customer.firstName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-bold">{customer.firstName} {customer.lastName}</h3>
          <p className="text-sm text-muted-foreground">Premium Client</p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Phone Number</p>
            <p className="font-bold">{customer.phoneNumber || "Not provided"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Email Address</p>
            <p className="font-bold">{customer.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuoteDialog({ job, user, profile }: { job: any; user: any; profile: any }) {
  const db = useFirestore();
  const [open, setOpen] = useState(false);
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [isQuoting, setIsQuoting] = useState(false);

  const handleSendQuote = async () => {
    if (!user || !profile || !quotePrice) return;
    setIsQuoting(true);

    try {
      const quoteData = {
        serviceRequestId: job.id,
        workerId: user.uid,
        workerName: `${profile.firstName} ${profile.lastName}`,
        price: parseFloat(quotePrice),
        message: quoteMessage,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'service_requests', job.id, 'quotes'), quoteData);
      
      toast({
        title: "Quote Sent!",
        description: "The customer has been notified of your offer.",
      });
      setQuotePrice("");
      setQuoteMessage("");
      setOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <DollarSign className="h-4 w-4 mr-1" /> Send Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Quote for {job.serviceType}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="price">Your Price (Offer)</Label>
            <Input 
              id="price"
              type="number" 
              placeholder="e.g. 500" 
              value={quotePrice}
              onChange={(e) => setQuotePrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Additional Message (Optional)</Label>
            <Textarea 
              id="message"
              placeholder="Briefly explain your offer..." 
              value={quoteMessage}
              onChange={(e) => setQuoteMessage(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSendQuote} disabled={!quotePrice || isQuoting} className="w-full">
            {isQuoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Submit Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CompleteJobDialog({ job, onComplete }: { job: any; onComplete: (rating: number, feedback: string) => void }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Complete Job</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finish & Rate Customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2 text-center">
            <Label>How was your experience with {job.customerName}?</Label>
            <div className="flex justify-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-8 w-8 cursor-pointer transition-colors ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                  onClick={() => setRating(s)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-feedback">Private Feedback for Customer</Label>
            <Textarea 
              id="customer-feedback"
              placeholder="Polite, clear instructions, timely payment, etc."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="resize-none h-24"
            />
          </div>
        </div>
        <DialogFooter>
          <Button className="w-full" onClick={() => {
            onComplete(rating, feedback);
            setOpen(false);
          }}>
            Submit & Close Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function JobCard({ job, isAvailable, user, profile, onStatusUpdate, onCompleteJob }: { 
  job: any; 
  isAvailable: boolean; 
  user: any;
  profile: any;
  onStatusUpdate: (id: string, s: string) => void;
  onCompleteJob: (id: string, rating: number, feedback: string) => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden border-t-4 border-t-primary h-full flex flex-col bg-card">
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
      <CardContent className="space-y-3 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {job.refinedDescription || job.description}
        </p>
        <div className="grid gap-1 border-t pt-3 mt-auto">
          {!isAvailable && (
            <div className="mb-2">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                    <User className="h-4 w-4" /> View Customer: {job.customerName}
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Customer Contact Details</DialogTitle>
                  </DialogHeader>
                  <CustomerProfileView customerId={job.customerId} />
                </DialogContent>
              </Dialog>
            </div>
          )}
          <div className="flex items-center text-sm font-medium gap-1">
            <MapPin className="h-4 w-4 text-primary shrink-0" /> 
            <span>{job.areaCityPincode}</span>
          </div>
          <p className="text-xs text-muted-foreground pl-5">{job.apartment}, {job.landmark}</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 bg-muted/30 pt-4">
        {isAvailable ? (
          <QuoteDialog job={job} user={user} profile={profile} />
        ) : (
          <div className="w-full space-y-2">
            {job.status === 'ACCEPTED' && (
              <Button className="w-full" onClick={() => onStatusUpdate(job.id, 'IN_PROGRESS')}>Start Work</Button>
            )}
            {job.status === 'IN_PROGRESS' && (
              <CompleteJobDialog job={job} onComplete={(r, f) => onCompleteJob(job.id, r, f)} />
            )}
            {job.status === 'COMPLETED' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600 font-bold text-sm w-full justify-center py-1">
                  <CheckCircle2 className="h-4 w-4" /> COMPLETED
                </div>
                {job.workerRating && (
                  <div className="flex items-center justify-center gap-1 bg-card p-2 rounded-lg border text-xs">
                    <span className="text-muted-foreground">My Rating:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`h-3 w-3 ${s <= job.workerRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default function WorkerDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);
  const { data: profile } = useDoc(userDocRef);

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

  const handleCompleteJob = async (jobId: string, rating: number, feedback: string) => {
    try {
      await updateDoc(doc(db, 'service_requests', jobId), {
        status: 'COMPLETED',
        customerRating: rating,
        customerFeedback: feedback,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast({ title: "Job Finalized", description: "Feedback submitted and job closed." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  if (isUserLoading || isAvailableLoading || isMyJobsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Scanning for nearby jobs...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="bg-card rounded-3xl p-8 shadow-sm border border-secondary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Worker Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Browsing available jobs in <span className="text-secondary font-bold">{profile?.state}</span>
          </p>
        </div>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 h-12 p-1 bg-muted">
          <TabsTrigger value="available" className="text-base data-[state=active]:bg-card">
            Nearby Jobs ({availableJobs?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="my-jobs" className="text-base data-[state=active]:bg-card">
            My Assignments ({myJobs?.length || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-6">
          {!availableJobs || availableJobs.length === 0 ? (
            <div className="py-20 text-center bg-card rounded-3xl border-2 border-dashed">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold">No nearby jobs in {profile?.state}</h3>
              <p className="text-muted-foreground">Keep checking for new requests in your area.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  isAvailable={true} 
                  user={user} 
                  profile={profile}
                  onStatusUpdate={handleStatusUpdate} 
                  onCompleteJob={handleCompleteJob}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my-jobs" className="space-y-6">
          {!myJobs || myJobs.length === 0 ? (
            <div className="py-20 text-center bg-card rounded-3xl border-2 border-dashed">
              <Hammer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold">No assignments yet</h3>
              <p className="text-muted-foreground">Submit quotes to win new jobs!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  isAvailable={false} 
                  user={user} 
                  profile={profile}
                  onStatusUpdate={handleStatusUpdate} 
                  onCompleteJob={handleCompleteJob}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
