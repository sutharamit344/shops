import React from "react";

const Textarea = ({ label, name, placeholder, value, onChange, rows = 4, required = false, helpText, className = "", ...props }) => {
  return (
    <div className={`space-y-2 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
          {label} {required && <span className="text-primary">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full p-3.5 rounded-xl bg-gray-50/50 border border-gray-200 transition-all focus:border-[#FF6B35] focus:bg-white focus:ring-0 font-bold text-navy placeholder:text-gray-300 leading-relaxed"
        {...props}
      />
      {helpText && (
        <p className="text-[9px] text-gray-400 font-bold px-1 uppercase tracking-tighter">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default Textarea;
