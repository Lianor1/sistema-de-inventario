import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Sale } from '../types';

const salesCollectionName = 'ventas';
const salesRef = collection(db, salesCollectionName);

export const registerSale = async (sale: Sale) => {
  // Usamos un batch para asegurar que la venta y la reducción de stock ocurran al mismo tiempo
  const batch = writeBatch(db);

  // 1. Crear la referencia del nuevo documento de venta
  const newSaleRef = doc(salesRef);
  batch.set(newSaleRef, {
    ...sale,
    fechaVenta: serverTimestamp()
  });

  // 2. Actualizar el stock de cada producto vendido y registrar en Kardex
  const { increment } = await import('firebase/firestore');
  
  sale.articulos.forEach(item => {
    const productRef = doc(db, 'productos', item.productoId);
    batch.update(productRef, {
      stockActual: increment(-item.cantidad)
    });

    // Registrar movimiento en Kardex
    const kardexRef = doc(collection(db, 'kardex'));
    batch.set(kardexRef, {
      productoId: item.productoId,
      productoNombre: item.nombre,
      tipo: 'Salida',
      motivo: 'Venta',
      cantidad: -item.cantidad,
      fechaMovimiento: serverTimestamp(),
      referenciaId: newSaleRef.id,
      usuarioEmail: sale.vendedorId || 'Cajero' // TODO: add user 
    });
  });

  // Ejecutar todo
  await batch.commit();
  return newSaleRef.id;
};

export const getSales = async (): Promise<Sale[]> => {
  const { getDocs, query, orderBy } = await import('firebase/firestore');
  const q = query(salesRef, orderBy('fechaVenta', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Sale));
};
