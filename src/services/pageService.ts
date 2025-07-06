import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy, serverTimestamp, where, getDoc, limit } from "firebase/firestore";
import { unstable_noStore as noStore } from 'next/cache';

export interface Page {
  id: string;
  title: string;
  slug: string;
  htmlContent: string;
  showInMenu: boolean;
  parentId: string | null;
  menuOrder: number;
  createdAt: string | null;
}

export type PageData = Omit<Page, 'id' | 'createdAt'>;

const pagesCollection = collection(db, "pages");

const fromFirestore = (snapshot: any): Page => {
  const data = snapshot.data();
  const createdAtTimestamp = data.createdAt;
  return {
    id: snapshot.id,
    title: data.title,
    slug: data.slug,
    htmlContent: data.htmlContent,
    showInMenu: data.showInMenu || false,
    parentId: data.parentId || null,
    menuOrder: data.menuOrder || 0,
    createdAt: createdAtTimestamp ? (createdAtTimestamp.toDate() as Date).toISOString() : null,
  };
};

export const getPages = async (): Promise<Page[]> => {
  noStore();
  try {
    const q = query(pagesCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(fromFirestore);
  } catch (error) {
    console.error("Error fetching pages:", error);
    return [];
  }
};

export const getMenuPages = async (): Promise<Page[]> => {
    noStore();
    try {
        // First, query for pages to be shown in the menu
        const q = query(pagesCollection, where("showInMenu", "==", true));
        const snapshot = await getDocs(q);
        
        // Then, map and sort the results in application code
        const pages = snapshot.docs.map(fromFirestore);
        pages.sort((a, b) => a.menuOrder - b.menuOrder);

        return pages;
    } catch (error) {
        console.error("Error fetching menu pages:", error);
        return [];
    }
};

export const getPageBySlug = async (slug: string): Promise<Page | null> => {
    noStore();
    try {
        const q = query(pagesCollection, where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return null;
        }
        return fromFirestore(snapshot.docs[0]);
    } catch (error) {
        console.error(`Error fetching page by slug ${slug}:`, error);
        return null;
    }
};

export const getPageById = async (id: string): Promise<Page | null> => {
    noStore();
    try {
        const docRef = doc(db, "pages", id);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) {
            return null;
        }
        return fromFirestore(snapshot);
    } catch (error) {
        console.error(`Error fetching page by id ${id}:`, error);
        return null;
    }
}

export const addPage = async (item: PageData) => {
  return await addDoc(pagesCollection, {
      ...item,
      createdAt: serverTimestamp()
  });
};

export const updatePage = async (id: string, item: Partial<PageData>) => {
  const docRef = doc(db, "pages", id);
  return await updateDoc(docRef, item);
};

export const deletePage = async (id: string) => {
  const docRef = doc(db, "pages", id);
  return await deleteDoc(docRef);
};
