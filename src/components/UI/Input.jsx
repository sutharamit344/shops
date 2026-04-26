import React from "react";

const Input = ({ label, name, placeholder, value, onChange, type = "text", required = false, helpText, icon: Icon, error, className = "", ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-[11px] font-semibold text-[#1A1F36]/40 uppercase tracking-[0.08em] pl-1">
          {label} {required && <span className="text-[#FF6B35]">*</span>}
        </label>
      )}
      <div className="relative group">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full h-11 px-4 rounded-xl border bg-white text-[14px] font-medium text-[#1A1F36] placeholder:text-[#bbb] transition-all outline-none 
            ${error 
              ? "border-red-400 focus:ring-2 focus:ring-red-100" 
              : "border-black/10 focus:border-[#FF6B35]/60 focus:ring-2 focus:ring-[#FF6B35]/15"
            } 
            ${Icon ? "pl-11" : ""}`}
          {...props}
        />
        {Icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? "text-red-400" : "text-[#1A1F36]/20 group-focus-within:text-[#FF6B35]"}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      {(error || helpText) && (
        <p className={`text-[11px] font-semibold px-1 ${error ? "text-red-500 flex items-center gap-1" : "text-[#1A1F36]/40 uppercase tracking-tighter"}`}>
          {error && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
          {error || helpText}
        </p>
      )}
    </div>
  );
};

export default Input;
