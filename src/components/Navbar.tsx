"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { LogOut, Home, History, PieChart, Wallet, User, Settings, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  // Fetch role from Firestore
  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    const { firestore } = require('@/firebase');
    const { doc } = require('firebase/firestore');
    return doc(require('@/firebase').initializeFirebase().firestore, 'users', user.uid);
  }, [user]);

  const { data: profile } = useDoc(userDocRef);
  const role = profile?.role;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (isUserLoading) return null;

  const NavLinks = () => {
    if (!user || !role) return null;
    
    if (role === 'customer') {
      return (
        <div className="flex items-center gap-1">
          <Link href="/customer/dashboard">
            <Button variant={pathname === '/customer/dashboard' ? 'secondary' : 'ghost'} size="sm">
              Dashboard
            </Button>
          </Link>
          <Link href="/customer/history">
            <Button variant={pathname === '/customer/history' ? 'secondary' : 'ghost'} size="sm">
              <History className="h-4 w-4 mr-1 sm:hidden md:block" /> History
            </Button>
          </Link>
        </div>
      );
    }
    
    if (role === 'worker') {
      return (
        <div className="flex items-center gap-1">
          <Link href="/worker/dashboard">
            <Button variant={pathname === '/worker/dashboard' ? 'secondary' : 'ghost'} size="sm">
              Jobs
            </Button>
          </Link>
          <Link href="/worker/earnings">
            <Button variant={pathname === '/worker/earnings' ? 'secondary' : 'ghost'} size="sm">
              <Wallet className="h-4 w-4 mr-1" /> Earnings
            </Button>
          </Link>
        </div>
      );
    }

    if (role === 'admin') {
      return (
        <div className="flex items-center gap-1">
          <Link href="/admin/dashboard">
            <Button variant={pathname === '/admin/dashboard' ? 'secondary' : 'ghost'} size="sm">
              Users
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button variant={pathname === '/admin/reports' ? 'secondary' : 'ghost'} size="sm">
              <PieChart className="h-4 w-4 mr-1" /> Reports
            </Button>
          </Link>
        </div>
      );
    }

    return null;
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Home className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-xl text-primary hidden sm:block">
            HomeServ <span className="text-secondary">Connect</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <NavLinks />
          
          {user ? (
            <>
              <div className="h-8 w-px bg-border mx-2 hidden sm:block" />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100`} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.firstName || user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">{role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href={`/${role}/profile`}>
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
