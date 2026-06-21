import { ComparePageClient } from "@/components/ComparePageClient";
import { requireUser } from "@/lib/auth";
import { getColleges } from "@/lib/data";

export default async function ComparePage() {
  await requireUser();
  const colleges = await getColleges();
  return <ComparePageClient colleges={colleges} />;
}
