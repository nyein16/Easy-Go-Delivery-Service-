import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DataEntryModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [shops, setShops] = useState<any[]>([]);
  const [shopId, setShopId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoAmount, setPhotoAmount] = useState(0);
  const [deliveryAmount, setDeliveryAmount] = useState(0);
  const [category, setCategory] = useState('Standard');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      supabase.from('shops').select('*').eq('is_active', true).then(({ data }) => setShops(data || []));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const deliveryId = `EG-${Math.floor(100000 + Math.random() * 900000)}`;
      const { error } = await supabase.from('deliveries').insert([{
        delivery_id: deliveryId,
        shop_id: shopId || null,
        customer_name: customerName,
        phone_number: phoneNumber,
        delivery_address: deliveryAddress,
        delivery_date: deliveryDate,
        photo_amount: photoAmount,
        delivery_amount: deliveryAmount,
        category,
        delivery_notes: deliveryNotes,
        status: 'Pending'
      }]);

      if (error) throw error;
      alert(`ပါဆယ်အသစ် (${deliveryId}) အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။`);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-[#D20D1B] mb-4">+ ပါဆယ်အသစ် စာရင်းသွင်းရန် (Data Entry)</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Online Shop ရွေးချယ်ရန်</label>
            <select value={shopId} onChange={(e) => setShopId(e.target.value)} required className="w-full border rounded-lg p-2.5">
              <option value="">-- Shop ရွေးပါ --</option>
              {shops.map(s => <option key={s.id} value={s.id}>{s.shop_name} ({s.owner_name})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">ဝယ်ယူသူ အမည်</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className="w-full border rounded-lg p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">ဖုန်းနံပါတ်</label>
              <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="w-full border rounded-lg p-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">ပို့ဆောင်ရမည့် လိပ်စာ</label>
            <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required className="w-full border rounded-lg p-2.5" rows={2}></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">ပစ္စည်းတန်ဖိုး (Photo Amount)</label>
              <input type="number" value={photoAmount} onChange={(e) => setPhotoAmount(Number(e.target.value))} className="w-full border rounded-lg p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">ပို့ဆောင်ခ (Delivery Fee)</label>
              <input type="number" value={deliveryAmount} onChange={(e) => setDeliveryAmount(Number(e.target.value))} className="w-full border rounded-lg p-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">အမျိုးအစား (Category)</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded-lg p-2.5">
                <option value="Standard">Standard</option>
                <option value="MDY">MDY</option>
                <option value="NPT">NPT</option>
                <option value="Gate">Gate</option>
                <option value="Royal">Royal</option>
                <option value="Return Parcels">Return Parcels</option>
                <option value="Not Found Parcels">Not Found Parcels</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">ပို့ဆောင်မည့် ရက်စွဲ</label>
              <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} required className="w-full border rounded-lg p-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">မှတ်ချက် (Notes)</label>
            <input type="text" value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} className="w-full border rounded-lg p-2.5" />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg font-bold">မလုပ်တော့ပါ</button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-[#D20D1B] text-white rounded-lg font-bold hover:opacity-90">
              {loading ? 'သိမ်းဆည်းနေသည်...' : 'ပါဆယ် စာရင်းသွင်းမည်'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
