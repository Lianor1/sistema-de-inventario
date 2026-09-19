import { useData } from '../contexts/DataContext';

export const Reports = () => {
  const { sales, products } = useData();

  // Simple static data mimicking the image for visual fidelity
  // In a real scenario we would calculate this from context
  const bestSellingCategories = [
    { category: 'Vegetable', turnover: 'S/ 26,000', increase: '3.2%', isPositive: true },
    { category: 'Instant Food', turnover: 'S/ 22,000', increase: '2%', isPositive: true },
    { category: 'Households', turnover: 'S/ 22,000', increase: '1.5%', isPositive: true },
  ];

  const bestSellingProducts = [
    { name: 'Tomato', id: '23567', category: 'Vegetable', remaining: '225 kg', turnover: 'S/ 17,000', increase: '2.3%', isPositive: true },
    { name: 'Onion', id: '25831', category: 'Vegetable', remaining: '200 kg', turnover: 'S/ 12,000', increase: '1.3%', isPositive: true },
    { name: 'Maggi', id: '56841', category: 'Instant Food', remaining: '200 Packet', turnover: 'S/ 10,000', increase: '1.3%', isPositive: true },
    { name: 'Surf Excel', id: '23567', category: 'Household', remaining: '125 Packet', turnover: 'S/ 9,000', increase: '1%', isPositive: true },
  ];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-8 space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overview Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Overview</h3>
          
          <div className="grid grid-cols-3 gap-6 mb-8 border-b border-slate-100 pb-8">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-700">S/ 21,190</span>
              <span className="text-sm font-medium text-slate-400 mt-1">Total Profit</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-700">S/ 18,300</span>
              <span className="text-sm font-medium text-orange-400 mt-1">Revenue</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-700">S/ 17,432</span>
              <span className="text-sm font-medium text-purple-500 mt-1">Sales</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-700">S/ 1,17,432</span>
              <span className="text-sm font-medium text-slate-400 mt-1">Net purchase value</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-700">S/ 80,432</span>
              <span className="text-sm font-medium text-slate-400 mt-1">Net sales value</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-700">S/ 30,432</span>
              <span className="text-sm font-medium text-slate-400 mt-1">MoM Profit</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-700">S/ 1,10,432</span>
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
              {bestSellingCategories.map((cat, i) => (
                <tr key={i}>
                  <td className="py-4 text-sm font-medium text-slate-700">{cat.category}</td>
                  <td className="py-4 text-sm font-semibold text-slate-700">{cat.turnover}</td>
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
            📅 Weekly
          </button>
        </div>

        {/* Pure SVG Line Chart matching the design exactly */}
        <div className="w-full h-80 relative">
          {/* Y Axis Labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs font-medium text-slate-400 pb-8 z-10">
            <span>80,000</span>
            <span>60,000</span>
            <span>40,000</span>
            <span>20,000</span>
          </div>
          
          <div className="ml-16 h-full relative">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-8">
              <div className="w-full border-t border-slate-100/50"></div>
              <div className="w-full border-t border-slate-100/50"></div>
              <div className="w-full border-t border-slate-100/50"></div>
              <div className="w-full border-t border-slate-100"></div>
            </div>

            {/* SVG Chart */}
            <svg className="absolute inset-0 w-full h-[calc(100%-2rem)] overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 300">
              {/* Profit Line (Orange) */}
              <path 
                d="M 0 200 C 100 190, 150 250, 250 250 C 350 250, 400 150, 500 130 C 600 110, 650 180, 750 170 C 850 160, 900 100, 1000 140" 
                fill="none" 
                stroke="#fed7aa" 
                strokeWidth="3" 
              />
              
              {/* Revenue Line (Blue) */}
              <path 
                d="M 0 250 C 100 230, 150 180, 250 190 C 350 200, 400 240, 500 140 C 600 40, 650 150, 750 110 C 850 70, 900 220, 1000 210" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="3" 
              />

              {/* Tooltip Point & Line */}
              <g transform="translate(500, 140)">
                <line x1="0" y1="0" x2="0" y2="160" stroke="#bfdbfe" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="0" cy="0" r="6" fill="#3b82f6" stroke="white" strokeWidth="3" />
                <rect x="-60" y="-80" width="120" height="60" rx="8" fill="white" className="drop-shadow-lg" />
                <text x="-45" y="-55" fontSize="12" fill="#94a3b8" fontWeight="600">This Month</text>
                <text x="-45" y="-35" fontSize="16" fill="#1e293b" fontWeight="bold">220,342,123</text>
                <text x="-45" y="-20" fontSize="11" fill="#94a3b8" fontWeight="600">Nov</text>
              </g>
            </svg>

            {/* X Axis Labels */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs font-medium text-slate-400">
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
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
              {bestSellingProducts.map((product, i) => (
                <tr key={i}>
                  <td className="py-4 text-sm font-semibold text-slate-700">{product.name}</td>
                  <td className="py-4 text-sm text-slate-600">{product.id}</td>
                  <td className="py-4 text-sm text-slate-600">{product.category}</td>
                  <td className="py-4 text-sm text-slate-600">{product.remaining}</td>
                  <td className="py-4 text-sm font-semibold text-slate-700">{product.turnover}</td>
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
