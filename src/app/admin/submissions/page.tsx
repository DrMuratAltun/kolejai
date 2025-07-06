import { getSubmissions } from "@/services/submissionService";
import SubmissionsClient from "./SubmissionsClient";

export default async function SubmissionsPage() {
  const submissions = await getSubmissions();

  return (
    <div className="animate-in fade-in duration-500">
      <SubmissionsClient initialSubmissions={submissions} />
    </div>
  );
}
