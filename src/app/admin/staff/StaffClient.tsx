
"use client";

import React, { useState, useEffect } from 'react';
import type { StaffMember } from "@/services/staffService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Network } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteStaffMemberAction } from "./actions";
import { StaffFormDialog } from './StaffFormDialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

export default function StaffClient({ initialStaffMembers }: { initialStaffMembers: StaffMember[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEdit = (item: StaffMember) => {
    setEditingStaff(item);
    setIsDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingStaff(null);
    setIsDialogOpen(true);
  };
  
  // ID is now a string
  const handleDelete = async (id: string) => {
    const result = await deleteStaffMemberAction(id);
    if (result.success) {
      toast({
        title: "Başarılı!",
        description: "Personel başarıyla silindi.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: result.error,
      });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Personel Yönetimi</h1>
          <p className="text-muted-foreground">Yeni personel ekleyin, düzenleyin veya silin.</p>
        </div>
        <div className="flex gap-2">
            <Button asChild variant="outline">
                <Link href="/admin/staff/chart">
                    <Network className="mr-2 h-4 w-4"/>
                    Organizasyon Şeması
                </Link>
            </Button>
            <Button onClick={handleAddNew}>Yeni Personel Ekle</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Personeller</CardTitle>
          <CardDescription>Toplam {initialStaffMembers.length} personel bulundu.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İsim</TableHead>
                <TableHead>Rol/Unvan</TableHead>
                <TableHead>Departman</TableHead>
                <TableHead>Yöneticisi</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialStaffMembers.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className='flex items-center gap-3'>
                      <Avatar>
                        <AvatarImage src={item.photo} alt={item.name} />
                        <AvatarFallback>{item.name?.substring(0, 2).toUpperCase() || 'P'}</AvatarFallback>
                      </Avatar>
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.department}</TableCell>
                   <TableCell>{item.parentId ? 'Var' : '-'}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Menüyü aç</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Sil
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu işlem geri alınamaz. Bu personel kalıcı olarak silinecektir.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.id)}>Sil</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {isMounted && (
        <StaffFormDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          editingStaff={editingStaff}
          allStaffMembers={initialStaffMembers}
        />
      )}
    </>
  );
}
