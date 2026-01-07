import { redirect } from "next/navigation";
import { getDashboardData } from "./actions/user";
import AppShell from "@/components/AppShell";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/auth/login");
  }

  return <AppShell data={data} />;
}
