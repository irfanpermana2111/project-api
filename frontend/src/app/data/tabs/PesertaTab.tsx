"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchFromAPI } from "@/lib/api";
import { Users, Search, Plus, Edit2, Trash2, Phone, MapPin, Calendar } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Form";

const AGAMA = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];
const EMPTY_FORM = { id: "", nama: "", tempatlahir: "", tanggallahir: "", agama: "", alamat: "", telepon: "", jk: "L", hobi: "", foto: "", kabko_id: "" };

interface PesertaTabProps {
  kabko: any[];
  onRefresh: () => void;
}

export default function PesertaTab({ kabko, onRefresh }: PesertaTabProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const rP = await fetchFromAPI('/peserta');
      if (rP.data) setData(rP.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredData = useMemo(() =>
    data.filter((item: any) =>
      `${item.nama} ${item.nama_kabko} ${item.telepon}`.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm, data]);

  const openModal = (mode: string, item: any = null) => {
    setModalMode(mode);
    if (mode === "edit" && item) {
      const tgl = item.tanggallahir ? new Date(item.tanggallahir).toISOString().split('T')[0] : "";
      setFormData({ ...item, tanggallahir: tgl, jk: item.jk || "L" });
    } else setFormData({ ...EMPTY_FORM });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setSubmitting(true);
    try {
      const method = modalMode === "add" ? 'POST' : 'PUT';
      const url = modalMode === "add" ? '/peserta' : `/peserta/${formData.id}`;
      await fetchFromAPI(url, { method, body: JSON.stringify(formData) });
      setIsModalOpen(false); 
      loadData();
    } catch { 
      alert("Gagal menyimpan."); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus peserta ini?")) return;
    await fetchFromAPI(`/peserta/${id}`, { method: 'DELETE' });
    loadData();
  };

  const set = (field: string, val: string) => setFormData(prev => ({ ...prev, [field]: val }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Users size={20} /></div>
          <p className="text-slate-400 text-sm">Total <span className="text-white font-bold">{filteredData.length}</span> peserta terdaftar</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => openModal("add")}>
          <Plus size={16} /> Tambah Peserta
        </button>
      </div>

      <div className="glass-card p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input type="text" placeholder="Cari nama, kota, atau telepon..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none text-white placeholder:text-slate-600" />
        </div>
      </div>

      <div className="glass-card overflow-hidden ring-1 ring-white/5">
        {loading ? (
          <div className="flex justify-center items-center h-48 gap-3">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Memuat...</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.03]">
                  {["Nama Lengkap", "Info Peserta", "Kontak & Wilayah", "Aksi"].map((h, i) => (
                    <th key={h} className={`p-4 text-xs uppercase tracking-widest text-slate-500 font-bold border-b border-white/5 ${i === 3 ? "text-center" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredData.length > 0 ? filteredData.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="text-white font-medium">{item.nama}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {item.id}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.jk === 'L' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'}`}>
                        {item.jk === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <Calendar size={11} /> {item.tempatlahir || '-'}, {item.tanggallahir ? new Date(item.tanggallahir).toLocaleDateString('id-ID') : '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-300"><Phone size={13} className="text-indigo-400" /> {item.telepon || '-'}</div>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mt-0.5"><MapPin size={13} /> {item.nama_kabko || item.kabko_id || '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openModal("edit", item)} className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-indigo-400 transition-all"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="p-12 text-center text-slate-500 italic">Data peserta tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalMode === "add" ? "Tambah Peserta" : "Edit Peserta"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2"><p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-white/5 pb-2">Informasi Dasar</p></div>

            <Input 
              label="Nama Lengkap *" 
              required 
              value={formData.nama} 
              onChange={(e) => set("nama", e.target.value)}
              placeholder="Nama sesuai KTP" 
            />

            <Select 
              label="Asal Kabupaten/Kota *" 
              required 
              value={formData.kabko_id} 
              onChange={(e) => set("kabko_id", e.target.value)}
            >
              <option value="" disabled className="bg-[#1a1d2e]">-- Pilih Wilayah --</option>
              {kabko.map((k: any) => <option key={k.id} value={k.id} className="bg-[#1a1d2e]">{k.nama_kabko || k.nama}</option>)}
            </Select>

            <Input 
              label="Tempat Lahir" 
              value={formData.tempatlahir} 
              onChange={(e) => set("tempatlahir", e.target.value)}
              placeholder="Kota/Kabupaten" 
            />

            <Input 
              label="Tanggal Lahir" 
              type="date" 
              value={formData.tanggallahir} 
              onChange={(e) => set("tanggallahir", e.target.value)}
              style={{ colorScheme: 'dark' }} 
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Jenis Kelamin</label>
              <div className="flex gap-2 p-1 bg-black/20 rounded-lg border border-white/5">
                {['L', 'P'].map(g => (
                  <button key={g} type="button" onClick={() => set("jk", g)}
                    className={`flex-1 py-2 text-sm rounded-md transition-all ${formData.jk === g ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    {g === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </button>
                ))}
              </div>
            </div>

            <Select 
              label="Agama" 
              value={formData.agama} 
              onChange={(e) => set("agama", e.target.value)}
            >
              <option value="" className="bg-[#1a1d2e]">-- Pilih Agama --</option>
              {AGAMA.map(a => <option key={a} value={a} className="bg-[#1a1d2e]">{a}</option>)}
            </Select>

            <div className="md:col-span-2"><p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-white/5 pb-2 mt-2">Kontak & Tambahan</p></div>

            <Input 
              label="Nomor Telepon" 
              value={formData.telepon} 
              onChange={(e) => set("telepon", e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0812..." 
            />

            <Input 
              label="Hobi" 
              value={formData.hobi} 
              onChange={(e) => set("hobi", e.target.value)}
              placeholder="Membaca, Musik, dll" 
            />

            <div className="md:col-span-2">
              <Textarea 
                label="Alamat Lengkap" 
                rows={2} 
                value={formData.alamat} 
                onChange={(e) => set("alamat", e.target.value)} 
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white border border-white/5">Batal</button>
            <button type="submit" disabled={submitting} className="flex-[2] py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-xl text-sm font-bold text-white">
              {submitting ? "Menyimpan..." : "Simpan Peserta"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
