
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
  
  let createdAtISO: string | null = null;
  // This is the key change: only call toDate() if it's a function on a valid object.
  // This prevents crashes if createdAt is missing, null, or not a Firestore Timestamp.
  if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      createdAtISO = (data.createdAt.toDate() as Date).toISOString();
  }

  return {
    id: snapshot.id,
    name: typeof data.name === 'string' ? data.name : '',
    role: typeof data.role === 'string' ? data.role : '',
    department: typeof data.department === 'string' ? data.department : '',
    bio: typeof data.bio === 'string' ? data.bio : '',
    image: typeof data.image === 'string' && data.image ? data.image : 'https://placehold.co/400x400.png',
    aiHint: typeof data.aiHint === 'string' ? data.aiHint : '',
    managerId: typeof data.managerId === 'string' ? data.managerId : null,
    createdAt: createdAtISO,
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
        // fromFirestore is now robust enough to handle malformed data without crashing.
        const member = fromFirestore(doc);
        members.push(member);
      } catch (e) {
        // This catch is an extra safety layer, but fromFirestore should prevent most errors.
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
