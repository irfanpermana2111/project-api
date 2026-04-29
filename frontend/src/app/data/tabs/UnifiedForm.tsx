"use client";

import { useEffect, useState } from "react";
import { fetchFromAPI } from "@/lib/api";
import { X, MapPin, Building2, Users, Plus, CheckCircle2, Loader2, Info } from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/Form";

const AGAMA_OPTIONS = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];

interface UnifiedFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface PesertaState {
  nama: string;
  tempatlahir: string;
  tanggallahir: string;
  agama: string;
  alamat: string;
  telepon: string;
  jk: "L" | "P";
  hobi: string;
}

export default function UnifiedForm({ onClose, onSuccess }: UnifiedFormProps) {
  const [provinsiList, setProvinsiList] = useState<any[]>([]);
  const [kabkoList, setKabkoList] = useState<any[]>([]);
  const [fetching, setFetching] = useState({ prov: false, kab: false });

  const [provinsiMode, setProvinsiMode] = useState<"select" | "new">("select");
  const [selectedProvinsiId, setSelectedProvinsiId] = useState("");
  const [newProvinsiName, setNewProvinsiName] = useState("");

  const [kabkoMode, setKabkoMode] = useState<"select" | "new">("select");
  const [selectedKabkoId, setSelectedKabkoId] = useState("");
  const [newKabkoName, setNewKabkoName] = useState("");

  const [peserta, setPeserta] = useState<PesertaState>({
    nama: "", tempatlahir: "", tanggallahir: "", agama: "",
    alamat: "", telepon: "", jk: "L", hobi: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setFetching(f => ({ ...f, prov: true }));
    fetchFromAPI('/provinsi')
      .then(r => { if (r.data) setProvinsiList(r.data); })
      .catch(err => console.error("Gagal load provinsi:", err))
      .finally(() => setFetching(f => ({ ...f, prov: false })));
  }, []);

  useEffect(() => {
    if (provinsiMode === "new") {
      setKabkoMode("new");
      setKabkoList([]);
      return;
    }

    if (!selectedProvinsiId) {
      setKabkoList([]);
      return;
    }

    setFetching(f => ({ ...f, kab: true }));
    fetchFromAPI(`/kabko?provinsi_id=${selectedProvinsiId}`)
      .then(r => {
        if (r.data) {
          setKabkoList(r.data);
          if (r.data.length > 0) setKabkoMode("select");
          else setKabkoMode("new");
        }
      })
      .catch(err => console.error("Gagal load kabko:", err))
      .finally(() => setFetching(f => ({ ...f, kab: false })));
  }, [selectedProvinsiId, provinsiMode]);

  const updatePeserta = (field: keyof PesertaState, val: string) => {
    setPeserta(p => ({ ...p, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (provinsiMode === "new" && !newProvinsiName.trim()) return alert("Nama provinsi baru harus diisi");
    if (kabkoMode === "new" && !newKabkoName.trim()) return alert("Nama kabupaten baru harus diisi");
    if (!peserta.nama.trim()) return alert("Nama peserta harus diisi");

    setSubmitting(true);
    try {
      let finalProvinsiId = selectedProvinsiId;
      if (provinsiMode === "new") {
        const resProv = await fetchFromAPI('/provinsi', {
          method: 'POST',
          body: JSON.stringify({ nama: newProvinsiName.trim() })
        });
        finalProvinsiId = resProv.data?.id || resProv.id;
        if (!finalProvinsiId) throw new Error("Gagal mendaftarkan provinsi baru.");
      }

      let finalKabkoId = selectedKabkoId;
      if (kabkoMode === "new") {
        const resKab = await fetchFromAPI('/kabko', {
          method: 'POST',
          body: JSON.stringify({ provinsi_id: finalProvinsiId, nama: newKabkoName.trim() })
        });
        finalKabkoId = resKab.data?.id || resKab.id;
        if (!finalKabkoId) throw new Error("Gagal mendaftarkan kabupaten baru.");
      }

      await fetchFromAPI('/peserta', {
        method: 'POST',
        body: JSON.stringify({ ...peserta, nama: peserta.nama.trim(), kabko_id: finalKabkoId })
      });

      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const labelCls = "block text-sm font-semibold text-slate-400 mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl my-auto animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02] rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-white">Entry Data Terpadu</h2>
            <p className="text-slate-400 text-xs mt-1">Lengkapi data wilayah dan identitas peserta secara bersamaan.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-all"><X size={20} /></button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="bg-emerald-500/20 p-5 rounded-full ring-8 ring-emerald-500/5">
              <CheckCircle2 size={52} className="text-emerald-400 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-2xl">Pendaftaran Berhasil!</p>
              <p className="text-slate-500 mt-1">Data master dan peserta telah diperbarui.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 border-b border-white/5 pb-2">
                <MapPin size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">Bagian 1: Lokasi Provinsi</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                <button type="button" onClick={() => setProvinsiMode("select")} className={`py-2 text-xs font-bold rounded-lg transition-all ${provinsiMode === "select" ? "bg-indigo-600 text-white" : "text-slate-500"}`}>PILIH LOKASI</button>
                <button type="button" onClick={() => setProvinsiMode("new")} className={`py-2 text-xs font-bold rounded-lg transition-all ${provinsiMode === "new" ? "bg-emerald-600 text-white" : "text-slate-500"}`}>+ PROVINSI BARU</button>
              </div>
              {provinsiMode === "select" ? (
                <Select required value={selectedProvinsiId} onChange={e => { setSelectedProvinsiId(e.target.value); setSelectedKabkoId(""); }}>
                  <option value="" disabled>{fetching.prov ? "Memproses data..." : "-- Pilih Provinsi --"}</option>
                  {provinsiList.map(p => <option key={p.id} value={p.id} className="bg-[#1a1d2e]">{p.nama || p.nama_provinsi}</option>)}
                </Select>
              ) : (
                <Input required value={newProvinsiName} onChange={e => setNewProvinsiName(e.target.value)} placeholder="Contoh: Jawa Tengah" />
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 border-b border-white/5 pb-2">
                <Building2 size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">Bagian 2: Kabupaten / Kota</h3>
              </div>
              {provinsiMode === "select" ? (
                <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                  <button type="button" onClick={() => setKabkoMode("select")} className={`py-2 text-xs font-bold rounded-lg transition-all ${kabkoMode === "select" ? "bg-indigo-600 text-white" : "text-slate-500"}`}>PILIH KOTA</button>
                  <button type="button" onClick={() => setKabkoMode("new")} className={`py-2 text-xs font-bold rounded-lg transition-all ${kabkoMode === "new" ? "bg-emerald-600 text-white" : "text-slate-500"}`}>+ KOTA BARU</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300 italic">
                  <Info size={14} className="shrink-0" /> Otomatis membuat data Kota baru untuk Provinsi baru.
                </div>
              )}
              {kabkoMode === "select" ? (
                <Select required value={selectedKabkoId} onChange={e => setSelectedKabkoId(e.target.value)}>
                  <option value="" disabled>{fetching.kab ? "Mencari kota..." : "-- Pilih Kabupaten/Kota --"}</option>
                  {kabkoList.map(k => <option key={k.id} value={k.id} className="bg-[#1a1d2e]">{k.nama || k.nama_kabko}</option>)}
                </Select>
              ) : (
                <Input required value={newKabkoName} onChange={e => setNewKabkoName(e.target.value)} placeholder="Contoh: Semarang" />
              )}
            </section>

            <section className="space-y-5">
              <div className="flex items-center gap-2 text-indigo-400 border-b border-white/5 pb-2">
                <Users size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">Bagian 3: Profil Peserta</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Input label="Nama Lengkap *" required value={peserta.nama} onChange={e => updatePeserta("nama", e.target.value)} placeholder="Nama sesuai tanda pengenal" />
                </div>
                <Select label="Agama" value={peserta.agama} onChange={e => updatePeserta("agama", e.target.value)}>
                  <option value="">Pilih Agama</option>
                  {AGAMA_OPTIONS.map(a => <option key={a} value={a} className="bg-[#1a1d2e]">{a}</option>)}
                </Select>
                <Input label="No. WhatsApp" value={peserta.telepon} onChange={e => updatePeserta("telepon", e.target.value.replace(/[^0-9]/g, ""))} placeholder="08xxxxxxxxxx" />
                <div>
                  <label className={labelCls}>Jenis Kelamin</label>
                  <div className="flex gap-2">
                    {(['L', 'P'] as const).map(g => (
                      <button key={g} type="button" onClick={() => updatePeserta("jk", g)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${peserta.jk === g ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-black/20 border-white/5 text-slate-500 hover:text-slate-300'}`}>
                        {g === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </button>
                    ))}
                  </div>
                </div>
                <Input label="Tempat Lahir" value={peserta.tempatlahir} onChange={e => updatePeserta("tempatlahir", e.target.value)} placeholder="Kota/Kabupaten" />
                <Input label="Tanggal Lahir" type="date" value={peserta.tanggallahir} onChange={e => updatePeserta("tanggallahir", e.target.value)} style={{ colorScheme: 'dark' }} />
                <div className="md:col-span-2">
                  <Textarea label="Alamat Domisili" value={peserta.alamat} onChange={e => updatePeserta("alamat", e.target.value)} className="min-h-[100px]" placeholder="Alamat lengkap..." />
                </div>
                <div className="md:col-span-2">
                  <Input label="Hobi" value={peserta.hobi} onChange={e => updatePeserta("hobi", e.target.value)} placeholder="Membaca, Renang, dll" />
                </div>
              </div>
            </section>

            <div className="flex gap-4 pt-6 sticky bottom-0 bg-[#0f111a] pb-2">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold text-white transition-all">Batal</button>
              <button type="submit" disabled={submitting} className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-2xl text-sm font-black text-white shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3">
                {submitting ? <><Loader2 size={20} className="animate-spin" /> MENGIRIM DATA...</> : "KONFIRMASI PENDAFTARAN"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}