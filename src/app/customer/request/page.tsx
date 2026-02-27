"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { SERVICE_TYPES } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import AIJobAssistant from "@/components/AIJobAssistant";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function NewServiceRequest() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);
  const { data: profile } = useDoc(userDocRef);
  
  const [serviceType, setServiceType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !serviceType || !description) return;
    
    setLoading(true);

    const jobData = {
      customerId: user.uid,
      customerName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user.email,
      serviceType,
      description,
      status: 'PENDING',
      createdAt: serverTimestamp(),
      jobLocationAddress: location || profile?.address || 'Address not specified',
      jobLocationLatitude: profile?.latitude || 0,
      jobLocationLongitude: profile?.longitude || 0,
    };

    const colRef = collection(db, 'service_requests');
    
    addDoc(colRef, jobData)
      .then(() => {
        toast({
          title: "Request Created",
          description: "Workers in your area will be notified soon.",
        });
        router.push("/customer/dashboard");
      })
      .catch(async (error) => {
        const contextualError = new FirestorePermissionError({
          operation: 'create',
          path: colRef.path,
          requestResourceData: jobData,
        });
        errorEmitter.emit('permission-error', contextualError);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!user) return null;

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Service Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="service-type">Service Type</Label>
              <Select onValueChange={setServiceType} required>
                <SelectTrigger id="service-type" className="h-12">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Job Location (Area/City)</Label>
              <Input 
                id="location" 
                placeholder="e.g. Springfield, Downtown" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe what you need help with in detail..." 
                className="min-h-[120px] resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              
              {serviceType && (
                <div className="pt-2">
                  <AIJobAssistant 
                    serviceType={serviceType} 
                    initialDescription={description}
                    onRefined={(refined) => setDescription(refined)}
                  />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading || !serviceType || !description}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  Post Request <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}