
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldCheck, User, Hammer, LayoutDashboard, CheckCircle2, Loader2, Droplets, Zap, Wind, Eraser, PenTool, Drill } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import placeholderData from '@/app/lib/placeholder-images.json';
import Logo from '@/components/Logo';

const POPULAR_SERVICES = [
  { name: 'Plumbing', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'Electrical', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { name: 'Fan Repair', icon: Wind, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { name: 'Cleaning', icon: Eraser, color: 'text-green-500', bg: 'bg-green-50' },
  { name: 'Carpentry', icon: Drill, color: 'text-orange-500', bg: 'bg-orange-50' },
  { name: 'Painting', icon: PenTool, color: 'text-purple-500', bg: 'bg-purple-50' },
];

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [showSplash, setShowSplash] = useState(true);

  const heroImage = placeholderData.placeholderImages.find(img => img.id === 'hero');

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash && !isUserLoading && !isProfileLoading && user && profile?.role) {
      if (profile.role === 'customer') router.replace("/customer/dashboard");
      else if (profile.role === 'worker') router.replace("/worker/dashboard");
      else if (profile.role === 'admin') router.replace("/admin/dashboard");
    }
  }, [user, profile, isUserLoading, isProfileLoading, router, showSplash]);

  const scrollToServices = () => {
    const element = document.getElementById('popular-services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500">
        <div className="relative flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-700">
          <div className="bg-primary/10 p-8 rounded-[2.5rem] shadow-2xl shadow-primary/10 animate-bounce">
            <Logo size="xl" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-primary">
              Apna<span className="text-secondary">Helper</span>
            </h1>
            <p className="text-muted-foreground font-medium tracking-widest uppercase text-xs">
              Trusted Home Services
            </p>
          </div>
          <div className="pt-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
          </div>
        </div>
      </div>
    );
  }

  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Securing your session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-in slide-in-from-left duration-700">
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Reliable home services <br />
              <span className="text-primary">at your doorstep.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg">
              Expert plumbing, electrical, and maintenance services simplified with <strong>ApnaHelper</strong>. Get it done right the first time.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="rounded-full px-8 text-lg transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-primary/25">Get Started</Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-8 text-lg transition-all hover:scale-105 active:scale-95 hover:bg-muted"
                onClick={scrollToServices}
              >
                Browse Services
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                <CheckCircle2 className="h-4 w-4 text-secondary" /> Connect Nearest Local Professional
              </div>
              <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                <CheckCircle2 className="h-4 w-4 text-secondary" /> 24/7 Support
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block animate-in slide-in-from-right duration-700">
            {heroImage && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <Image 
                  src={heroImage.imageUrl} 
                  alt={heroImage.description} 
                  width={800} 
                  height={600}
                  className="relative rounded-3xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                  data-ai-hint={heroImage.imageHint}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="popular-services" className="py-24 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold">Popular Services</h2>
            <p className="text-muted-foreground">From minor fixes to major installations, we've got you covered.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {POPULAR_SERVICES.map((service, idx) => (
              <Card key={idx} className="group hover:border-primary/50 transition-all cursor-pointer border-dashed hover:shadow-xl hover:-translate-y-1 duration-300">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className={`${service.bg} p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <service.icon className={`h-8 w-8 ${service.color}`} />
                  </div>
                  <span className="font-bold text-sm">{service.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold">Choose your path</h2>
          <p className="text-muted-foreground">Join <strong>ApnaHelper</strong> as a customer to get work done, or as a service provider to grow your business.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-2xl transition-all duration-500 border-t-4 border-primary group bg-card hover:-translate-y-2">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <User className="text-primary group-hover:text-white h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">I am a Customer</CardTitle>
              <CardDescription>Post jobs, track progress, and get top-quality service for your home.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login?role=customer">
                <Button className="w-full transition-all active:scale-95">Customer Portal</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-500 border-t-4 border-secondary group bg-card hover:-translate-y-2">
            <CardHeader>
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                <Hammer className="text-secondary group-hover:text-white h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">I am a Worker</CardTitle>
              <CardDescription>Find jobs near you, manage your schedule, and grow your reputation.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login?role=worker">
                <Button variant="secondary" className="w-full transition-all active:scale-95">Worker Portal</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-500 border-t-4 border-slate-900 dark:border-slate-100 group bg-card hover:-translate-y-2">
            <CardHeader>
              <div className="bg-muted w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                <LayoutDashboard className="text-foreground group-hover:text-background h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">System Admin</CardTitle>
              <CardDescription>Access analytics, manage users, and ensure platform quality.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login?role=admin">
                <Button variant="outline" className="w-full transition-all active:scale-95">Admin Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-12 text-foreground">
          <div className="text-center space-y-4 group">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="text-primary h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Verified Experts</h3>
            <p className="text-muted-foreground">Every worker on our platform goes through a rigorous background check and skill assessment.</p>
          </div>
          <div className="text-center space-y-4 group">
            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="text-secondary h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Quality Guaranteed</h3>
            <p className="text-muted-foreground">We stand behind our work. If you're not satisfied, we'll make it right at no extra cost.</p>
          </div>
          <div className="text-center space-y-4 group">
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="text-accent h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Transparent Pricing</h3>
            <p className="text-muted-foreground">No hidden fees or surprise charges. Get clear estimates before any work begins.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
