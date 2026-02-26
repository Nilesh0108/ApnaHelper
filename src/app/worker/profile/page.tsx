
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { User as UserIcon, Mail, Shield, Save, ArrowLeft, MapPin, Briefcase } from "lucide-react";

export default function WorkerProfile() {
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
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, {
        firstName,
        lastName,
        bio,
        updatedAt: new Date().toISOString()
      });
      toast({
        title: "Profile Updated",
        description: "Your professional profile has been saved successfully.",
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading || !user) return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-20 w-20 border-2 border-secondary">
            <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200`} />
            <AvatarFallback>{firstName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{firstName} {lastName}</h1>
            <p className="text-muted-foreground capitalize">Service Provider ({profile?.role})</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
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
              <Label htmlFor="bio">Professional Bio</Label>
              <textarea 
                id="bio"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell customers about your experience and expertise..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" value={user.email || ""} disabled className="pl-10 bg-slate-50" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} className="w-full" variant="secondary">
              <Save className="mr-2 h-4 w-4" /> Save Profile
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-secondary" /> Service Area Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-muted-foreground">Apartment/Building</Label>
                <p className="font-medium">{profile?.apartment || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Landmark</Label>
                <p className="font-medium">{profile?.landmark || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">City</Label>
                  <p className="font-medium">{profile?.city || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">State</Label>
                  <p className="font-medium">{profile?.state || "N/A"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
