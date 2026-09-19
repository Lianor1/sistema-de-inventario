import { collection, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Supplier } from '../types';

const suppliersRef = collection(db, 'proveedores');

export const addSupplier = async (supplier: Supplier) => {
  const docRef = await addDoc(suppliersRef, supplier);
  return docRef.id;
};

export const deleteSupplier = async (id: string) => {
  const docRef = doc(db, 'proveedores', id);
  await deleteDoc(docRef);
};
