
'use server';

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
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

const staffCollection = collection(db, "staff");

const fromFirestore = (snapshot: any): StaffMember => {
  const data = snapshot.data();
  const createdAtTimestamp = data.createdAt;
  return {
    id: snapshot.id,
    name: data.name,
    title: data.title,
    department: data.department,
    description: data.description || '',
    photo: data.photo || '',
    aiHint: data.aiHint || '',
    parentId: data.parentId || null,
    createdAt: createdAtTimestamp ? (createdAtTimestamp.toDate() as Date).toISOString() : null,
  };
};

export const getStaffMembers = async (): Promise<StaffMember[]> => {
    noStore();
    try {
        const q = query(staffCollection, orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching staff members:", error);
        return [];
    }
};

export const addStaffMember = async (item: StaffMemberData) => {
    const dataToAdd = {
        ...item,
        photo: item.photo || '',
        aiHint: item.aiHint || '',
        createdAt: serverTimestamp()
    };
    return await addDoc(staffCollection, dataToAdd);
};

export const updateStaffMember = async (id: string, item: Partial<StaffMemberData>) => {
    const docRef = doc(db, "staff", id);
    const dataToUpdate = { ...item };

    // Prevent 'undefined' values from being written to Firestore
    if (item.photo === undefined) delete dataToUpdate.photo;
    if (item.aiHint === undefined) delete dataToUpdate.aiHint;
    
    return await updateDoc(docRef, dataToUpdate);
};

export const deleteStaffMember = async (id: string) => {
    const allStaff = await getStaffMembers();
    
    // Find children and set their parentId to null
    const childrenUpdates = allStaff
        .filter(member => member.parentId === id)
        .map(child => updateDoc(doc(db, "staff", child.id), { parentId: null }));
    
    await Promise.all(childrenUpdates);
    
    // Delete the member
    const docRef = doc(db, "staff", id);
    return await deleteDoc(docRef);
};


export const updateStaffParent = async (staffId: string, newParentId: string | null) => {
    if (!staffId) {
        throw new Error("Personel ID gerekli.");
    }

    if (staffId === newParentId) {
        throw new Error("Bir personel kendisine yönetici olarak atanamaz.");
    }
    
    const docRef = doc(db, "staff", staffId);
    
    // Check for circular dependencies
    let currentParentIdInLoop = newParentId;
    while(currentParentIdInLoop !== null) {
        if (currentParentIdInLoop === staffId) {
            throw new Error("Döngüsel bir hiyerarşi oluşturulamaz. (Örn: Bir yönetici kendi altına atanamaz)");
        }
        const parentDoc = await getDoc(doc(db, "staff", currentParentIdInLoop));
        if (!parentDoc.exists()) break;
        currentParentIdInLoop = parentDoc.data().parentId || null;
    }

    return await updateDoc(docRef, { parentId: newParentId });
};
