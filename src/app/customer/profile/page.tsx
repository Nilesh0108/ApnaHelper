
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSession } from "@/lib/mock-data";
import { User } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { User as UserIcon, Mail, Shield, Save, ArrowLeft } from "lucide-react";

export default function CustomerProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
      setName(session.name);
    }
  }, []);

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your personal information has been saved successfully.",
    });
  };

  if (!user) return null;

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={`https://picsum.photos/seed/${user.id}/200`} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground capitalize">{user.role} Member</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" value={user.email} disabled className="pl-10 bg-slate-50" />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed for security.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} className="w-full">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Account Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-xs text-muted-foreground">Not enabled</div>
                </div>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
