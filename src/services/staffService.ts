
'use server';

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { unstable_noStore as noStore } from 'next/cache';

export interface StaffMember {
  id: string;
  name: string;
  title: string;
  department: string;
  description: string;
  photo: string;
  aiHint: string;
  parentId: string | null;
  createdAt?: string | null;
}

// Data for creating/updating, ID is not included as it's the doc ID
export type StaffMemberData = Omit<StaffMember, 'id' | 'createdAt'>;

const staffCollection = collection(db, "staff");

const fromFirestore = (snapshot: any): StaffMember => {
  const data = snapshot.data();
  const createdAtTimestamp = data.createdAt;
  return {
    id: snapshot.id,
    name: data.name || '',
    title: data.title || '',
    department: data.department || '',
    description: data.description || '',
    photo: data.photo || '',
    aiHint: data.aiHint || '',
    parentId: data.parentId || null,
    createdAt: createdAtTimestamp ? (createdAtTimestamp.toDate() as Date).toISOString() : null,
  };
};

export const getStaffMembers = async (): Promise<StaffMember[]> => {
  noStore();
  try {
    const q = query(staffCollection, orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(fromFirestore);
  } catch (error) {
    console.error("Error fetching staff members:", error);
    return [];
  }
};

export const getStaffMemberById = async (id: string): Promise<StaffMember | null> => {
    noStore();
    if (!id) return null;
    try {
        const docRef = doc(db, "staff", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return fromFirestore(docSnap);
        }
        return null;
    } catch (error) {
        console.error(`Error fetching staff member by ID ${id}:`, error);
        return null;
    }
}


export const addStaffMember = async (item: StaffMemberData) => {
  return await addDoc(staffCollection, {
    ...item,
    createdAt: serverTimestamp()
  });
};

export const updateStaffMember = async (id: string, item: Partial<StaffMemberData>) => {
  const docRef = doc(db, "staff", id);
  return await updateDoc(docRef, item);
};

export const deleteStaffMember = async (id: string) => {
    const batch = writeBatch(db);

    // 1. Find all direct children of the member being deleted
    const childrenQuery = query(staffCollection, where("parentId", "==", id));
    const childrenSnapshot = await getDocs(childrenQuery);
    
    // 2. Set their parentId to null
    childrenSnapshot.forEach(childDoc => {
        const childRef = doc(db, "staff", childDoc.id);
        batch.update(childRef, { parentId: null });
    });

    // 3. Delete the actual member
    const docRef = doc(db, "staff", id);
    batch.delete(docRef);

    // 4. Commit the batch
    return await batch.commit();
};


export async function updateStaffParent(staffId: string, newParentId: string | null) {
    if (staffId === newParentId) throw new Error("Bir personel kendi yöneticisi olamaz.");

    // Check for circular dependencies
    let currentParentIdInLoop = newParentId;
    while (currentParentIdInLoop !== null) {
        if (currentParentIdInLoop === staffId) {
            throw new Error("Döngüsel bir hiyerarşi oluşturulamaz.");
        }
        const parent = await getStaffMemberById(currentParentIdInLoop);
        if (!parent) break;
        currentParentIdInLoop = parent.parentId;
    }

    const docRef = doc(db, "staff", staffId);
    return await updateDoc(docRef, { parentId: newParentId });
}
