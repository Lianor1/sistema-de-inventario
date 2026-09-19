export interface Product {
  id?: string;
  familyId?: string; // RelaciÃ³n Padre (Familia)
  familiaNombre?: string; // Desnormalizado para evitar joins costosos
  codigoBarras: string;
  nombre: string; // Ej: "Fresa" o "Yogurt Gloria 1L - Fresa"
  descripcion: string;
  categoria: string;
  marca: string;
  precioVenta: number;
  costoCompra: number;
  stockActual: number;
  stockMinimo: number;
  fechaVencimiento: string;
  ubicacionPasillo: string;
  proveedor: string;
  estado: 'Activo' | 'Inactivo';
  fechaRegistro?: Date | any;
  lotes?: ProductBatch[]; // Control de lotes y vencimientos
}

export interface SaleItem {
  productoId: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Sale {
  id?: string;
  articulos: SaleItem[];
  total: number;
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Yape/Plin' | 'Otro';
  fechaVenta?: Date | any;
  turnoId?: string;
  vendedorId?: string;
}

export interface PurchaseItem {
  productoId: string;
  nombre: string;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
}

export interface Purchase {
  id?: string;
  proveedorId: string;
  proveedorNombre: string;
  articulos: PurchaseItem[];
  total: number;
  fechaCompra?: Date | any;
  estado: 'Completado' | 'Pendiente';
}

export interface Employee {
  id?: string;
  nombre: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string; // Para login
  rol: 'Super Administrador' | 'Administrador' | 'Trabajador' | 'Cajero' | 'Almacenero' | 'Reponedor' | 'Inventarista' | 'Recursos Humanos' | 'Contabilidad';
  salario: number;
  fechaIngreso: string;
  estado?: 'Activo' | 'Inactivo'; // Soft delete
}

export interface ProductBatch {
  loteId: string;
  cantidad: number;
  fechaVencimiento: string; // YYYY-MM-DD
}



export interface Supplier {
  id?: string;
  razonSocial: string;
  ruc?: string;
  contacto?: string;
  telefono: string;
  email?: string;
  direccion?: string;
  categoria: string;
  estado?: 'Activo' | 'Inactivo';
  
  // Kanban mockup fields
  producto?: string;
  precioCompra?: string;
  tipoDevolucion?: 'Taking Return' | 'Not Taking Return';
  enCamino?: number;
}

export interface CashShift {
  id?: string;
  cajeroEmail: string;
  fechaApertura: string | any;
  montoApertura: number;
  estado: 'Abierto' | 'Cerrado';
  fechaCierre?: string | any;
  montoCierreDeclarado?: number;
  montoCierreSistema?: number;
  ventasTotalesEfectivo?: number;
  gastosTotalesEfectivo?: number; // Suma de gastos en este turno
}

export interface Expense {
  id?: string;
  concepto: string;
  monto: number;
  categoria: 'Servicios' | 'Planilla' | 'LogÃ­stica' | 'Mantenimiento' | 'Otros';
  fechaRegistro?: Date | any;
  cajeroEmail: string;
  turnoId: string;
}

export interface InventoryMovement {
  id?: string;
  productoId: string;
  productoNombre: string;
  tipo: 'Entrada' | 'Salida' | 'Ajuste';
  motivo: 'Compra' | 'Venta' | 'Merma/Vencido' | 'Ajuste Manual';
  cantidad: number;
  fechaMovimiento?: Date | any;
  usuarioEmail?: string;
  referenciaId?: string;
}

export interface Shrinkage {
  id?: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  motivo: 'Vencido' | 'Dañado/Roto' | 'Robo' | 'Otro';
  costoPerdido: number;
  fecha: any;
  registradoPor: string;
}
