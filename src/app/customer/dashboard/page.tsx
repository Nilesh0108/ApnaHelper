"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
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
  Loader2
} from "lucide-react";

export default function CustomerDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);
  const { data: profile } = useDoc(userDocRef);

  // Simplified query: Removed orderBy to avoid requiring a composite index.
  // We will sort the results in the useMemo hook below.
  const jobsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, 'service_requests'),
      where('customerId', '==', user.uid)
    );
  }, [user, db]);

  const { data: rawJobs, isLoading: isJobsLoading } = useCollection(jobsQuery);

  // Sort jobs on the client side to avoid index errors
  const jobs = useMemo(() => {
    if (!rawJobs) return null;
    return [...rawJobs].sort((a: any, b: any) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA; // Descending order
    });
  }, [rawJobs]);

  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const s = (status || 'PENDING').toUpperCase();
    switch (s) {
      case 'PENDING':
      case 'OPEN': 
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'ACCEPTED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Accepted</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">In Progress</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default: 
        return <Badge variant="outline">{s}</Badge>;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    try {
      if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleDateString();
      if (timestamp instanceof Date) return timestamp.toLocaleDateString();
      return new Date(timestamp).toLocaleDateString();
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 space-y-10">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome back, <span className="text-primary">{profile?.firstName || 'Guest'}</span>!
          </h1>
          <p className="text-muted-foreground text-lg">
            What can we help you fix or improve in your home today?
          </p>
        </div>
        <Link href="/customer/request">
          <Button size="lg" className="rounded-full h-14 px-8 text-lg shadow-lg hover:shadow-xl transition-all group">
            <Plus className="mr-2 h-6 w-6 group-hover:rotate-90 transition-transform" /> 
            New Service Request
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/customer/request" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="bg-primary/10 p-4 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="font-bold">Book Service</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/customer/history" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="bg-secondary/10 p-4 rounded-2xl group-hover:bg-secondary group-hover:text-white transition-colors">
                <History className="h-6 w-6" />
              </div>
              <span className="font-bold">Order History</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/customer/profile" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="bg-orange-50 p-4 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-colors text-orange-600">
                <UserCircle className="h-6 w-6" />
              </div>
              <span className="font-bold">My Profile</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="#" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="bg-slate-100 p-4 rounded-2xl group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <HelpCircle className="h-6 w-6" />
              </div>
              <span className="font-bold">Get Support</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Service Requests</h2>
          {jobs && jobs.length > 0 && (
            <Link href="/customer/history">
              <Button variant="ghost" size="sm" className="text-primary font-semibold">
                View all history
              </Button>
            </Link>
          )}
        </div>

        {isJobsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse bg-slate-50 border-none h-48" />
            ))}
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <div className="py-20 text-center space-y-6 bg-white rounded-3xl border-2 border-dashed">
            <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">No requests yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Your ongoing and past service requests will appear here. Start by creating your first one!
              </p>
            </div>
            <Link href="/customer/request">
              <Button variant="outline" size="lg" className="rounded-full">
                Create My First Request
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <Card key={job.id} className="hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold">{job.serviceType}</CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <Clock className="h-3 w-3" /> 
                      {formatDate(job.createdAt)}
                    </div>
                  </div>
                  {getStatusBadge(job.status)}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm line-clamp-2 text-muted-foreground leading-relaxed">
                    {job.refinedDescription || job.description}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground gap-2 pt-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0" /> 
                    <span className="truncate">{job.jobLocationAddress || 'Address not specified'}</span>
                  </div>
                  {job.workerName && (
                    <div className="pt-3 flex items-center gap-3 border-t">
                      <div className="bg-secondary/10 p-2 rounded-full">
                        <Hammer className="h-4 w-4 text-secondary" />
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Provider:</span> <span className="font-bold">{job.workerName}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-slate-50/50 pt-4">
                  <Button variant="ghost" className="w-full group hover:bg-white" size="sm">
                    View Full Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}