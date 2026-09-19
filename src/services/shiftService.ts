import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CashShift } from '../types';

export const openShift = async (cajeroEmail: string, montoApertura: number) => {
  const newShift: CashShift = {
    cajeroEmail,
    montoApertura,
    fechaApertura: serverTimestamp(),
    estado: 'Abierto',
  };
  
  const docRef = await addDoc(collection(db, 'turnos'), newShift);
  return docRef.id;
};

export const closeShift = async (shiftId: string, montoCierreDeclarado: number, ventasTotalesEfectivo: number, gastosTotalesEfectivo: number = 0) => {
  const shiftRef = doc(db, 'turnos', shiftId);
  await updateDoc(shiftRef, {
    estado: 'Cerrado',
    fechaCierre: serverTimestamp(),
    montoCierreDeclarado,
    ventasTotalesEfectivo,
    gastosTotalesEfectivo,
    montoCierreSistema: ventasTotalesEfectivo - gastosTotalesEfectivo // No sumamos montoApertura al sistema aquí para facilidad de cuadre
  });
};
