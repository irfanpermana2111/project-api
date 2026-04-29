"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchFromAPI } from "@/lib/api";
import { MapPin, Search, Plus, X, Edit2, Trash2 } from "lucide-react";

export default function ProvinsiPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State untuk pencarian
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({ id: "", nama: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchFromAPI('/provinsi');
      if (response.data) setData(response.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter data berdasarkan pencarian secara real-time
  const filteredData = useMemo(() => {
    return data.filter((item: any) => {
      const name = item.nama || item.nama_provinsi || "";
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm]);

  const handleOpenModal = (mode: string, item: any = null) => {
    setModalMode(mode);
    setFormData(mode === "edit" ? { id: item.id, nama: item.nama || item.nama_provinsi } : { id: "", nama: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = modalMode === "add" ? 'POST' : 'PUT';
      const url = modalMode === "add" ? '/provinsi' : `/provinsi/${formData.id}`;
      await fetchFromAPI(url, {
        method,
        body: JSON.stringify({ nama: formData.nama })
      });
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus provinsi ini?")) {
      try {
        await fetchFromAPI(`/provinsi/${id}`, { method: 'DELETE' });
        loadData();
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  return (
    <div className="animate-slide-up max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 ring-1 ring-indigo-500/20">
            <MapPin size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Data Provinsi</h1>
            <p className="text-slate-400 text-sm">Total {filteredData.length} provinsi ditemukan</p>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2 shadow-lg shadow-indigo-500/20" onClick={() => handleOpenModal("add")}>
          <Plus size={18} />
          Tambah Provinsi
        </button>
      </header>

      {/* Filter & Search */}
      <div className="glass-card mb-6 p-2 ring-1 ring-white/5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Cari provinsi (contoh: Jakarta, Bali...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent rounded-lg pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden ring-1 ring-white/5">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm animate-pulse">Memperbarui data...</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
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
                  <tr key={item.id} className="group hover:bg-indigo-500/[0.03] transition-colors">
                    <td className="p-4 text-slate-400 font-mono text-sm">{item.id}</td>
                    <td className="p-4 font-medium text-slate-200 group-hover:text-white transition-colors uppercase">
                      {item.nama || item.nama_provinsi}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenModal("edit", item)}
                          className="p-2 bg-white/5 hover:bg-indigo-500/20 rounded-lg text-indigo-400 border border-white/5 hover:border-indigo-500/30 transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-red-400 border border-white/5 hover:border-red-500/30 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="p-12 text-center text-slate-500 italic">
                      Data tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal CRUD dengan Backdrop Click */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)} // Klik luar untuk tutup
        >
          <div
            className="bg-[#1a1d2e] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden shadow-black/50"
            onClick={(e) => e.stopPropagation()} // Mencegah tutup saat klik dalam modal
          >
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.01]">
              <h2 className="text-xl font-bold text-white">
                {modalMode === "add" ? "Tambah Provinsi" : "Edit Provinsi"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-8">
                <label className="block text-xs uppercase tracking-widest font-bold text-slate-500 mb-3 ml-1">Nama Provinsi</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder:text-slate-700 shadow-inner"
                  placeholder="Masukkan nama provinsi..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold text-white transition-all border border-white/5"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all"
                >
                  {submitting ? "Proses..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}