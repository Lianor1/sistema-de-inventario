import { useState } from 'react';
import type { Employee } from '../types';
import { addEmployee, deleteEmployee } from '../services/hrService';
import { useData } from '../contexts/DataContext';
import { Users, UserPlus, Trash2, Shield, Phone, Mail, CreditCard, Calendar } from 'lucide-react';

export const HR = () => {
  const { employees, loadingEmployees: loading } = useData();
  const [view, setView] = useState<'list' | 'form'>('list');

  const initialFormState: Employee = {
    nombre: '', apellidos: '', dni: '', email: '', telefono: '',
    rol: 'Trabajador', salario: 0, fechaIngreso: '', estado: 'Activo'
  };
  const [formData, setFormData] = useState<Employee>(initialFormState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'salario' ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEmployee(formData);
      alert('Trabajador registrado con éxito');
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
              <Users size={24} />
            </div>
            Gestión de Personal
          </h2>
          <p className="text-slate-500 text-sm mt-1">Administra los trabajadores, roles y salarios de la tienda.</p>
        </div>
        
        {view === 'list' ? (
          <button 
            onClick={() => setView('form')} 
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95"
          >
            <UserPlus size={20} /> Registrar Trabajador
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
              Cargando personal...
            </div>
          ) : employees.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
              <Users size={48} className="mb-4 text-slate-300" />
              <p>No hay trabajadores registrados en el sistema.</p>
            </div>
          ) : (
            employees.map(emp => (
              <div key={emp.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative group hover:shadow-md hover:border-primary/30 transition-all">
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    emp.estado === 'Activo' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${emp.estado === 'Activo' ? 'bg-success' : 'bg-danger'}`}></span>
                    {emp.estado}
                  </span>
                </div>
                
                <div className="flex flex-col items-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 mb-3 border-4 border-white shadow-sm">
                    {emp.nombre.charAt(0)}{emp.apellidos.charAt(0)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 text-center leading-tight">{emp.nombre} {emp.apellidos}</h3>
                  <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md mt-2">
                    <Shield size={12} />
                    {emp.rol}
                  </div>
                </div>

                <div className="space-y-2 mb-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2"><CreditCard size={14} className="text-slate-400"/> {emp.dni}</div>
                  <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {emp.telefono || 'Sin teléfono'}</div>
                  <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> <span className="truncate">{emp.email}</span></div>
                  <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400"/> Ingreso: {emp.fechaIngreso || '-'}</div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <div className="text-sm">
                    <span className="text-slate-400 block text-xs">Salario Mensual</span>
                    <span className="font-bold text-slate-700">S/ {emp.salario.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => { 
                        if(window.confirm(`¿Cambiar estado de ${emp.nombre}?`)) { 
                          const { updateEmployeeStatus } = await import('../services/hrService');
                          await updateEmployeeStatus(emp.id!, emp.estado === 'Activo' ? 'Inactivo' : 'Activo'); 
                        } 
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {emp.estado === 'Activo' ? 'Suspender' : 'Activar'}
                    </button>
                    <button 
                      onClick={async () => { if(window.confirm(`¿ADVERTENCIA: Despedir/Eliminar a ${emp.nombre} borrará permanentemente sus datos?`)) { await deleteEmployee(emp.id!); } }}
                      className="p-1.5 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      title="Eliminar permanentemente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'form' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl mx-auto w-full">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Ficha del Empleado</h3>
            <p className="text-sm text-slate-500">Datos personales y contractuales del trabajador.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nombres <span className="text-danger">*</span></label>
                <input required name="nombre" value={formData.nombre} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Apellidos <span className="text-danger">*</span></label>
                <input required name="apellidos" value={formData.apellidos} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Documento de Identidad (DNI) <span className="text-danger">*</span></label>
                <input required name="dni" value={formData.dni} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Correo Electrónico <span className="text-danger">*</span></label>
                <input type="email" required name="email" value={formData.email} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Teléfono Móvil</label>
                <input name="telefono" value={formData.telefono} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>

              <div className="col-span-full border-t border-slate-100 my-2"></div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Rol <span className="text-danger">*</span></label>
                <select required name="rol" value={formData.rol} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                  <option value="Trabajador">Trabajador (General)</option>
                  <option value="Cajero">Cajero</option>
                  <option value="Almacenero">Almacenero (Ingresos)</option>
                  <option value="Reponedor">Reponedor (Pasillos)</option>
                  <option value="Inventarista">Inventarista (Auditorías)</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Contabilidad">Contabilidad</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Super Administrador">Super Administrador</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Salario Mensual (S/.) <span className="text-danger">*</span></label>
                <input type="number" required name="salario" value={formData.salario} onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-success focus:ring-2 focus:ring-success/20 transition-all font-bold text-success" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Fecha de Ingreso <span className="text-danger">*</span></label>
                <input type="date" required name="fechaIngreso" value={formData.fechaIngreso} onChange={handleInputChange} 
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
                Inscribir Trabajador
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
