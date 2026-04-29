"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchFromAPI } from "@/lib/api";
import { MapPin, Building2, Users, PlusCircle } from "lucide-react";
import ProvinsiTab from "./tabs/ProvinsiTab";
import KabkotaTab from "./tabs/KabkotaTab";
import PesertaTab from "./tabs/PesertaTab";
import UnifiedForm from "./tabs/UnifiedForm";

const TABS = [
  { key: "provinsi", label: "Provinsi", icon: MapPin },
  { key: "kabkota", label: "Kabupaten/Kota", icon: Building2 },
  { key: "peserta", label: "Peserta", icon: Users },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function DataPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("provinsi");
  const [isUnifiedModalOpen, setIsUnifiedModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State Master Data (Centralized)
  const [masterData, setMasterData] = useState<{ provinsi: any[], kabko: any[] }>({ provinsi: [], kabko: [] });

  const loadMasterData = useCallback(async () => {
    try {
      const [rP, rK] = await Promise.all([fetchFromAPI('/provinsi'), fetchFromAPI('/kabko')]);
      setMasterData({ 
        provinsi: rP.data || [], 
        kabko: rK.data || [] 
      });
    } catch (e) { console.error("Gagal load master data:", e); }
  }, []);

  useEffect(() => { loadMasterData(); }, [loadMasterData, refreshTrigger]);

  // Gunakan useCallback untuk menghindari re-render yang tidak perlu pada modal
  const handleUnifiedSuccess = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="animate-slide-up space-y-6 p-1">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent inline-block">
            Data Master
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Kelola data wilayah dan pendaftaran peserta dalam satu manajemen terpadu.
          </p>
        </div>

        <button
          onClick={() => setIsUnifiedModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle size={18} />
          <span>Input Data Lengkap</span>
        </button>
      </header>

      {/* Tab Navigation */}
      <nav className="flex gap-1.5 bg-white/[0.03] p-1.5 rounded-2xl w-fit border border-white/5 backdrop-blur-sm">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === key
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/40"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
          >
            <Icon size={16} className={activeTab === key ? "animate-pulse" : ""} />
            {label}
          </button>
        ))}
      </nav>

      {/* Tab Content Section */}
      <main className="relative min-h-[400px]">
        {/* Gunakan refreshTrigger sebagai 'key' pada wrapper konten agar 
           semua data di dalam tab ter-reset otomatis saat form unified sukses.
        */}
        <div key={refreshTrigger} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "provinsi" && <ProvinsiTab data={masterData.provinsi} onRefresh={loadMasterData} />}
          {activeTab === "kabkota" && <KabkotaTab kabko={masterData.kabko} provinsi={masterData.provinsi} onRefresh={loadMasterData} />}
          {activeTab === "peserta" && <PesertaTab kabko={masterData.kabko} onRefresh={loadMasterData} />}
        </div>
      </main>

      {/* Unified Modal */}
      {isUnifiedModalOpen && (
        <UnifiedForm
          onClose={() => setIsUnifiedModalOpen(false)}
          onSuccess={handleUnifiedSuccess}
        />
      )}
    </div>
  );
}