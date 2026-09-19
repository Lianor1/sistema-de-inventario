import { useState } from 'react';
import type { Supplier } from '../types';
import { addSupplier } from '../services/supplierService';
import { useData } from '../contexts/DataContext';
import { User, Filter, Download } from 'lucide-react';

export const Suppliers = () => {
  const { suppliers, loadingSuppliers: loading } = useData();
  const [showModal, setShowModal] = useState(false);

  const initialFormState: Supplier = {
    razonSocial: '', 
    producto: '', 
    categoria: '', 
    precioCompra: '', 
    telefono: '', 
    email: '',
    tipoDevolucion: 'Taking Return',
    enCamino: Math.floor(Math.random() * 20)
  };
  const [formData, setFormData] = useState<Supplier>(initialFormState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTypeToggle = (type: 'Taking Return' | 'Not Taking Return') => {
    setFormData({ ...formData, tipoDevolucion: type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Provide fallback values for required legacy fields
      const submitData = {
        ...formData,
        ruc: formData.ruc || '00000000000',
        estado: 'Activo' as const
      };
      
      // Auto-generate email based on name if empty, just for the aesthetic
      if (!submitData.email) {
        submitData.email = `${submitData.razonSocial.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
      }

      await addSupplier(submitData);
      setFormData(initialFormState);
      setShowModal(false);
    } catch (error) {
      alert('Error saving supplier');
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      
      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col h-full overflow-hidden relative z-0">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Suppliers</h2>
          
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
              Download all
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
          <table className="w-full text-left min-w-[800px]">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-100 text-sm text-slate-500 font-medium">
                <th className="px-6 py-4 font-medium">Supplier Name</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Contact Number</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">On the way</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No suppliers found</td>
                </tr>
              ) : (
                suppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{sup.razonSocial}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{sup.producto || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{sup.telefono}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{sup.email || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className={sup.tipoDevolucion === 'Not Taking Return' ? 'text-danger' : 'text-success'}>
                        {sup.tipoDevolucion || 'Taking Return'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{sup.enCamino ? sup.enCamino : '-'}</td>
                  </tr>
                ))
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
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" 
            onClick={() => setShowModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="bg-white rounded-2xl shadow-xl w-[500px] relative z-10 overflow-hidden flex flex-col max-h-full">
            <div className="px-8 py-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">New Supplier</h3>
              
              <div className="flex items-center gap-4 mb-8 justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                  <User size={32} />
                </div>
                <div className="text-sm text-slate-500 text-center flex flex-col">
                  <span>Drag image here</span>
                  <span>or</span>
                  <button className="text-primary font-medium hover:underline">Browse Image</button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="flex items-center">
                  <label className="w-1/3 text-sm font-semibold text-slate-700">Supplier Name</label>
                  <input required name="razonSocial" value={formData.razonSocial} onChange={handleInputChange} 
                    className="w-2/3 px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-slate-400" 
                    placeholder="Enter supplier name" />
                </div>

                <div className="flex items-center">
                  <label className="w-1/3 text-sm font-semibold text-slate-700">Product</label>
                  <input name="producto" value={formData.producto} onChange={handleInputChange} 
                    className="w-2/3 px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-slate-400" 
                    placeholder="Enter product" />
                </div>

                <div className="flex items-center">
                  <label className="w-1/3 text-sm font-semibold text-slate-700">Category</label>
                  <input required name="categoria" value={formData.categoria} onChange={handleInputChange} 
                    className="w-2/3 px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-slate-400" 
                    placeholder="Select product category" />
                </div>

                <div className="flex items-center">
                  <label className="w-1/3 text-sm font-semibold text-slate-700">Buying Price</label>
                  <input name="precioCompra" value={formData.precioCompra} onChange={handleInputChange} 
                    className="w-2/3 px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-slate-400" 
                    placeholder="Enter buying price" />
                </div>

                <div className="flex items-center">
                  <label className="w-1/3 text-sm font-semibold text-slate-700">Contact Number</label>
                  <input required name="telefono" value={formData.telefono} onChange={handleInputChange} 
                    className="w-2/3 px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-slate-400" 
                    placeholder="Enter supplier contact number" />
                </div>

                <div className="flex items-start pt-2">
                  <label className="w-1/3 text-sm font-semibold text-slate-700 mt-2">Type</label>
                  <div className="w-2/3 flex flex-col gap-3">
                    <button type="button" 
                      onClick={() => handleTypeToggle('Not Taking Return')}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors text-left ${formData.tipoDevolucion === 'Not Taking Return' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      Not taking return
                    </button>
                    <button type="button"
                      onClick={() => handleTypeToggle('Taking Return')}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors text-left ${formData.tipoDevolucion === 'Taking Return' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      Taking return
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-4">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                    Discard
                  </button>
                  <button type="submit" 
                    className="px-6 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                    Add Supplier
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
