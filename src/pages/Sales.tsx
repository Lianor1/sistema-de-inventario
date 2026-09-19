import { useState } from 'react';
import type { Product, SaleItem, Sale } from '../types';
import { registerSale } from '../services/saleService';
import { openShift, closeShift } from '../services/shiftService';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, ShoppingCart, Trash2, CheckCircle, CreditCard, Banknote, Smartphone, Receipt, Lock, Unlock } from 'lucide-react';

export const Sales = () => {
  const { currentUser } = useAuth();
  const { products, sales, activeShift, loadingShift } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Yape/Plin' | 'Otro'>('Efectivo');
  const [loading, setLoading] = useState(false);

  // Estados para Apertura / Cierre de Caja
  const [montoApertura, setMontoApertura] = useState<number>(0);
  const [montoCierre, setMontoCierre] = useState<number>(0);
  const [showCloseModal, setShowCloseModal] = useState(false);

  if (loadingShift) {
    return <div className="h-full flex items-center justify-center text-slate-400">Verificando estado de la caja...</div>;
  }

  // --- LÓGICA DE TURNOS DE CAJA ---
  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email) return;
    setLoading(true);
    try {
      await openShift(currentUser.email, montoApertura);
    } catch (error) {
      alert("Error abriendo caja");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift?.id) return;
    setLoading(true);
    try {
      // Calcular todas las ventas en EFECTIVO de este turno
      const ventasEfectivoTurno = sales
        .filter(s => s.turnoId === activeShift.id && s.metodoPago === 'Efectivo')
        .reduce((sum, s) => sum + s.total, 0);

      await closeShift(activeShift.id, montoCierre, ventasEfectivoTurno);
      setShowCloseModal(false);
      
      const esperado = activeShift.montoApertura + ventasEfectivoTurno;
      const diferencia = montoCierre - esperado;
      
      alert(`Caja Cerrada.\nEfectivo Esperado: S/ ${esperado.toFixed(2)}\nDeclarado: S/ ${montoCierre.toFixed(2)}\nDiferencia: S/ ${diferencia.toFixed(2)}`);
      
    } catch (error) {
      alert("Error cerrando caja");
    } finally {
      setLoading(false);
    }
  };

  // --- PANTALLA DE APERTURA DE CAJA ---
  if (!activeShift) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 text-center">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Caja Cerrada</h2>
          <p className="text-slate-500 mb-8">Para empezar a registrar ventas, necesitas aperturar tu caja (turno actual).</p>
          
          <form onSubmit={handleOpenShift}>
            <div className="text-left mb-6">
              <label className="text-sm font-semibold text-slate-700 block mb-2">Monto Inicial (Sencillo) S/.</label>
              <input 
                type="number" 
                step="0.10" 
                min="0"
                required
                value={montoApertura}
                onChange={(e) => setMontoApertura(Number(e.target.value))}
                className="w-full text-center text-3xl font-bold text-slate-800 px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Unlock size={20} />
              {loading ? 'Abriendo...' : 'Abrir Caja y Empezar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- LÓGICA DEL PUNTO DE VENTA ---
  const filteredProducts = products.filter(p => 
    (p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.codigoBarras.includes(searchTerm)) && p.stockActual > 0
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productoId === product.id);
    if (existingItem) {
      if (existingItem.cantidad >= product.stockActual) {
        alert('No hay suficiente stock disponible.');
        return;
      }
      setCart(cart.map(item => 
        item.productoId === product.id 
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precioUnitario }
          : item
      ));
    } else {
      setCart([...cart, {
        productoId: product.id!,
        nombre: product.nombre,
        precioUnitario: product.precioVenta,
        cantidad: 1,
        subtotal: product.precioVenta
      }]);
    }
    setSearchTerm('');
  };

  const removeFromCart = (productoId: string) => setCart(cart.filter(item => item.productoId !== productoId));
  const updateQuantity = (productoId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const product = products.find(p => p.id === productoId);
    if (product && newQuantity > product.stockActual) {
      alert(`Solo hay ${product.stockActual} unidades en stock.`);
      return;
    }
    setCart(cart.map(item => item.productoId === productoId ? { ...item, cantidad: newQuantity, subtotal: newQuantity * item.precioUnitario } : item));
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleProcessSale = async () => {
    if (cart.length === 0 || !activeShift) return;
    setLoading(true);
    try {
      const newSale: Sale = {
        articulos: cart,
        total: total,
        metodoPago: paymentMethod,
        turnoId: activeShift.id
      };
      await registerSale(newSale);
      alert('¡Venta registrada con éxito!');
      setCart([]);
    } catch (error) {
      alert('Error al registrar la venta.');
    } finally {
      setLoading(false);
    }
  };

  const PaymentButton = ({ type, icon: Icon, label }: { type: any, icon: any, label: string }) => (
    <button
      onClick={() => setPaymentMethod(type)}
      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${paymentMethod === type ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:border-slate-300 text-slate-500'}`}
    >
      <Icon size={24} className="mb-2" />
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="flex gap-6 h-full relative">
      
      {/* Modal Cierre de Caja */}
      {showCloseModal && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Cerrar Caja (Arqueo)</h2>
            <p className="text-slate-500 mb-6 text-sm">Cuenta el dinero físico que hay en la gaveta y decláralo a continuación.</p>
            <form onSubmit={handleCloseShift}>
              <div className="mb-6">
                <label className="text-sm font-semibold text-slate-700 block mb-2">Efectivo Total en Caja (S/.)</label>
                <input type="number" step="0.10" required value={montoCierre} onChange={(e) => setMontoCierre(Number(e.target.value))}
                  className="w-full text-center text-3xl font-bold text-slate-800 px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-danger focus:ring-4 focus:ring-danger/10 transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCloseModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-danger hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-danger/30 transition-all">Confirmar Cierre</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Catálogo */}
      <div className="flex-[3] flex flex-col gap-6">
        <div className="flex justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex-1 flex items-center">
            <div className="pl-4 pr-2 text-slate-400"><Search size={22} /></div>
            <input type="text" placeholder="Buscar un producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-4 px-2 text-lg outline-none text-slate-700 bg-transparent placeholder-slate-400" autoFocus />
          </div>
          <button onClick={() => setShowCloseModal(true)} className="flex items-center gap-2 px-6 py-3 mr-2 bg-danger/10 hover:bg-danger text-danger hover:text-white font-bold rounded-xl transition-all">
            <Lock size={18} /> Cerrar Caja
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} onClick={() => addToCart(product)} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col">
                <h4 className="text-slate-800 font-semibold mb-1 flex-1">{product.nombre}</h4>
                <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-50">
                  <div className="text-lg font-bold text-success">S/ {product.precioVenta.toFixed(2)}</div>
                  <div className="text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{product.stockActual}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ticket */}
      <div className="flex-[2] bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><Receipt size={24} className="text-primary-light" /> Ticket de Venta</h2>
          <span className="bg-slate-800 text-xs px-3 py-1 rounded-full font-medium">{cart.length} Ítems</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 bg-slate-50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <ShoppingCart size={48} className="mb-4 text-slate-200" />
              <p>Escanea o selecciona productos para agregarlos al ticket</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.productoId} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{item.nombre}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.productoId, item.cantidad - 1)} className="w-8 h-8 rounded-md hover:bg-white text-slate-600 font-bold">-</button>
                      <span className="w-8 text-center font-semibold">{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.productoId, item.cantidad + 1)} className="w-8 h-8 rounded-md hover:bg-white text-slate-600 font-bold">+</button>
                    </div>
                    <div className="w-20 text-right font-bold text-slate-800">S/ {item.subtotal.toFixed(2)}</div>
                    <button onClick={() => removeFromCart(item.productoId)} className="p-2 text-danger hover:bg-danger/10 rounded-xl"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex justify-between items-end mb-6">
            <span className="text-slate-500 font-medium">Total a Pagar</span>
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">S/ {total.toFixed(2)}</span>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Método de Pago</p>
            <div className="flex gap-3">
              <PaymentButton type="Efectivo" icon={Banknote} label="Efectivo" />
              <PaymentButton type="Tarjeta" icon={CreditCard} label="Tarjeta" />
              <PaymentButton type="Yape/Plin" icon={Smartphone} label="Digital" />
            </div>
          </div>

          <button onClick={handleProcessSale} disabled={cart.length === 0 || loading} className={`w-full py-4 rounded-2xl text-lg font-bold flex justify-center items-center gap-2 transition-all shadow-lg ${cart.length === 0 ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' : 'bg-primary hover:bg-blue-700 text-white shadow-primary/30 active:scale-[0.98]'}`}>
            <CheckCircle size={24} /> Cobrar e Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};
