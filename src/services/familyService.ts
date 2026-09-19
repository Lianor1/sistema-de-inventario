import { collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ProductFamily {
  id?: string;
  nombre: string; // Ej: "Yogurt Gloria 1L"
  categoria: string;
  marca: string;
}

const familiesRef = collection(db, 'familias_productos');

export const addFamily = async (family: ProductFamily) => {
  const docRef = await addDoc(familiesRef, family);
  return docRef.id;
};

export const updateFamily = async (id: string, family: Partial<ProductFamily>) => {
  const docRef = doc(db, 'familias_productos', id);
  await updateDoc(docRef, family);
};

export const deleteFamily = async (id: string) => {
  const docRef = doc(db, 'familias_productos', id);
  await deleteDoc(docRef);
};
