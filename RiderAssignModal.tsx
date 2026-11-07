import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AssignProps {
  isOpen: boolean;
  delivery: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const RiderAssignModal: React.FC<AssignProps> = ({ isOpen, delivery, onClose, onSuccess }) => {
  const [riders, setRiders] = useState<any[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      supabase.from('riders').select('*').eq('is_active', true).then(({ data }) => setRiders(data || []));
    }
  }, [isOpen]);

  if (!isOpen || !delivery) return null;

  const handleAssign = async () => {
    if (!selectedRiderId) return alert('Rider တစ်ယောက် ရွေးချယ်ပေးပါ');
    setLoading(true);

    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ rider_id: selectedRiderId, status: 'Assigned', updated_at: new Date().toISOString() })
        .eq('id', delivery.id);

      if (error) throw error;
      alert(`ပါဆယ် (${delivery.delivery_id}) အား Rider သို့ အောင်မြင်စွာ တာဝန်ပေးပြီးပါပြီ။`);
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-[#D20D1B] mb-2">Rider တာဝန်ပေးအပ်ခြင်း (Assignment)</h2>
        <p className="text-sm text-gray-600 mb-4">Delivery ID: <strong>{delivery.delivery_id}</strong> ({delivery.customer_name})</p>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">တာဝန်ပေးမည့် Rider ရွေးပါ</label>
          <select value={selectedRiderId} onChange={(e) => setSelectedRiderId(e.target.value)} className="w-full border rounded-lg p-2.5">
            <option value="">-- Rider ရွေးပါ --</option>
            {riders.map(r => <option key={r.id} value={r.id}>{r.rider_name} ({r.phone})</option>)}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg font-bold">မလုပ်တော့ပါ</button>
          <button type="button" onClick={handleAssign} disabled={loading} className="px-5 py-2 bg-[#FFB900] text-gray-900 rounded-lg font-bold hover:opacity-90">
            {loading ? 'ဆောင်ရွက်နေသည်...' : 'တာဝန်ပေးမည်'}
          </button>
        </div>
      </div>
    </div>
  );
};
