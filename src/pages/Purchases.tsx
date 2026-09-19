import { useState, useMemo } from 'react';
import type { Purchase } from '../types';
import { useData } from '../contexts/DataContext';
import { Filter } from 'lucide-react';
import { registerPurchase } from '../services/purchaseService';

export const Purchases = () => {
  const { purchases } = useData();
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    productName: '',
    productId: '',
    category: '',
    orderValue: '',
    quantity: '',
    unit: '',
    buyingPrice: '',
    dateOfDelivery: '',
    notify: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerPurchase({
        proveedorId: 'N/A',
        proveedorNombre: 'N/A',
        total: Number(formData.orderValue) || 0,
        articulos: [{
          productoId: formData.productId || 'UNKNOWN',
          nombre: formData.productName,
          costoUnitario: Number(formData.buyingPrice) || 0,
          cantidad: Number(formData.quantity) || 1,
          subtotal: Number(formData.orderValue) || 0
        }],
        estado: 'Pendiente' as const
      });
      setShowModal(false);
      setFormData({
        productName: '', productId: '', category: '', orderValue: '', 
        quantity: '', unit: '', buyingPrice: '', dateOfDelivery: '', notify: false
      });
    } catch (e) {
      alert("Error adding order");
    }
  };

  const metrics = useMemo(() => {
    let totalOrders = purchases.length;
    let totalReceived = 0;
    let revenueReceived = 0;
    let totalReturned = 0;
    let costReturned = 0;
    let onTheWay = 0;
    let costOnTheWay = 0;

    purchases.forEach(p => {
      if (p.estado === 'Completada' || p.estado === 'Confirmado' || p.estado === 'Completado') {
        totalReceived++;
        revenueReceived += p.total;
      } else if (p.estado === 'Devuelto' || p.estado === 'Returned') {
        totalReturned++;
        costReturned += p.total;
      } else {
        onTheWay++;
        costOnTheWay += p.total;
      }
    });

    return { totalOrders, totalReceived, revenueReceived, totalReturned, costReturned, onTheWay, costOnTheWay };
  }, [purchases]);

  const formatCurrency = (val: number) => `₹${val}`;

  return (
    <div className="h-full flex flex-col relative space-y-6">
      
      {/* Overview Cards Container */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Overall Orders</h3>
        
        <div className="grid grid-cols-4 gap-6">
          <div className="flex flex-col">
            <span className="text-blue-500 font-semibold mb-2">Total Orders</span>
            <span className="text-xl font-bold text-slate-700">{metrics.totalOrders}</span>
            <span className="text-sm font-medium text-slate-400 mt-1">Last 7 days</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-orange-400 font-semibold mb-2">Total Received</span>
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-700">{metrics.totalReceived}</span>
                <span className="text-sm font-medium text-slate-400 mt-1">Last 7 days</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xl font-bold text-slate-700">{formatCurrency(metrics.revenueReceived)}</span>
                <span className="text-sm font-medium text-slate-400 mt-1">Revenue</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-purple-500 font-semibold mb-2">Total Returned</span>
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-700">{metrics.totalReturned}</span>
                <span className="text-sm font-medium text-slate-400 mt-1">Last 7 days</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xl font-bold text-slate-700">{formatCurrency(metrics.costReturned)}</span>
                <span className="text-sm font-medium text-slate-400 mt-1">Cost</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-red-400 font-semibold mb-2">On the way</span>
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-700">{metrics.onTheWay}</span>
                <span className="text-sm font-medium text-slate-400 mt-1">Ordered</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xl font-bold text-slate-700">{formatCurrency(metrics.costOnTheWay)}</span>
                <span className="text-sm font-medium text-slate-400 mt-1">Cost</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col flex-1 overflow-hidden relative z-0">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Orders</h2>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowModal(true)}
              className="px-5 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add Product
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-lg transition-colors">
              <Filter size={16} /> Filters
            </button>
            <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-lg transition-colors">
              Order History
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
          <table className="w-full text-left min-w-[800px]">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-100 text-sm text-slate-500 font-medium">
                <th className="px-6 py-4 font-medium">Products</th>
                <th className="px-6 py-4 font-medium">Order Value</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Expected Delivery</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No orders found</td>
                </tr>
              ) : (
                purchases.map((purchase) => {
                  const productItem = purchase.articulos?.[0] || { nombre: 'Unknown', cantidad: 0 };
                  
                  let statusClass = "text-orange-400";
                  let statusText = purchase.estado || 'Delayed';
                  if (statusText === 'Completado' || statusText === 'Confirmado' || statusText === 'Completada') {
                    statusText = 'Confirmed';
                    statusClass = "text-blue-500";
                  } else if (statusText === 'Pendiente') {
                    statusText = 'Out for delivery';
                    statusClass = "text-green-500";
                  } else if (statusText === 'Devuelto' || statusText === 'Returned') {
                    statusText = 'Returned';
                    statusClass = "text-slate-500";
                  }

                  return (
                    <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{productItem.nombre}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatCurrency(purchase.total)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{productItem.cantidad} Packets</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{purchase.id?.slice(0, 5) || '7535'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">11/12/22</td>
                      <td className={`px-6 py-4 text-sm font-medium ${statusClass}`}>
                        {statusText}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 mt-auto">
          <button className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Previous
          </button>
          <span className="text-sm font-medium text-slate-500">Page 1 of 10</span>
          <button className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Next
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="bg-white rounded-2xl shadow-xl w-[500px] relative z-10 overflow-hidden flex flex-col max-h-full">
            <div className="px-8 py-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">New Order</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="flex items-center">
                  <label className="w-1/3 text-sm font-semibold text-slate-700">Product Name</label>
                  <input name="productName" value={formData.productName} onChange={handleInputChange} 
                    className="w-2/3 px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-slate-400" 
                    placeholder="Enter product name" />
                </div>

                <div className="flex items-center">
                  <label className="w-1/3 text-sm font-semibold text-slate-700">Product ID</label>
                  <input name="productId" value={formData.productId} onChange={handleInputChange} 
                    className="w-2/3 px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-slate-400" 
                    placeholder="Enter product ID" />
                </div>

                <div className="flex items-center">
                  <label className="w-1/3 text-sm font-semibold text-slate-700">Category</label>
                  <input name="category" value={formData.category} onChange={handleInputChange} 
                    className="w-2/3 px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-slate-400" 
                    placeholder="Select product category" />
                </div>

                <div className="flex items-center">
                  <label className="w-1/3 text-sm font-semibold text-slate-700">Order value</label>
                  <input name="orderValue" value={formData.orderValue} onChange={handleInputChange} 
                    className="w-2/3 px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-slate-400" 
                    placeholder="Enter order value" />
                </div>

                <div className="flex items-center">
                  <label className="w-1/3 text-sm font-semibold text-slate-700">Quantity</label>
                  <input name="quantity" value={formData.quantity} onChange={handleInputChange} 
                    className="w-2/3 px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-slate-400" 
                    placeholder="Enter product quantity" />
                </div>

                <div className="flex items-center">
                  <label className="w-1/3 text-sm font-semibold text-slate-700">Unit</label>
                  <input name="unit" value={formData.unit} onChange={handleInputChange} 
                    className="w-2/3 px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-slate-400" 
                    placeholder="Enter product unit" />
                </div>
                
                <div className="flex items-center">
                  <label className="w-1/3 text-sm font-semibold text-slate-700">Buying price</label>
                  <input name="buyingPrice" value={formData.buyingPrice} onChange={handleInputChange} 
                    className="w-2/3 px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-slate-400" 
                    placeholder="Enter buying price" />
                </div>
                
                <div className="flex items-center">
                  <label className="w-1/3 text-sm font-semibold text-slate-700">Date of delivery</label>
                  <input name="dateOfDelivery" value={formData.dateOfDelivery} onChange={handleInputChange} 
                    className="w-2/3 px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-slate-400" 
                    placeholder="Enter date of delivery" />
                </div>

                <div className="flex items-center pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                    <input type="checkbox" name="notify" checked={formData.notify} onChange={handleInputChange} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20" />
                    Notify on the date of delivery
                  </label>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-4">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                    Discard
                  </button>
                  <button type="submit" 
                    className="px-6 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                    Add Product
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
