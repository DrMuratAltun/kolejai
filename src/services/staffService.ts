
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
  
  if (!data) {
    console.error(`Staff document ${snapshot.id} has no data. Skipping.`);
    // Return a 'safe' object that can be handled or filtered out, though this case is rare.
    // For now, we create a fallback object to avoid crashing the entire page.
    return {
      id: snapshot.id,
      name: 'Hatalı Kayıt',
      title: 'Hatalı Kayıt',
      department: 'Bilinmiyor',
      description: 'Bu kayıt veritabanında bozuk.',
      photo: '',
      aiHint: '',
      parentId: null,
      createdAt: new Date().toISOString(),
    };
  }

  const createdAtTimestamp = data.createdAt;

  // Defensive checks for all potentially missing fields
  if (!data.name || !data.title || !data.department) {
      console.warn(`Staff document ${snapshot.id} is missing required fields (name, title, or department). Using default values to prevent crash.`);
  }

  return {
    id: snapshot.id,
    name: data.name || 'İsim Belirtilmemiş',
    title: data.title || 'Unvan Belirtilmemiş',
    department: data.department || 'Departman Belirtilmemiş',
    description: data.description || '',
    photo: data.photo || '',
    aiHint: data.aiHint || '',
    parentId: data.parentId || null,
    createdAt: createdAtTimestamp ? (createdAtTimestamp.toDate() as Date).toISOString() : new Date().toISOString(),
  };
};

export const getStaffMembers = async (): Promise<StaffMember[]> => {
    noStore();
    try {
        const q = query(staffCollection, orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        // Safely map documents, any error in fromFirestore should be handled inside it.
        return snapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching staff members:", error);
        // Return empty array on error to prevent crashing the page.
        return [];
    }
};

export const addStaffMember = async (item: StaffMemberData) => {
    const dataToAdd = {
        ...item,
        description: item.description || '',
        photo: item.photo || '',
        aiHint: item.aiHint || '',
        parentId: item.parentId || null,
        createdAt: serverTimestamp()
    };
    return await addDoc(staffCollection, dataToAdd);
};

export const updateStaffMember = async (id: string, item: Partial<StaffMemberData>) => {
    const docRef = doc(db, "staff", id);
    const dataToUpdate: {[key: string]: any} = {};

    // Ensure we don't write `undefined` to firestore
    for (const [key, value] of Object.entries(item)) {
        if (value !== undefined) {
            dataToUpdate[key] = value;
        }
    }
    
    return await updateDoc(docRef, dataToUpdate);
};

export const deleteStaffMember = async (id: string) => {
    const allStaff = await getStaffMembers();
    
    const childrenUpdates = allStaff
        .filter(member => member.parentId === id)
        .map(child => updateDoc(doc(db, "staff", child.id), { parentId: null }));
    
    await Promise.all(childrenUpdates);
    
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
