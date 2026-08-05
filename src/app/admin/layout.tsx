import AdminSidebar from "@/roles/admin/components/layout/AdminSidebar";
import TopNav from "@/roles/shared/components/layout/TopNav";
import PageTransition from "@/roles/shared/components/layout/PageTransition";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-admin-surface-soft">
      <AdminSidebar />
      <div className="flex flex-1 flex-col md:pl-sidebar">
        <TopNav />
        <main className="flex-1 pt-20 px-4 md:pr-6 pb-10">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
