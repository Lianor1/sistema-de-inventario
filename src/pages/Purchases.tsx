import { useState } from 'react';
import type { Product, PurchaseItem, Purchase, Supplier } from '../types';
import { registerPurchase } from '../services/purchaseService';
import { useData } from '../contexts/DataContext';
import { Search, ShoppingBag, Trash2, CheckCircle, PackagePlus, Building2 } from 'lucide-react';

export const Purchases = () => {
  const { products, suppliers } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<(PurchaseItem & { fechaVencimiento?: string })[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const filteredProducts = products.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.codigoBarras.includes(searchTerm)
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productoId === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.productoId === product.id 
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.costoUnitario }
          : item
      ));
    } else {
      setCart([...cart, {
        productoId: product.id!,
        nombre: product.nombre,
        costoUnitario: product.costoCompra,
        cantidad: 1,
        subtotal: product.costoCompra,
        fechaVencimiento: undefined
      }]);
    }
    setSearchTerm('');
  };

  const removeFromCart = (productoId: string) => setCart(cart.filter(item => item.productoId !== productoId));
  
  const updateQuantity = (productoId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item => item.productoId === productoId ? { ...item, cantidad: newQuantity, subtotal: newQuantity * item.costoUnitario } : item));
  };

  const updateCost = (productoId: string, newCost: number) => {
    if (newCost < 0) return;
    setCart(cart.map(item => item.productoId === productoId ? { ...item, costoUnitario: newCost, subtotal: item.cantidad * newCost } : item));
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleProcessPurchase = async () => {
    if (cart.length === 0 || !selectedSupplier) {
      alert("Selecciona un proveedor y añade productos.");
      return;
    }
    
    setLoading(true);
    try {
      const supplier = suppliers.find(s => s.id === selectedSupplier);
      
      const newPurchase: Purchase = {
        proveedorId: supplier!.id!,
        proveedorNombre: supplier!.razonSocial,
        articulos: cart,
        total: total,
        estado: 'Completado'
      };
      
      await registerPurchase(newPurchase);
      alert('¡Ingreso de mercadería registrado! El stock ha sido actualizado.');
      setCart([]);
      setSelectedSupplier('');
    } catch (error) {
      alert('Error al registrar la compra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-6 h-full relative">
      
      {/* Catálogo */}
      <div className="flex-[3] flex flex-col gap-6">
        
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <PackagePlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Ingreso de Mercadería</h2>
              <p className="text-xs text-slate-500">Registra compras para abastecer tu inventario</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex-1 flex items-center">
            <div className="pl-4 pr-2 text-slate-400"><Search size={22} /></div>
            <input type="text" placeholder="Buscar producto para ingresar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-3 px-2 outline-none text-slate-700 bg-transparent placeholder-slate-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} onClick={() => addToCart(product)} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all cursor-pointer flex flex-col">
                <h4 className="text-slate-800 font-semibold mb-1 flex-1">{product.nombre}</h4>
                <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-50">
                  <div className="text-sm font-bold text-slate-600">Costo: S/ {product.costoCompra.toFixed(2)}</div>
                  <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Stock: {product.stockActual}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orden de Compra */}
      <div className="flex-[2] bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-6 bg-blue-900 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingBag size={24} className="text-blue-300" /> Orden de Compra</h2>
          <span className="bg-blue-800 text-xs px-3 py-1 rounded-full font-medium">{cart.length} Ítems</span>
        </div>

        {/* Selector de Proveedor */}
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1"><Building2 size={14}/> Proveedor</label>
          <select 
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium text-slate-700"
          >
            <option value="">-- Seleccionar Proveedor --</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.razonSocial} (RUC: {s.ruc})</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-2 bg-slate-50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <PackagePlus size={48} className="mb-4 text-slate-200" />
              <p>Selecciona los productos que están ingresando al almacén.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.productoId} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-slate-800">{item.nombre}</h4>
                    <button onClick={() => removeFromCart(item.productoId)} className="p-1.5 text-danger hover:bg-danger/10 rounded-xl"><Trash2 size={18} /></button>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Costo Unit. (S/)</span>
                      <input 
                        type="number" step="0.01" 
                        value={item.costoUnitario === 0 ? '' : item.costoUnitario} 
                        onChange={(e) => updateCost(item.productoId, parseFloat(e.target.value) || 0)}
                        className="w-20 p-2 border border-slate-200 rounded-lg text-sm font-semibold outline-none"
                      />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Cantidad</span>
                      <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.productoId, item.cantidad - 1)} className="w-6 h-6 rounded-md hover:bg-white text-slate-600 font-bold">-</button>
                        <span className="w-8 text-center font-semibold text-sm">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.productoId, item.cantidad + 1)} className="w-6 h-6 rounded-md hover:bg-white text-slate-600 font-bold">+</button>
                      </div>
                    </div>

                    <div className="flex flex-col flex-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Vencimiento (Opcional)</span>
                      <input 
                        type="date"
                        value={item.fechaVencimiento || ''}
                        onChange={(e) => setCart(cart.map(i => i.productoId === item.productoId ? { ...i, fechaVencimiento: e.target.value } : i))}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Subtotal</span>
                      <div className="font-bold text-slate-800">S/ {item.subtotal.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex justify-between items-end mb-6">
            <span className="text-slate-500 font-medium">Total a Pagar al Proveedor</span>
            <span className="text-3xl font-extrabold text-blue-700 tracking-tight">S/ {total.toFixed(2)}</span>
          </div>

          <button onClick={handleProcessPurchase} disabled={cart.length === 0 || !selectedSupplier || loading} className={`w-full py-4 rounded-2xl text-lg font-bold flex justify-center items-center gap-2 transition-all shadow-lg ${cart.length === 0 || !selectedSupplier ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 active:scale-[0.98]'}`}>
            <CheckCircle size={24} /> Registrar Ingreso
          </button>
        </div>
      </div>
    </div>
  );
};
