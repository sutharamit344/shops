"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { closeModal, setInputValue } from "@/redux/slices/modalSlice";
import Dialog from "@/components/UI/Dialog";
import { AlertCircle, CheckCircle2, HelpCircle, Info } from "lucide-react";

const ModalContainer = () => {
  const dispatch = useDispatch();
  const modal = useSelector((state) => state.modal);

  const handleClose = () => {
    dispatch(closeModal());
  };

  const getIcon = () => {
    switch (modal.type) {
      case "success": return CheckCircle2;
      case "error": return AlertCircle;
      case "confirm": return HelpCircle;
      default: return Info;
    }
  };

  const getIconColor = () => {
    switch (modal.type) {
      case "success": return "text-green-500 bg-green-50";
      case "error": return "text-red-500 bg-red-50";
      case "confirm": return "text-[#FF6B35] bg-[#FF6B35]/10";
      default: return "text-blue-500 bg-blue-50";
    }
  };

  if (!modal.isOpen) return null;

  return (
    <Dialog
      isOpen={modal.isOpen}
      onClose={handleClose}
      title={modal.title}
      showClose={false}
    >
      <div className="space-y-6 py-2">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${getIconColor()}`}>
            {React.createElement(getIcon(), { size: 24 })}
          </div>
          <div className="space-y-1">
            <p className="text-[15px] text-[#444] leading-relaxed">
              {modal.message}
            </p>
          </div>
        </div>

        {modal.showInput && (
          <div className="pt-2">
            <input
              type="text"
              value={modal.inputValue}
              onChange={(e) => dispatch(setInputValue(e.target.value))}
              className="w-full h-12 bg-gray-50 border border-black/[0.06] rounded-xl px-4 text-[14px] outline-none focus:border-[#FF6B35] transition-all"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  modal.onConfirm?.(modal.inputValue);
                  handleClose();
                }
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          {(modal.type === "confirm" || modal.type === "prompt") && (
            <button
              onClick={() => {
                modal.onCancel?.();
                handleClose();
              }}
              className="flex-1 h-12 rounded-xl text-[13px] font-bold text-[#666] bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
            >
              {modal.cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (modal.onConfirm) {
                modal.onConfirm(modal.inputValue);
              }
              handleClose();
            }}
            className={`flex-1 h-12 rounded-xl text-[13px] font-bold text-white transition-all active:scale-95 shadow-lg ${
              modal.type === "error" ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : 
              modal.type === "success" ? "bg-green-500 hover:bg-green-600 shadow-green-500/20" : 
              "bg-[#0F0F0F] hover:bg-[#333] shadow-black/10"
            }`}
          >
            {modal.confirmText}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ModalContainer;
