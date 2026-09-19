import { collection, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Product } from '../types';

const productsCollectionName = 'productos';
const productsRef = collection(db, productsCollectionName);

export const addProduct = async (product: Product) => {
  const docRef = await addDoc(productsRef, product);
  return docRef.id;
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const docRef = doc(db, productsCollectionName, id);
  await updateDoc(docRef, product);
};

export const deleteProduct = async (id: string) => {
  const docRef = doc(db, productsCollectionName, id);
  await deleteDoc(docRef);
};
