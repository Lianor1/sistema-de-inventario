import { useState } from 'react';
import type { Product } from '../types';
import { addProduct, deleteProduct, updateProduct } from '../services/productService';
import { addFamily, deleteFamily } from '../services/familyService';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, Search, ArrowLeft, Package } from 'lucide-react';

export const Products = () => {
  const { products, sales, loadingProducts: loading } = useData();
  const { userRole } = useAuth();
  const canEdit = userRole === 'Super Administrador' || userRole === 'Administrador';
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Obtener categorías y marcas únicas
  const categories = Array.from(new Set(products.map(p => p.categoria).filter(Boolean)));
  const brands = Array.from(new Set(products.map(p => p.marca).filter(Boolean)));

  const exportToCSV = () => {
    const headers = ['Codigo', 'Producto', 'Categoria', 'Marca', 'Costo', 'Precio', 'Stock', 'Stock Minimo'];
    const rows = filteredProducts.map(p => [
      p.codigoBarras,
      p.nombre,
      p.categoria,
      p.marca,
      p.costoCompra,
      p.precioVenta,
      p.stockActual,
      p.stockMinimo
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventario.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const initialFormState: Product = {
    codigoBarras: '', nombre: '', descripcion: '', categoria: '', marca: '',
    precioVenta: 0, costoCompra: 0, stockActual: 0, stockMinimo: 0,
    fechaVencimiento: '', ubicacionPasillo: '', proveedor: '', estado: 'Activo'
  };
  const [formData, setFormData] = useState<Product>(initialFormState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name.includes('precio') || name.includes('costo') || name.includes('stock') 
        ? (value === '' ? '' : Number(value)) 
        : value 
    });
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id!);
    setView('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProduct(editingId, formData);
        alert('Producto actualizado con éxito');
      } else {
        await addProduct(formData);
        alert('Producto agregado con éxito');
      }
      setFormData(initialFormState);
      setEditingId(null);
      setView('list');
    } catch (error) {
      alert('Hubo un error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      await deleteProduct(id);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.codigoBarras.includes(searchTerm);
    const matchCategory = filterCategory ? p.categoria === filterCategory : true;
    const matchBrand = filterBrand ? p.marca === filterBrand : true;
    return matchSearch && matchCategory && matchBrand;
  });

  const [tab, setTab] = useState<'skus' | 'families'>('skus');

  // Funciones de familia
  const { families, loadingFamilies } = useData();
  const [newFamilyName, setNewFamilyName] = useState('');

  const handleAddFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newFamilyName) return;
    try {
      await addFamily({ nombre: newFamilyName, categoria: 'General', marca: 'General' });
      setNewFamilyName('');
    } catch (e) {}
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Package size={24} />
            </div>
            Gestión de Inventario
          </h2>
          <p className="text-slate-500 text-sm mt-1">Administra los productos, variedades y existencias de la tienda.</p>
        </div>
        
        {view === 'list' ? (
          <div className="flex items-center gap-3">
            <div className="bg-slate-200 p-1 rounded-xl flex items-center">
              <button onClick={() => setTab('skus')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'skus' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                Vista Plana (SKUs)
              </button>
              <button onClick={() => setTab('families')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'families' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                Agrupado (Familias)
              </button>
            </div>
            
            {canEdit && (
              <button 
                onClick={() => { setView('form'); setEditingId(null); setFormData(initialFormState); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95"
              >
                <Plus size={20} /> Nuevo SKU
              </button>
            )}
          </div>
        ) : (
          <button 
            onClick={() => { setView('list'); setFormData(initialFormState); setEditingId(null); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft size={20} /> Volver a la Lista
          </button>
        )}
      </div>

      {/* List View */}
      {view === 'list' && tab === 'skus' && (
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Overall Inventory Card */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Overall Inventory</h3>
            <div className="grid grid-cols-4 gap-4">
              
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-blue-500 mb-2">Categories</span>
                <span className="text-xl font-bold text-slate-700">{categories.length}</span>
                <span className="text-xs text-slate-400 mt-1">Last 7 days</span>
              </div>
              
              <div className="flex flex-col border-l border-slate-100 pl-4">
                <span className="text-sm font-semibold text-orange-400 mb-2">Total Products</span>
                <div className="flex justify-between w-full pr-8">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-slate-700">{products.length}</span>
                    <span className="text-xs text-slate-400 mt-1">Last 7 days</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xl font-bold text-slate-700">S/ 25000</span>
                    <span className="text-xs text-slate-400 mt-1">Revenue</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col border-l border-slate-100 pl-4">
                <span className="text-sm font-semibold text-purple-500 mb-2">Top Selling</span>
                <div className="flex justify-between w-full pr-8">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-slate-700">5</span>
                    <span className="text-xs text-slate-400 mt-1">Last 7 days</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xl font-bold text-slate-700">S/ 2500</span>
                    <span className="text-xs text-slate-400 mt-1">Cost</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col border-l border-slate-100 pl-4">
                <span className="text-sm font-semibold text-danger mb-2">Low Stocks</span>
                <div className="flex justify-between w-full pr-8">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-slate-700">{products.filter(p => p.stockActual <= p.stockMinimo && p.stockActual > 0).length}</span>
                    <span className="text-xs text-slate-400 mt-1">Ordered</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xl font-bold text-slate-700">{products.filter(p => p.stockActual === 0).length}</span>
                    <span className="text-xs text-slate-400 mt-1">Not in stock</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
            {/* Header / Actions */}
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-white">
              <h3 className="text-lg font-bold text-slate-800">Products</h3>
              
              <div className="flex items-center gap-3">
                {canEdit && (
                  <button 
                    onClick={() => { setView('form'); setEditingId(null); setFormData(initialFormState); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-all"
                  >
                    Add Product
                  </button>
                )}
                
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50">
                  Filters
                </button>
                
                <button 
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg text-sm hover:bg-slate-50"
                >
                  Download all
                </button>
              </div>
            </div>

            <div className="px-4 py-2 bg-slate-50 text-xs text-slate-500 font-medium border-b border-slate-100 flex gap-2">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs px-3 py-1.5 border border-slate-200 rounded-md outline-none focus:border-blue-500"
              />
              <span className="self-center ml-2">{filteredProducts.length} items</span>
            </div>

            {/* Tabla */}
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 font-medium">Products</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 font-medium">Buying Price</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 font-medium">Quantity</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 font-medium">Threshold Value</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 font-medium">Expiry Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 font-medium">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(product => {
                    const isOutOfStock = product.stockActual === 0;
                    const isLowStock = product.stockActual > 0 && product.stockActual <= product.stockMinimo;
                    
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => { setSelectedProduct(product); setView('details'); }}>
                        <td className="px-6 py-4 text-sm text-slate-700">{product.nombre}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">S/ {product.costoCompra?.toFixed(2) || '0.00'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{product.stockActual} Packets</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{product.stockMinimo} Packets</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{product.fechaVencimiento || '11/12/22'}</td>
                        <td className="px-6 py-4 text-sm">
                          {isOutOfStock ? (
                            <span className="text-danger font-medium">Out of stock</span>
                          ) : isLowStock ? (
                            <span className="text-orange-500 font-medium">Low stock</span>
                          ) : (
                            <span className="text-success font-medium">In- stock</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        No se encontraron productos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Families View */}
      {view === 'list' && tab === 'families' && (
        <div className="flex-1 flex flex-col gap-6">
          {canEdit && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 text-lg">Administrar Familias de Productos (Modelo Padre)</h3>
              <form onSubmit={handleAddFamily} className="flex gap-4">
                <input required value={newFamilyName} onChange={e => setNewFamilyName(e.target.value)} placeholder="Ej: Yogurt Gloria 1 Litro" className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary" />
                <button type="submit" className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700">Crear Familia</button>
              </form>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-4">
            {families.map(fam => {
              const children = products.filter(p => p.familyId === fam.id);
              return (
                <div key={fam.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-black text-slate-800 text-lg">{fam.nombre}</h4>
                      <p className="text-xs text-slate-500">{children.length} Variedades (SKUs)</p>
                    </div>
                    {canEdit && (
                      <button onClick={() => deleteFamily(fam.id)} className="text-danger hover:underline text-sm font-semibold">Eliminar Familia</button>
                    )}
                  </div>
                  <div className="p-4">
                    {children.length === 0 ? (
                      <p className="text-sm text-slate-400">No hay variedades asignadas a esta familia.</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {children.map(child => (
                          <div key={child.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="text-xs text-slate-400 mb-1">{child.codigoBarras}</div>
                            <div className="font-bold text-slate-700 text-sm">{child.nombre}</div>
                            <div className="flex justify-between items-end mt-2">
                              <span className="text-success font-black text-sm">S/ {child.precioVenta.toFixed(2)}</span>
                              <span className="text-xs bg-slate-200 text-slate-600 px-2 rounded-md font-bold">Stock: {child.stockActual}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Form View */}
      {view === 'form' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl mx-auto w-full">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">{editingId ? 'Editar Producto' : 'Detalles del Producto'}</h3>
            <p className="text-sm text-slate-500">Ingresa la información necesaria para registrar el ítem en la base de datos.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Código de Barras (SKU) <span className="text-danger">*</span></label>
                <input required name="codigoBarras" value={formData.codigoBarras} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>

              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Familia / Producto Padre (Opcional)</label>
                <select 
                  name="familyId" 
                  value={formData.familyId || ''} 
                  onChange={(e) => {
                    const family = families.find(f => f.id === e.target.value);
                    setFormData({ ...formData, familyId: e.target.value, familiaNombre: family?.nombre || '' });
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">-- Ninguna (Producto Independiente) --</option>
                  {families.map(f => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Nombre Variante <span className="text-danger">*</span></label>
                <input required name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej: Sabor Fresa 1L"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Marca</label>
                <input name="marca" value={formData.marca} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Categoría <span className="text-danger">*</span></label>
                <select required name="categoria" value={formData.categoria} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                  <option value="">Seleccione...</option>
                  <option value="Abarrotes">Abarrotes</option>
                  <option value="Lácteos">Lácteos</option>
                  <option value="Limpieza">Limpieza</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Cuidado Personal">Cuidado Personal</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Proveedor</label>
                <input name="proveedor" value={formData.proveedor} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Costo de Compra (S/.) <span className="text-danger">*</span></label>
                <input type="number" step="0.01" required name="costoCompra" value={formData.costoCompra === 0 ? '' : formData.costoCompra} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Precio de Venta (S/.) <span className="text-danger">*</span></label>
                <input type="number" step="0.01" required name="precioVenta" value={formData.precioVenta === 0 ? '' : formData.precioVenta} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-success focus:ring-2 focus:ring-success/20 transition-all font-bold text-success" />
              </div>

              <div className="col-span-full border-t border-slate-100 my-2"></div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Stock Actual <span className="text-danger">*</span></label>
                <input type="number" required name="stockActual" value={formData.stockActual === 0 ? '' : formData.stockActual} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Stock Mínimo (Alerta) <span className="text-danger">*</span></label>
                <input type="number" required name="stockMinimo" value={formData.stockMinimo === 0 ? '' : formData.stockMinimo} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-warning focus:ring-2 focus:ring-warning/20 transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Fecha Vencimiento</label>
                <input type="date" name="fechaVencimiento" value={formData.fechaVencimiento} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Pasillo/Estante</label>
                <input name="ubicacionPasillo" value={formData.ubicacionPasillo} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>

              <div className="space-y-1.5 col-span-full">
                <label className="text-sm font-semibold text-slate-700">Descripción / Detalles</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px] resize-y" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => { setView('list'); setEditingId(null); }}
                className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-8 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95"
              >
                {editingId ? 'Actualizar Producto' : 'Guardar Producto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Details View */}
      {view === 'details' && selectedProduct && (
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 p-8 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setView('list')} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-slate-800 flex-1">{selectedProduct.nombre}</h2>
            
            <div className="flex gap-3">
              {canEdit && (
                <button onClick={() => handleEdit(selectedProduct)} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                  <Edit size={16} /> Edit
                </button>
              )}
              <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-50 transition-colors shadow-sm">
                Download
              </button>
            </div>
          </div>

          <div className="flex gap-8 border-b border-slate-100 mb-8">
            <button className="px-4 py-3 font-semibold text-blue-600 border-b-2 border-blue-600">Overview</button>
            <button className="px-4 py-3 font-medium text-slate-500 hover:text-slate-700">Purchases</button>
            <button className="px-4 py-3 font-medium text-slate-500 hover:text-slate-700">Adjustments</button>
            <button className="px-4 py-3 font-medium text-slate-500 hover:text-slate-700">History</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Primary Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 text-sm">
                    <div className="text-slate-500 font-medium col-span-1">Product name</div>
                    <div className="text-slate-800 col-span-2">{selectedProduct.nombre}</div>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <div className="text-slate-500 font-medium col-span-1">Product ID</div>
                    <div className="text-slate-800 col-span-2">{selectedProduct.codigoBarras}</div>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <div className="text-slate-500 font-medium col-span-1">Product category</div>
                    <div className="text-slate-800 col-span-2">{selectedProduct.categoria || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <div className="text-slate-500 font-medium col-span-1">Expiry Date</div>
                    <div className="text-slate-800 col-span-2">{selectedProduct.fechaVencimiento || '13/4/23'}</div>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <div className="text-slate-500 font-medium col-span-1">Threshold Value</div>
                    <div className="text-slate-800 col-span-2">{selectedProduct.stockMinimo}</div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Supplier Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 text-sm">
                    <div className="text-slate-500 font-medium col-span-1">Supplier name</div>
                    <div className="text-slate-800 col-span-2">{selectedProduct.proveedor || 'Ronald Martin'}</div>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <div className="text-slate-500 font-medium col-span-1">Contact Number</div>
                    <div className="text-slate-800 col-span-2">98789 86757</div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Stock Locations</h3>
                <div className="overflow-hidden rounded-xl border border-slate-100">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Store Name</th>
                        <th className="px-6 py-4 font-semibold text-right">Stock in hand</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-6 py-4 text-slate-700">Sulur Branch</td>
                        <td className="px-6 py-4 text-right text-blue-600 font-bold">15</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-slate-700">Singanallur Branch</td>
                        <td className="px-6 py-4 text-right text-blue-600 font-bold">19</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

            </div>

            <div>
              <div className="border border-dashed border-slate-300 rounded-2xl p-4 flex items-center justify-center mb-8 h-64 bg-slate-50/50">
                <Package size={64} className="text-slate-300" />
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Opening Stock</span>
                  <span className="font-bold text-slate-800">40</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Remaining Stock</span>
                  <span className="font-bold text-slate-800">{selectedProduct.stockActual}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">On the way</span>
                  <span className="font-bold text-slate-800">15</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Threshold value</span>
                  <span className="font-bold text-slate-800">{selectedProduct.stockMinimo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
