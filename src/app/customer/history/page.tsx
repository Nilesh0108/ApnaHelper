
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSession, getJobs } from "@/lib/mock-data";
import { JobRequest, User } from "@/lib/types";
import { Calendar, History, Search } from "lucide-react";

export default function CustomerHistory() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [yearFilter, setYearFilter] = useState("all");

  useEffect(() => {
    const session = getSession();
    setUser(session);
    if (session) {
      const allJobs = getJobs();
      setJobs(allJobs.filter(j => j.customerId === session.id));
    }
  }, []);

  const filteredJobs = jobs.filter(job => {
    if (yearFilter === "all") return true;
    return new Date(job.createdAt).getFullYear().toString() === yearFilter;
  });

  const years = Array.from(new Set(jobs.map(j => new Date(j.createdAt).getFullYear().toString()))).sort().reverse();

  if (!user) return null;

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service History</h1>
          <p className="text-muted-foreground">Review your past requests and service performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select onValueChange={setYearFilter} defaultValue="all">
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
          <Card className="py-20 text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No records found</h3>
            <p className="text-muted-foreground">Try changing your year filter or post a new request.</p>
          </Card>
        ) : (
          filteredJobs.map(job => (
            <Card key={job.id} className="overflow-hidden border-l-4 border-l-slate-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{job.serviceType}</span>
                      <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {job.description}
                    </p>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{new Date(job.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Provider</div>
                    <div className="text-sm text-primary">{job.workerName || "N/A"}</div>
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
