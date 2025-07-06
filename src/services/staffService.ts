
'use server';

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { unstable_noStore as noStore } from 'next/cache';

// Interface for the application's staff member structure
// This now directly matches the Firestore array object structure
export interface StaffMember {
  id: number;
  name: string;
  title: string; // Was role
  department: string;
  description: string; // Was bio
  photo: string; // Was image
  aiHint?: string;
  parentId: number | null; // Was managerId
}

// Type for creating new staff members, omitting the generated `id`
export type StaffMemberData = Omit<StaffMember, 'id'>;

const staffDocRef = doc(db, "staff", "staff");

const getStaffArray = async (): Promise<any[]> => {
    const docSnap = await getDoc(staffDocRef);
    if (!docSnap.exists()) {
        await updateDoc(staffDocRef, { staff: [] });
        return [];
    }
    const data = docSnap.data();
    return data.staff && Array.isArray(data.staff) ? data.staff : [];
};

const fromDbObjectToStaffMember = (dbObj: any): StaffMember => {
    return {
        id: dbObj.id || 0,
        name: dbObj.name || 'Hatalı Veri',
        title: dbObj.title || '',
        department: dbObj.department || 'Bilinmiyor',
        description: dbObj.description || '',
        photo: dbObj.photo || 'https://placehold.co/400x400.png',
        aiHint: dbObj.aiHint || '',
        parentId: dbObj.parentId || null,
    };
};

export const getStaffMembers = async (): Promise<StaffMember[]> => {
  noStore();
  try {
    const staffArray = await getStaffArray();
    const members = staffArray.map(fromDbObjectToStaffMember);
    members.sort((a, b) => a.name.localeCompare(b.name));
    return members;
  } catch (error) {
    console.error("Error fetching staff members:", error);
    return [];
  }
};

export const addStaffMember = async (item: StaffMemberData) => {
    const staffArray = await getStaffArray();
    const maxId = staffArray.reduce((max, member) => (member.id > max ? member.id : max), 0);
    const newMember: StaffMember = {
        ...item,
        id: maxId + 1,
    };
    const newStaffArray = [...staffArray, newMember];
    return await updateDoc(staffDocRef, { staff: newStaffArray });
};

export const updateStaffMember = async (id: number, item: Partial<StaffMemberData>) => {
  const staffArray = await getStaffArray();
  const memberIndex = staffArray.findIndex(member => member.id === id);

  if (memberIndex === -1) {
    throw new Error("Staff member not found for update.");
  }
  
  const updatedMember = { ...staffArray[memberIndex], ...item, id };
  const newStaffArray = [...staffArray];
  newStaffArray[memberIndex] = updatedMember;

  return await updateDoc(staffDocRef, { staff: newStaffArray });
};

export const deleteStaffMember = async (id: number) => {
    const staffArray = await getStaffArray();
    const newStaffArray = staffArray.filter(member => member.id !== id);
    return await updateDoc(staffDocRef, { staff: newStaffArray });
};
