
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { loginUser } from "@/lib/mock-data";
import { UserRole } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { LogIn, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') as UserRole || 'customer';
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const user = loginUser(email);
      if (user) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`,
        });
        
        if (user.role === 'customer') router.push("/customer/dashboard");
        else if (user.role === 'worker') router.push("/worker/dashboard");
        else if (user.role === 'admin') router.push("/admin/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "User not found. Try customer@test.com, worker@test.com or admin@test.com",
        });
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="container max-w-md mx-auto py-20 px-4">
      <Card className="shadow-2xl border-primary/20">
        <CardHeader className="space-y-1 text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-primary h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Enter your email to access your HomeServ Connect account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="h-12"
              />
              <p className="text-xs text-muted-foreground pt-1">
                Demo emails: customer@test.com, worker@test.com, admin@test.com
              </p>
            </div>
            <Button className="w-full h-12 text-lg font-medium group" type="submit" disabled={loading}>
              {loading ? "Authenticating..." : (
                <>
                  Login <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="text-sm text-muted-foreground">
            Don't have an account? <span className="text-primary font-semibold cursor-pointer hover:underline">Register now</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
