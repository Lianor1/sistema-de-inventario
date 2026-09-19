import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Product, Sale, Employee, Supplier, CashShift, Expense } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  products: Product[];
  sales: Sale[];
  employees: Employee[];
  suppliers: Supplier[];
  expenses: Expense[];
  families: any[];
  purchases: any[];
  activeShift: CashShift | null;
  loadingProducts: boolean;
  loadingSales: boolean;
  loadingEmployees: boolean;
  loadingSuppliers: boolean;
  loadingExpenses: boolean;
  loadingFamilies: boolean;
  loadingPurchases: boolean;
  loadingShift: boolean;
}

const DataContext = createContext<DataContextType>({
  products: [],
  sales: [],
  employees: [],
  suppliers: [],
  expenses: [],
  families: [],
  purchases: [],
  activeShift: null,
  loadingProducts: true,
  loadingSales: true,
  loadingEmployees: true,
  loadingSuppliers: true,
  loadingExpenses: true,
  loadingFamilies: true,
  loadingPurchases: true,
  loadingShift: true,
});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [activeShift, setActiveShift] = useState<CashShift | null>(null);
  
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [loadingFamilies, setLoadingFamilies] = useState(true);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [loadingShift, setLoadingShift] = useState(true);

  useEffect(() => {
    // Escuchar Compras (Historial)
    const qPurchases = query(collection(db, 'compras'), orderBy('fechaCompra', 'desc'));
    const unsubPurchases = onSnapshot(qPurchases, (snapshot) => {
      setPurchases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingPurchases(false);
    });

    // Escuchar Familias (Categorías Padre)
    const qFamilies = query(collection(db, 'familias_productos'), orderBy('nombre', 'asc'));
    const unsubFamilies = onSnapshot(qFamilies, (snapshot) => {
      setFamilies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingFamilies(false);
    });

    // Escuchar Productos
    const qProducts = query(collection(db, 'productos'), orderBy('nombre', 'asc'));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoadingProducts(false);
    });

    // Escuchar Ventas
    const qSales = query(collection(db, 'ventas'), orderBy('fechaVenta', 'desc'));
    const unsubSales = onSnapshot(qSales, (snapshot) => {
      setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale)));
      setLoadingSales(false);
    });

    // Escuchar Gastos
    const qExpenses = query(collection(db, 'gastos'), orderBy('fechaRegistro', 'desc'));
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
      setLoadingExpenses(false);
    });

    // Escuchar Empleados
    const qEmployees = query(collection(db, 'trabajadores'), orderBy('nombre', 'asc'));
    const unsubEmployees = onSnapshot(qEmployees, (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
      setLoadingEmployees(false);
    });

    // Escuchar Proveedores
    const qSuppliers = query(collection(db, 'proveedores'), orderBy('razonSocial', 'asc'));
    const unsubSuppliers = onSnapshot(qSuppliers, (snapshot) => {
      setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier)));
      setLoadingSuppliers(false);
    });
    
    // Escuchar Turno Activo (Caja)
    let unsubShift = () => {};
    if (currentUser?.email) {
      const qShift = query(collection(db, 'turnos'), where('cajeroEmail', '==', currentUser.email), where('estado', '==', 'Abierto'));
      unsubShift = onSnapshot(qShift, (snapshot) => {
        if (!snapshot.empty) {
          setActiveShift({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as CashShift);
        } else {
          setActiveShift(null);
        }
        setLoadingShift(false);
      });
    } else {
      setLoadingShift(false);
    }

    return () => {
      unsubPurchases();
      unsubFamilies();
      unsubProducts();
      unsubSales();
      unsubExpenses();
      unsubEmployees();
      unsubSuppliers();
      unsubShift();
    };
  }, [currentUser]);

  return (
    <DataContext.Provider value={{
      products, sales, employees, suppliers, expenses, activeShift, families, purchases,
      loadingProducts, loadingSales, loadingEmployees, loadingSuppliers, loadingExpenses, loadingShift, loadingFamilies, loadingPurchases
    }}>
      {children}
    </DataContext.Provider>
  );
};
