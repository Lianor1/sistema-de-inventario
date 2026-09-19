import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Expense } from '../types';

export const registerExpense = async (expense: Expense) => {
  const newExpense = {
    ...expense,
    fechaRegistro: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, 'gastos'), newExpense);
  return docRef.id;
};

export const getExpensesByShift = async (turnoId: string): Promise<Expense[]> => {
  const q = query(collection(db, 'gastos'), where('turnoId', '==', turnoId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
};
