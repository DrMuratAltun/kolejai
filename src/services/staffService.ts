
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
  aiHint: string;
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
    
    let parentId = null;
    if (obj.parentId !== null && typeof obj.parentId !== 'undefined') {
        const numParentId = Number(obj.parentId);
        if (!isNaN(numParentId)) {
            parentId = String(numParentId);
        } else {
            console.warn(`Invalid non-numeric parentId found for staff member ${obj.id}:`, obj.parentId);
        }
    }
    
    return {
        id: String(obj.id),
        name: obj.name || 'İsimsiz Personel',
        title: obj.title || 'Unvan Belirtilmemiş',
        department: obj.department || 'Departman Bilinmiyor',
        description: obj.description || '',
        photo: obj.photo || 'https://placehold.co/400x400.png',
        aiHint: obj.aiHint || '',
        parentId: parentId,
        createdAt: new Date().toISOString(),
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
        id: newId,
        name: item.name,
        title: item.title,
        department: item.department,
        description: item.description,
        photo: item.photo,
        aiHint: item.aiHint || '',
        parentId: item.parentId ? Number(item.parentId) : null,
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
    
    const dataToUpdate: any = { ...item };
    if ('parentId' in dataToUpdate) {
        dataToUpdate.parentId = dataToUpdate.parentId ? Number(dataToUpdate.parentId) : null;
    }

    const updatedMember = {
        ...staffArray[memberIndex],
        ...dataToUpdate
    };

    staffArray[memberIndex] = updatedMember;
    return await setDoc(staffDocRef, { staff: staffArray });
};

export const deleteStaffMember = async (id: string) => {
    let staffArray = await getStaffArray();
    const numericIdToDelete = Number(id);
    
    const arrayWithOrphansHandled = staffArray.map(member => {
        if (member.parentId === numericIdToDelete) {
            return { ...member, parentId: null };
        }
        return member;
    });

    const updatedStaffArray = arrayWithOrphansHandled.filter(m => m.id !== numericIdToDelete);

    return await setDoc(staffDocRef, { staff: updatedStaffArray });
};

export const updateStaffParent = async (staffId: string, newParentId: string | null) => {
    const staffArray = await getStaffArray();
    const numericId = Number(staffId);
    const numericParentId = newParentId ? Number(newParentId) : null;

    if (numericId === numericParentId) {
        throw new Error("Bir personel kendisine yönetici olarak atanamaz.");
    }

    const memberIndex = staffArray.findIndex(m => m.id === numericId);
    if (memberIndex === -1) {
        throw new Error("Sürüklenen personel bulunamadı.");
    }

    if (numericParentId !== null) {
        const parentExists = staffArray.some(m => m.id === numericParentId);
        if (!parentExists) {
            throw new Error("Hedef yönetici bulunamadı.");
        }
    }
    
    // Check for circular dependencies
    let currentParentIdInLoop = numericParentId;
    while(currentParentIdInLoop !== null) {
        if (currentParentIdInLoop === numericId) {
            throw new Error("Döngüsel bir hiyerarşi oluşturulamaz. (Örn: Bir yönetici kendi altına atanamaz)");
        }
        const parent = staffArray.find(m => m.id === currentParentIdInLoop);
        if (!parent) break; // Reached the top of this branch
        currentParentIdInLoop = parent.parentId;
    }

    staffArray[memberIndex].parentId = numericParentId;

    return await setDoc(staffDocRef, { staff: staffArray });
};
