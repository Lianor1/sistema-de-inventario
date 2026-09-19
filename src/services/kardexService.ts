import { collection, doc, writeBatch, serverTimestamp, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { InventoryMovement } from '../types';

export const registerManualAdjustment = async (
  productoId: string, 
  productoNombre: string, 
  cantidadAjuste: number, // Negativo para merma, Positivo para corrección
  motivo: 'Merma/Vencido' | 'Ajuste Manual', 
  usuarioEmail: string
) => {
  if (cantidadAjuste === 0) return;

  const batch = writeBatch(db);
  const tipo = cantidadAjuste > 0 ? 'Entrada' : 'Salida';
  
  // 1. Actualizar el stock del producto
  const productRef = doc(db, 'productos', productoId);
  const { increment } = await import('firebase/firestore');
  batch.update(productRef, {
    stockActual: increment(cantidadAjuste)
  });

  // 2. Registrar en Kardex
  const kardexRef = doc(collection(db, 'kardex'));
  batch.set(kardexRef, {
    productoId,
    productoNombre,
    tipo,
    motivo,
    cantidad: cantidadAjuste,
    fechaMovimiento: serverTimestamp(),
    usuarioEmail
  });

  await batch.commit();
};
