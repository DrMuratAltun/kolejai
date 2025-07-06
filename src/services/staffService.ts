
'use server';

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { unstable_noStore as noStore } from 'next/cache';

// Interface for the application's staff member structure
export interface StaffMember {
  id: string; // Using string to accommodate both Firestore IDs and numeric IDs from array
  name: string;
  role: string;
  department: string;
  bio: string;
  image: string;
  aiHint: string;
  managerId: string | null;
  createdAt?: string | null; // This will be null for data from the array
}

// Type for creating new staff members, omitting generated fields
export type StaffMemberData = Omit<StaffMember, 'id' | 'createdAt'>;

const staffDocRef = doc(db, "staff", "staff");

// Helper to get the whole staff array from the single document
const getStaffArray = async (): Promise<any[]> => {
    const docSnap = await getDoc(staffDocRef);
    if (!docSnap.exists()) {
        console.warn("Staff document 'staff/staff' does not exist.");
        // Attempt to create it if it doesn't exist to prevent future errors
        await updateDoc(staffDocRef, { staff: [] });
        return [];
    }
    const data = docSnap.data();
    return data.staff && Array.isArray(data.staff) ? data.staff : [];
};

// Converts a raw object from the Firestore array to the application's StaffMember interface
const fromDbObjectToStaffMember = (dbObj: any, index: number): StaffMember => {
    if (!dbObj || typeof dbObj !== 'object') {
        return {
            id: `${index}`, name: 'Hatalı Veri', role: '', department: '', bio: '', image: 'https://placehold.co/400x400.png', aiHint: '', managerId: null, createdAt: null,
        };
    }
    return {
        id: dbObj.id?.toString(),
        name: dbObj.name || '',
        role: dbObj.title || dbObj.role || '', // Support both `title` and `role` from DB
        department: dbObj.department || 'Bilinmiyor',
        bio: dbObj.description || dbObj.bio || '', // Support both `description` and `bio` from DB
        image: dbObj.photo || dbObj.image || 'https://placehold.co/400x400.png', // Support both `photo` and `image`
        aiHint: dbObj.aiHint || '',
        managerId: dbObj.parentId?.toString() || dbObj.managerId || null, // Support both `parentId` and `managerId`
        createdAt: null, // The array structure doesn't have timestamps
    };
};

export const getStaffMembers = async (): Promise<StaffMember[]> => {
  noStore();
  try {
    const staffArray = await getStaffArray();
    const members = staffArray.map(fromDbObjectToStaffMember);
    // Sort by name as the UI might expect it
    members.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return members;
  } catch (error) {
    console.error("Error fetching staff members:", error);
    return [];
  }
};

export const addStaffMember = async (item: StaffMemberData) => {
    const staffArray = await getStaffArray();
    
    // Find the highest existing ID to generate a new one
    const maxId = staffArray.reduce((max, member) => (member.id > max ? member.id : max), 0);
    const newId = maxId + 1;
    
    // Create object matching the DB schema seen in the image
    const newDbObject = {
        id: newId,
        name: item.name,
        title: item.role, // Map role to title
        department: item.department,
        description: item.bio, // Map bio to description
        photo: item.image, // Map image to photo
        aiHint: item.aiHint,
        parentId: item.managerId ? parseInt(item.managerId, 10) : null,
    };

    const newStaffArray = [...staffArray, newDbObject];
    
    return await updateDoc(staffDocRef, { staff: newStaffArray });
};

export const updateStaffMember = async (id: string, item: Partial<StaffMemberData>) => {
  const staffArray = await getStaffArray();
  
  const numericId = parseInt(id, 10);
  const memberIndex = staffArray.findIndex(member => member.id === numericId);

  if (memberIndex === -1) {
    throw new Error("Staff member not found for update.");
  }
  
  // Get existing member data
  const existingMember = staffArray[memberIndex];

  // Merge with new data, ensuring we use the app-level property names
  const updatedMemberData: StaffMemberData = {
      name: item.name ?? existingMember.name,
      role: item.role ?? existingMember.title,
      department: item.department ?? existingMember.department,
      bio: item.bio ?? existingMember.description,
      image: item.image ?? existingMember.photo,
      aiHint: item.aiHint ?? existingMember.aiHint,
      managerId: item.managerId === undefined ? (existingMember.parentId?.toString() || null) : item.managerId,
  };
  
  // Convert back to DB format for writing
  const updatedDbObject = {
    id: numericId, // Keep original numeric ID
    name: updatedMemberData.name,
    title: updatedMemberData.role,
    department: updatedMemberData.department,
    description: updatedMemberData.bio,
    photo: updatedMemberData.image,
    aiHint: updatedMemberData.aiHint,
    parentId: updatedMemberData.managerId ? parseInt(updatedMemberData.managerId, 10) : null,
  };

  const newStaffArray = [...staffArray];
  newStaffArray[memberIndex] = updatedDbObject;

  return await updateDoc(staffDocRef, { staff: newStaffArray });
};

export const deleteStaffMember = async (id: string) => {
    const staffArray = await getStaffArray();
    const numericId = parseInt(id, 10);
    
    const newStaffArray = staffArray.filter(member => member.id !== numericId);

    if (newStaffArray.length === staffArray.length) {
        console.warn(`Staff member with id ${id} not found for deletion.`);
        return; // Avoid unnecessary write
    }

    return await updateDoc(staffDocRef, { staff: newStaffArray });
};
