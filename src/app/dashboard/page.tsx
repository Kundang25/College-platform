import { DashboardClient } from "@/components/DashboardClient";
import { requireUser } from "@/lib/auth";
import { getColleges } from "@/lib/data";

export default async function DashboardPage() {
  await requireUser();
  const colleges = await getColleges();
  return <DashboardClient colleges={colleges} />;
}
