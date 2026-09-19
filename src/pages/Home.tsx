import { useData } from '../contexts/DataContext';
import { Package, TrendingUp, AlertTriangle, Users, DollarSign, Activity, FileText, XCircle, Undo2, ArrowUpRight } from 'lucide-react';

export const Home = () => {
  const { products, sales, purchases, suppliers, loadingProducts, loadingSales } = useData();

  const lowStockProducts = products.filter(p => p.stockActual <= p.stockMinimo);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysSales = sales.filter(s => {
    if (!s.fecha) return false;
    const d = s.fecha.toDate ? s.fecha.toDate() : new Date(s.fecha);
    return d >= today;
  });

  const totalRevenue = todaysSales.reduce((sum, s) => sum + s.total, 0);
  const totalSalesCount = todaysSales.length;
  // Cost estimates for sales (simplified)
  const totalCost = totalRevenue * 0.7; 
  const totalProfit = totalRevenue - totalCost;

  const todaysPurchases = purchases.filter(p => {
    if (!p.fechaCompra) return false;
    const d = p.fechaCompra.toDate ? p.fechaCompra.toDate() : new Date(p.fechaCompra);
    return d >= today;
  });

  const totalPurchaseCost = todaysPurchases.reduce((sum, p) => sum + p.total, 0);
  const purchaseCount = todaysPurchases.length;

  const totalQuantityInHand = products.reduce((sum, p) => sum + p.stockActual, 0);
  const uniqueCategories = new Set(products.map(p => p.categoria)).size;

  // Calcular productos más vendidos (Top Selling)
  const productSalesMap = new Map<string, number>();
  sales.forEach(sale => {
    sale.items.forEach(item => {
      productSalesMap.set(item.productId, (productSalesMap.get(item.productId) || 0) + item.cantidad);
    });
  });

  const topSelling = [...products]
    .map(p => ({ ...p, soldQuantity: productSalesMap.get(p.id!) || 0 }))
    .sort((a, b) => b.soldQuantity - a.soldQuantity)
    .slice(0, 4);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-8">
      
      {/* 4 Cards Grid - Layout KANBAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Sales Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Sales Overview</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <div className="text-blue-500 mb-2"><TrendingUp size={24} /></div>
              <span className="text-lg font-bold text-slate-700">{totalSalesCount}</span>
              <span className="text-xs text-slate-400 font-medium mt-1">Sales</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-100">
              <div className="text-indigo-500 mb-2"><DollarSign size={24} /></div>
              <span className="text-lg font-bold text-slate-700">S/ {totalRevenue.toFixed(0)}</span>
              <span className="text-xs text-slate-400 font-medium mt-1">Revenue</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-100">
              <div className="text-orange-400 mb-2"><Activity size={24} /></div>
              <span className="text-lg font-bold text-slate-700">S/ {totalProfit.toFixed(0)}</span>
              <span className="text-xs text-slate-400 font-medium mt-1">Profit</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-100">
              <div className="text-green-500 mb-2"><FileText size={24} /></div>
              <span className="text-lg font-bold text-slate-700">S/ {totalCost.toFixed(0)}</span>
              <span className="text-xs text-slate-400 font-medium mt-1">Cost</span>
            </div>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Inventory Summary</h3>
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="flex flex-col items-center justify-center">
              <div className="text-orange-400 mb-2"><Package size={28} /></div>
              <span className="text-xl font-bold text-slate-700">{totalQuantityInHand}</span>
              <span className="text-xs text-slate-400 font-medium mt-1">Quantity in Hand</span>
            </div>
            <div className="flex flex-col items-center justify-center border-l border-slate-100">
              <div className="text-purple-500 mb-2"><Truck size={28} /></div>
              <span className="text-xl font-bold text-slate-700">0</span>
              <span className="text-xs text-slate-400 font-medium mt-1">To be received</span>
            </div>
          </div>
        </div>

        {/* Purchase Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Purchase Overview</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <div className="text-blue-400 mb-2"><Package size={24} /></div>
              <span className="text-lg font-bold text-slate-700">{purchaseCount}</span>
              <span className="text-xs text-slate-400 font-medium mt-1">Purchase</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-100">
              <div className="text-green-500 mb-2"><DollarSign size={24} /></div>
              <span className="text-lg font-bold text-slate-700">S/ {totalPurchaseCost.toFixed(0)}</span>
              <span className="text-xs text-slate-400 font-medium mt-1">Cost</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-100">
              <div className="text-indigo-400 mb-2"><XCircle size={24} /></div>
              <span className="text-lg font-bold text-slate-700">0</span>
              <span className="text-xs text-slate-400 font-medium mt-1">Cancel</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-100">
              <div className="text-orange-400 mb-2"><Undo2 size={24} /></div>
              <span className="text-lg font-bold text-slate-700">S/ 0</span>
              <span className="text-xs text-slate-400 font-medium mt-1">Return</span>
            </div>
          </div>
        </div>

        {/* Product Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Product Summary</h3>
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="flex flex-col items-center justify-center">
              <div className="text-blue-500 mb-2"><Users size={28} /></div>
              <span className="text-xl font-bold text-slate-700">{suppliers.length}</span>
              <span className="text-xs text-slate-400 font-medium mt-1">Number of Suppliers</span>
            </div>
            <div className="flex flex-col items-center justify-center border-l border-slate-100">
              <div className="text-indigo-400 mb-2"><Package size={28} /></div>
              <span className="text-xl font-bold text-slate-700">{uniqueCategories}</span>
              <span className="text-xs text-slate-400 font-medium mt-1">Number of Categories</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Top Selling Stock (Table) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Top Selling Stock</h3>
            <span className="text-primary text-sm font-semibold cursor-pointer hover:underline">See All</span>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-sm">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Sold Quantity</th>
                  <th className="pb-3 font-medium">Remaining Quantity</th>
                  <th className="pb-3 font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {topSelling.map((p, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-4 text-sm font-semibold text-slate-700">{p.nombre}</td>
                    <td className="py-4 text-sm text-slate-600">{p.soldQuantity}</td>
                    <td className="py-4 text-sm text-slate-600">{p.stockActual}</td>
                    <td className="py-4 text-sm font-semibold text-slate-700">S/ {p.precioVenta.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Quantity Stock */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Low Quantity Stock</h3>
            <span className="text-primary text-sm font-semibold cursor-pointer hover:underline">See All</span>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            {lowStockProducts.slice(0, 4).map((p, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Package className="text-slate-400" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm">{p.nombre}</h4>
                  <p className="text-xs text-slate-500 mt-1">Remaining Quantity : {p.stockActual}</p>
                </div>
                <div>
                  <span className="px-2.5 py-1 bg-danger/10 text-danger rounded-full text-xs font-bold flex items-center gap-1">
                    <AlertTriangle size={12} /> Low
                  </span>
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="text-center py-8 text-slate-400">All stocks are sufficient.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
