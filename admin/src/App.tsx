import { useState, useEffect } from "react";
import { 
  Check, X, Search, Lock, LogOut, Trash2, Eye, RefreshCw, AlertCircle, Phone, User
} from "lucide-react";
import { PaymentRequest } from "./types";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [isLoading, setIsLoading] = useState(false);

  // Authenticate from local storage on reload
  useEffect(() => {
    const saved = localStorage.getItem("admin_secret_auth");
    if (saved === "Kwork.com") {
      setIsAuthenticated(true);
      fetchPayments("Kwork.com");
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "Kwork.com") {
      localStorage.setItem("admin_secret_auth", "Kwork.com");
      setIsAuthenticated(true);
      setLoginError("");
      fetchPayments("Kwork.com");
    } else {
      setLoginError("Noto‘g‘ri parol!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_secret_auth");
    setIsAuthenticated(false);
    setPayments([]);
  };

  const fetchPayments = async (pwd?: string) => {
    const auth = pwd || localStorage.getItem("admin_secret_auth") || "";
    if (!auth) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/payments?password=${encodeURIComponent(auth)}`, {
        headers: { "X-Admin-Password": auth }
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      } else {
        console.error("Failed to fetch payments");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "pending" | "approved" | "rejected") => {
    const auth = localStorage.getItem("admin_secret_auth") || "";
    if (!auth) return;
    try {
      const res = await fetch("/api/payments/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": auth
        },
        body: JSON.stringify({ id, status, password: auth })
      });
      if (res.ok) {
        setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllPayments = async () => {
    if (!confirm("Barcha to‘lovlarni o‘chirib yuborishni xohlaysizmi? Bu amalni orqaga qaytarib bo‘lmaydi!")) return;
    const auth = localStorage.getItem("admin_secret_auth") || "";
    if (!auth) return;
    try {
      const res = await fetch("/api/payments/clear", {
        method: "POST",
        headers: { "X-Admin-Password": auth }
      });
      if (res.ok) {
        setPayments([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter query
  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phoneNumber.includes(searchQuery) ||
      p.userId.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" ? true : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-sky-500">
        <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8 text-sky-500" />
          </div>
          <div className="space-y-1.5 font-sans">
            <h1 className="text-xl font-black text-white tracking-tight uppercase">Resyume AI</h1>
            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Administrative Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2 font-sans">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Admin Paroli</label>
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none rounded-2xl p-3.5 text-center text-white tracking-widest font-bold"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-500 font-bold">{loginError}</p>
            )}

            <button 
              type="submit"
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer shadow-md shadow-sky-950/20 active:scale-98 transition-all"
            >
              Tizimga kirish
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <header className="bg-slate-900 text-white border-b border-slate-950 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-sm tracking-tight shadow">
            📈
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight">RESYUME AI</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase leading-none">Admin System Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => fetchPayments()}
            className="p-2 bg-slate-800 hover:bg-slate-755 border border-slate-700/50 rounded-xl transition-all font-bold cursor-pointer text-slate-300 hover:text-white"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 bg-red-650 hover:bg-red-700 text-xs font-bold tracking-wider rounded-xl cursor-pointer shadow flex items-center gap-1.5 transition-all text-white border-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Chiqish</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Metric widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl shadow-inner">📋</div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jami ariza</p>
              <h4 className="text-xl font-extrabold text-slate-800">{payments.length} ta</h4>
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-xl shadow-inner font-bold">⌛</div>
            <div>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Kutilmoqda</p>
              <h4 className="text-xl font-extrabold text-amber-600">{payments.filter(p => p.status === 'pending').length} ta</h4>
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-xl shadow-inner">✅</div>
            <div>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Tasdiqlangan</p>
              <h4 className="text-xl font-extrabold text-emerald-600">{payments.filter(p => p.status === 'approved').length} ta</h4>
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-xl shadow-inner">❌</div>
            <div>
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Rad etilgan</p>
              <h4 className="text-xl font-extrabold text-rose-600">{payments.filter(p => p.status === 'rejected').length} ta</h4>
            </div>
          </div>
        </div>

        {/* Toolbar panel */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="F.I.SH., Telefon yoki Telegram ID bo‘yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Filter statuses */}
            <div className="bg-slate-100 p-0.5 rounded-xl flex items-center gap-0.5 flex-1 sm:flex-initial">
              {(["all", "pending", "approved", "rejected"] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer flex-1 sm:flex-initial border-0 ${
                    statusFilter === f ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {f === "all" ? "Barchasi" : f === "pending" ? "Kutayotgan" : f === "approved" ? "Tasdiqlangan" : "Rad etilgan"}
                </button>
              ))}
            </div>

            <button 
              type="button"
              onClick={clearAllPayments}
              className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 hover:border-rose-200 rounded-xl cursor-pointer flex items-center justify-center transition-all shadow-xs ml-auto sm:ml-0"
              title="Bazani tozalash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold uppercase tracking-wider">Arizalar mavjud emas</p>
              <p className="text-[10px] text-slate-450">Barcha mezonlarga mos to‘lov arizalari bo‘sh.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-450 uppercase tracking-widest select-none">
                    <th className="py-4 px-6">Mijoz ma‘lumotlari</th>
                    <th className="py-4 px-6">Telegram ID</th>
                    <th className="py-4 px-6 text-center">To‘lov rasmi</th>
                    <th className="py-4 px-6">Vaqt</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                  {filteredPayments.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-450" />
                            {req.fullName}
                          </p>
                          <a href={`tel:${req.phoneNumber}`} className="text-[10px] text-slate-500 hover:text-sky-600 font-bold flex items-center gap-1.5 cursor-pointer leading-none">
                            <Phone className="w-3 h-3" />
                            {req.phoneNumber}
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <code className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono text-[11px] leading-none font-bold">
                          {req.userId}
                        </code>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {req.screenshot ? (
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setZoomImage(req.screenshot)}
                              className="relative group w-12 h-12 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center cursor-zoom-in transition-all hover:scale-105 shadow-sm p-0"
                            >
                              <img src={req.screenshot} className="w-full h-full object-cover" alt="receipt mini" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold italic select-none">Yuklanmagan</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-semibold text-[11px]">
                        {req.timestamp}
                      </td>
                      <td className="py-4 px-6">
                        {req.status === "approved" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 leading-tight">
                            Tasdiqlangan
                          </span>
                        ) : req.status === "rejected" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 leading-tight">
                            Rad etilgan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 leading-tight">
                            Kutilmoqda
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-1.5">
                          {req.status !== "approved" && (
                            <button
                              type="button"
                              onClick={() => updateStatus(req.id, "approved")}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-xs font-black uppercase tracking-wider text-[10px] border-0"
                            >
                              <Check className="w-3 h-3" />
                              Tasdiqlash
                            </button>
                          )}
                          {req.status !== "rejected" && (
                            <button
                              type="button"
                              onClick={() => updateStatus(req.id, "rejected")}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-xs font-black uppercase tracking-wider text-[10px] border-0"
                            >
                              <X className="w-3 h-3" />
                              Rad etish
                            </button>
                          )}
                          {(req.status === "approved" || req.status === "rejected") && (
                            <button
                              type="button"
                              onClick={() => updateStatus(req.id, "pending")}
                              className="text-slate-400 hover:text-slate-650 hover:-translate-y-px transition-all font-bold underline cursor-pointer bg-transparent border-0"
                            >
                              Qayta tiklash
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Screenshot Viewer Modal Overlay */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-55 p-4 cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-auto rounded-3xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={zoomImage} className="w-full h-auto object-contain max-h-[80vh] bg-white border border-slate-200" alt="expanded receipt overlay" />
            <button 
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all cursor-pointer border-0 shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-950 py-5 text-center text-[10px] text-slate-500 font-bold tracking-widest leading-none select-none">
        独立管理者コントロールパネル • Resyume AI Engine • © 2026
      </footer>
    </div>
  );
}
