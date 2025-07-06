
import { getStaffMembers } from "@/services/staffService";
import StaffClient from "./StaffClient";

export default async function StaffManagementPage() {
  const staffMembers = await getStaffMembers();

  return (
    <div className="animate-in fade-in duration-500">
      <StaffClient initialStaffMembers={staffMembers} />
    </div>
  );
}
