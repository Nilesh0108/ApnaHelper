
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, updateDoc, serverTimestamp } from "firebase/firestore";
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
  DollarSign
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
        acceptedAt: serverTimestamp()
      });
      toast({
        title: "Quote Accepted!",
        description: `You've selected ${quote.workerName} for this task.`,
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Selection Failed", description: e.message });
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
          <div key={quote.id} className="p-4 border rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-2">
                {quote.workerName}
                <Badge variant="outline" className="bg-green-50 text-green-700">₹{quote.price}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{quote.message || 'Professional service at best price.'}</p>
            </div>
            <Button size="sm" onClick={() => handleSelectQuote(jobId, quote)}>Select This Quote</Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10 px-4 space-y-10">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
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
          { icon: UserCircle, label: 'My Profile', href: '/customer/profile', color: 'bg-orange-50 text-orange-600' },
          { icon: HelpCircle, label: 'Get Support', href: '#', color: 'bg-slate-100 text-slate-800' }
        ].map((action, idx) => (
          <Link key={idx} href={action.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
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
            {[1, 2, 3].map(i => <Card key={i} className="animate-pulse bg-slate-50 h-48" />)}
          </div>
        ) : !sortedJobs || sortedJobs.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold">No requests yet</h3>
            <p className="text-muted-foreground">Start by creating your first one!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedJobs.map((job: any) => (
              <Card key={job.id} className="hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold">{job.serviceType}</CardTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">{job.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <MapPin className="h-3 w-3" /> {job.areaCityPincode}
                  </div>
                  {job.workerName && (
                    <div className="pt-3 border-t flex items-center gap-2">
                      <Hammer className="h-4 w-4 text-secondary" />
                      <div className="text-sm">Provider: <span className="font-bold">{job.workerName}</span></div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-slate-50/50 pt-4">
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
                  ) : (
                    <Button variant="ghost" className="w-full" size="sm">
                      Track Progress <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
