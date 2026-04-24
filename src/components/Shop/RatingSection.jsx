"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import Card from "@/components/UI/Card";
import Button from "@/components/UI/Button";
import { submitShopRating } from "@/lib/db";

export default function RatingSection({ shop, onSuccess }) {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (userRating === 0 || submitting || submitted) return;
    setSubmitting(true);
    const res = await submitShopRating(shop.id, userRating, comment, userName || "Customer");
    if (res.success) {
      setSubmitted(true);
      if (onSuccess) onSuccess();
    }
    setSubmitting(false);
  };

  return (
    <Card className="mb-8 p-8 rounded-md border-navy/5 bg-navy/5 backdrop-blur-xl text-center">
      <h3 className="text-xl font-black text-navy uppercase tracking-tight mb-1">Rate your experience</h3>
      <p className="text-[10px] text-navy/30 font-bold uppercase tracking-[0.4em] mb-8 italic">Support this local shop</p>

      <div className="flex flex-col items-center gap-8">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              variant="ghost"
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setUserRating(star)}
              disabled={submitting}
              className="p-1 shadow-none"
            >
              <Star
                size={36}
                className={star <= (hoverRating || userRating) ? "text-primary" : "text-navy/10"}
                fill={star <= (hoverRating || userRating) ? "currentColor" : "none"}
              />
            </Button>
          ))}
        </div>

        {userRating > 0 && !submitted && (
          <div className="w-full max-w-sm animate-in slide-in-from-bottom-4 duration-500 space-y-4 text-left">
            <div>
              <label className="text-[10px] font-black text-navy/20 uppercase tracking-[0.3em] block mb-2 px-1">Identity</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your Name"
                className="w-full p-4 rounded-md bg-white border border-navy/10 focus:border-primary/50 outline-none text-sm font-medium text-navy transition-all placeholder:text-navy/20"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-navy/20 uppercase tracking-[0.3em] block mb-2 px-1">Thoughts</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full p-4 rounded-md bg-white border border-navy/10 focus:border-primary/50 outline-none text-sm font-medium text-navy transition-all min-h-[100px] resize-none placeholder:text-navy/20"
              />
            </div>

            <Button onClick={handleSubmit} disabled={submitting} size="lg" className="w-full theme-bg-primary shadow-xl shadow-primary/20">
              {submitting ? "Processing..." : "Publish Review"}
            </Button>
          </div>
        )}

        {submitted && (
          <div className="animate-in zoom-in duration-500 text-center py-4">
             <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <Star size={24} fill="currentColor" />
             </div>
             <p className="text-primary font-black text-xs uppercase tracking-[0.3em]">Review Published!</p>
          </div>
        )}
      </div>
    </Card>
  );
}
