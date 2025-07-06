"use client";

import React, { useState } from 'react';
import type { NewsItem } from "@/services/newsService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteNewsItemAction } from "./actions";
import { NewsFormDialog } from './NewsFormDialog';

export default function NewsClient({ initialNewsItems }: { initialNewsItems: NewsItem[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const { toast } = useToast();

  const handleEdit = (item: NewsItem) => {
    setEditingNews(item);
    setIsDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingNews(null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    const result = await deleteNewsItemAction(id);
    if (result.success) {
      toast({
        title: "Başarılı!",
        description: "Kayıt başarıyla silindi.",
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
          <h1 className="text-3xl font-bold">Haber, Duyuru ve Etkinlik Yönetimi</h1>
          <p className="text-muted-foreground">Yeni haber, etkinlik veya duyuru ekleyin, düzenleyin veya silin.</p>
        </div>
        <Button onClick={handleAddNew}>Yeni Kayıt Ekle</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Kayıtlar</CardTitle>
          <CardDescription>Toplam {initialNewsItems.length} kayıt bulundu.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialNewsItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell><Badge variant={item.type === 'Haber' ? 'default' : item.type === 'Duyuru' ? 'secondary' : 'outline'}>{item.type}</Badge></TableCell>
                  <TableCell>{item.date}</TableCell>
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
                            Bu işlem geri alınamaz. Bu kayıt kalıcı olarak silinecektir.
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
      <NewsFormDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        editingNews={editingNews}
      />
    </>
  );
}
