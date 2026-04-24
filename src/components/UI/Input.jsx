import React from "react";

const Input = ({ label, name, placeholder, value, onChange, type = "text", required = false, helpText, icon: Icon, className = "", ...props }) => {
  return (
    <div className={`space-y-2 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
          {label} {required && <span className="text-primary">*</span>}
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
          className={`w-full p-3 px-4 rounded-xl bg-white/50 backdrop-blur-xl border border-gray-100 transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 font-bold text-navy placeholder:text-navy/20 text-sm ${Icon ? "pl-11" : ""}`}
          {...props}
        />
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-primary transition-colors">
            <Icon size={18} />
          </div>
        )}
      </div>
      {helpText && (
        <p className="text-[9px] text-navy/30 font-black px-1 uppercase tracking-tighter">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default Input;
