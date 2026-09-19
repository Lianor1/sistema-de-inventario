import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CashShift } from '../types';
import { Lock, Unlock, Search, Calendar, DollarSign, AlertCircle } from 'lucide-react';

export const CashAudits = () => {
  const [shifts, setShifts] = useState<CashShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Escuchar últimos turnos
    const q = query(collection(db, 'turnos'), orderBy('fechaApertura', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      setShifts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CashShift)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredShifts = shifts.filter(s => 
    s.cajeroEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <DollarSign size={24} />
            </div>
            Auditoría de Cajas (Turnos)
          </h2>
          <p className="text-slate-500 text-sm mt-1">Historial de aperturas, cierres y descuadres de cajeros.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center">
          <Search size={18} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Buscar por correo del cajero..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white sticky top-0 border-b border-slate-100 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-500">Fecha / Hora</th>
                <th className="px-6 py-4 font-semibold text-slate-500">Cajero</th>
                <th className="px-6 py-4 font-semibold text-slate-500 text-center">Estado</th>
                <th className="px-6 py-4 font-semibold text-slate-500 text-right">M. Inicial</th>
                <th className="px-6 py-4 font-semibold text-slate-500 text-right">Vendido (Efectivo)</th>
                <th className="px-6 py-4 font-semibold text-slate-500 text-right">Declarado</th>
                <th className="px-6 py-4 font-semibold text-slate-500 text-right">Descuadre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Cargando turnos...</td></tr>
              ) : filteredShifts.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No hay historial de cajas.</td></tr>
              ) : (
                filteredShifts.map((shift) => {
                  const apertura = shift.fechaApertura?.toDate ? shift.fechaApertura.toDate() : new Date();
                  const cierre = shift.fechaCierre?.toDate ? shift.fechaCierre.toDate() : null;
                  
                  const isAbierto = shift.estado === 'Abierto';
                  
                  const esperado = shift.montoApertura + (shift.ventasTotalesEfectivo || 0);
                  const diferencia = isAbierto ? 0 : ((shift.montoCierreDeclarado || 0) - esperado);
                  
                  const hasDescuadre = diferencia !== 0 && !isAbierto;

                  return (
                    <tr key={shift.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-slate-700 font-bold flex items-center gap-1"><Unlock size={14} className="text-success" /> {apertura.toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          {cierre && (
                            <span className="text-slate-400 text-xs flex items-center gap-1 mt-1"><Lock size={12} /> {cierre.toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{shift.cajeroEmail}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                          isAbierto ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {shift.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">
                        S/ {shift.montoApertura.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">
                        {isAbierto ? '-' : `S/ ${(shift.ventasTotalesEfectivo || 0).toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                        {isAbierto ? '-' : `S/ ${(shift.montoCierreDeclarado || 0).toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isAbierto ? (
                          <span className="text-slate-300">-</span>
                        ) : (
                          <div className={`font-black flex items-center justify-end gap-1 ${
                            diferencia === 0 ? 'text-success' : diferencia < 0 ? 'text-danger' : 'text-orange-500'
                          }`}>
                            {hasDescuadre && <AlertCircle size={14} />}
                            {diferencia > 0 ? '+' : ''}{diferencia.toFixed(2)}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
