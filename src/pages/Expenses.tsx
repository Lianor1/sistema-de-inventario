import { useState } from 'react';
import type { Expense } from '../types';
import { registerExpense } from '../services/expenseService';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, Search, TrendingDown, Plus, Trash2, Calendar, FileText } from 'lucide-react';

export const Expenses = () => {
  const { expenses, activeShift, loadingExpenses } = useData();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [view, setView] = useState<'list' | 'form'>('list');
  const [formData, setFormData] = useState<Partial<Expense>>({
    concepto: '',
    monto: 0,
    categoria: 'Otros'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) {
      alert("Debes tener un turno (caja) abierto para registrar un gasto.");
      return;
    }

    try {
      await registerExpense({
        concepto: formData.concepto!,
        monto: formData.monto!,
        categoria: formData.categoria as any,
        cajeroEmail: currentUser?.email || 'Desconocido',
        turnoId: activeShift.id!
      });
      alert('Gasto registrado exitosamente');
      setFormData({ concepto: '', monto: 0, categoria: 'Otros' });
      setView('list');
    } catch (error) {
      alert('Error al registrar el gasto');
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.concepto.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
              <TrendingDown size={24} />
            </div>
            Gastos Operativos (Caja Chica)
          </h2>
          <p className="text-slate-500 text-sm mt-1">Registra salidas de dinero en efectivo de tu caja actual.</p>
        </div>
        
        {view === 'list' ? (
          <button 
            onClick={() => {
              if(!activeShift) { alert("Abre tu caja primero en Punto de Venta."); return; }
              setView('form');
            }} 
            className="flex items-center gap-2 px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-xl shadow-lg shadow-pink-600/30 transition-all active:scale-95"
          >
            <Plus size={20} /> Nuevo Gasto
          </button>
        ) : (
          <button 
            onClick={() => setView('list')} 
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl shadow-sm transition-all"
          >
            Volver al Historial
          </button>
        )}
      </div>

      {view === 'list' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center flex-1 max-w-md">
              <Search size={18} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Buscar gasto por concepto o categoría..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white sticky top-0 border-b border-slate-100 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-500">Fecha</th>
                  <th className="px-6 py-4 font-semibold text-slate-500">Concepto</th>
                  <th className="px-6 py-4 font-semibold text-slate-500">Categoría</th>
                  <th className="px-6 py-4 font-semibold text-slate-500">Registrado por</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingExpenses ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-400">Cargando...</td></tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400">No hay gastos registrados.</td></tr>
                ) : (
                  filteredExpenses.map((exp) => {
                    const dateObj = exp.fechaRegistro?.toDate ? exp.fechaRegistro.toDate() : new Date();
                    return (
                      <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400"/> {dateObj.toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">{exp.concepto}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
                            {exp.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {exp.cajeroEmail}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-danger">
                          - S/ {exp.monto.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'form' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 max-w-lg mx-auto w-full p-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Wallet size={20} className="text-pink-600"/> Registrar Salida de Efectivo</h3>
            <p className="text-sm text-slate-500 mt-1">Este dinero se restará automáticamente de tu cuadre de caja actual.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Concepto / Descripción <span className="text-danger">*</span></label>
              <input required value={formData.concepto} onChange={(e) => setFormData({...formData, concepto: e.target.value})} placeholder="Ej: Pago de Luz, Almuerzo, Pasajes..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-500 transition-all font-medium" />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Monto Retirado (S/.) <span className="text-danger">*</span></label>
              <input type="number" step="0.10" min="0.1" required value={formData.monto || ''} onChange={(e) => setFormData({...formData, monto: Number(e.target.value)})} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-500 transition-all text-2xl font-black text-slate-800" />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Categoría <span className="text-danger">*</span></label>
              <select value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-500 font-medium">
                <option value="Servicios">Servicios (Luz, Agua, Internet)</option>
                <option value="Planilla">Adelanto de Planilla / Personal</option>
                <option value="Logística">Logística / Pasajes</option>
                <option value="Mantenimiento">Mantenimiento / Reparaciones</option>
                <option value="Otros">Otros Gastos</option>
              </select>
            </div>

            <button type="submit" className="w-full mt-4 py-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-600/30 transition-all flex items-center justify-center gap-2">
              <TrendingDown size={20} /> Registrar Gasto
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
