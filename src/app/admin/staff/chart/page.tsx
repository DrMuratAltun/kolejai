
import { getStaffMembers } from "@/services/staffService";
import type { StaffMember } from "@/services/staffService";
import OrgChart from "./OrgChart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface StaffNode extends StaffMember {
    children: StaffNode[];
}

export default async function OrgChartPage() {
  const staff = await getStaffMembers();
  // Map key is now string (document ID)
  const staffMap = new Map<string, StaffNode>();
  const rootNodes: StaffNode[] = [];

  staff.forEach(member => {
    staffMap.set(member.id, { ...member, children: [] });
  });

  staff.forEach(member => {
    const node = staffMap.get(member.id);
    if (node) {
      if (member.parentId && staffMap.has(member.parentId)) {
        const managerNode = staffMap.get(member.parentId);
        managerNode?.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }
  });

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/staff">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
            <h1 className="text-3xl font-bold">Organizasyon Şeması</h1>
            <p className="text-muted-foreground">Personel hiyerarşisini görüntüleyin.</p>
        </div>
      </div>
      <div className="bg-muted/40 p-4 sm:p-8 rounded-lg overflow-x-auto">
        {rootNodes.length > 0 ? (
            <div className="flex flex-col items-center">
                 {rootNodes.map(node => <OrgChart key={node.id} node={node} />)}
            </div>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <p>Organizasyon şeması oluşturmak için personel ekleyin ve yöneticilerini belirleyin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
