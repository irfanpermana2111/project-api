"use client";

import { useState, useMemo } from "react";
import { fetchFromAPI } from "@/lib/api";
import { Building2, Search, Plus, Edit2, Trash2, MapPin } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Form";

interface KabkotaTabProps {
  kabko: any[];
  provinsi: any[];
  onRefresh: () => void;
}

export default function KabkotaTab({ kabko, provinsi, onRefresh }: KabkotaTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({ id: "", provinsi_id: "", nama: "" });
  const [submitting, setSubmitting] = useState(false);

  const filteredData = useMemo(() =>
    kabko.filter((item: any) => {
      const nama = (item.nama_kabko || item.nama || "").toLowerCase();
      const prov = (item.nama_provinsi || "").toLowerCase();
      return nama.includes(searchTerm.toLowerCase()) || prov.includes(searchTerm.toLowerCase());
    }), [searchTerm, kabko]);

  const openModal = (mode: string, item: any = null) => {
    setModalMode(mode);
    if (mode === "edit" && item) setFormData({ id: item.id, provinsi_id: item.provinsi_id || "", nama: item.nama_kabko || item.nama });
    else setFormData({ id: "", provinsi_id: "", nama: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setSubmitting(true);
    try {
      const payload = { provinsi_id: formData.provinsi_id, nama: formData.nama };
      if (modalMode === "add") await fetchFromAPI('/kabko', { method: 'POST', body: JSON.stringify(payload) });
      else await fetchFromAPI(`/kabko/${formData.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      setIsModalOpen(false); 
      onRefresh();
    } catch { 
      alert("Gagal menyimpan."); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus kabupaten/kota ini?")) return;
    await fetchFromAPI(`/kabko/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Building2 size={20} /></div>
          <p className="text-slate-400 text-sm">Total <span className="text-white font-bold">{filteredData.length}</span> kabupaten/kota</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => openModal("add")}>
          <Plus size={16} /> Tambah Kab/Kota
        </button>
      </div>

      <div className="glass-card p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input type="text" placeholder="Cari nama atau provinsi..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none text-white placeholder:text-slate-600" />
        </div>
      </div>

      <div className="glass-card overflow-hidden ring-1 ring-white/5">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/[0.03]">
              {["ID", "Nama Kab/Kota", "Provinsi", "Aksi"].map((h, i) => (
                <th key={h} className={`p-4 text-xs uppercase tracking-widest text-slate-500 font-bold border-b border-white/5 ${i === 3 ? "text-center" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredData.length > 0 ? filteredData.map((item: any, i: number) => (
              <tr key={item.id || i} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 text-slate-400 font-mono text-xs">{item.id || i + 1}</td>
                <td className="p-4 font-medium text-white">{item.nama_kabko || item.nama}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin size={12} className="text-slate-500" />
                    {item.nama_provinsi || "—"}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openModal("edit", item)} className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-indigo-400 transition-all"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="p-12 text-center text-slate-500 italic">Data tidak ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalMode === "add" ? "Tambah Kab/Kota" : "Edit Kab/Kota"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select 
            label="Pilih Provinsi" 
            required 
            value={formData.provinsi_id} 
            onChange={(e) => setFormData({ ...formData, provinsi_id: e.target.value })}
          >
            <option value="" disabled className="bg-[#1a1d2e]">-- Pilih Provinsi --</option>
            {provinsi.map((p: any) => (
              <option key={p.id} value={p.id} className="bg-[#1a1d2e]">{p.nama || p.nama_provinsi}</option>
            ))}
          </Select>
          
          <Input 
            label="Nama Kabupaten/Kota" 
            required 
            value={formData.nama} 
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            placeholder="Contoh: Kabupaten Sidoarjo" 
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
