
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Calendar, History, Loader2, MapPin, Star, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * Dialog for Customer to rate the Worker
 */
function RateWorkerDialog({ job }: { job: any }) {
  const db = useFirestore();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'service_requests', job.id), {
        workerRating: rating,
        workerFeedback: feedback,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Rating Submitted", description: "Thank you for sharing your experience!" });
      setOpen(false);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
          Rate Provider
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate {job.workerName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2 text-center">
            <Label>How would you rate the service?</Label>
            <div className="flex justify-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-8 w-8 cursor-pointer transition-colors ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                  onClick={() => setRating(s)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="worker-feedback">Tell us more about the work...</Label>
            <Textarea 
              id="worker-feedback"
              placeholder="e.g. Prompt, professional, and high quality work."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="resize-none h-24"
            />
          </div>
        </div>
        <DialogFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomerHistory() {
  const { user } = useUser();
  const db = useFirestore();
  const [yearFilter, setYearFilter] = useState("all");

  const jobsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, 'service_requests'),
      where('customerId', '==', user.uid)
    );
  }, [user, db]);

  const { data: jobs, isLoading } = useCollection(jobsQuery);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    
    let result = [...jobs];
    
    if (yearFilter !== "all") {
      result = result.filter(job => {
        const date = job.createdAt?.seconds ? new Date(job.createdAt.seconds * 1000) : new Date();
        return date.getFullYear().toString() === yearFilter;
      });
    }

    return result.sort((a: any, b: any) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  }, [jobs, yearFilter]);

  const years = useMemo(() => {
    if (!jobs) return [];
    const uniqueYears = new Set(jobs.map(j => {
      const date = j.createdAt?.seconds ? new Date(j.createdAt.seconds * 1000) : new Date();
      return date.getFullYear().toString();
    }));
    return Array.from(uniqueYears).sort().reverse();
  }, [jobs]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground mt-2">Loading your service history...</p>
    </div>
  );

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service History</h1>
          <p className="text-muted-foreground">Review your past requests and service performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select onValueChange={setYearFilter} value={yearFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card className="py-20 text-center border-dashed">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No records found</h3>
            <p className="text-muted-foreground">Try changing your year filter or post a new request.</p>
          </Card>
        ) : (
          filteredJobs.map(job => (
            <Card key={job.id} className="overflow-hidden border-l-4 border-l-primary/30 hover:border-l-primary transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{job.serviceType}</span>
                      <Badge 
                        variant={job.status === 'COMPLETED' ? 'default' : 'secondary'} 
                        className={job.status === 'COMPLETED' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {job.description}
                    </p>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {job.createdAt?.seconds 
                          ? new Date(job.createdAt.seconds * 1000).toLocaleDateString(undefined, { dateStyle: 'long' }) 
                          : 'Just now'}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.areaCityPincode}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Service Provider</div>
                    <div className="text-sm font-bold text-primary">{job.workerName || "Searching for experts..."}</div>
                    {job.actualCost && <div className="text-lg font-bold mt-1">₹{job.actualCost}</div>}
                  </div>
                </div>
              </CardContent>
              {job.status === 'COMPLETED' && (
                <CardFooter className="bg-slate-50/50 py-3 flex justify-between items-center px-6 border-t">
                  {job.workerRating ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Your Rating:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`h-4 w-4 ${s <= job.workerRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-primary text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Ready for feedback
                    </div>
                  )}
                  {!job.workerRating && <RateWorkerDialog job={job} />}
                </CardFooter>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
