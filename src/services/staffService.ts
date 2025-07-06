
'use server';

import { db } from "@/lib/firebase";
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
  query, orderBy, serverTimestamp, writeBatch, where 
} from "firebase/firestore";
import { unstable_noStore as noStore } from 'next/cache';

// NEW DATA MODEL:
// id: string (Firestore Document ID)
// parentId: string | null (Document ID of the parent)
export interface StaffMember {
  id: string;
  name: string;
  title: string; 
  department: string;
  description: string; 
  photo: string; 
  aiHint?: string;
  parentId: string | null; 
  createdAt?: string;
}

export type StaffMemberData = Omit<StaffMember, 'id' | 'createdAt'>;

const staffCollection = collection(db, "staff");

// Converts a Firestore document snapshot to our StaffMember type
const fromFirestore = (snapshot: any): StaffMember => {
  const data = snapshot.data();
  const createdAtTimestamp = data.createdAt;
  
  return {
    id: snapshot.id,
    name: data.name || 'İsimsiz Personel',
    title: data.title || 'Unvan Belirtilmemiş',
    department: data.department || 'Departman Bilinmiyor',
    description: data.description || '',
    photo: data.photo || 'https://placehold.co/400x400.png',
    aiHint: data.aiHint || '',
    parentId: data.parentId || null,
    createdAt: createdAtTimestamp ? (createdAtTimestamp.toDate()).toISOString() : new Date().toISOString(),
  };
};

// GET all staff members, ordered by name
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
    return []; // Return empty array on error to prevent page crash
  }
};

// ADD a new staff member
export const addStaffMember = async (item: StaffMemberData) => {
  // Ensure all fields are present with default values to maintain a consistent data structure
  const dataToSave = {
    ...item,
    aiHint: item.aiHint || '',
    parentId: item.parentId || null,
    createdAt: serverTimestamp()
  };
  return await addDoc(staffCollection, dataToSave);
};

// UPDATE an existing staff member
export const updateStaffMember = async (id: string, item: Partial<StaffMemberData>) => {
  const docRef = doc(db, "staff", id);
  const dataToUpdate = {...item};
  // Ensure parentId is not undefined, which can cause issues.
  if ('parentId' in dataToUpdate && dataToUpdate.parentId === undefined) {
    dataToUpdate.parentId = null;
  }
  return await updateDoc(docRef, dataToUpdate);
};

// DELETE a staff member and handle orphaned children
export const deleteStaffMember = async (id: string) => {
  const batch = writeBatch(db);

  // 1. Delete the staff member itself
  const docRef = doc(db, "staff", id);
  batch.delete(docRef);

  // 2. Find any children who had this member as a parent
  const q = query(staffCollection, where("parentId", "==", id));
  const childrenSnapshot = await getDocs(q);

  // 3. Update their parentId to null
  if (!childrenSnapshot.empty) {
    childrenSnapshot.forEach(childDoc => {
      const childRef = doc(db, "staff", childDoc.id);
      batch.update(childRef, { parentId: null });
    });
  }
  
  // 4. Commit all operations as a single batch
  return await batch.commit();
};
