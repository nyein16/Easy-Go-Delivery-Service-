import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import { DataEntryModal } from './components/DataEntryModal';
import { RiderAssignModal } from './components/RiderAssignModal';
import { WayCheckModule } from './components/WayCheckModule';
import { FinanceModule } from './components/FinanceModule';

function MainDashboard() {
  const { profile, signOut } = useAuth();
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'waycheck' | 'finance'>('dashboard');
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isDataEntryOpen, setIsDataEntryOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, pending: 0, complete: 0, photoAmt: 0 });

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      let query = supabase.from('deliveries').select('*, shops(shop_name), riders(rider_name)');
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      setDeliveries(data || []);
      const total = data.length;
      const pending = data.filter(d => d.status === 'Pending').length;
      const complete = data.filter(d => d.status === 'Complete').length;
      const photoAmt = data.reduce((sum, d) => sum + Number(d.photo_amount || 0), 0);

      setStats({ total, pending, complete, photoAmt });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) loadDeliveries();
  }, [profile]);

  return (
    <div className="flex min-h-screen bg-[#F5F6F8]">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-6">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-black text-[#D20D1B]">EASY</span>
          <span className="text-2xl font-black text-[#FFB900]">GO</span>
        </div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setCurrentTab('dashboard')} className={`w-full text-left px-4 py-2.5 rounded-lg font-bold ${currentTab === 'dashboard' ? 'bg-red-50 text-[#D20D1B]' : 'text-gray-600 hover:bg-gray-50'}`}>Dashboard</button>
          <button onClick={() => setIsDataEntryOpen(true)} className="w-full text-left px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 font-bold">+ Data Entry</button>
          <button onClick={() => setCurrentTab('waycheck')} className={`w-full text-left px-4 py-2.5 rounded-lg font-bold ${currentTab === 'waycheck' ? 'bg-red-50 text-[#D20D1B]' : 'text-gray-600 hover:bg-gray-50'}`}>Way Check</button>
          <button onClick={() => setCurrentTab('finance')} className={`w-full text-left px-4 py-2.5 rounded-lg font-bold ${currentTab === 'finance' ? 'bg-red-50 text-[#D20D1B]' : 'text-gray-600 hover:bg-gray-50'}`}>Finance</button>
        </nav>
        <button onClick={signOut} className="mt-auto py-2 px-4 bg-gray-100 text-red-600 rounded-lg font-bold hover:bg-red-50">Logout</button>
      </aside>

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">EASY GO Management System</h1>
            <p className="text-sm text-gray-500">Account: {profile?.full_name} ({profile?.role?.toUpperCase()})</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsDataEntryOpen(true)} className="px-4 py-2 bg-[#D20D1B] text-white font-bold rounded-lg hover:opacity-90">+ ပါဆယ်အသစ်ထည့်မည်</button>
          </div>
        </header>

        {currentTab === 'waycheck' && <WayCheckModule />}
        {currentTab === 'finance' && <FinanceModule />}

        {currentTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-semibold text-gray-500">Total Deliveries</p>
                <p className="text-3xl font-black text-[#D20D1B] mt-2">{stats.total}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-semibold text-gray-500">Pending Ways</p>
                <p className="text-3xl font-black text-amber-500 mt-2">{stats.pending}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-semibold text-gray-500">Completed</p>
                <p className="text-3xl font-black text-emerald-600 mt-2">{stats.complete}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-semibold text-gray-500">Total Photo Amount</p>
                <p className="text-2xl font-black text-gray-800 mt-2">{stats.photoAmt.toLocaleString()} Ks</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-200 font-bold text-gray-800">ပါဆယ် စာရင်းနှင့် Rider တာဝန်ပေးမှုများ</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                      <th className="p-4">Delivery ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Shop</th>
                      <th className="p-4">Assigned Rider</th>
                      <th className="p-4">Photo Amt</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {loading ? (
                      <tr><td colSpan={8} className="p-6 text-center text-gray-500">Loading deliveries...</td></tr>
                    ) : deliveries.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-[#D20D1B]">{d.delivery_id}</td>
                        <td className="p-4">{d.customer_name}</td>
                        <td className="p-4">{d.phone_number}</td>
                        <td className="p-4">{d.shops?.shop_name || '-'}</td>
                        <td className="p-4 font-semibold text-gray-700">{d.riders?.rider_name || 'မသတ်မှတ်ရသေး'}</td>
                        <td className="p-4">{Number(d.photo_amount).toLocaleString()} Ks</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            d.status === 'Complete' ? 'bg-emerald-100 text-emerald-800' :
                            d.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => { setSelectedDelivery(d); setIsAssignOpen(true); }}
                            className="px-3 py-1 bg-[#FFB900] text-gray-900 rounded font-bold text-xs hover:opacity-90"
                          >
                            Assign Rider
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <DataEntryModal isOpen={isDataEntryOpen} onClose={() => setIsDataEntryOpen(false)} onSuccess={loadDeliveries} />
        <RiderAssignModal isOpen={isAssignOpen} delivery={selectedDelivery} onClose={() => setIsAssignOpen(false)} onSuccess={loadDeliveries} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  );
}
