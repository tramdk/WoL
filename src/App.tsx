import React, { useState, useEffect } from 'react';
import { Power, Plus, Trash2, Monitor, Server, Wifi, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface Device {
  id: string;
  name: string;
  mac: string;
  address?: string;
}

export default function App() {
  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem('wol-devices');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: '', mac: '', address: '' });
  const [statusMsg, setStatusMsg] = useState<{text: string, type: 'success'|'error'} | null>(null);
  const [wakingId, setWakingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('wol-devices', JSON.stringify(devices));
  }, [devices]);

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevice.name || !newDevice.mac) return;
    
    // Basic MAC address validation
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(newDevice.mac)) {
      setStatusMsg({ text: 'Định dạng địa chỉ MAC không hợp lệ (VD: 00:1A:2B:3C:4D:5E)', type: 'error' });
      return;
    }

    const device: Device = {
      id: crypto.randomUUID(),
      name: newDevice.name,
      mac: newDevice.mac,
      address: newDevice.address || undefined
    };

    setDevices([...devices, device]);
    setNewDevice({ name: '', mac: '', address: '' });
    setShowAddForm(false);
    setStatusMsg({ text: 'Đã thêm thiết bị thành công', type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleDelete = (id: string) => {
    setDevices(devices.filter(d => d.id !== id));
  };

  const handleWake = async (device: Device) => {
    setWakingId(device.id);
    try {
      const res = await fetch('/api/wake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac: device.mac, address: device.address })
      });
      
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ text: `Đã gửi tín hiệu khởi động đến ${device.name}`, type: 'success' });
      } else {
        setStatusMsg({ text: data.error || 'Lỗi khi gửi tín hiệu', type: 'error' });
      }
    } catch (err) {
      setStatusMsg({ text: 'Lỗi kết nối đến máy chủ', type: 'error' });
    } finally {
      setWakingId(null);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto p-6">
        
        <header className="flex items-center justify-between py-8 border-b border-neutral-800 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Power className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Wake-on-LAN</h1>
              <p className="text-neutral-400 text-sm">Khởi động máy tính từ xa</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Thêm thiết bị
          </button>
        </header>

        {/* Cảnh báo về mạng */}
        <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-4 items-start">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-200/80">
            <strong className="text-amber-400 block mb-1">Lưu ý quan trọng:</strong>
            Website này đang chạy trên Cloud. Để Wake-on-LAN hoạt động, bạn cần cấu hình Router ở nhà (Port Forwarding UDP cổng 7/9) và nhập IP Public (hoặc DDNS) vào ô "IP / Domain". Nếu chỉ dùng MAC, website cần được host trên cùng mạng LAN với máy tính.
          </div>
        </div>

        {statusMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-6 text-sm font-medium ${
              statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {statusMsg.text}
          </motion.div>
        )}

        {showAddForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-8 overflow-hidden"
            onSubmit={handleAddDevice}
          >
            <h2 className="text-lg font-medium mb-4">Thêm máy tính mới</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Tên thiết bị</label>
                <input 
                  type="text" 
                  required
                  placeholder="VD: PC Phòng làm việc"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  value={newDevice.name}
                  onChange={e => setNewDevice({...newDevice, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Địa chỉ MAC</label>
                <input 
                  type="text" 
                  required
                  placeholder="00:1A:2B:3C:4D:5E"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  value={newDevice.mac}
                  onChange={e => setNewDevice({...newDevice, mac: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">IP / Domain (Tùy chọn)</label>
                <input 
                  type="text" 
                  placeholder="VD: myhome.ddns.net"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  value={newDevice.address}
                  onChange={e => setNewDevice({...newDevice, address: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Hủy
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-sm font-semibold rounded-lg transition-colors"
              >
                Lưu thiết bị
              </button>
            </div>
          </motion.form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.length === 0 ? (
            <div className="col-span-full py-12 text-center text-neutral-500 border border-dashed border-neutral-800 rounded-2xl">
              <Server className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Chưa có thiết bị nào. Hãy thêm máy tính của bạn.</p>
            </div>
          ) : (
            devices.map((device) => (
              <motion.div 
                key={device.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 group hover:border-neutral-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-neutral-800 rounded-lg">
                      <Monitor className="w-5 h-5 text-neutral-300" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-100">{device.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                        <span className="font-mono">{device.mac}</span>
                        {device.address && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Wifi className="w-3 h-3" />
                              {device.address}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(device.id)}
                    className="p-2 text-neutral-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Xóa thiết bị"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => handleWake(device)}
                  disabled={wakingId === device.id}
                  className="w-full py-3 flex items-center justify-center gap-2 bg-neutral-800 hover:bg-emerald-500 hover:text-neutral-950 text-neutral-300 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Power className={`w-4 h-4 ${wakingId === device.id ? 'animate-pulse text-emerald-500' : ''}`} />
                  {wakingId === device.id ? 'Đang gửi tín hiệu...' : 'Khởi động (Wake)'}
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
