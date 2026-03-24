
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-8 border-t bg-white mt-auto">
        <div className="container mx-auto px-4 text-center space-y-2">
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="font-bold text-primary text-lg">TechVeda</span>
            <p className="text-sm text-muted-foreground">
              © 2024 HomeServ Connect. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Developed by <span className="font-semibold text-foreground">Nilesh Pal</span>
            </p>
          </div>
        </div>
      </footer>
      <Toaster />
    </>
  );
}
