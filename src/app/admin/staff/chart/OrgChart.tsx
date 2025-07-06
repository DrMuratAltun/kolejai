"use client";

import React from 'react';
import { DndContext, useDraggable, useDroppable, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { updateStaffParentAction } from '../actions';
import type { StaffNode } from './page';

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
        <div ref={setDraggableNodeRef} style={style} {...attributes} {...listeners} className="inline-flex flex-col items-center text-center">
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
        <div className="inline-flex flex-col items-center text-center">
            <StaffNodeCard node={node} />
            {node.children && node.children.length > 0 && (
                <>
                    <div className="w-px h-8 bg-gray-300" />
                    <div className="flex justify-center relative">
                        {node.children.length > 1 &&
                            <div className="absolute top-0 left-1/2 right-1/2 h-px -translate-x-1/2 w-full bg-gray-300"></div>
                        }
                        {node.children.map((child) => (
                            <div key={child.id} className="px-10 flex-shrink-0 relative">
                                <div className="absolute top-0 left-1/2 w-px h-8 -translate-x-1/2 bg-gray-300"></div>
                                <ChartBranch node={child} />
                            </div>
                        ))}
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
            <div className="flex flex-col items-center">
                {rootNodes.map(node => <ChartBranch key={node.id} node={node} />)}
            </div>
        </DndContext>
    );
}
