import React from "react";

const SectionHeader = ({ title, subtitle, className = "", color = "primary" }) => {
  const barColors = {
    primary: "bg-primary",
    navy: "bg-navy",
    whatsapp: "bg-whatsapp",
    red: "bg-red-500",
  };

  return (
    <div className={`flex flex-col gap-1 mb-2 px-2 ${className}`}>
      <div className="flex items-center gap-2">
        <div className={`w-1 h-6 rounded-full ${barColors[color] || barColors.primary}`}></div>
        <h2 className="text-lg md:text-xl font-black text-navy uppercase tracking-tight italic">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] ml-3">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
