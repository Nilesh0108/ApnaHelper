"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth, useUser, useDoc, useMemoFirebase, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { LogOut, Home, History, PieChart, Wallet, User, History as HistoryIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  // Fetch role from Firestore using memoized reference
  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: profile } = useDoc(userDocRef);
  const role = profile?.role;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  if (isUserLoading) return (
    <nav className="bg-background border-b sticky top-0 z-50 h-16 flex items-center">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-lg w-9 h-9 animate-pulse" />
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </nav>
  );

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
              <HistoryIcon className="h-4 w-4 mr-1 hidden md:block" /> History
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
              <Wallet className="h-4 w-4 mr-1 hidden md:block" /> Earnings
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
              <PieChart className="h-4 w-4 mr-1 hidden md:block" /> Reports
            </Button>
          </Link>
        </div>
      );
    }

    return null;
  };

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Home className="text-primary-foreground h-5 w-5" />
          </div>
          <span className="font-bold text-xl text-primary hidden sm:block">
            Apna<span className="text-secondary">Helper</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <NavLinks />
          
          <ModeToggle />

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
                      <p className="text-sm font-medium leading-none truncate">{profile?.firstName || user.email}</p>
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
