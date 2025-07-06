
'use server';

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { unstable_noStore as noStore } from 'next/cache';

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

const staffDocRef = doc(db, "staff", "staff");

const getStaffArray = async (): Promise<any[]> => {
    const docSnap = await getDoc(staffDocRef);
    if (!docSnap.exists() || !Array.isArray(docSnap.data().staff)) {
        console.log("Staff document or array not found, creating a new one.");
        await setDoc(staffDocRef, { staff: [] }, { merge: true });
        return [];
    }
    return docSnap.data().staff;
};

const fromFirestoreObject = (obj: any): StaffMember | null => {
    if (!obj || typeof obj.id === 'undefined' || !obj.name) {
        console.error("Skipping malformed staff object in Firestore:", obj);
        return null; 
    }
    return {
        id: String(obj.id),
        name: obj.name || 'İsimsiz Personel',
        title: obj.title || 'Unvan Belirtilmemiş',
        department: obj.department || 'Departman Bilinmiyor',
        description: obj.description || '',
        photo: obj.photo || 'https://placehold.co/400x400.png',
        aiHint: obj.aiHint || '',
        parentId: obj.parentId !== null && typeof obj.parentId !== 'undefined' ? String(obj.parentId) : null,
        createdAt: new Date().toISOString(), // This is a fallback as createdAt is not in the DB
    };
};

export const getStaffMembers = async (): Promise<StaffMember[]> => {
    noStore();
    try {
        const staffArray = await getStaffArray();
        const validStaff = staffArray.map(fromFirestoreObject).filter(Boolean) as StaffMember[];
        return validStaff.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Error fetching staff members:", error);
        return [];
    }
};

export const addStaffMember = async (item: StaffMemberData) => {
    const staffArray = await getStaffArray();
    const newId = staffArray.length > 0 ? Math.max(...staffArray.map(m => m.id || 0)) + 1 : 1;

    const newMember = {
        ...item,
        id: newId,
        parentId: item.parentId ? Number(item.parentId) : null,
        aiHint: item.aiHint || '',
    };
    
    staffArray.push(newMember);
    return await setDoc(staffDocRef, { staff: staffArray });
};

export const updateStaffMember = async (id: string, item: Partial<StaffMemberData>) => {
    const staffArray = await getStaffArray();
    const numericId = Number(id);
    const memberIndex = staffArray.findIndex(m => m.id === numericId);

    if (memberIndex === -1) {
        throw new Error("Staff member not found for update.");
    }
    
    const dataToUpdate = { ...item };
    if ('parentId' in dataToUpdate) {
        dataToUpdate.parentId = dataToUpdate.parentId ? String(dataToUpdate.parentId) : null;
    }

    const updatedMember = {
        ...staffArray[memberIndex],
        ...dataToUpdate,
        parentId: dataToUpdate.parentId ? Number(dataToUpdate.parentId) : null,
    };

    staffArray[memberIndex] = updatedMember;
    return await setDoc(staffDocRef, { staff: staffArray });
};

export const deleteStaffMember = async (id: string) => {
    let staffArray = await getStaffArray();
    const numericIdToDelete = Number(id);
    
    // First, handle any children of the member being deleted
    const arrayWithOrphansHandled = staffArray.map(member => {
        if (member.parentId === numericIdToDelete) {
            return { ...member, parentId: null };
        }
        return member;
    });

    // Then, filter out the member to be deleted
    const updatedStaffArray = arrayWithOrphansHandled.filter(m => m.id !== numericIdToDelete);

    return await setDoc(staffDocRef, { staff: updatedStaffArray });
};
