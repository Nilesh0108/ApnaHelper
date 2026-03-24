
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Send, HelpCircle, Loader2 } from "lucide-react";

export default function CustomerSupport() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!subject || !description) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please provide a subject and a description of your issue.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        reporterUserId: user.uid,
        subject,
        description,
        status: 'OPEN',
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Report Submitted",
        description: "Our support team will review your issue and get back to you soon.",
      });
      router.push("/customer/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Failed to submit your support request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="shadow-lg border-primary/10 overflow-hidden">
        <div className="bg-primary/5 p-8 border-b text-center">
          <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
            <HelpCircle className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold">Customer Support</CardTitle>
          <p className="text-muted-foreground mt-2">
            Having trouble with a service or the app? Describe your issue and we'll help you out.
          </p>
        </div>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">What's the issue about?</Label>
              <Input 
                id="subject"
                placeholder="e.g. Problem with a quote, App not working..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea 
                id="description"
                placeholder="Describe your issue in detail so we can assist you better..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="min-h-[150px] resize-none"
              />
            </div>

            <Button type="submit" className="w-full h-14 text-xl font-bold rounded-xl shadow-lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit Issue <Send className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-slate-50 p-6 text-center text-xs text-muted-foreground">
          Average response time: 2-4 business hours.
        </CardFooter>
      </Card>
    </div>
  );
}
