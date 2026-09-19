import { useState, useEffect } from 'react';
import type { Product, Shrinkage as ShrinkageType } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { registerShrinkage, subscribeToShrinkages } from '../services/shrinkageService';
import { AlertTriangle, Search, Trash2 } from 'lucide-react';

export const Shrinkage = () => {
  const { products } = useData();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [shrinkages, setShrinkages] = useState<ShrinkageType[]>([]);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState<'Vencido' | 'Dañado/Roto' | 'Robo' | 'Otro'>('Vencido');

  useEffect(() => {
    const unsub = subscribeToShrinkages(setShrinkages);
    return () => unsub();
  }, []);

  const filteredProducts = products.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.codigoBarras.includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return alert('Selecciona un producto');
    if (cantidad <= 0 || cantidad > selectedProduct.stockActual) {
      return alert('Cantidad inválida o superior al stock actual');
    }

    try {
      await registerShrinkage({
        productoId: selectedProduct.id!,
        productoNombre: selectedProduct.nombre,
        cantidad,
        motivo,
        costoPerdido: cantidad * selectedProduct.costoCompra,
        registradoPor: currentUser?.email || 'Desconocido',
        fecha: new Date()
      });
      alert('Merma registrada exitosamente');
      setSelectedProduct(null);
      setCantidad(1);
      setSearchTerm('');
    } catch (e) {
      alert('Error al registrar la merma');
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      
      {/* Formulario de Registro */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-danger/10 text-danger rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Registrar Merma</h2>
            <p className="text-xs text-slate-500">Productos vencidos, rotos o perdidos</p>
          </div>
        </div>

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar producto a dar de baja..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-danger"
          />
        </div>

        {searchTerm && !selectedProduct && (
          <div className="max-h-40 overflow-y-auto mb-4 border border-slate-100 rounded-xl">
            {filteredProducts.map(p => (
              <div 
                key={p.id} 
                onClick={() => { setSelectedProduct(p); setSearchTerm(''); }}
                className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 flex justify-between"
              >
                <span className="font-semibold text-sm">{p.nombre}</span>
                <span className="text-xs text-slate-500">Stock: {p.stockActual}</span>
              </div>
            ))}
          </div>
        )}

        {selectedProduct && (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800">{selectedProduct.nombre}</span>
              <button type="button" onClick={() => setSelectedProduct(null)} className="text-danger hover:underline text-xs font-bold">Cambiar</button>
            </div>
            
            <div className="flex justify-between text-sm text-slate-600 px-1">
              <span>Stock Actual: <b>{selectedProduct.stockActual}</b></span>
              <span>Costo Unit: <b>S/ {selectedProduct.costoCompra.toFixed(2)}</b></span>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Cantidad a dar de baja</label>
              <input type="number" required min="1" max={selectedProduct.stockActual} value={cantidad} onChange={e => setCantidad(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg outline-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Motivo</label>
              <select value={motivo} onChange={e => setMotivo(e.target.value as any)} className="w-full p-2 border border-slate-200 rounded-lg outline-none">
                <option value="Vencido">Vencido / Caducado</option>
                <option value="Dañado/Roto">Dañado / Roto</option>
                <option value="Robo">Robo / Pérdida</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="mt-auto pt-4">
              <div className="flex justify-between text-danger font-bold mb-4">
                <span>Pérdida Monetaria:</span>
                <span>S/ {(cantidad * selectedProduct.costoCompra).toFixed(2)}</span>
              </div>
              <button type="submit" className="w-full py-3 bg-danger hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-danger/30">
                Registrar Pérdida
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Historial */}
      <div className="flex-[2] bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Historial de Mermas</h3>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Producto</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Cant.</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Motivo</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Pérdida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shrinkages.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs text-slate-500">{s.fecha?.toDate ? s.fecha.toDate().toLocaleDateString() : '...'}</td>
                  <td className="px-4 py-3 font-semibold text-sm text-slate-700">{s.productoNombre}</td>
                  <td className="px-4 py-3 text-sm font-bold text-danger">-{s.cantidad}</td>
                  <td className="px-4 py-3 text-xs"><span className="bg-slate-200 px-2 py-1 rounded text-slate-700">{s.motivo}</span></td>
                  <td className="px-4 py-3 text-sm font-bold text-danger">S/ {s.costoPerdido.toFixed(2)}</td>
                </tr>
              ))}
              {shrinkages.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">No hay mermas registradas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
