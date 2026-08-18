import Sidebar from "@/roles/member/components/layout/Sidebar";
import TopNav from "@/roles/shared/components/layout/TopNav";
import PageTransition from "@/roles/shared/components/layout/PageTransition";
import { PortalAccessGate } from "@/roles/shared/components/auth/PortalAccessGate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalAccessGate area="student">
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col md:pl-sidebar">
        <TopNav />
        <main className="min-w-0 flex-1 pt-20 px-2 md:pr-4">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
    </PortalAccessGate>
  );
}
