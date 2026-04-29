"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, MapPin, Building2, TrendingUp, ArrowRight, RefreshCcw } from "lucide-react";
import { fetchFromAPI } from "@/lib/api";
import Link from "next/link";

// --- Interfaces ---
interface Peserta {
  id: string | number;
  nama?: string;
  telepon?: string;
  nama_kabko?: string;
  kabko_id?: string | number;
}

interface Stats {
  provinsi: number;
  kabkota: number;
  peserta: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  delay: string;
  isNumber?: boolean;
}

// --- Sub-Components ---
function StatCard({ title, value, icon, delay, isNumber = false }: StatCardProps) {
  const displayValue = isNumber
    ? (value || 0).toLocaleString("id-ID")
    : value;

  return (
    <div
      className="glass-card group hover:border-indigo-500/30 transition-all duration-300 shadow-sm animate-slide-up"
      style={{ animationDelay: delay }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <h2 className="text-4xl font-bold mb-2 tracking-tight text-white">
        {displayValue}
      </h2>
      <div className="flex items-center gap-1.5 text-xs text-emerald-400/80">
        <TrendingUp size={14} />
        <span>Data Terkini</span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <div className="glass-card h-36 animate-pulse bg-white/5 border border-white/10" />;
}

// --- Main Component ---
export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ provinsi: 0, kabkota: 0, peserta: 0 });
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      // Menggunakan allSettled agar jika satu API down, dashboard tetap bisa render data lainnya
      const results = await Promise.allSettled([
        fetchFromAPI('/provinsi'),
        fetchFromAPI('/kabko'),
        fetchFromAPI('/peserta')
      ]);

      const provRes = results[0].status === 'fulfilled' ? results[0].value?.data : [];
      const kabRes = results[1].status === 'fulfilled' ? results[1].value?.data : [];
      const pesertaRes = results[2].status === 'fulfilled' ? results[2].value?.data : [];

      // Update Stats
      setStats({
        provinsi: Array.isArray(provRes) ? provRes.length : 0,
        kabkota: Array.isArray(kabRes) ? kabRes.length : 0,
        peserta: Array.isArray(pesertaRes) ? pesertaRes.length : 0,
      });

      // Update Recent Participants (Ambil 5 terbaru)
      if (Array.isArray(pesertaRes)) {
        const recent = [...pesertaRes].reverse().slice(0, 5);
        setPesertaList(recent);
      }

      // Trigger error view hanya jika semua request gagal total
      if (results.every(r => r.status === 'rejected')) {
        setError(true);
      }

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div className="p-4 bg-red-500/10 text-red-400 rounded-full">
          <RefreshCcw size={32} />
        </div>
        <p className="text-slate-400 font-medium">Gagal terhubung ke database.</p>
        <button
          onClick={fetchData}
          className="btn-primary flex items-center gap-2 px-6 py-2 rounded-full transition-all"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      <header className="animate-slide-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent inline-block">
          Dashboard Overview
        </h1>
        <p className="text-slate-400 mt-1 text-sm sm:text-base">
          Selamat datang kembali. Berikut adalah statistik data terbaru Anda.
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <>
          {/* Stats Cards Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Provinsi"
              value={stats.provinsi}
              icon={<MapPin size={20} />}
              delay="0ms"
            />
            <StatCard
              title="Total Kabupaten/Kota"
              value={stats.kabkota}
              icon={<Building2 size={20} />}
              delay="100ms"
            />
            <StatCard
              title="Total Peserta"
              value={stats.peserta}
              icon={<Users size={20} />}
              delay="200ms"
              isNumber
            />
          </section>

          {/* Table Section */}
          <section
            className="glass-card overflow-hidden ring-1 ring-white/5 shadow-2xl animate-slide-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="p-6 flex justify-between items-center border-b border-white/5 bg-white/[0.01]">
              <div>
                <h2 className="text-xl font-semibold text-white">Pendaftaran Terbaru</h2>
                <p className="text-slate-500 text-xs mt-1 italic">Menampilkan 5 data peserta terakhir.</p>
              </div>
              <Link
                href="/peserta"
                className="group flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-bold transition-all px-3 py-1.5 rounded-lg hover:bg-indigo-400/10"
              >
                Lihat Detail <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="p-4 text-[10px] uppercase tracking-widest text-slate-500 font-black border-b border-white/10">Nama Lengkap</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-slate-500 font-black border-b border-white/10 text-center text-nowrap">No. WhatsApp</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-slate-500 font-black border-b border-white/10">Domisili</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-slate-500 font-black border-b border-white/10 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pesertaList.length > 0 ? pesertaList.map((row) => (
                    <tr key={row.id} className="hover:bg-indigo-500/[0.03] transition-colors group">
                      <td className="p-4">
                        <div className="font-semibold text-slate-200 group-hover:text-white transition-colors capitalize">
                          {row.nama || 'Tanpa Nama'}
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-xs text-center">
                        {row.telepon || '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <MapPin size={12} className="text-indigo-500/40" />
                          <span className="truncate max-w-[150px]">
                            {row.nama_kabko || row.kabko_id || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Active
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="p-16 text-center text-slate-500 italic text-sm">
                        Belum ada data pendaftaran yang masuk.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}