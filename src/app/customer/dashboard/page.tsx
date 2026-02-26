
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSession, getJobs } from "@/lib/mock-data";
import { JobRequest, User } from "@/lib/types";
import { Plus, Clock, CheckCircle2, MapPin, Hammer, ArrowRight } from "lucide-react";

export default function CustomerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<JobRequest[]>([]);

  useEffect(() => {
    const session = getSession();
    setUser(session);
    if (session) {
      const allJobs = getJobs();
      setJobs(allJobs.filter(j => j.customerId === session.id));
    }
  }, []);

  if (!user) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'accepted': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Accepted</Badge>;
      case 'in-progress': return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">In Progress</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Service Requests</h1>
          <p className="text-muted-foreground">Manage and track your active home service tasks.</p>
        </div>
        <Link href="/customer/request">
          <Button size="lg" className="rounded-full h-12 px-6">
            <Plus className="mr-2 h-5 w-5" /> New Service Request
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No requests yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">Need a plumber or electrician? Create your first service request now.</p>
            <Link href="/customer/request">
              <Button variant="outline">Create My First Request</Button>
            </Link>
          </div>
        ) : (
          jobs.map(job => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold">{job.serviceType}</CardTitle>
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <Clock className="h-3 w-3" /> {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {getStatusBadge(job.status)}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm line-clamp-2 text-muted-foreground">
                  {job.refinedDescription || job.description}
                </p>
                <div className="flex items-center text-sm text-muted-foreground gap-1">
                  <MapPin className="h-4 w-4" /> {job.location}
                </div>
                {job.workerName && (
                  <div className="pt-2 flex items-center gap-2 border-t mt-2">
                    <div className="bg-secondary/10 p-1.5 rounded-full">
                      <Hammer className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Provider:</span> <span className="font-semibold">{job.workerName}</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" className="w-full group" size="sm">
                  View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
