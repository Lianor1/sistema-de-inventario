import { useState } from 'react';

export const ManageStore = () => {
  const [stores] = useState([
    {
      id: 1,
      branchName: 'Singanallur Branch',
      storeName: 'Lisy Store',
      address1: '1A/Krihnarajapuram, 3 rd street sulur',
      address2: 'Coimbatore - 6313403',
      phone: '044- 653578'
    },
    {
      id: 2,
      branchName: 'Slur Branch',
      storeName: 'Lisy Store',
      address1: '54 Ramani colony, 3 rd street sulur',
      address2: 'Coimbatore - 63133452',
      phone: '044- 653763'
    },
    {
      id: 3,
      branchName: 'Gaandipuram Branch',
      storeName: 'Lisy Store',
      address1: '32/ Venkatasamy layout, 3 rd street sulur',
      address2: 'Coimbatore - 6313403',
      phone: '044- 653578'
    }
  ]);

  return (
    <div className="h-full flex flex-col relative">
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col h-full overflow-hidden relative z-0">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Manage Store</h2>
          <button className="px-5 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
            Add Store
          </button>
        </div>

        {/* Store List */}
        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {stores.map(store => (
            <div key={store.id} className="flex border border-slate-100 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-100/60 w-1/3 p-6 flex items-center justify-center border-r border-slate-100">
                <h3 className="font-bold text-slate-600">{store.branchName}</h3>
              </div>
              
              <div className="bg-white w-2/3 p-6 flex justify-between items-start">
                <div className="space-y-3">
                  <h4 className="text-slate-600 font-medium">{store.storeName}</h4>
                  <div className="text-slate-500 text-sm space-y-1">
                    <p>{store.address1}</p>
                    <p>{store.address2}</p>
                    <p className="pt-2">{store.phone}</p>
                  </div>
                </div>
                
                <button className="px-6 py-1.5 border border-primary text-primary rounded text-sm font-medium hover:bg-primary/5 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
};
