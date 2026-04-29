"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchFromAPI } from "@/lib/api";
import { Building2, Search, Plus, X, Edit2, Trash2, MapPin } from "lucide-react";

export default function KabKotaPage() {
  const [data, setData] = useState([]);
  const [provinsiList, setProvinsiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({ id: "", provinsi_id: "", nama: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resKabko, resProv] = await Promise.all([
        fetchFromAPI('/kabko'),
        fetchFromAPI('/provinsi')
      ]);
      if (resKabko.data) setData(resKabko.data);
      if (resProv.data) setProvinsiList(resProv.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter pencarian secara Client-side untuk performa cepat
  const filteredData = useMemo(() => {
    return data.filter((item: any) => {
      const nama = (item.nama_kabko || item.nama || "").toLowerCase();
      const provinsi = (item.nama_provinsi || "").toLowerCase();
      return nama.includes(searchTerm.toLowerCase()) || provinsi.includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, data]);

  const handleOpenModal = (mode: string, item: any = null) => {
    setModalMode(mode);
    if (mode === "edit" && item) {
      setFormData({
        id: item.id,
        provinsi_id: item.provinsi_id || "",
        nama: item.nama_kabko || item.nama
      });
    } else {
      setFormData({ id: "", provinsi_id: "", nama: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { provinsi_id: formData.provinsi_id, nama: formData.nama };
      if (modalMode === "add") {
        await fetchFromAPI('/kabko', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      } else {
        await fetchFromAPI(`/kabko/${formData.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      alert("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kabupaten/kota ini?")) {
      try {
        await fetchFromAPI(`/kabko/${id}`, { method: 'DELETE' });
        loadData();
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  return (
    <div className="animate-slide-up p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Data Kabupaten/Kota</h1>
            <p className="text-slate-400 text-sm">Kelola informasi wilayah tingkat dua.</p>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => handleOpenModal("add")}>
          <Plus size={18} />
          Tambah Kab/Kota
        </button>
      </header>

      {/* Search Bar */}
      <div className="glass-card mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama kabupaten, kota, atau provinsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm animate-pulse">Memuat data...</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="bg-white/5 p-4 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">ID</th>
                  <th className="bg-white/5 p-4 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">Nama Kab/Kota</th>
                  <th className="bg-white/5 p-4 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">Provinsi</th>
                  <th className="bg-white/5 p-4 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((item: any, i: number) => (
                  <tr key={item.id || i} className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
                    <td className="p-4 text-slate-400 font-mono text-xs">{item.id || i + 1}</td>
                    <td className="p-4">
                      <div className="font-medium text-white">{item.nama_kabko || item.nama}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin size={14} className="text-slate-500" />
                        {item.nama_provinsi || "Provinsi tidak ditemukan"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal("edit", item)}
                          className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-indigo-400 transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <div className="text-slate-500 italic">Data tidak ditemukan atau belum ada.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 transition-opacity"
          onClick={() => setIsModalOpen(false)} // Close on backdrop click
        >
          <div
            className="bg-[#1a1d2e] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">
                {modalMode === "add" ? "Tambah Kabupaten/Kota" : "Edit Kabupaten/Kota"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Pilih Provinsi</label>
                <div className="relative">
                  <select
                    required
                    value={formData.provinsi_id}
                    onChange={(e) => setFormData({ ...formData, provinsi_id: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#1a1d2e]">-- Pilih Provinsi --</option>
                    {provinsiList.map((prov: any) => (
                      <option key={prov.id} value={prov.id} className="bg-[#1a1d2e]">
                        {prov.nama || prov.nama_provinsi}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <Plus size={14} className="rotate-45" />
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-300 mb-2">Nama Kabupaten/Kota</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder:text-slate-600"
                  placeholder="Contoh: Kabupaten Sidoarjo"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
                >
                  {submitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}