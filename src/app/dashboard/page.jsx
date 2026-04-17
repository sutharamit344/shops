"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getShopsByOwner } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Card from "@/components/UI/Card";
import Button from "@/components/UI/Button";
import Link from "next/link";
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  ExternalLink, 
  Settings2,
  AlertCircle
} from "lucide-react";

const UserDashboard = () => {
  const { user, loading: authLoading, loginWithGoogle } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchMyShops = async () => {
        setLoading(true);
        const data = await getShopsByOwner(user.uid);
        setShops(data);
        setLoading(false);
      };
      fetchMyShops();
    }
  }, [user]);

  if (authLoading) return <div className="min-h-screen bg-cream flex items-center justify-center">Loading Dashboard...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-black text-navy mb-4">Sign In Required</h1>
          <p className="text-gray-500 mb-8">Please sign in to view your businesses and management tools.</p>
          <Button onClick={loginWithGoogle}>Sign In with Google</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-navy uppercase tracking-tight italic mb-2">My <span className="text-primary tracking-normal">Businesses</span></h1>
            <p className="text-gray-500 font-medium">Manage your shop presence and track approval status.</p>
          </div>
          <Link href="/create">
            <Button className="flex items-center gap-2 shadow-xl shadow-primary/20">
              <Plus size={20} /> Create New Shop
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="h-40 bg-white rounded-3xl animate-pulse border border-cream"></div>
            ))}
          </div>
        ) : shops.length === 0 ? (
          <Card className="p-16 text-center border-dashed border-2 border-cream bg-transparent">
             <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6 text-primary/40">
                <Building2 size={40} />
             </div>
             <h2 className="text-2xl font-black text-navy mb-2">No Shops Found</h2>
             <p className="text-gray-500 mb-8">You haven't added any businesses to ShopSetu yet.</p>
             <Link href="/create"><Button variant="outline">Get Started Now</Button></Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {shops.map(shop => (
              <Card key={shop.id} className="p-6 md:p-8 hover:shadow-2xl transition-all border-cream group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black text-navy uppercase tracking-tight group-hover:text-primary transition-colors">{shop.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                        shop.status === 'approved' 
                          ? 'bg-whatsapp/10 text-whatsapp border border-whatsapp/20' 
                          : 'bg-orange-100 text-orange-600 border border-orange-200'
                      }`}>
                        {shop.status === 'approved' ? (
                          <><CheckCircle2 size={12} /> Approved</>
                        ) : (
                          <><Clock size={12} /> Pending Review</>
                        )}
                      </span>
                    </div>
                    <p className="text-gray-500 font-medium text-sm line-clamp-1 mb-4">{shop.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                       <span className="flex items-center gap-1"><Building2 size={14} /> {shop.category}</span>
                       <span className="flex items-center gap-1">Located in {shop.city}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href={`/edit?id=${shop.id}`} className="flex-1 md:flex-none">
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2 text-sm font-black border-2 border-navy/5 hover:border-navy">
                        <Settings2 size={16} /> Edit
                      </Button>
                    </Link>
                    {shop.status === 'approved' && (
                      <Link href={`/${shop.city}/${shop.category}/${shop.slug}`}>
                        <Button className="w-full flex items-center justify-center gap-2 text-sm font-black shadow-lg shadow-primary/20 bg-navy hover:bg-black">
                           View Live <ExternalLink size={16} />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
