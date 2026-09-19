import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { InventoryMovement, Product } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { registerManualAdjustment } from '../services/kardexService';
import { ClipboardList, AlertTriangle, ArrowUpRight, ArrowDownRight, PackageMinus, Search } from 'lucide-react';

export const Kardex = () => {
  const { products } = useData();
  const { currentUser } = useAuth();
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para el Modal de Ajuste/Merma
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [ajusteTipo, setAjusteTipo] = useState<'Merma/Vencido' | 'Ajuste Manual'>('Merma/Vencido');
  const [ajusteCantidad, setAjusteCantidad] = useState(1);
  const [ajusteOperacion, setAjusteOperacion] = useState<'Resta' | 'Suma'>('Resta');

  useEffect(() => {
    // Escuchar últimos 100 movimientos de kardex
    const q = query(collection(db, 'kardex'), orderBy('fechaMovimiento', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snapshot) => {
      setMovements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryMovement)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || ajusteCantidad <= 0) return;
    
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    if (ajusteOperacion === 'Resta' && ajusteCantidad > product.stockActual) {
      alert(`No puedes retirar más del stock actual (${product.stockActual})`);
      return;
    }

    const finalQuantity = ajusteOperacion === 'Resta' ? -ajusteCantidad : ajusteCantidad;
    
    try {
      await registerManualAdjustment(
        selectedProductId, 
        product.nombre, 
        finalQuantity, 
        ajusteTipo, 
        currentUser?.email || 'Admin'
      );
      alert('Ajuste de inventario registrado con éxito');
      setShowModal(false);
      setAjusteCantidad(1);
    } catch (error) {
      alert('Error registrando ajuste');
    }
  };

  const filteredMovements = movements.filter(m => 
    m.productoNombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.motivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <ClipboardList size={24} />
            </div>
            Kardex y Auditoría
          </h2>
          <p className="text-slate-500 text-sm mt-1">Historial de movimientos de stock y registro de mermas.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)} 
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-95"
        >
          <AlertTriangle size={20} /> Registrar Merma / Ajuste
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center">
          <Search size={18} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Buscar por nombre de producto o motivo (ej. Venta, Compra)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white sticky top-0 border-b border-slate-100 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-500">Fecha</th>
                <th className="px-6 py-4 font-semibold text-slate-500">Producto</th>
                <th className="px-6 py-4 font-semibold text-slate-500">Motivo</th>
                <th className="px-6 py-4 font-semibold text-slate-500">Operación</th>
                <th className="px-6 py-4 font-semibold text-slate-500">Cant.</th>
                <th className="px-6 py-4 font-semibold text-slate-500">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">Cargando movimientos...</td></tr>
              ) : filteredMovements.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No hay movimientos registrados.</td></tr>
              ) : (
                filteredMovements.map((mov) => {
                  const dateObj = mov.fechaMovimiento?.toDate ? mov.fechaMovimiento.toDate() : new Date();
                  const isEntrada = mov.tipo === 'Entrada';
                  
                  return (
                    <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {dateObj.toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">{mov.productoNombre}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          mov.motivo === 'Venta' ? 'bg-blue-100 text-blue-700' :
                          mov.motivo === 'Compra' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {mov.motivo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 font-bold ${isEntrada ? 'text-success' : 'text-danger'}`}>
                          {isEntrada ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}
                          {mov.tipo}
                        </div>
                      </td>
                      <td className={`px-6 py-4 font-black ${isEntrada ? 'text-success' : 'text-danger'}`}>
                        {mov.cantidad > 0 ? `+${mov.cantidad}` : mov.cantidad}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[150px]">
                        {mov.usuarioEmail || 'Sistema'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajuste Manual */}
      {showModal && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 text-orange-500 rounded-xl">
                <PackageMinus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Ajuste de Inventario</h2>
                <p className="text-slate-500 text-sm">Registrar mermas o corregir stock.</p>
              </div>
            </div>
            
            <form onSubmit={handleAdjustmentSubmit}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Producto</label>
                  <select 
                    required value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-medium"
                  >
                    <option value="">-- Seleccionar --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} (Stock actual: {p.stockActual})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Tipo Ajuste</label>
                    <select value={ajusteOperacion} onChange={(e) => setAjusteOperacion(e.target.value as 'Resta'|'Suma')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                      <option value="Resta">Disminuir (-)</option>
                      <option value="Suma">Aumentar (+)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Motivo</label>
                    <select value={ajusteTipo} onChange={(e) => setAjusteTipo(e.target.value as 'Merma/Vencido'|'Ajuste Manual')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                      <option value="Merma/Vencido">Merma / Roto</option>
                      <option value="Ajuste Manual">Ajuste de Error</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Cantidad</label>
                  <input 
                    type="number" min="1" required value={ajusteCantidad} onChange={(e) => setAjusteCantidad(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all">Aplicar Ajuste</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
