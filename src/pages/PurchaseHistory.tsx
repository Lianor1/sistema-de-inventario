import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { PackagePlus, XCircle, FileText, Search } from 'lucide-react';

export const PurchaseHistory = () => {
  const { purchases, loadingPurchases } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null);

  const filteredPurchases = purchases.filter(p => 
    p.proveedorNombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id?.includes(searchTerm)
  );

  const handleVoidPurchase = async (purchaseId: string) => {
    if (!window.confirm('¿ADVERTENCIA: Estás seguro de ANULAR este ingreso? Esto restará el stock de los productos ingresados.')) return;
    
    try {
      const { voidPurchase } = await import('../services/purchaseService');
      await voidPurchase(purchaseId);
      alert('Ingreso anulado correctamente. El stock ha sido revertido.');
      setSelectedPurchase(null);
    } catch (e) {
      alert('Error al anular ingreso.');
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      
      {/* Lista de Compras */}
      <div className="flex-[2] bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <PackagePlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Historial de Ingresos</h2>
            <p className="text-xs text-slate-500">Listado de órdenes de compra pasadas</p>
          </div>
        </div>

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por proveedor o ID de orden..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Proveedor</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingPurchases ? (
                <tr><td colSpan={5} className="text-center py-8">Cargando...</td></tr>
              ) : filteredPurchases.map(p => (
                <tr 
                  key={p.id} 
                  onClick={() => setSelectedPurchase(p)}
                  className={`hover:bg-slate-50 cursor-pointer ${selectedPurchase?.id === p.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 py-3 text-xs font-mono text-slate-400">{p.id.slice(0, 6)}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{p.fechaCompra?.toDate ? p.fechaCompra.toDate().toLocaleString() : ''}</td>
                  <td className="px-4 py-3 font-semibold text-sm text-slate-700">{p.proveedorNombre}</td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-600">S/ {p.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-1 rounded font-bold ${p.estado === 'Anulado' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                      {p.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredPurchases.length === 0 && !loadingPurchases && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">No hay compras registradas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalle de la Orden */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col">
        {selectedPurchase ? (
          <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4"><FileText size={20} className="text-slate-400" /> Detalle de Orden</h3>
            
            <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
              <div className="text-sm font-semibold text-slate-700 mb-1">Proveedor: {selectedPurchase.proveedorNombre}</div>
              <div className="text-xs text-slate-500 mb-1">ID: {selectedPurchase.id}</div>
              <div className="text-xs text-slate-500 mb-3">Fecha: {selectedPurchase.fechaCompra?.toDate?.().toLocaleString()}</div>
              
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-600">Total Pagado:</span>
                <span className="text-xl font-black text-blue-600">S/ {selectedPurchase.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 border border-slate-100 rounded-xl p-2 bg-slate-50">
              <div className="text-xs font-bold text-slate-400 uppercase mb-2 px-2">Artículos Ingresados</div>
              {selectedPurchase.articulos?.map((item: any) => (
                <div key={item.productoId} className="bg-white p-3 rounded-lg border border-slate-100 mb-2 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm text-slate-700">{item.nombre}</div>
                    <div className="text-xs text-slate-500">{item.cantidad} x S/ {item.costoUnitario.toFixed(2)}</div>
                  </div>
                  <div className="font-bold text-slate-800">S/ {item.subtotal.toFixed(2)}</div>
                </div>
              ))}
            </div>

            {selectedPurchase.estado !== 'Anulado' && (
              <button 
                onClick={() => handleVoidPurchase(selectedPurchase.id)}
                className="w-full py-3 bg-danger/10 hover:bg-danger text-danger hover:text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-colors"
              >
                <XCircle size={20} /> Anular Ingreso (Revertir Stock)
              </button>
            )}
            {selectedPurchase.estado === 'Anulado' && (
              <div className="w-full py-3 bg-danger text-white font-bold rounded-xl text-center">
                ESTA ORDEN FUE ANULADA
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <FileText size={48} className="mb-4 text-slate-200" />
            <p>Selecciona una orden de compra de la lista para ver sus detalles y artículos.</p>
          </div>
        )}
      </div>

    </div>
  );
};
