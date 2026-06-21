import { PredictorClient } from "@/components/PredictorClient";
import { requireUser } from "@/lib/auth";
import { getColleges } from "@/lib/data";

export default async function PredictorPage() {
  await requireUser();
  const colleges = await getColleges();
  return <PredictorClient colleges={colleges} />;
}
