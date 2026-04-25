"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-red-100 shadow-sm">
          <div className="w-14 h-14 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center mb-5">
            <AlertCircle size={28} />
          </div>
          <h3 className="text-[15px] font-bold text-[#0F0F0F] mb-1">
            {this.props.fallbackTitle || "Something went wrong"}
          </h3>
          <p className="text-[12px] text-[#999] max-w-xs mb-6">
            {this.props.fallbackMessage ||
              "This section failed to load. You can try refreshing or continue using the rest of the page."}
          </p>
          <button
            onClick={() => this.handleReset()}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#0F0F0F] text-white text-[12px] font-semibold rounded-xl hover:bg-[#333] transition-all"
          >
            <RefreshCw size={13} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
