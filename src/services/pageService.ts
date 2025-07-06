import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy, serverTimestamp, where, getDoc, limit, writeBatch } from "firebase/firestore";
import { unstable_noStore as noStore } from 'next/cache';

export interface Page {
  id: string;
  title: string;
  type: 'page' | 'link' | 'container';
  slug?: string;
  href?: string;
  htmlContent?: string;
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
    type: data.type || 'page',
    slug: data.slug || '',
    href: data.href || '',
    htmlContent: data.htmlContent || '',
    showInMenu: data.showInMenu === undefined ? true : data.showInMenu,
    parentId: data.parentId || null,
    menuOrder: data.menuOrder || 0,
    createdAt: createdAtTimestamp ? (createdAtTimestamp.toDate() as Date).toISOString() : null,
  };
};

export const getPages = async (): Promise<Page[]> => {
  noStore();
  try {
    // Note: Firestore doesn't support ordering by a field that isn't in an inequality filter.
    // We fetch and then sort in the application.
    const snapshot = await getDocs(pagesCollection);
    const pages = snapshot.docs.map(fromFirestore);
    pages.sort((a, b) => a.menuOrder - b.menuOrder);
    return pages;
  } catch (error) {
    console.error("Error fetching pages:", error);
    return [];
  }
};

export const getMenuPages = async (): Promise<Page[]> => {
    noStore();
    try {
        const q = query(pagesCollection, where("showInMenu", "==", true));
        const snapshot = await getDocs(q);
        
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

export const addPage = async (item: Partial<PageData>) => {
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


export async function updatePageOrderAndParent(pageId: string, parentId: string | null, newOrder: number) {
    noStore();
    try {
        const pageRef = doc(db, "pages", pageId);
        await updateDoc(pageRef, {
            parentId: parentId,
            menuOrder: newOrder
        });
        return { success: true };
    } catch (e: any) {
        console.error("Error updating page order and parent:", e);
        return { success: false, error: e.message };
    }
}