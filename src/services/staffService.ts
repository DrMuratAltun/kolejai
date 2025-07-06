
'use server';

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { unstable_noStore as noStore } from 'next/cache';

// Interface for the application's staff member structure
// This now directly matches the Firestore array object structure
export interface StaffMember {
  id: number;
  name: string;
  title: string; 
  department: string;
  description: string; 
  photo: string; 
  aiHint?: string;
  parentId: number | null; 
}

// Type for creating new staff members, omitting the generated `id`
export type StaffMemberData = Omit<StaffMember, 'id'>;

const staffDocRef = doc(db, "staff", "staff");

const getStaffArray = async (): Promise<any[]> => {
    const docSnap = await getDoc(staffDocRef);
    if (!docSnap.exists()) {
        console.log("Staff document does not exist, creating one...");
        // Use setDoc to create the document if it doesn't exist. updateDoc would fail.
        await setDoc(staffDocRef, { staff: [] });
        return [];
    }
    const data = docSnap.data();
    return data.staff && Array.isArray(data.staff) ? data.staff : [];
};

// This function is designed to be extremely robust against malformed data.
const fromDbObjectToStaffMember = (dbObj: any): StaffMember | null => {
    // Robust check to ensure dbObj is a processable object
    if (!dbObj || typeof dbObj !== 'object') {
        console.error("Skipping invalid (non-object) staff member data found in Firestore:", dbObj);
        return null;
    }
    if (dbObj.id === undefined || dbObj.id === null) {
        console.error("Skipping staff member data with missing or null ID:", dbObj);
        return null;
    }

    // Ultra-robust parentId parsing to prevent NaN serialization errors.
    const parsedParentId = Number(dbObj.parentId);
    let finalParentId: number | null;

    if (dbObj.parentId === undefined || dbObj.parentId === '' || dbObj.parentId === null) {
        finalParentId = null;
    } else if (isNaN(parsedParentId)) {
        console.error(`ERROR: Invalid parentId for staff member ID ${dbObj.id}. The value was "${dbObj.parentId}", which is not a number. Defaulting to null to prevent crash.`);
        finalParentId = null;
    } else {
        finalParentId = parsedParentId;
    }
    
    return {
        id: Number(dbObj.id), // Ensure it's a number
        name: dbObj.name || 'İsimsiz Personel',
        title: dbObj.title || 'Unvan Belirtilmemiş',
        department: dbObj.department || 'Departman Bilinmiyor',
        description: dbObj.description || '',
        photo: dbObj.photo || 'https://placehold.co/400x400.png',
        aiHint: dbObj.aiHint || '',
        parentId: finalParentId,
    };
};

export const getStaffMembers = async (): Promise<StaffMember[]> => {
  noStore();
  try {
    const staffArray = await getStaffArray();
    
    // Map and then filter out any null values resulting from malformed data
    const members = staffArray
        .map(fromDbObjectToStaffMember)
        .filter((member): member is StaffMember => member !== null);

    // Safely sort the valid members
    members.sort((a, b) => a.name.localeCompare(b.name));
    
    return members;
  } catch (error) {
    console.error("FATAL ERROR fetching staff members, returning empty array to prevent crash.", error);
    // Return an empty array on error to ensure the page can still render
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
    // After deleting, check for any children that pointed to the deleted member and nullify their parentId
    const updatedStaffArray = newStaffArray.map(member => {
        if (member.parentId === id) {
            return { ...member, parentId: null };
        }
        return member;
    });
    return await updateDoc(staffDocRef, { staff: updatedStaffArray });
};
