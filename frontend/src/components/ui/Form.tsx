"use client";

import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface BaseProps {
  label?: string;
  error?: string;
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;
type SelectProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { options?: { value: string | number, label: string }[] };
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

const baseCls = "w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50";
const labelCls = "block text-sm font-medium text-slate-300 mb-1.5";

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className={labelCls}>{label}</label>}
      <input className={`${baseCls} ${className}`} {...props} />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

export function Select({ label, error, options, className = "", children, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className={labelCls}>{label}</label>}
      <div className="relative">
        <select className={`${baseCls} appearance-none ${className}`} {...props}>
          {children}
          {options?.map(opt => <option key={opt.value} value={opt.value} className="bg-[#1a1d2e]">{opt.label}</option>)}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-2 h-2 border-r-2 border-b-2 border-slate-500 rotate-45" />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && <label className={labelCls}>{label}</label>}
      <textarea className={`${baseCls} resize-none ${className}`} {...props} />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
