"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchFromAPI } from "@/lib/api";
import { Users, Search, Plus, X, Edit2, Trash2, Phone, MapPin, Calendar } from "lucide-react";

export default function PesertaPage() {
  const [data, setData] = useState([]);
  const [kabkoList, setKabkoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    id: "", nama: "", tempatlahir: "", tanggallahir: "",
    agama: "", alamat: "", telepon: "", jk: "L", hobi: "", foto: "", kabko_id: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resPeserta, resKabko] = await Promise.all([
        fetchFromAPI('/peserta'),
        fetchFromAPI('/kabko')
      ]);
      if (resPeserta.data) setData(resPeserta.data);
      if (resKabko.data) setKabkoList(resKabko.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter pencarian efisien menggunakan useMemo
  const filteredData = useMemo(() => {
    return data.filter((item: any) => {
      const searchTarget = `${item.nama} ${item.nama_kabko} ${item.telepon}`.toLowerCase();
      return searchTarget.includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, data]);

  const handleOpenModal = (mode: string, item: any = null) => {
    setModalMode(mode);
    if (mode === "edit" && item) {
      let formattedDate = "";
      if (item.tanggallahir) {
        formattedDate = new Date(item.tanggallahir).toISOString().split('T')[0];
      }

      setFormData({
        ...item,
        tanggallahir: formattedDate,
        jk: item.jk || "L"
      });
    } else {
      setFormData({ id: "", nama: "", tempatlahir: "", tanggallahir: "", agama: "", alamat: "", telepon: "", jk: "L", hobi: "", foto: "", kabko_id: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = modalMode === "add" ? 'POST' : 'PUT';
      const endpoint = modalMode === "add" ? '/peserta' : `/peserta/${formData.id}`;

      await fetchFromAPI(endpoint, {
        method,
        body: JSON.stringify(formData)
      });

      setIsModalOpen(false);
      loadData();
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus peserta ini?")) {
      try {
        await fetchFromAPI(`/peserta/${id}`, { method: 'DELETE' });
        loadData();
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  return (
    <div className="animate-slide-up p-4 md:p-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Data Peserta</h1>
            <p className="text-slate-400 text-sm">Manajemen seluruh peserta yang terdaftar di sistem.</p>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center" onClick={() => handleOpenModal("add")}>
          <Plus size={18} />
          Tambah Peserta
        </button>
      </header>

      {/* Search Section */}
      <div className="glass-card mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama, kota, atau nomor telepon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Memuat data peserta...</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto text-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="bg-white/5 p-4 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">Nama Lengkap</th>
                  <th className="bg-white/5 p-4 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">Info Peserta</th>
                  <th className="bg-white/5 p-4 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">Kontak & Wilayah</th>
                  <th className="bg-white/5 p-4 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
                    <td className="p-4 font-medium">
                      <div className="text-white">{item.nama}</div>
                      <div className="text-xs text-slate-500 font-mono mt-1">ID: {item.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.jk === 'L' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'}`}>
                          {item.jk === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar size={12} /> {item.tempatlahir || '-'}, {item.tanggallahir ? new Date(item.tanggallahir).toLocaleDateString('id-ID') : '-'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Phone size={14} className="text-indigo-400" /> {item.telepon || '-'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <MapPin size={14} /> {item.nama_kabko || item.kabko_id || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleOpenModal("edit", item)} className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-indigo-400 transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-500 italic">Data peserta tidak ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal CRUD - Diperluas untuk kenyamanan scrolling */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#1a1d2e] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl animate-slide-up my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">
                {modalMode === "add" ? "Tambah Peserta Baru" : "Update Data Peserta"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block tracking-wider">Informasi Dasar</label>
                  <hr className="border-white/5 mb-4" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nama Lengkap *</label>
                  <input type="text" required value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="form-input-custom" placeholder="Nama sesuai KTP" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Asal Kabupaten/Kota *</label>
                  <select required value={formData.kabko_id} onChange={(e) => setFormData({ ...formData, kabko_id: e.target.value })} className="form-input-custom appearance-none cursor-pointer">
                    <option value="" disabled>-- Pilih Wilayah --</option>
                    {kabkoList.map((kab: any) => (
                      <option key={kab.id} value={kab.id} className="bg-[#1a1d2e]">{kab.nama_kabko || kab.nama}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tempat Lahir</label>
                  <input type="text" value={formData.tempatlahir} onChange={(e) => setFormData({ ...formData, tempatlahir: e.target.value })} className="form-input-custom" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tanggal Lahir</label>
                  <input type="date" value={formData.tanggallahir} onChange={(e) => setFormData({ ...formData, tanggallahir: e.target.value })} className="form-input-custom" style={{ colorScheme: 'dark' }} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Jenis Kelamin</label>
                  <div className="flex gap-4 p-1 bg-black/20 rounded-lg border border-white/5">
                    {['L', 'P'].map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => setFormData({ ...formData, jk: gender })}
                        className={`flex-1 py-2 text-sm rounded-md transition-all ${formData.jk === gender ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        {gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Agama</label>
                  <select value={formData.agama} onChange={(e) => setFormData({ ...formData, agama: e.target.value })} className="form-input-custom">
                    <option value="">-- Pilih Agama --</option>
                    {["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"].map(a => (
                      <option key={a} value={a} className="bg-[#1a1d2e]">{a}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 mt-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block tracking-wider">Kontak & Tambahan</label>
                  <hr className="border-white/5 mb-4" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nomor Telepon</label>
                  <input type="text" value={formData.telepon} onChange={(e) => setFormData({ ...formData, telepon: e.target.value })} className="form-input-custom" placeholder="0812..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Hobi</label>
                  <input type="text" value={formData.hobi} onChange={(e) => setFormData({ ...formData, hobi: e.target.value })} className="form-input-custom" placeholder="Membaca, Musik, dll" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Alamat Lengkap</label>
                  <textarea rows={2} value={formData.alamat} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} className="form-input-custom resize-none"></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-300 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all">
                  {submitting ? "Menyimpan..." : "Simpan Peserta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS for reusability */}
      <style jsx global>{`
        .form-input-custom {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px border rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          color: white;
          transition: all 0.2s;
        }
        .form-input-custom:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 1px #6366f1;
        }
      `}</style>
    </div>
  );
}