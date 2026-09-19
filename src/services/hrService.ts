import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Employee } from '../types';

const employeesRef = collection(db, 'trabajadores');

export const addEmployee = async (employee: Employee) => {
  const docRef = await addDoc(employeesRef, employee);
  return docRef.id;
};

export const getEmployees = async (): Promise<Employee[]> => {
  const q = query(employeesRef, orderBy('nombre', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Employee));
};

export const deleteEmployee = async (id: string) => {
  const docRef = doc(db, 'trabajadores', id);
  await deleteDoc(docRef);
};

import { updateDoc } from 'firebase/firestore';

export const updateEmployeeStatus = async (id: string, estado: 'Activo' | 'Inactivo') => {
  const docRef = doc(db, 'trabajadores', id);
  await updateDoc(docRef, { estado });
};
