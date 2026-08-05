import Sidebar from "@/roles/member/components/layout/Sidebar";
import TopNav from "@/roles/shared/components/layout/TopNav";
import PageTransition from "@/roles/shared/components/layout/PageTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
