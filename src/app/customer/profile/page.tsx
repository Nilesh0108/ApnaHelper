
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Mail, Save, ArrowLeft, MapPin, Loader2, Phone } from "lucide-react";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function CustomerProfile() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: profile, isLoading } = useDoc(userDocRef);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [apartment, setApartment] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setPhoneNumber(profile.phoneNumber || "");
      setApartment(profile.apartment || "");
      setLandmark(profile.landmark || "");
      setCity(profile.city || "");
      setState(profile.state || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!userDocRef) return;
    setIsSaving(true);
    try {
      await updateDoc(userDocRef, {
        firstName,
        lastName,
        phoneNumber,
        apartment,
        landmark,
        city,
        state,
        address: `${apartment}, ${landmark}, ${city}, ${state}`,
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200`} />
            <AvatarFallback>{firstName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{firstName} {lastName}</h1>
            <p className="text-muted-foreground capitalize">Customer Member</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="phone" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" value={user.email || ""} disabled className="pl-10 bg-slate-50 cursor-not-allowed" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Address Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apartment">Apartment/Building & Flat No.</Label>
              <Input 
                id="apartment" 
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landmark">Nearby Landmark</Label>
              <Input 
                id="landmark" 
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select onValueChange={setState} value={state}>
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
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} className="w-full" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save All Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
