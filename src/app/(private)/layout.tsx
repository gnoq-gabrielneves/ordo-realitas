import { AppSidebar } from "@/shared/components/AppSidebar/AppSidebar";
import { Toaster } from "@/shared/components/ui/sonner";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex h-dvh overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
      <Toaster position="bottom-right" />
    </QueryProvider>
  );
}
