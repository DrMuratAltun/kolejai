"use client";

import React, { useState } from 'react';
import type { GalleryItem } from "@/services/galleryService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteGalleryItemAction } from "./actions";
import { GalleryFormDialog } from './GalleryFormDialog';
import Image from 'next/image';

export default function GalleryClient({ initialItems }: { initialItems: GalleryItem[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const { toast } = useToast();

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    const result = await deleteGalleryItemAction(id);
    if (result.success) {
      toast({
        title: "Başarılı!",
        description: "Galeri öğesi başarıyla silindi.",
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
          <h1 className="text-3xl font-bold">Galeri Yönetimi</h1>
          <p className="text-muted-foreground">Galeriye yeni resimler ekleyin, düzenleyin veya silin.</p>
        </div>
        <Button onClick={handleAddNew}>Yeni Resim Ekle</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Resimler</CardTitle>
          <CardDescription>Toplam {initialItems.length} resim bulundu.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resim</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>AI İpucu</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image src={item.src} alt={item.alt} width={100} height={60} className="rounded-md object-cover" />
                  </TableCell>
                  <TableCell className="font-medium">{item.alt}</TableCell>
                  <TableCell>{item.aiHint}</TableCell>
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
                            Bu işlem geri alınamaz. Bu resim galeriden kalıcı olarak silinecektir.
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
      <GalleryFormDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        editingItem={editingItem}
      />
    </>
  );
}
