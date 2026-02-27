
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { SERVICE_TYPES, STATES } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Loader2, MapPin } from "lucide-react";
import AIJobAssistant from "@/components/AIJobAssistant";

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
  const [apartment, setApartment] = useState("");
  const [landmark, setLandmark] = useState("");
  const [areaCityPincode, setAreaCityPincode] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-populate from profile
  useEffect(() => {
    if (profile) {
      setApartment(profile.apartment || "");
      setLandmark(profile.landmark || "");
      setAreaCityPincode(`${profile.city || ""} ${profile.pincode || ""}`.trim());
      setState(profile.state || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !serviceType || !description || !apartment || !areaCityPincode || !state) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all required fields including address.",
      });
      return;
    }
    
    setLoading(true);

    const jobData = {
      customerId: user.uid,
      customerName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user.email,
      serviceType,
      description,
      status: 'PENDING',
      createdAt: serverTimestamp(),
      apartment,
      landmark,
      areaCityPincode,
      state,
      jobLocationAddress: `${apartment}, ${landmark}, ${areaCityPincode}, ${state}`,
    };

    try {
      await addDoc(collection(db, 'service_requests'), jobData);
      toast({
        title: "Request Created",
        description: "Workers in your area will be notified and can send quotes soon.",
      });
      router.push("/customer/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create request.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="shadow-lg border-primary/10 overflow-hidden">
        <div className="bg-primary/5 p-6 border-b">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" /> Post New Request
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">Get custom quotes from verified experts in your area.</p>
        </div>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                1. Service Details
              </h3>
              <div className="space-y-2">
                <Label htmlFor="service-type">Service Type</Label>
                <Select onValueChange={setServiceType} required value={serviceType}>
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
            </div>

            <div className="space-y-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                <MapPin className="h-5 w-5 text-primary" /> 2. Service Address
              </h3>
              
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apartment">Apartment / Building / Flat No.</Label>
                  <Input 
                    id="apartment" 
                    placeholder="e.g. Green Heights, Flat 402" 
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="landmark">Nearby Landmark</Label>
                  <Input 
                    id="landmark" 
                    placeholder="e.g. Near Central Park" 
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Area / City / Pincode</Label>
                    <Input 
                      id="area" 
                      placeholder="e.g. Downtown, 400001" 
                      value={areaCityPincode}
                      onChange={(e) => setAreaCityPincode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State (Auto-selected)</Label>
                    <Select onValueChange={setState} value={state} required>
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-xl font-bold rounded-xl shadow-lg" disabled={loading || !serviceType || !description}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  Publish Request <Send className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
