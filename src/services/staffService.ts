
'use server';

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy, serverTimestamp } from "firebase/firestore";
import { unstable_noStore as noStore } from 'next/cache';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  image: string;
  aiHint: string;
  managerId: string | null;
  createdAt?: string | null;
}

export type StaffMemberData = Omit<StaffMember, 'id' | 'createdAt'>;

const staffCollection = collection(db, "staff");

const fromFirestore = (snapshot: any): StaffMember => {
  const data = snapshot.data() || {};
  const createdAtTimestamp = data.createdAt;
  return {
    id: snapshot.id,
    name: data.name || '',
    role: data.role || '',
    department: data.department || '',
    bio: data.bio || '',
    image: data.image || 'https://placehold.co/400x400.png',
    aiHint: data.aiHint || '',
    managerId: data.managerId || null,
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

    const members: StaffMember[] = [];
    snapshot.docs.forEach(doc => {
      try {
        // Attempt to parse each document individually.
        const member = fromFirestore(doc);
        members.push(member);
      } catch (e) {
        // If a single document is malformed, log the error and skip it
        // instead of crashing the entire page render.
        console.error(`Skipping malformed staff document with ID: ${doc.id}`, e);
      }
    });
    return members;

  } catch (error) {
    console.error("Error fetching staff members collection:", error);
    // If the entire query fails, return an empty array to prevent a crash.
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
