
'use server';

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { unstable_noStore as noStore } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export interface StaffMember {
  id: string;
  name: string;
  title: string;
  department: string;
  description: string;
  photo: string;
  aiHint: string;
  parentId: string | null;
}

export type StaffMemberData = Omit<StaffMember, 'id'>;

const staffDocRef = doc(db, "staff", "staff");

const fromArray = (data: any, id: string): StaffMember => ({
    id: id,
    name: data.name,
    title: data.title,
    department: data.department,
    description: data.description,
    photo: data.photo,
    aiHint: data.aiHint || '',
    parentId: data.parentId || null,
});

export const getStaffMembers = async (): Promise<StaffMember[]> => {
    noStore();
    try {
        const docSnap = await getDoc(staffDocRef);
        if (!docSnap.exists() || !docSnap.data()?.staff) {
            await setDoc(staffDocRef, { staff: [] }, { merge: true });
            return [];
        }
        const staffArray = docSnap.data().staff;
        return staffArray.map((s: any) => fromArray(s, s.id)).sort((a: StaffMember, b: StaffMember) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Error fetching staff members:", error);
        return [];
    }
};

export const addStaffMember = async (item: StaffMemberData) => {
    const docSnap = await getDoc(staffDocRef);
    const staffArray = docSnap.exists() && docSnap.data()?.staff ? docSnap.data().staff : [];
    
    const newMember: StaffMember = {
        id: uuidv4(),
        name: item.name,
        title: item.title,
        department: item.department,
        description: item.description,
        photo: item.photo,
        aiHint: item.aiHint,
        parentId: item.parentId,
    };
    
    const newStaffArray = [...staffArray, newMember];
    
    return await setDoc(staffDocRef, { staff: newStaffArray });
};

export const updateStaffMember = async (id: string, item: Partial<StaffMemberData>) => {
    const docSnap = await getDoc(staffDocRef);
    if (!docSnap.exists() || !docSnap.data()?.staff) throw new Error("Staff document not found.");
    
    const staffArray: StaffMember[] = docSnap.data().staff;
    const newStaffArray = staffArray.map((member) => member.id === id ? { ...member, ...item } : member);

    return await setDoc(staffDocRef, { staff: newStaffArray });
};

export const deleteStaffMember = async (id: string) => {
    const docSnap = await getDoc(staffDocRef);
    if (!docSnap.exists() || !docSnap.data()?.staff) throw new Error("Staff document not found.");
    
    const staffArray: StaffMember[] = docSnap.data().staff;
    const updatedArray = staffArray.map(member => member.parentId === id ? { ...member, parentId: null } : member);
    const finalArray = updatedArray.filter(member => member.id !== id);

    return await setDoc(staffDocRef, { staff: finalArray });
};

export async function updateStaffParent(staffId: string, newParentId: string | null) {
    if (staffId === newParentId) throw new Error("A staff member cannot be their own parent.");

    const docSnap = await getDoc(staffDocRef);
    if (!docSnap.exists() || !docSnap.data()?.staff) throw new Error("Staff document not found.");

    const staffArray: StaffMember[] = docSnap.data().staff;

    // Check for circular dependencies
    let currentParentIdInLoop = newParentId;
    while(currentParentIdInLoop !== null) {
        if (currentParentIdInLoop === staffId) {
            throw new Error("Circular hierarchy detected.");
        }
        const parent = staffArray.find((s:any) => s.id === currentParentIdInLoop);
        if (!parent) break;
        currentParentIdInLoop = parent.parentId || null;
    }

    const newStaffArray = staffArray.map((member) => member.id === staffId ? { ...member, parentId: newParentId } : member);

    return await setDoc(staffDocRef, { staff: newStaffArray });
}
