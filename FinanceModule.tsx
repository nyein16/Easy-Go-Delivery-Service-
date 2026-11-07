import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const FinanceModule: React.FC = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('deliveries').select('*').then(({ data }) => setDeliveries(data || []));
  }, []);

  const totalPhoto = deliveries.reduce((sum, d) => sum + Number(d.photo_amount || 0), 0);
  const totalDelivery = deliveries.reduce((sum, d) => sum + Number(d.delivery_amount || 0), 0);
  const totalCashCollected = deliveries.filter(d => d.status === 'Complete').reduce((sum, d) => sum + Number(d.photo_amount || 0) + Number(d.delivery_amount || 0), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#D20D1B]">ဘဏ္ဍာရေး စီမံခန့်ခွဲမှု (Finance Management)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm font-bold text-gray-500">စုစုပေါင်း ရရန်ရှိ Photo Amount</p>
          <p className="text-3xl font-black text-[#D20D1B] mt-2">{totalPhoto.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm font-bold text-gray-500">စုစုပေါင်း Delivery Fee</p>
          <p className="text-3xl font-black text-[#FFB900] mt-2">{totalDelivery.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm font-bold text-gray-500">ကောက်ခံရရှိပြီး ငွေပမာဏ (Cash In)</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{totalCashCollected.toLocaleString()} Ks</p>
        </div>
      </div>
    </div>
  );
};
