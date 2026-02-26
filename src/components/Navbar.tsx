
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSession, logoutUser } from "@/lib/mock-data";
import { LogOut, Home, Briefcase, LayoutDashboard, User } from "lucide-react";
import { useEffect, useState } from "react";
import { User as UserType } from "@/lib/types";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    setUser(getSession());
  }, [pathname]);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  if (!user && pathname !== "/" && !pathname.startsWith("/login")) return null;

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Home className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-xl text-primary hidden sm:block">HomeServ <span className="text-secondary">Connect</span></span>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <>
              {user.role === 'customer' && (
                <Link href="/customer/dashboard">
                  <Button variant={pathname.includes('dashboard') ? 'default' : 'ghost'} size="sm">
                    Dashboard
                  </Button>
                </Link>
              )}
              {user.role === 'worker' && (
                <Link href="/worker/dashboard">
                  <Button variant={pathname.includes('dashboard') ? 'default' : 'ghost'} size="sm">
                    Jobs
                  </Button>
                </Link>
              )}
              {user.role === 'admin' && (
                <Link href="/admin/dashboard">
                  <Button variant={pathname.includes('dashboard') ? 'default' : 'ghost'} size="sm">
                    Analytics
                  </Button>
                </Link>
              )}
              
              <div className="h-8 w-px bg-border mx-2 hidden sm:block" />
              
              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-sm font-medium leading-none">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                  <LogOut className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </>
          )}
          {!user && (
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
