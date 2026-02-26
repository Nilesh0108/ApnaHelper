
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSession, createJob } from "@/lib/mock-data";
import { SERVICE_TYPES, User } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Send } from "lucide-react";
import AIJobAssistant from "@/components/AIJobAssistant";

export default function NewServiceRequest() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  
  const [serviceType, setServiceType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUser(getSession());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !serviceType || !description) return;
    
    setLoading(true);
    setTimeout(() => {
      createJob({
        customerId: user.id,
        customerName: user.name,
        serviceType,
        description,
        location
      });
      
      toast({
        title: "Request Created",
        description: "Workers in your area will be notified soon.",
      });
      router.push("/customer/dashboard");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create Service Request</CardTitle>
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
              <Label htmlFor="location">Location / Area</Label>
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
                className="min-h-[120px]"
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

            <Button type="submit" className="w-full h-12 text-lg" disabled={loading || !serviceType || !description}>
              {loading ? "Creating Request..." : (
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
