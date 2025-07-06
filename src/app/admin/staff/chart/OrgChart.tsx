
"use client";

import React from 'react';
import { DndContext, useDraggable, useDroppable, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { updateStaffParentAction } from '../actions';
import type { StaffNode } from './page';
import { cn } from '@/lib/utils';

function StaffNodeCard({ node }: { node: StaffNode }) {
    const { attributes, listeners, setNodeRef: setDraggableNodeRef, transform, isDragging } = useDraggable({
        id: node.id,
        data: { name: node.name }
    });
    
    const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
        id: node.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setDraggableNodeRef} style={style} {...attributes} {...listeners}>
            <div ref={setDroppableNodeRef}>
                <Card className={`p-3 shadow-md bg-background min-w-[180px] transition-all duration-200 ${isOver ? 'ring-2 ring-primary ring-offset-2' : ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
                    <div className="flex flex-col items-center">
                        <Avatar className="w-16 h-16 mb-2 border-2 border-primary">
                            <AvatarImage src={node.photo} alt={node.name} />
                            <AvatarFallback>{node.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <p className="font-bold text-sm">{node.name}</p>
                        <p className="text-xs text-muted-foreground">{node.title}</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function ChartBranch({ node }: { node: StaffNode }) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Add padding here to create space between sibling nodes */}
      <div className="px-4 md:px-8">
        <StaffNodeCard node={node} />
      </div>

      {node.children && node.children.length > 0 && (
        <>
          {/* Vertical line from parent down to the horizontal connector */}
          <div className="w-px h-8 bg-slate-300" />

          {/* Container for all children branches */}
          <div className="flex justify-center">
            {node.children.map((child, index) => {
              let horizontalLineClass = '';
              // This logic draws the horizontal line connecting sibling nodes
              if (node.children.length > 1) {
                if (index === 0) {
                  // First child: line from center to right
                  horizontalLineClass = 'left-1/2 right-0';
                } else if (index === node.children.length - 1) {
                  // Last child: line from left to center
                  horizontalLineClass = 'left-0 right-1/2';
                } else {
                  // Middle child: line spans full width
                  horizontalLineClass = 'left-0 right-0';
                }
              }

              return (
                <div key={child.id} className="flex-shrink-0 relative">
                  {/* Vertical line from child up to the horizontal line */}
                  <div className="absolute top-0 left-1/2 w-px h-8 -translate-x-1/2 bg-slate-300" />
                  
                  {/* The horizontal line segment for this child */}
                  <div className={cn("absolute top-0 h-px bg-slate-300", horizontalLineClass)} />

                  {/* Recursive call for the child node and its children */}
                  <ChartBranch node={child} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}


export default function InteractiveOrgChart({ rootNodes }: { rootNodes: StaffNode[] }) {
    const { toast } = useToast();
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const staffId = active.id as string;
            const newParentId = over.id as string;
            const staffName = active.data.current?.name || 'Personel';
            
            toast({
                title: "Hiyerarşi Güncelleniyor...",
                description: `${staffName} yeni yöneticisine atanıyor.`,
            });

            const result = await updateStaffParentAction(staffId, newParentId);

            if (result.success) {
                toast({
                    title: "Başarılı!",
                    description: "Organizasyon şeması başarıyla güncellendi.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Hata!",
                    description: result.error,
                });
            }
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
             <div className="flex justify-center items-start">
                {rootNodes.map(node => <ChartBranch key={node.id} node={node} />)}
            </div>
        </DndContext>
    );
}
