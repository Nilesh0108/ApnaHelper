"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Mail, Save, ArrowLeft, Loader2, Phone, ShieldCheck, User as UserIcon } from "lucide-react";

export default function AdminProfile() {
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setPhoneNumber(profile.phoneNumber || "");
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
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Profile Updated",
        description: "Admin details have been updated successfully.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update admin profile.",
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
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="space-y-6">
        <div className="flex items-center gap-6 mb-8 p-6 bg-card rounded-3xl border shadow-sm">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200`} />
            <AvatarFallback>{firstName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{firstName} {lastName}</h1>
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <p className="text-muted-foreground font-medium uppercase tracking-wider text-xs mt-1">System Administrator</p>
          </div>
        </div>

        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" /> Administrative Identity
            </CardTitle>
            <CardDescription>Update your personal details associated with this admin account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Contact Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="phone" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  className="pl-10 h-11"
                  placeholder="Admin phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Administrative Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  value={user.email || ""} 
                  disabled 
                  className="pl-10 h-11 bg-muted/50 cursor-not-allowed border-dashed" 
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic">Email addresses for admin accounts are domain-restricted and cannot be changed.</p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 pt-6">
            <Button onClick={handleSave} className="w-full h-12 text-lg font-bold shadow-md" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Save Admin Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
