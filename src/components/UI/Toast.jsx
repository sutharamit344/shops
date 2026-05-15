"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { hideToast } from "@/redux/slices/toastSlice";
import { CircleCheckBig, CircleAlert, Info, X } from "lucide-react";

const Toast = () => {
  const { message, type, isVisible, id } = useSelector((state) => state.toast);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, id, dispatch]);

  if (!isVisible) return null;

  const styles = {
    success: {
      bg: "bg-[#0A0A0F]",
      border: "border-green-500/30",
      icon: <CircleCheckBig className="text-green-400" size={18} />,
      text: "text-white"
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-100",
      icon: <CircleAlert className="text-red-500" size={18} />,
      text: "text-red-800"
    },
    info: {
      bg: "bg-[#0A0A0F]",
      border: "border-blue-500/30",
      icon: <Info className="text-blue-400" size={18} />,
      text: "text-white"
    }
  };

  const current = styles[type] || styles.success;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full max-w-md animate-in slide-in-from-bottom-5 duration-500">
      <div className={`flex items-center gap-4 p-4 ${current.bg} border ${current.border} rounded-2xl shadow-2xl backdrop-blur-md`}>
        <div className="shrink-0">{current.icon}</div>
        <p className={`flex-1 text-[13px] font-bold ${current.text} leading-tight`}>{message}</p>
        <button 
          onClick={() => dispatch(hideToast())}
          className={`${current.text} opacity-40 hover:opacity-100 transition-opacity p-1`}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default Toast;

