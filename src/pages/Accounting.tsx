import { useData } from '../contexts/DataContext';
import { TrendingUp, Package, DollarSign, Activity, Calendar, ArrowRight, Receipt } from 'lucide-react';

export const Accounting = () => {
  const { sales, products, loadingSales, loadingProducts } = useData();
  const loading = loadingSales || loadingProducts;

  const ingresosTotales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const valorInventario = products.reduce((sum, p) => sum + (p.costoCompra * p.stockActual), 0);
  const valorVentaEsperado = products.reduce((sum, p) => sum + (p.precioVenta * p.stockActual), 0);
  const utilidadEsperada = valorVentaEsperado - valorInventario;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Reciente';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Activity size={24} />
          </div>
          Inteligencia Financiera
        </h2>
        <p className="text-slate-500 text-sm mt-1">Reportes contables, valorización de inventario y registro de transacciones.</p>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center text-slate-400">
          Analizando finanzas...
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
          
          {/* Tarjetas de Resumen (KPIs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-sm font-semibold text-slate-500">Ingresos Brutos</h3>
                <div className="p-2 bg-success/10 rounded-lg text-success"><TrendingUp size={20} /></div>
              </div>
              <p className="text-3xl font-extrabold text-slate-800 relative z-10">S/ {ingresosTotales.toFixed(2)}</p>
              <div className="mt-4 text-xs font-medium text-success flex items-center gap-1 relative z-10">
                <ArrowRight size={12} className="-rotate-45" /> Total facturado
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-danger/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-sm font-semibold text-slate-500">Costo de Inventario</h3>
                <div className="p-2 bg-danger/10 rounded-lg text-danger"><Package size={20} /></div>
              </div>
              <p className="text-3xl font-extrabold text-slate-800 relative z-10">S/ {valorInventario.toFixed(2)}</p>
              <div className="mt-4 text-xs font-medium text-slate-400 relative z-10">
                Capital invertido en almacén
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-sm font-semibold text-slate-500">Utilidad Bruta Proyectada</h3>
                <div className="p-2 bg-warning/10 rounded-lg text-warning"><DollarSign size={20} /></div>
              </div>
              <p className="text-3xl font-extrabold text-slate-800 relative z-10">S/ {utilidadEsperada.toFixed(2)}</p>
              <div className="mt-4 text-xs font-medium text-slate-400 relative z-10">
                Si se vende el 100% del stock
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-sm font-semibold text-slate-500">Operaciones (Tickets)</h3>
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Receipt size={20} /></div>
              </div>
              <p className="text-3xl font-extrabold text-slate-800 relative z-10">{sales.length}</p>
              <div className="mt-4 text-xs font-medium text-slate-400 relative z-10">
                Ventas procesadas exitosamente
              </div>
            </div>

          </div>

          {/* Historial de Ventas */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Libro Diario de Transacciones</h3>
              <button className="text-sm font-semibold text-primary hover:text-blue-700 transition-colors">Exportar a Excel</button>
            </div>
            
            {sales.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Receipt size={48} className="mx-auto mb-4 opacity-50" />
                <p>El libro diario está vacío. Registra ventas para verlas aquí.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha / Hora</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Detalle de Compra</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Método de Pago</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Monto Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <Calendar size={14} className="text-slate-400" />
                            {formatDate(sale.fechaVenta)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-700">
                            {sale.articulos.map(art => (
                              <div key={art.productoId} className="mb-0.5 last:mb-0">
                                <span className="font-semibold">{art.cantidad}x</span> {art.nombre}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                            sale.metodoPago === 'Efectivo' ? 'bg-emerald-100 text-emerald-700' : 
                            sale.metodoPago === 'Tarjeta' ? 'bg-blue-100 text-blue-700' : 
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {sale.metodoPago}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-lg font-bold text-slate-800">
                            S/ {sale.total.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
