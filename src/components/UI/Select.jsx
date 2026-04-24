import React from "react";
import { ChevronDown } from "lucide-react";

const Select = ({ label, name, value, onChange, options = [], required = false, helpText, className = "" }) => {
  return (
    <div className={`space-y-2 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
          {label} {required && <span className="text-primary">*</span>}
        </label>
      )}
      <div className="relative group">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full p-3.5 pr-10 rounded-xl bg-gray-50/50 border border-gray-200 transition-all focus:border-[#FF6B35] focus:bg-white focus:ring-0 font-bold text-navy appearance-none cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled} className={opt.className}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
          <ChevronDown size={20} />
        </div>
      </div>
      {helpText && (
        <p className="text-[9px] text-gray-400 font-bold px-1 uppercase tracking-tighter">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default Select;
