
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Calendar, History, Loader2, MapPin } from "lucide-react";

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

    // Sort by newest first
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
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
