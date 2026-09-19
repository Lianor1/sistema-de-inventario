import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';

export const Reports = () => {
  const { sales, products, purchases } = useData();

  const metrics = useMemo(() => {
    let netSalesValue = 0;
    let netPurchaseValue = 0;
    let totalCogs = 0;
    
    // Calculate net sales and COGS
    sales.forEach(sale => {
      netSalesValue += sale.total;
      sale.articulos?.forEach(item => {
        const product = products.find(p => p.id === item.productoId);
        if (product) {
          totalCogs += (product.costoCompra * item.cantidad);
        }
      });
    });

    // Calculate net purchases
    purchases.forEach(purchase => {
      netPurchaseValue += purchase.total;
    });

    const totalProfit = netSalesValue - totalCogs;

    // Categories
    const categoryMap = new Map<string, { turnover: number }>();
    // Products
    const productSalesMap = new Map<string, { name: string, category: string, remaining: number, turnover: number }>();

    sales.forEach(sale => {
      sale.articulos?.forEach(item => {
        const product = products.find(p => p.id === item.productoId);
        if (product) {
          // Category aggregate
          const cat = product.categoria || 'Sin categoría';
          const catData = categoryMap.get(cat) || { turnover: 0 };
          catData.turnover += item.subtotal;
          categoryMap.set(cat, catData);

          // Product aggregate
          const prodData = productSalesMap.get(product.id!) || { 
            name: product.nombre, 
            category: cat, 
            remaining: product.stockActual, 
            turnover: 0 
          };
          prodData.turnover += item.subtotal;
          productSalesMap.set(product.id!, prodData);
        }
      });
    });

    const bestSellingCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, turnover: data.turnover, increase: '+0%', isPositive: true }))
      .sort((a, b) => b.turnover - a.turnover)
      .slice(0, 3);

    const bestSellingProducts = Array.from(productSalesMap.entries())
      .map(([id, data]) => ({ id, ...data, increase: '+0%', isPositive: true }))
      .sort((a, b) => b.turnover - a.turnover)
      .slice(0, 4);

    // Chart Data (Last 7 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const last7Months: { label: string, revenue: number, profit: number, cogs: number, monthId: string }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last7Months.push({
        label: monthNames[d.getMonth()],
        monthId: `${d.getFullYear()}-${d.getMonth()}`,
        revenue: 0,
        profit: 0,
        cogs: 0
      });
    }

    sales.forEach(sale => {
      if (!sale.fechaVenta) return;
      const d = sale.fechaVenta.toDate ? sale.fechaVenta.toDate() : new Date(sale.fechaVenta);
      const mId = `${d.getFullYear()}-${d.getMonth()}`;
      
      const monthData = last7Months.find(m => m.monthId === mId);
      if (monthData) {
        monthData.revenue += sale.total;
        
        let cogs = 0;
        sale.articulos?.forEach(item => {
          const product = products.find(p => p.id === item.productoId);
          if (product) cogs += (product.costoCompra * item.cantidad);
        });
        monthData.cogs += cogs;
        monthData.profit = monthData.revenue - monthData.cogs;
      }
    });

    return {
      netSalesValue,
      netPurchaseValue,
      totalProfit,
      totalSalesCount: sales.length,
      bestSellingCategories,
      bestSellingProducts,
      chartData: last7Months
    };
  }, [sales, products, purchases]);

  // Generate SVG Path for Chart
  const getPath = (data: number[], maxVal: number, width: number, height: number) => {
    if (data.length === 0 || maxVal === 0) return '';
    const dx = width / Math.max(1, data.length - 1);
    // Add padding top and bottom (10%)
    const paddedHeight = height * 0.8; 
    const scaleY = (val: number) => height - (height * 0.1) - (val / maxVal) * paddedHeight;

    let path = `M 0 ${scaleY(data[0])}`;
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = i * dx;
      const y1 = scaleY(data[i]);
      const x2 = (i + 1) * dx;
      const y2 = scaleY(data[i + 1]);
      const mx = (x1 + x2) / 2;
      path += ` C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
    }
    return path;
  };

  const chartMax = Math.max(100, ...metrics.chartData.map(m => Math.max(m.revenue, m.profit)));
  const revenuePoints = metrics.chartData.map(m => m.revenue);
  const profitPoints = metrics.chartData.map(m => m.profit);

  const formatCurrency = (val: number) => `S/ ${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-8 space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overview Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Overview</h3>
          
          <div className="grid grid-cols-3 gap-6 mb-8 border-b border-slate-100 pb-8">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-700">{formatCurrency(metrics.totalProfit)}</span>
              <span className="text-sm font-medium text-slate-400 mt-1">Total Profit</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-700">{formatCurrency(metrics.netSalesValue)}</span>
              <span className="text-sm font-medium text-orange-400 mt-1">Revenue</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-700">{metrics.totalSalesCount}</span>
              <span className="text-sm font-medium text-purple-500 mt-1">Sales</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-700">{formatCurrency(metrics.netPurchaseValue)}</span>
              <span className="text-sm font-medium text-slate-400 mt-1">Net purchase value</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-700">{formatCurrency(metrics.netSalesValue)}</span>
              <span className="text-sm font-medium text-slate-400 mt-1">Net sales value</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-700">S/ 0</span>
              <span className="text-sm font-medium text-slate-400 mt-1">MoM Profit</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-700">{formatCurrency(metrics.totalProfit)}</span>
              <span className="text-sm font-medium text-slate-400 mt-1">YoY Profit</span>
            </div>
          </div>
        </div>

        {/* Best selling category */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Best selling category</h3>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">See All</button>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-slate-400 font-medium">
                <th className="pb-4 font-medium">Category</th>
                <th className="pb-4 font-medium">Turn Over</th>
                <th className="pb-4 font-medium">Increase By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.bestSellingCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-sm text-slate-400 text-center">No data available</td>
                </tr>
              ) : metrics.bestSellingCategories.map((cat, i) => (
                <tr key={i}>
                  <td className="py-4 text-sm font-medium text-slate-700">{cat.category}</td>
                  <td className="py-4 text-sm font-semibold text-slate-700">{formatCurrency(cat.turnover)}</td>
                  <td className={`py-4 text-sm font-bold ${cat.isPositive ? 'text-success' : 'text-danger'}`}>
                    {cat.increase}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profit & Revenue Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-bold text-slate-800">Profit & Revenue</h3>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 flex items-center gap-2 hover:bg-slate-50">
            📅 Monthly
          </button>
        </div>

        <div className="w-full h-80 relative">
          {/* Y Axis Labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs font-medium text-slate-400 pb-8 z-10">
            <span>{formatCurrency(chartMax)}</span>
            <span>{formatCurrency(chartMax * 0.75)}</span>
            <span>{formatCurrency(chartMax * 0.5)}</span>
            <span>{formatCurrency(chartMax * 0.25)}</span>
            <span>S/ 0</span>
          </div>
          
          <div className="ml-20 h-full relative">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-8">
              <div className="w-full border-t border-slate-100/50"></div>
              <div className="w-full border-t border-slate-100/50"></div>
              <div className="w-full border-t border-slate-100/50"></div>
              <div className="w-full border-t border-slate-100/50"></div>
              <div className="w-full border-t border-slate-100"></div>
            </div>

            {/* SVG Chart */}
            <svg className="absolute inset-0 w-full h-[calc(100%-2rem)] overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 300">
              {/* Profit Line (Orange) */}
              <path 
                d={getPath(profitPoints, chartMax, 1000, 300)}
                fill="none" 
                stroke="#fed7aa" 
                strokeWidth="3" 
              />
              
              {/* Revenue Line (Blue) */}
              <path 
                d={getPath(revenuePoints, chartMax, 1000, 300)}
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="3" 
              />
            </svg>

            {/* X Axis Labels */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs font-medium text-slate-400">
              {metrics.chartData.map((m, i) => (
                <span key={i}>{m.label}</span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm font-semibold text-slate-500">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-300"></div>
            <span className="text-sm font-semibold text-slate-500">Profit</span>
          </div>
        </div>
      </div>

      {/* Best selling product Table */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Best selling product</h3>
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">See All</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-sm font-medium text-slate-400">Product</th>
                <th className="pb-4 text-sm font-medium text-slate-400">Product ID</th>
                <th className="pb-4 text-sm font-medium text-slate-400">Category</th>
                <th className="pb-4 text-sm font-medium text-slate-400">Remaining Quantity</th>
                <th className="pb-4 text-sm font-medium text-slate-400">Turn Over</th>
                <th className="pb-4 text-sm font-medium text-slate-400">Increase By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.bestSellingProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No data available</td>
                </tr>
              ) : metrics.bestSellingProducts.map((product, i) => (
                <tr key={i}>
                  <td className="py-4 text-sm font-semibold text-slate-700">{product.name}</td>
                  <td className="py-4 text-sm text-slate-600">{product.id?.slice(0,6) || '-'}</td>
                  <td className="py-4 text-sm text-slate-600">{product.category}</td>
                  <td className="py-4 text-sm text-slate-600">{product.remaining}</td>
                  <td className="py-4 text-sm font-semibold text-slate-700">{formatCurrency(product.turnover)}</td>
                  <td className={`py-4 text-sm font-bold ${product.isPositive ? 'text-success' : 'text-danger'}`}>
                    {product.increase}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
