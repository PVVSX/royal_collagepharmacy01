import AdminSidebar from "@/roles/admin/components/layout/AdminSidebar";
import TopNav from "@/roles/shared/components/layout/TopNav";
import PageTransition from "@/roles/shared/components/layout/PageTransition";
import { PortalAccessGate } from "@/roles/shared/components/auth/PortalAccessGate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalAccessGate area="admin">
    <div className="flex min-h-screen bg-admin-surface-soft">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col md:pl-sidebar">
        <TopNav />
        <main className="min-w-0 flex-1 pt-20 px-4 md:pr-6 pb-10">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
    </PortalAccessGate>
  );
}
