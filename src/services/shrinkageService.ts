import { collection, doc, writeBatch, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Shrinkage } from '../types';

export const registerShrinkage = async (shrinkage: Shrinkage) => {
  const batch = writeBatch(db);
  const shrinkageRef = doc(collection(db, 'mermas'));
  
  batch.set(shrinkageRef, {
    ...shrinkage,
    fecha: serverTimestamp()
  });

  const productRef = doc(db, 'productos', shrinkage.productoId);
  const { increment } = await import('firebase/firestore');
  
  batch.update(productRef, {
    stockActual: increment(-shrinkage.cantidad)
  });

  const kardexRef = doc(collection(db, 'kardex'));
  batch.set(kardexRef, {
    productoId: shrinkage.productoId,
    productoNombre: shrinkage.productoNombre,
    tipo: 'Salida',
    motivo: `Merma: ${shrinkage.motivo}`,
    cantidad: shrinkage.cantidad,
    fechaMovimiento: serverTimestamp(),
    referenciaId: shrinkageRef.id
  });

  await batch.commit();
  return shrinkageRef.id;
};

export const subscribeToShrinkages = (callback: (data: Shrinkage[]) => void) => {
  const q = query(collection(db, 'mermas'), orderBy('fecha', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shrinkage)));
  });
};
