
"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { StaffNode } from "./page";

const StaffCard = ({ node }: { node: StaffNode }) => {
  return (
    <div className="inline-flex flex-col items-center text-center">
      <Card className="p-3 shadow-md bg-background min-w-[180px]">
        <div className="flex flex-col items-center">
          <Avatar className="w-16 h-16 mb-2 border-2 border-primary">
            <AvatarImage src={node.image} alt={node.name} />
            <AvatarFallback>{node.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <p className="font-bold text-sm">{node.name}</p>
          <p className="text-xs text-muted-foreground">{node.role}</p>
        </div>
      </Card>
      {node.children && node.children.length > 0 && (
        <>
            {/* Vertical line down from card */}
            <div className="w-px h-8 bg-gray-300" />
            
            <div className="flex justify-center relative">
                {/* Horizontal line across children */}
                {node.children.length > 1 &&
                    <div className="absolute top-0 left-1/2 right-1/2 h-px -translate-x-1/2 w-[calc(100%-10rem)] bg-gray-300"></div>
                }

                {node.children.map((child) => (
                    <div key={child.id} className="px-10 flex-shrink-0 relative">
                        {/* Vertical line up to horizontal line */}
                        <div className="absolute top-0 left-1/2 w-px h-8 -translate-x-1/2 bg-gray-300"></div>
                        <StaffCard node={child} />
                    </div>
                ))}
            </div>
        </>
      )}
    </div>
  );
};


const OrgChart = ({ node }: { node: StaffNode }) => {
  return <StaffCard node={node} />;
};

export default OrgChart;
