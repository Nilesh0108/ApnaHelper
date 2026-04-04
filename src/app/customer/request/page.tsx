
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
import { ArrowLeft, Send, Loader2, MapPin, Droplets, Zap, Wind, Eraser, PenTool, Drill, HelpCircle } from "lucide-react";
import AIJobAssistant from "@/components/AIJobAssistant";
import { cn } from "@/lib/utils";

const SERVICE_ICONS: Record<string, any> = {
  'Plumbing': Droplets,
  'Electrical': Zap,
  'Fan Repair': Wind,
  'Cleaning': Eraser,
  'Carpentry': Drill,
  'Painting': PenTool,
  'Other': HelpCircle
};

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
    <div className="container max-w-3xl mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Post a New Request</h1>
          <p className="text-muted-foreground">Tell us what you need, and verified pros will bid on your job.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border-primary/10 shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg">1. Choose Service Category</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {SERVICE_TYPES.map((type) => {
                  const Icon = SERVICE_ICONS[type] || HelpCircle;
                  const isSelected = serviceType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setServiceType(type)}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all space-y-2",
                        isSelected 
                          ? "border-primary bg-primary/5 text-primary shadow-sm" 
                          : "border-transparent bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      <Icon className={cn("h-6 w-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-xs font-bold">{type}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg">2. Describe the Problem</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="e.g. My kitchen sink is leaking from the main pipe and water is pooling on the floor. I need it fixed today." 
                  className="min-h-[150px] resize-none"
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
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" /> 3. Service Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
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
                    <Label htmlFor="state">State</Label>
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
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl transition-transform hover:scale-[1.01] active:scale-[0.99]" disabled={loading || !serviceType || !description}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                Confirm & Publish Request <Send className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
