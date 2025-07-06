
'use server';

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy, serverTimestamp } from "firebase/firestore";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  image: string;
  aiHint: string;
  createdAt?: string | null;
}

export type StaffMemberData = Omit<StaffMember, 'id' | 'createdAt'>;

const staffCollection = collection(db, "staff");

const fromFirestore = (snapshot: any): StaffMember => {
  const data = snapshot.data();
  const createdAtTimestamp = data.createdAt;
  return {
    id: snapshot.id,
    name: data.name,
    role: data.role,
    department: data.department,
    bio: data.bio,
    image: data.image,
    aiHint: data.aiHint || '',
    createdAt: createdAtTimestamp ? (createdAtTimestamp.toDate() as Date).toISOString() : null,
  };
};

export const getStaffMembers = async (): Promise<StaffMember[]> => {
  try {
    const q = query(staffCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        console.log("No staff members found, returning empty array.");
        return [];
    }
    return snapshot.docs.map(fromFirestore);
  } catch (error) {
    console.error("Error fetching staff members:", error);
    return [];
  }
};

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
  const docRef = doc(db, "staff", id);
  return await deleteDoc(docRef);
};
