import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Purchase } from '../types';

export const registerPurchase = async (purchase: Purchase) => {
  const batch = writeBatch(db);
  const purchasesRef = collection(db, 'compras');
  
  // 1. Crear el documento de la compra
  const newPurchaseRef = doc(purchasesRef);
  batch.set(newPurchaseRef, {
    ...purchase,
    fechaCompra: serverTimestamp()
  });

  // 2. Aumentar el stock y registrar en kardex
  for (const item of purchase.articulos) {
    const productRef = doc(db, 'productos', item.productoId);
    
    const { increment, arrayUnion } = await import('firebase/firestore');
    
    let updateData: any = {
      stockActual: increment(item.cantidad)
    };

    if ((item as any).fechaVencimiento) {
      updateData.lotes = arrayUnion({
        loteId: newPurchaseRef.id,
        cantidad: item.cantidad,
        fechaVencimiento: (item as any).fechaVencimiento
      });
    }

    batch.update(productRef, updateData);

    // 3. Registrar movimiento en Kardex
    const kardexRef = doc(collection(db, 'kardex'));
    batch.set(kardexRef, {
      productoId: item.productoId,
      productoNombre: item.nombre,
      tipo: 'Entrada',
      motivo: 'Compra',
      cantidad: item.cantidad,
      fechaMovimiento: serverTimestamp(),
      referenciaId: newPurchaseRef.id
    });
  }

  // Ejecutar todo de forma atómica
  await batch.commit();
  return newPurchaseRef.id;
};

import { getDoc } from 'firebase/firestore';

export const voidPurchase = async (purchaseId: string) => {
  const purchaseRef = doc(db, 'compras', purchaseId);
  const purchaseSnap = await getDoc(purchaseRef);
  
  if (!purchaseSnap.exists()) throw new Error("Purchase not found");
  
  const purchase = purchaseSnap.data() as Purchase;
  if (purchase.estado === 'Anulado') throw new Error("Already voided");

  const batch = writeBatch(db);
  batch.update(purchaseRef, { estado: 'Anulado' });

  const { increment } = await import('firebase/firestore');

  for (const item of purchase.articulos) {
    const productRef = doc(db, 'productos', item.productoId);
    
    batch.update(productRef, {
      stockActual: increment(-item.cantidad)
    });

    const kardexRef = doc(collection(db, 'kardex'));
    batch.set(kardexRef, {
      productoId: item.productoId,
      productoNombre: item.nombre,
      tipo: 'Salida',
      motivo: 'Anulación de Compra',
      cantidad: item.cantidad,
      fechaMovimiento: serverTimestamp(),
      referenciaId: purchaseId
    });
  }

  await batch.commit();
};
