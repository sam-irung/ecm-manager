import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ecm-background">
      <Sidebar />
      <Header />
      <main className="p-0">{children}</main>
    </div>
  );
}