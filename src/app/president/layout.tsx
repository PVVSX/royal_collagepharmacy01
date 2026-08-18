import PresidentAccessGate from "@/roles/president/components/layout/PresidentAccessGate";
import PresidentSidebar from "@/roles/president/components/layout/PresidentSidebar";
import PresidentTopBar from "@/roles/president/components/layout/PresidentTopBar";
import PageTransition from "@/roles/shared/components/layout/PageTransition";

export default function PresidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <PresidentAccessGate>
      <div className="flex min-h-screen bg-surface-container-low">
        <PresidentSidebar />
        <div className="flex min-w-0 flex-1 flex-col md:pl-sidebar">
          <PresidentTopBar />
          <main className="min-w-0 flex-1 px-4 pb-10 pt-20 md:pr-6"><PageTransition>{children}</PageTransition></main>
        </div>
      </div>
    </PresidentAccessGate>
  );
}
