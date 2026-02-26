
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Toaster />
    </>
  );
}
