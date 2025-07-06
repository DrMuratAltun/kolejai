
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy, serverTimestamp } from "firebase/firestore";

export interface NewsItem {
  id: string;
  type: "Haber" | "Etkinlik" | "Duyuru";
  title: string;
  date: string;
  description: string;
  image: string;
  aiHint: string;
  href: string;
  createdAt?: string | null;
}

export type NewsItemData = Omit<NewsItem, 'id' | 'createdAt'>;

const newsCollection = collection(db, "news");

const fromFirestore = (snapshot: any): NewsItem => {
  const data = snapshot.data();
  const createdAtTimestamp = data.createdAt;
  return {
    id: snapshot.id,
    type: data.type,
    title: data.title,
    description: data.description,
    image: data.image,
    aiHint: data.aiHint,
    href: data.href || '#',
    date: data.date, // Tarihi string olarak alıyoruz
    createdAt: createdAtTimestamp ? (createdAtTimestamp.toDate() as Date).toISOString() : null,
  };
};

export const getNewsItems = async (): Promise<NewsItem[]> => {
  const q = query(newsCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(fromFirestore);
};

export const addNewsItem = async (item: NewsItemData) => {
  return await addDoc(newsCollection, {
      ...item,
      createdAt: serverTimestamp()
  });
};

export const updateNewsItem = async (id: string, item: Partial<NewsItemData>) => {
  const docRef = doc(db, "news", id);
  return await updateDoc(docRef, item);
};

export const deleteNewsItem = async (id: string) => {
  const docRef = doc(db, "news", id);
  return await deleteDoc(docRef);
};
