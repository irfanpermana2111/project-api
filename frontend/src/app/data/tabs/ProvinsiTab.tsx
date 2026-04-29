"use client";

import { useState, useMemo } from "react";
import { fetchFromAPI } from "@/lib/api";
import { MapPin, Search, Plus, Edit2, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Form";

interface ProvinsiTabProps {
  data: any[];
  onRefresh: () => void;
}

export default function ProvinsiTab({ data, onRefresh }: ProvinsiTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({ id: "", nama: "" });
  const [submitting, setSubmitting] = useState(false);

  const filteredData = useMemo(() =>
    data.filter((item: any) => (item.nama || item.nama_provinsi || "").toLowerCase().includes(searchTerm.toLowerCase())),
    [data, searchTerm]);

  const openModal = (mode: string, item: any = null) => {
    setModalMode(mode);
    setFormData(mode === "edit" ? { id: item.id, nama: item.nama || item.nama_provinsi } : { id: "", nama: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setSubmitting(true);
    try {
      const method = modalMode === "add" ? 'POST' : 'PUT';
      const url = modalMode === "add" ? '/provinsi' : `/provinsi/${formData.id}`;
      await fetchFromAPI(url, { method, body: JSON.stringify({ nama: formData.nama }) });
      setIsModalOpen(false); 
      onRefresh();
    } catch { 
      alert("Gagal menyimpan."); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus provinsi ini?")) return;
    await fetchFromAPI(`/provinsi/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><MapPin size={20} /></div>
          <p className="text-slate-400 text-sm">Total <span className="text-white font-bold">{filteredData.length}</span> provinsi</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => openModal("add")}>
          <Plus size={16} /> Tambah Provinsi
        </button>
      </div>

      <div className="glass-card p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input type="text" placeholder="Cari provinsi..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none text-white placeholder:text-slate-600" />
        </div>
      </div>

      <div className="glass-card overflow-hidden ring-1 ring-white/5">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/[0.03]">
              <th className="p-4 text-xs uppercase tracking-widest text-slate-500 font-bold border-b border-white/5">ID</th>
              <th className="p-4 text-xs uppercase tracking-widest text-slate-500 font-bold border-b border-white/5">Nama Provinsi</th>
              <th className="p-4 text-xs uppercase tracking-widest text-slate-500 font-bold border-b border-white/5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredData.length > 0 ? filteredData.map((item: any) => (
              <tr key={item.id} className="hover:bg-indigo-500/[0.03] transition-colors group">
                <td className="p-4 text-slate-400 font-mono text-sm">{item.id}</td>
                <td className="p-4 font-medium text-slate-200 group-hover:text-white uppercase">{item.nama || item.nama_provinsi}</td>
                <td className="p-4">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openModal("edit", item)} className="p-2 bg-white/5 hover:bg-indigo-500/20 rounded-lg text-indigo-400 border border-white/5 hover:border-indigo-500/30 transition-all"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-red-400 border border-white/5 hover:border-red-500/30 transition-all"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="p-12 text-center text-slate-500 italic">Data tidak ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalMode === "add" ? "Tambah Provinsi" : "Edit Provinsi"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Nama Provinsi" 
            required 
            autoFocus 
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            placeholder="Masukkan nama provinsi..."
          />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white border border-white/5">Batal</button>
            <button type="submit" disabled={submitting} className="flex-[2] py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-xl text-sm font-bold text-white">
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
