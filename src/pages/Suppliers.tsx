import { useState } from 'react';
import type { Supplier } from '../types';
import { addSupplier, deleteSupplier } from '../services/supplierService';
import { useData } from '../contexts/DataContext';
import { Truck, Plus, Trash2, Phone, Mail, MapPin, Building2, Briefcase } from 'lucide-react';

export const Suppliers = () => {
  const { suppliers, loadingSuppliers: loading } = useData();
  const [view, setView] = useState<'list' | 'form'>('list');

  const initialFormState: Supplier = {
    razonSocial: '', ruc: '', contacto: '', telefono: '', 
    email: '', direccion: '', categoria: '', estado: 'Activo'
  };
  const [formData, setFormData] = useState<Supplier>(initialFormState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSupplier(formData);
      alert('Proveedor registrado con éxito');
      setFormData(initialFormState);
      setView('list');
    } catch (error) {
      alert('Hubo un error al guardar');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Truck size={24} />
            </div>
            Gestión de Proveedores
          </h2>
          <p className="text-slate-500 text-sm mt-1">Directorio de empresas, proveedores y marcas asociadas.</p>
        </div>
        
        {view === 'list' ? (
          <button 
            onClick={() => setView('form')} 
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95"
          >
            <Plus size={20} /> Nuevo Proveedor
          </button>
        ) : (
          <button 
            onClick={() => setView('list')} 
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl shadow-sm transition-all active:scale-95"
          >
            Volver al Directorio
          </button>
        )}
      </div>

      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-8 custom-scrollbar">
          {loading ? (
            <div className="col-span-full flex justify-center items-center h-40 text-slate-400">
              Cargando proveedores...
            </div>
          ) : suppliers.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
              <Building2 size={48} className="mb-4 text-slate-300" />
              <p>No hay proveedores registrados en el sistema.</p>
            </div>
          ) : (
            suppliers.map(sup => (
              <div key={sup.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative group hover:shadow-md hover:border-primary/30 transition-all">
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    sup.estado === 'Activo' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sup.estado === 'Activo' ? 'bg-success' : 'bg-danger'}`}></span>
                    {sup.estado}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary mb-4 border border-slate-100">
                    <Truck size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{sup.razonSocial}</h3>
                  <div className="text-xs font-semibold text-slate-400">RUC: {sup.ruc}</div>
                </div>

                <div className="space-y-2 mb-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><Briefcase size={14} className="text-slate-400"/> <span className="font-medium">{sup.contacto}</span></div>
                  <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {sup.telefono || 'Sin teléfono'}</div>
                  <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> <span className="truncate">{sup.email || '-'}</span></div>
                  <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> <span className="truncate">{sup.direccion || '-'}</span></div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                    {sup.categoria}
                  </span>
                  <button 
                    onClick={async () => { if(window.confirm(`¿Eliminar proveedor ${sup.razonSocial}?`)) { await deleteSupplier(sup.id!); } }}
                    className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'form' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl mx-auto w-full">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Ficha del Proveedor</h3>
            <p className="text-sm text-slate-500">Datos fiscales y de contacto de la empresa proveedora.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Razón Social / Empresa <span className="text-danger">*</span></label>
                <input required name="razonSocial" value={formData.razonSocial} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">RUC <span className="text-danger">*</span></label>
                <input required name="ruc" value={formData.ruc} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Categoría / Rubro <span className="text-danger">*</span></label>
                <input required name="categoria" placeholder="Ej: Lácteos, Abarrotes, Limpieza..." value={formData.categoria} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>

              <div className="col-span-full border-t border-slate-100 my-2"></div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nombre del Contacto (Vendedor)</label>
                <input name="contacto" value={formData.contacto} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Teléfono Móvil</label>
                <input name="telefono" value={formData.telefono} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Correo Electrónico</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Dirección</label>
                <input name="direccion" value={formData.direccion} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <button 
                type="button" onClick={() => setView('list')}
                className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-8 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95"
              >
                Guardar Proveedor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
