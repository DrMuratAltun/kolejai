"use client";

import React from 'react';
import type { Submission } from "@/services/submissionService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

export default function SubmissionsClient({ initialSubmissions }: { initialSubmissions: Submission[] }) {

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gelen Formlar</h1>
          <p className="text-muted-foreground">İletişim sayfasından gönderilen tüm formları burada görüntüleyebilirsiniz.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Form Gönderileri</CardTitle>
          <CardDescription>Toplam {initialSubmissions.length} form bulundu.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gönderim Tarihi</TableHead>
                <TableHead>Veli Adı</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Öğrenci Adı</TableHead>
                <TableHead>Sınıf</TableHead>
                <TableHead>Mesaj</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialSubmissions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.createdAt ? format(new Date(item.createdAt), 'dd.MM.yyyy HH:mm') : 'N/A'}
                  </TableCell>
                  <TableCell className="font-medium">{item.parentName}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>{item.studentName}</TableCell>
                  <TableCell>{item.grade}</TableCell>
                  <TableCell className="truncate max-w-xs">{item.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
