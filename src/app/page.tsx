
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldCheck, User, Hammer, LayoutDashboard, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Reliable home services <br />
              <span className="text-primary">at your doorstep.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg">
              Expert plumbing, electrical, and maintenance services simplified for modern living. Get it done right the first time.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="rounded-full px-8 text-lg">Get Started</Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-full px-8 text-lg">Browse Services</Button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" /> 2k+ Certified Workers
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" /> 24/7 Support
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <Image 
              src="https://picsum.photos/seed/homeserv/800/600" 
              alt="Home service professional" 
              width={800} 
              height={600}
              className="rounded-3xl shadow-2xl"
              data-ai-hint="home service"
            />
          </div>
        </div>
      </section>

      {/* Role Selection section */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold">Choose your path</h2>
          <p className="text-muted-foreground">Join HomeServ Connect as a customer to get work done, or as a service provider to grow your business.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-xl transition-all duration-300 border-t-4 border-primary group">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="text-primary h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">I am a Customer</CardTitle>
              <CardDescription>Post jobs, track progress, and get top-quality service for your home.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login?role=customer">
                <Button className="w-full">Customer Portal</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-t-4 border-secondary group">
            <CardHeader>
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Hammer className="text-secondary h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">I am a Worker</CardTitle>
              <CardDescription>Find jobs near you, manage your schedule, and grow your reputation.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login?role=worker">
                <Button variant="secondary" className="w-full">Worker Portal</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-t-4 border-slate-900 group">
            <CardHeader>
              <div className="bg-slate-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="text-slate-900 h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">System Admin</CardTitle>
              <CardDescription>Access analytics, manage users, and ensure platform quality.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login?role=admin">
                <Button variant="outline" className="w-full">Admin Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature highlight */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-12">
          <div className="text-center space-y-4">
            <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="text-primary h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Verified Experts</h3>
            <p className="text-muted-foreground">Every worker on our platform goes through a rigorous background check and skill assessment.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="bg-secondary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="text-secondary h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Quality Guaranteed</h3>
            <p className="text-muted-foreground">We stand behind our work. If you're not satisfied, we'll make it right at no extra cost.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="bg-accent/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
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
