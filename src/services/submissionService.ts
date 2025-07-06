'use server';

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, Timestamp, query, orderBy, serverTimestamp } from "firebase/firestore";

export interface Submission {
  id: string;
  parentName: string;
  phone: string;
  email: string;
  studentName: string;
  grade: string;
  source?: string;
  message?: string;
  kvkk: boolean;
  createdAt: Timestamp;
}

export type SubmissionData = Omit<Submission, 'id' | 'createdAt'>;

const submissionsCollection = collection(db, "submissions");

const fromFirestore = (snapshot: any): Submission => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    parentName: data.parentName,
    phone: data.phone,
    email: data.email,
    studentName: data.studentName,
    grade: data.grade,
    source: data.source,
    message: data.message,
    kvkk: data.kvkk,
    createdAt: data.createdAt,
  };
};

export const getSubmissions = async (): Promise<Submission[]> => {
  try {
    const q = query(submissionsCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(fromFirestore);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return [];
  }
};

export const addSubmission = async (item: SubmissionData) => {
  return await addDoc(submissionsCollection, {
      ...item,
      createdAt: serverTimestamp()
  });
};
