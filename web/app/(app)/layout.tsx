import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { AppNavbar } from "@/components/layout/navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex flex-col min-h-screen bg-surface-raised">
      <AppNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
