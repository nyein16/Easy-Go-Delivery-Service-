import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const WayCheckModule: React.FC = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchWayData = async () => {
    setLoading(true);
    const { data } = await supabase.from('deliveries').select('*, shops(shop_name), riders(rider_name)');
    setDeliveries(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchWayData(); }, []);

  const filtered = categoryFilter === 'All' ? deliveries : deliveries.filter(d => d.category === categoryFilter);
  const totalWays = filtered.length;
  const totalPhotoAmount = filtered.reduce((sum, d) => sum + Number(d.photo_amount || 0), 0);
  const totalDeliveryAmount = filtered.reduce((sum, d) => sum + Number(d.delivery_amount || 0), 0);

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#D20D1B]">Way Check စနစ် & ပါဆယ်စစ်ဆေးခြင်း</h2>
          <p className="text-sm text-gray-500">Photo Amount နှင့် Delivery Fee များကို သီးခြားစီ တိကျစွာ စစ်ဆေးခြင်း</p>
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border rounded-lg p-2 font-semibold">
          <option value="All">အမျိုးအစား အားလုံး</option>
          <option value="Standard">Standard Deliveries</option>
          <option value="MDY">MDY</option>
          <option value="NPT">NPT</option>
          <option value="Gate">Gate</option>
          <option value="Royal">Royal</option>
          <option value="Return Parcels">Return Parcels</option>
          <option value="Not Found Parcels">Not Found Parcels (မတွေ့ပါဆယ်)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <p className="text-xs font-bold text-red-700">စုစုပေါင်း Way အရေအတွက်</p>
          <p className="text-2xl font-black text-[#D20D1B] mt-1">{totalWays} Ways</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <p className="text-xs font-bold text-yellow-800">စုစုပေါင်း Photo Amount (ပစ္စည်းတန်ဖိုး)</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{totalPhotoAmount.toLocaleString()} Ks</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-xs font-bold text-blue-800">စုစုပေါင်း Delivery Fee (ပို့ခ)</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{totalDeliveryAmount.toLocaleString()} Ks</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="p-3">Delivery ID</th>
              <th className="p-3">Category</th>
              <th className="p-3">Shop</th>
              <th className="p-3">Rider</th>
              <th className="p-3">Photo Amt</th>
              <th className="p-3">Delivery Fee</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr> : filtered.map(d => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="p-3 font-bold text-[#D20D1B]">{d.delivery_id}</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-gray-200 rounded font-semibold text-xs">{d.category}</span></td>
                <td className="p-3">{d.shops?.shop_name || '-'}</td>
                <td className="p-3">{d.riders?.rider_name || 'မသတ်မှတ်ရသေး'}</td>
                <td className="p-3 font-semibold">{Number(d.photo_amount).toLocaleString()} Ks</td>
                <td className="p-3 font-semibold">{Number(d.delivery_amount).toLocaleString()} Ks</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-bold text-xs">{d.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
