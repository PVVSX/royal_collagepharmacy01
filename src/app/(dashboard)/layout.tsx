import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import PageTransition from "@/components/layout/PageTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col md:pl-60">
        <TopNav />
        <main className="flex-1 px-2 pt-2 md:pr-4">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
