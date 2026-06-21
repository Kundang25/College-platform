import { CollegeExplorer } from "@/components/CollegeExplorer";
import { getColleges } from "@/lib/data";

export default async function Home() {
  const colleges = await getColleges();
  const states = [...new Set(colleges.map((college) => college.state))].sort();
  const types = [...new Set(colleges.map((college) => college.type))].sort();

  return <CollegeExplorer colleges={colleges} states={states} types={types} />;
}
