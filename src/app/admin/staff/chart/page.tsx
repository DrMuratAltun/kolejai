
import { getStaffMembers } from "@/services/staffService";
import type { StaffMember } from "@/services/staffService";
import InteractiveOrgChart from "./OrgChart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export interface StaffNode extends StaffMember {
    children: StaffNode[];
}

export default async function OrgChartPage() {
  const staff = await getStaffMembers();
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

  // Sort children by name for consistent order
  staffMap.forEach(node => {
      node.children.sort((a, b) => a.name.localeCompare(b.name));
  });
  rootNodes.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <TooltipProvider>
        <div className="animate-in fade-in duration-500 space-y-8">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                <Link href="/admin/staff">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Organizasyon Şeması</h1>
                    <p className="text-muted-foreground">Hiyerarşiyi düzenlemek için bir personeli sürükleyip yöneticisinin üzerine bırakın.</p>
                </div>
            </div>
              <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                        <HelpCircle className="h-5 w-5"/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">Nasıl Kullanılır?</p>
                    <p className="text-muted-foreground">Bir personelin yöneticisini değiştirmek için kartını tutun ve yeni yöneticisinin kartının üzerine sürükleyip bırakın. Sayfa otomatik olarak güncellenecektir.</p>
                </TooltipContent>
            </Tooltip>
        </div>
        <div className="bg-muted/40 p-4 sm:p-8 rounded-lg overflow-x-auto min-h-[500px]">
            {rootNodes.length > 0 ? (
                <InteractiveOrgChart rootNodes={rootNodes} />
            ) : (
            <div className="text-center text-muted-foreground py-16">
                <p>Organizasyon şeması oluşturmak için personel ekleyin ve yöneticilerini belirleyin.</p>
            </div>
            )}
        </div>
        </div>
    </TooltipProvider>
  );
}
