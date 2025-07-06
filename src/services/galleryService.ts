'use server';

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy, serverTimestamp } from "firebase/firestore";
import { unstable_noStore as noStore } from 'next/cache';

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  aiHint: string;
  createdAt?: string | null;
}

export type GalleryItemData = Omit<GalleryItem, 'id' | 'createdAt'>;

const galleryCollection = collection(db, "gallery");

const fromFirestore = (snapshot: any): GalleryItem => {
  const data = snapshot.data();
  const createdAtTimestamp = data.createdAt;
  return {
    id: snapshot.id,
    src: data.src,
    alt: data.alt,
    aiHint: data.aiHint || '',
    createdAt: createdAtTimestamp ? (createdAtTimestamp.toDate() as Date).toISOString() : null,
  };
};

export const getGalleryItems = async (): Promise<GalleryItem[]> => {
  noStore();
  try {
    const q = query(galleryCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(fromFirestore);
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return [];
  }
};

export const addGalleryItem = async (item: GalleryItemData) => {
  return await addDoc(galleryCollection, {
      ...item,
      createdAt: serverTimestamp()
  });
};

export const updateGalleryItem = async (id: string, item: Partial<GalleryItemData>) => {
  const docRef = doc(db, "gallery", id);
  return await updateDoc(docRef, item);
};

export const deleteGalleryItem = async (id: string) => {
  const docRef = doc(db, "gallery", id);
  return await deleteDoc(docRef);
};
