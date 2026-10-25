import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  BadgeCheck, MapPin, Zap, Clock, Store, Leaf, Flame, Receipt, Search, List, Map as MapIcon,
  X, Check, Plus, Minus, ScanLine, Package, Phone, ChevronLeft, Navigation, Bike, Award,
} from "lucide-react";
import bread from "@/assets/bread.jpg";
import bento from "@/assets/bento.jpg";
import cake from "@/assets/cake.jpg";
import drink from "@/assets/drink.jpg";
import salad from "@/assets/salad.jpg";
import logo from "@/assets/esap-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Eco Flash Sale — Giải cứu thực phẩm dư thừa gần bạn" },
      { name: "description", content: "Săn suất ăn dư thừa giảm tới 70% từ cửa hàng quanh bạn. Giữ chỗ, nhận vé QR, lấy món tại quầy." },
      { property: "og:title", content: "Eco Flash Sale — Giải cứu thực phẩm dư thừa" },
      { property: "og:description", content: "Kết nối cửa hàng và người tiêu dùng để giảm lãng phí thực phẩm theo thời gian thực." },
    ],
  }),
  component: App,
});

type Drop = {
  id: string; store: string; dist: number; title: string; img: string;
  orig: number; price: number; stock: number; cat: string; address: string; hotline: string;
};
type Order = { id: string; drop: Drop; slot: string; pay: string; total: number; status: "active" | "done" | "cancel"; createdAt: number };

const TLJ = { store: "Tous Les Jours - Lê Thanh Nghị", dist: 400, address: "68 Lê Thanh Nghị, Hai Bà Trưng", hotline: "1900 6066" };
const WIN = { store: "WinMart+ Tạ Quang Bửu", dist: 650, address: "12 Tạ Quang Bửu, Hai Bà Trưng", hotline: "024 7106 6866" };
const HLC = { store: "Highlands Coffee - Đại Cồ Việt", dist: 900, address: "35 Đại Cồ Việt, Hai Bà Trưng", hotline: "1900 1755" };

const INITIAL: Drop[] = [
  { id: "d1", ...TLJ, title: "Set 3 Bánh Mì Hoa Cúc & Croissant", img: bread, orig: 55000, price: 22000, stock: 2, cat: "bakery" },
  { id: "d2", ...WIN, title: "Cơm Bento Gà Teriyaki kèm Trứng cuộn", img: bento, orig: 65000, price: 32000, stock: 5, cat: "bento" },
  { id: "d3", ...HLC, title: "Combo 2 Trà Sữa & Cà Phê Sữa Đá", img: drink, orig: 78000, price: 35000, stock: 4, cat: "drink" },
  { id: "d4", ...WIN, title: "Hộp Trái Cây Mix & Salad Rau Xanh", img: salad, orig: 60000, price: 25000, stock: 3, cat: "fruit" },
  { id: "d5", store: "Paris Gâteaux - Bạch Mai", dist: 1600, address: "201 Bạch Mai, Hai Bà Trưng", hotline: "024 3628 1234", title: "Combo 2 Bánh Kem Dâu & Tiramisu", img: cake, orig: 90000, price: 36000, stock: 3, cat: "bakery" },
  { id: "d6", store: "Hokkaido Kitchen - Minh Khai", dist: 2600, address: "120 Minh Khai, Hai Bà Trưng", hotline: "0988 112 233", title: "Bento Cá Hồi Áp Chảo (cuối ngày)", img: bento, orig: 85000, price: 42000, stock: 1, cat: "bento" },
];

const CATS = [
  { k: "all", l: "Tất cả" }, { k: "bento", l: "🍱 Cơm & Bento" }, { k: "bakery", l: "🥐 Bánh & Pastry" },
  { k: "drink", l: "☕ Trà & Cà phê" }, { k: "fruit", l: "🥗 Trái cây & Salad" },
];
const PINS = [
  { ...WIN, x: 30, y: 30 }, { ...TLJ, x: 70, y: 38 }, { ...HLC, x: 60, y: 74 },
];
const SLOTS = ["18:00 - 18:30", "18:30 - 19:00", "19:00 - 19:30"];
const PAYS = ["ZaloPay", "MoMo", "VietQR"];
const FEE = 2000;

const vnd = (n: number) => n.toLocaleString("vi-VN") + "đ";
const pct = (d: Drop) => Math.round((1 - d.price / d.orig) * 100);
const pad = (n: number) => String(n).padStart(2, "0");
const hms = (s: number) => `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
const km = (m: number) => (m >= 1000 ? (m / 1000).toFixed(1) + "km" : m + "m");

function useCountdown(start: number) {
  const [s, setS] = useState(start);
  useEffect(() => {
    const t = setInterval(() => setS((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  return s;
}

function App() {
  const [role, setRole] = useState<"user" | "partner">("user");
  const [drops, setDrops] = useState(INITIAL);
  const [orders, setOrders] = useState<Order[]>([]);
  const [radius, setRadius] = useState(2);

  const reserve = (drop: Drop, slot: string, pay: string) => {
    const o: Order = { id: "EFS" + Math.random().toString(36).slice(2, 8).toUpperCase(), drop, slot, pay, total: drop.price + FEE, status: "active", createdAt: Date.now() };
    setDrops((ds) => ds.map((d) => (d.id === drop.id ? { ...d, stock: d.stock - 1 } : d)));
    setOrders((os) => [o, ...os]);
    return o;
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background text-foreground shadow-2xl relative">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <img src={logo.url} alt="esap" width={28} height={28} className="h-7 w-7 rounded-md" />
            <span className="truncate text-[15px] font-bold tracking-tight">Eco Flash Sale</span>
            <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
          </div>
          <div className="flex shrink-0 rounded-full bg-muted p-0.5 text-[11px] font-semibold">
            {(["user", "partner"] as const).map((r) => (
              <button key={r} onClick={() => setRole(r)}
                className={`rounded-full px-3 py-1.5 transition-all duration-200 ${role === r ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
                {r === "user" ? "Khách hàng" : "Cửa hàng"}
              </button>
            ))}
          </div>
        </div>
        {role === "user" && (
          <div className="border-t border-border px-4 py-2">
            <div className="flex items-center justify-between gap-2 text-[12px]">
              <span className="flex min-w-0 items-center gap-1 font-semibold">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" /><span className="truncate">ĐH Bách Khoa, Hai Bà Trưng</span>
              </span>
              <button className="shrink-0 text-[11.5px] font-semibold text-primary">Thay đổi</button>
            </div>
            <div className="mt-1.5 flex gap-1.5">
              {[1, 2, 3].map((r) => (
                <button key={r} onClick={() => setRadius(r)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${radius === r ? "border-primary bg-mint text-primary" : "border-border bg-card text-muted-foreground"}`}>
                  {r} km{r === 2 ? " (Mặc định)" : ""}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div key={role} className="flex flex-1 flex-col animate-in fade-in duration-300">
        {role === "user" ? (
          <Consumer drops={drops.filter((d) => d.dist <= radius * 1000)} radius={radius} orders={orders} setOrders={setOrders} reserve={reserve} />
        ) : (
          <Partner drops={drops} setDrops={setDrops} orders={orders} setOrders={setOrders} />
        )}
      </div>
    </div>
  );
}

/* ================= CONSUMER ================= */

function Consumer({ drops, radius, orders, setOrders, reserve }: {
  drops: Drop[]; radius: number; orders: Order[]; setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  reserve: (d: Drop, s: string, p: string) => Order;
}) {
  const [tab, setTab] = useState<"discover" | "orders" | "impact">("discover");
  const [checkout, setCheckout] = useState<Drop | null>(null);
  const [pass, setPass] = useState<Order | null>(null);

  return (
    <>
      <main className="flex-1 pb-20">
        {tab === "discover" && <Discover drops={drops} radius={radius} onReserve={setCheckout} />}
        {tab === "orders" && <Orders orders={orders} onOpen={setPass} onCancel={(id) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, status: "cancel" } : o)))} />}
        {tab === "impact" && <Impact orders={orders} />}
      </main>
      <BottomNav
        items={[
          { k: "discover", label: "Khám phá", icon: Flame },
          { k: "orders", label: "Đơn hàng", icon: Receipt, badge: orders.filter((o) => o.status === "active").length },
          { k: "impact", label: "Tôi & ESG", icon: Leaf },
        ]}
        active={tab} onChange={(k) => setTab(k as typeof tab)}
      />
      {checkout && (
        <CheckoutSheet drop={checkout} onClose={() => setCheckout(null)}
          onConfirm={(slot, pay) => { const o = reserve(checkout, slot, pay); setCheckout(null); setPass(o); }} />
      )}
      {pass && <PassView order={pass} onClose={() => { setPass(null); setTab("orders"); }} />}
    </>
  );
}

function Discover({ drops, radius, onReserve }: { drops: Drop[]; radius: number; onReserve: (d: Drop) => void }) {
  const left = useCountdown(1 * 3600 + 24 * 60 + 15);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [pin, setPin] = useState<(typeof PINS)[number] | null>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return drops.filter((d) => (cat === "all" || d.cat === cat) && (!s || (d.title + d.store).toLowerCase().includes(s)));
  }, [drops, cat, q]);

  return (
    <>
      <div className="space-y-2 px-3 pt-3">
        <div className="flex gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm bánh mì, bento, tiệm gần bạn..."
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground" />
          </label>
          <div className="flex shrink-0 rounded-full border border-border bg-card p-0.5">
            {([["list", List, "Danh sách"], ["map", MapIcon, "Bản đồ"]] as const).map(([k, I, l]) => (
              <button key={k} aria-label={l} onClick={() => setView(k)}
                className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${view === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                <I className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
        <div className="no-scrollbar -mx-3 flex gap-1.5 overflow-x-auto px-3 pb-0.5">
          {CATS.map((c) => (
            <button key={c.k} onClick={() => setCat(c.k)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${cat === c.k ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`}>
              {c.l}
            </button>
          ))}
        </div>
      </div>

      {view === "map" ? (
        <div className="p-3">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-mint">
            <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(var(--card) 3px, transparent 3px), linear-gradient(90deg, var(--card) 3px, transparent 3px)", backgroundSize: "56px 56px" }} />
            <div className="absolute left-0 right-0 top-[55%] h-3 bg-card" />
            <div className="absolute bottom-0 top-0 left-[42%] w-3 bg-card" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/40 bg-primary/10 transition-all duration-300"
              style={{ width: `${radius * 36}%`, aspectRatio: "1" }} />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="relative mx-auto flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-card bg-primary" />
              </span>
              <span className="mt-1 block whitespace-nowrap rounded bg-card px-1.5 py-0.5 text-[10px] font-semibold shadow-xs">Vị trí của bạn (ĐH Bách Khoa)</span>
            </div>
            {PINS.map((p) => (
              <button key={p.store} onClick={() => setPin(p)} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                <span className={`flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-[10.5px] font-bold shadow-sm ${pin?.store === p.store ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                  <Store className="h-3 w-3" />{p.store.split(" - ")[0]}
                </span>
                <span className="mx-auto block h-2 w-0.5 bg-primary" />
              </button>
            ))}
          </div>
          {pin && (
            <Sheet title={pin.store} onClose={() => setPin(null)}>
              <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" />{km(pin.dist)}</span>
                <span className="truncate">{pin.address}</span>
              </div>
              <p className="micro mt-4 mb-2">Deal đang mở</p>
              <div className="space-y-1.5">
                {drops.filter((d) => d.store === pin.store).map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2.5 text-[12.5px]">
                    <span className="truncate font-medium">{d.title}</span>
                    <span className="shrink-0 font-bold text-primary">{vnd(d.price)}</span>
                  </div>
                ))}
                {!drops.some((d) => d.store === pin.store) && <p className="text-[12px] text-muted-foreground">Chưa có deal trong bán kính này.</p>}
              </div>
              <button onClick={() => { setQ(pin.store.split(" - ")[0]!); setView("list"); setPin(null); }}
                className="mt-4 w-full rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground">Xem món</button>
            </Sheet>
          )}
        </div>
      ) : (
        <>
          <div className="sticky top-[118px] z-20 bg-background px-3 py-2.5">
            <div className="flex items-center justify-between gap-2 rounded-lg border border-urgent/20 bg-urgent-soft px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-urgent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-urgent" />
                </span>
                <span className="truncate text-[11.5px] font-semibold text-urgent">Khung giờ vàng xả kho: 17:30 - 20:00</span>
              </div>
              <span className="shrink-0 font-mono text-[12px] font-bold tabular-nums text-urgent">Còn {hms(left)}</span>
            </div>
          </div>
          <div className="px-3">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="micro">Suất ăn trong bán kính {radius}km</span>
              <span className="text-[11px] text-muted-foreground">{list.length} kết quả</span>
            </div>
            <div className="space-y-2.5">
              {list.map((d) => <DropCard key={d.id} d={d} onReserve={() => onReserve(d)} />)}
              {list.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Không có suất ăn phù hợp.</p>}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function DropCard({ d, onReserve }: { d: Drop; onReserve: () => void }) {
  const out = d.stock <= 0;
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2 text-[11px]">
        <Store className="h-3.5 w-3.5 text-primary" />
        <span className="truncate font-semibold">{d.store}</span>
        <span className="shrink-0 rounded-full border border-mint-border bg-mint px-1.5 py-px text-[10px] font-semibold text-primary">{km(d.dist)}</span>
      </div>
      <div className="flex gap-3 p-3">
        <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
          <img src={d.img} alt={d.title} loading="lazy" width={992} height={672} className="h-full w-full object-cover" />
          <span className="absolute left-1.5 top-1.5 rounded bg-urgent px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">-{pct(d)}%</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="line-clamp-2 text-[13.5px] font-semibold leading-snug">{d.title}</h3>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[16px] font-bold text-primary">{vnd(d.price)}</span>
            <span className="text-[11px] text-muted-foreground line-through">{vnd(d.orig)}</span>
          </div>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <span className={`rounded-md border px-1.5 py-0.5 text-[10.5px] font-semibold ${out ? "border-border bg-muted text-muted-foreground" : d.stock <= 2 ? "border-urgent/25 bg-urgent-soft text-urgent" : "border-mint-border bg-mint text-primary"}`}>
              {out ? "Đã hết" : `Còn ${d.stock} suất`}
            </span>
            <button disabled={out} onClick={onReserve}
              className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground transition active:scale-95 disabled:opacity-40">
              Giữ chỗ
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Sheet({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 animate-in fade-in" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl bg-card animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-[15px] font-bold">{title}</h2>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-md bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="no-scrollbar max-h-[75vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

function CheckoutSheet({ drop, onClose, onConfirm }: { drop: Drop; onClose: () => void; onConfirm: (s: string, p: string) => void }) {
  const [slot, setSlot] = useState<string>(SLOTS[0]!);
  const [pay, setPay] = useState<string>(PAYS[0]!);
  return (
    <Sheet title="Xác nhận giữ chỗ" onClose={onClose}>
      <div className="flex gap-3 rounded-lg border border-border p-2.5">
        <img src={drop.img} alt="" className="h-12 w-14 rounded-md object-cover" />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold">{drop.title}</p>
          <p className="truncate text-[11px] text-muted-foreground">{drop.store}</p>
        </div>
      </div>

      <p className="micro mt-4 mb-2">Khung giờ lấy món</p>
      <div className="grid grid-cols-3 gap-1.5">
        {SLOTS.map((s) => (
          <button key={s} onClick={() => setSlot(s)}
            className={`rounded-lg border py-2 text-[11.5px] font-semibold tabular-nums ${slot === s ? "border-primary bg-mint text-primary" : "border-border"}`}>{s}</button>
        ))}
      </div>

      <p className="micro mt-4 mb-2">Chi tiết thanh toán</p>
      <div className="space-y-1.5 rounded-lg border border-border p-3 text-[12.5px]">
        <Row l="Tiền hàng" r={vnd(drop.price)} />
        <Row l="Phí dịch vụ nền tảng" r={vnd(FEE)} />
        <div className="border-t border-dashed border-border pt-1.5"><Row l="Tổng thanh toán" r={vnd(drop.price + FEE)} bold /></div>
      </div>

      <p className="micro mt-4 mb-2">Phương thức thanh toán</p>
      <div className="grid grid-cols-3 gap-1.5">
        {PAYS.map((p) => (
          <button key={p} onClick={() => setPay(p)}
            className={`flex items-center justify-center gap-1 rounded-lg border py-2 text-[12px] font-semibold ${pay === p ? "border-primary bg-mint text-primary" : "border-border"}`}>
            {pay === p && <Check className="h-3.5 w-3.5" />}{p}
          </button>
        ))}
      </div>

      <button onClick={() => onConfirm(slot, pay)} className="mt-5 w-full rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground active:scale-[0.99]">
        Thanh toán & Nhận vé
      </button>
    </Sheet>
  );
}

function Row({ l, r, bold }: { l: string; r: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className={bold ? "font-bold" : "text-muted-foreground"}>{l}</span>
      <span className={`tabular-nums ${bold ? "font-bold text-primary" : "font-medium"}`}>{r}</span>
    </div>
  );
}

function PassView({ order, onClose }: { order: Order; onClose: () => void }) {
  const left = useCountdown(1 * 3600 + 45 * 60 + 20);
  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-background animate-in fade-in">
      <div className="no-scrollbar w-full max-w-md overflow-y-auto">
        <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-3">
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md bg-muted"><ChevronLeft className="h-4 w-4" /></button>
          <h2 className="text-[15px] font-bold">Vé nhận hàng điện tử</h2>
        </div>
        <div className="p-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="bg-primary px-4 py-3 text-primary-foreground">
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Pick-up Pass • {order.id}</p>
              <p className="mt-0.5 truncate text-[15px] font-bold">{order.drop.store}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 px-4 py-3 text-[12px]">
              <div><p className="micro">Khung giờ</p><p className="font-semibold tabular-nums">{order.slot}</p></div>
              <div><p className="micro">Thanh toán</p><p className="font-semibold">{order.pay}</p></div>
              <div className="text-right"><p className="micro">Tổng</p><p className="font-semibold text-primary">{vnd(order.total)}</p></div>
            </div>
            <div className="relative flex items-center">
              <span className="absolute -left-2.5 h-5 w-5 rounded-full border border-border bg-background" />
              <div className="mx-4 w-full border-t-2 border-dashed border-border" />
              <span className="absolute -right-2.5 h-5 w-5 rounded-full border border-border bg-background" />
            </div>
            <div className="flex flex-col items-center px-4 py-5">
              <div className="rounded-xl border border-border bg-card p-3">
                <QRCodeSVG value={`ECOFLASH:${order.id}:${order.drop.id}`} size={190} level="H" />
              </div>
              <p className="mt-2 font-mono text-[13px] font-bold tracking-[0.2em]">{order.id}</p>
              <p className="mt-1 text-center text-[12.5px] font-semibold">{order.drop.title}</p>
            </div>
            <div className="mx-4 mb-4 flex items-center gap-2 rounded-lg border border-urgent/20 bg-urgent-soft px-3 py-2">
              <Clock className="h-4 w-4 shrink-0 text-urgent" />
              <p className="text-[11.5px] leading-snug text-urgent">
                Hạn chót lấy hàng: <b>21:00</b> (Còn <b className="tabular-nums">{hms(left)}</b>). Quá hạn, thực phẩm sẽ được xử lý an toàn.
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2 rounded-xl border border-border bg-card p-3 text-[12.5px]">
            <p className="micro">Hướng dẫn nhận món</p>
            <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" />{order.drop.address}</p>
            <p className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-primary" />Hotline: {order.drop.hotline}</p>
            <p className="flex gap-2"><ScanLine className="h-4 w-4 shrink-0 text-primary" />Mở ứng dụng đưa mã này cho nhân viên thu ngân</p>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.drop.address + ", Hà Nội")}`} target="_blank" rel="noreferrer"
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-primary py-2.5 text-[13px] font-semibold text-primary">
              <Navigation className="h-4 w-4" />Chỉ đường (Google Maps)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Orders({ orders, onOpen, onCancel }: { orders: Order[]; onOpen: (o: Order) => void; onCancel: (id: string) => void }) {
  const [t, setT] = useState<Order["status"]>("active");
  const tabs: { k: Order["status"]; l: string }[] = [{ k: "active", l: "Chờ lấy món" }, { k: "done", l: "Đã nhận" }, { k: "cancel", l: "Đã hủy / Hết hạn" }];
  const list = orders.filter((o) => o.status === t);
  return (
    <div className="p-3">
      <div className="grid grid-cols-3 rounded-lg bg-muted p-0.5 text-[12px] font-semibold">
        {tabs.map((x) => (
          <button key={x.k} onClick={() => setT(x.k)} className={`truncate rounded-md py-1.5 ${t === x.k ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>{x.l}</button>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {list.map((o) => (
          <div key={o.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-muted-foreground">{o.id}</span>
              <span className="text-[11px] font-semibold tabular-nums text-primary">{o.slot}</span>
            </div>
            <p className="mt-1 truncate text-[13px] font-semibold">{o.drop.title}</p>
            <p className="truncate text-[11px] text-muted-foreground">{o.drop.store}</p>
            {o.status === "active" && (
              <div className="mt-2.5 flex gap-2">
                <button onClick={() => onOpen(o)} className="flex-1 rounded-lg bg-primary py-2 text-[12px] font-semibold text-primary-foreground">Xem vé QR</button>
                <button onClick={() => onCancel(o.id)} className="rounded-lg border border-border px-3 py-2 text-[12px] font-semibold text-muted-foreground">Hủy</button>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && <p className="py-12 text-center text-[13px] text-muted-foreground">Chưa có đơn nào.</p>}
      </div>
    </div>
  );
}

function Impact({ orders }: { orders: Order[] }) {
  const mine = orders.filter((o) => o.status !== "cancel");
  const meals = 8 + mine.length;
  const co2 = 14.5 + mine.length * 1.8;
  const saved = 320000 + mine.reduce((s, o) => s + (o.drop.orig - o.drop.price), 0);
  const goal = 10;
  const pctRank = Math.min(100, (meals / goal) * 100);
  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-[15px] font-bold text-primary-foreground">A</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold">Nguyễn Văn A</p>
          <p className="text-[11.5px] text-muted-foreground">0912 *** 678</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full border border-mint-border bg-mint px-2 py-0.5 text-[10.5px] font-semibold text-primary">
          <BadgeCheck className="h-3 w-3" />Xác thực qua Zalo
        </span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card">
        {[
          { v: String(meals), l: "Bữa ăn đã cứu" },
          { v: `${co2.toFixed(1)} kg`, l: "CO2e tránh phát thải" },
          { v: vnd(saved), l: "Tiền đã tiết kiệm" },
        ].map((s) => (
          <div key={s.l} className="min-w-0 px-2.5 py-3">
            <p className="truncate text-[16px] font-bold tabular-nums text-primary">{s.v}</p>
            <p className="micro mt-0.5 leading-tight">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <p className="text-[12.5px] font-semibold">Hạng: Đại Sứ Xanh</p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pctRank}%` }} />
        </div>
        <p className="mt-1.5 text-[11.5px] text-muted-foreground">
          {meals < goal ? `Cần ${goal - meals} bữa nữa để lên Đại Sứ Bạc` : "Bạn đã đủ điều kiện lên Đại Sứ Bạc!"}
        </p>
      </div>
      <div className="flex items-center gap-3 rounded-xl bg-primary p-4 text-primary-foreground">
        <Bike className="h-8 w-8 shrink-0 opacity-90" />
        <p className="text-[13px] leading-snug">
          Thành tích của bạn tương đương giảm thiểu <b className="text-[15px]">{Math.round(co2 * 8.35)} km</b> di chuyển xe máy
        </p>
      </div>
    </div>
  );
}

/* ================= PARTNER ================= */

type Pending = { id: string; customer: string; items: { name: string; qty: number }[]; total: number; pay: string; orderId?: string };

const SEED_PENDING: Pending[] = [
  { id: "EFS7K2Q9", customer: "Nguyễn Minh Anh", items: [{ name: "Set 3 Bánh Mì Hoa Cúc & Croissant", qty: 1 }], total: 22000, pay: "ZaloPay" },
  { id: "EFS3M8X1", customer: "Trần Quốc Huy", items: [{ name: "Bánh Su Kem (hộp 4)", qty: 2 }], total: 36000, pay: "MoMo" },
  { id: "EFS9P4D6", customer: "Lê Thu Hà", items: [{ name: "Bánh Sừng Bò Bơ Pháp", qty: 3 }], total: 30000, pay: "VietQR" },
];

function Partner({ drops, setDrops, orders, setOrders }: {
  drops: Drop[]; setDrops: React.Dispatch<React.SetStateAction<Drop[]>>;
  orders: Order[]; setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}) {
  const [tab, setTab] = useState<"list" | "handover">("list");
  const [listed, setListed] = useState(14);
  const [revenue, setRevenue] = useState(280000);
  const [seed, setSeed] = useState(SEED_PENDING);
  const [toast, setToast] = useState<string | null>(null);

  const pending: Pending[] = [
    ...orders.filter((o) => o.status === "active").map((o) => ({
      id: o.id, customer: "Khách Eco Flash", items: [{ name: o.drop.title, qty: 1 }], total: o.drop.price, pay: o.pay, orderId: o.id,
    })),
    ...seed,
  ];

  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(null), 2200); };

  const publish = (d: { name: string; orig: number; qty: number; disc: number }) => {
    const drop: Drop = {
      id: "m" + Date.now(), store: "Tous Les Jours - Lê Thanh Nghị", dist: 400, title: d.name, img: bread,
      orig: d.orig, price: Math.round((d.orig * (100 - d.disc)) / 100 / 1000) * 1000, stock: d.qty, cat: "bakery",
      address: "68 Lê Thanh Nghị, Hai Bà Trưng", hotline: "1900 6066",
    };
    setDrops((ds) => [drop, ...ds]);
    setListed((n) => n + d.qty);
    flash(`Đã đăng bán ${d.qty} suất "${d.name}" lên bảng tin khách hàng`);
  };

  const handover = (p: Pending) => {
    if (p.orderId) setOrders((os) => os.map((o) => (o.id === p.orderId ? { ...o, status: "done" } : o)));
    else setSeed((s) => s.filter((x) => x.id !== p.id));
    setRevenue((r) => r + p.total);
    flash(`Đã bàn giao đơn ${p.id} • +${vnd(p.total)}`);
  };

  return (
    <>
      <main className="flex-1 pb-20">
        <div className="space-y-2 p-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-mint text-primary"><Store className="h-4.5 w-4.5" /></div>
            <div className="min-w-0 flex-1">
              <p className="micro">Cửa hàng đối tác</p>
              <p className="text-[13px] font-bold leading-snug">Tous Les Jours - Chi nhánh Lê Thanh Nghị</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-md border border-mint-border bg-mint px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />Đang mở
            </span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card">
            {[
              { l: "Hàng đã xả", v: `${listed}`, u: "món" },
              { l: "Doanh thu thu hồi", v: revenue.toLocaleString("vi-VN"), u: "VNĐ", c: "text-primary" },
              { l: "Đơn chờ nhận", v: `${pending.length}`, u: "đơn", c: "text-urgent" },
            ].map((s) => (
              <div key={s.l} className="min-w-0 px-2.5 py-2.5">
                <p className="micro leading-tight">{s.l}</p>
                <p className={`mt-0.5 truncate text-[16px] font-bold tabular-nums ${s.c ?? ""}`}>{s.v} <span className="text-[10px] font-medium text-muted-foreground">{s.u}</span></p>
              </div>
            ))}
          </div>
        </div>
        {tab === "list" ? <FastListing onPublish={publish} /> : <Handover pending={pending} onHandover={handover} />}
      </main>

      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 w-[calc(100%-24px)] max-w-[420px] -translate-x-1/2 rounded-lg bg-foreground px-3 py-2.5 text-[12px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <span className="flex items-center gap-2"><Check className="h-4 w-4 shrink-0 text-mint-border" />{toast}</span>
        </div>
      )}

      <BottomNav
        items={[
          { k: "list", label: "Xả kho 1 chạm", icon: Package },
          { k: "handover", label: "Quét mã trả đồ", icon: ScanLine, badge: pending.length },
        ]}
        active={tab} onChange={(k) => setTab(k as typeof tab)}
      />
    </>
  );
}

function Viewfinder({ img, label }: { img?: string | undefined; label: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-foreground">
      {img && <img src={img} alt="" className="h-full w-full object-cover opacity-80" />}
      <div className="absolute inset-6 rounded-lg border-2 border-mint-border/80" />
      <div className="absolute inset-x-6 h-0.5 animate-scan bg-mint-border shadow-[0_0_12px_2px_var(--mint-border)]" />
      <p className="absolute inset-x-0 bottom-2 text-center text-[11px] font-semibold text-background">{label}</p>
    </div>
  );
}

function FastListing({ onPublish }: { onPublish: (d: { name: string; orig: number; qty: number; disc: number }) => void }) {
  const [name, setName] = useState("");
  const [orig, setOrig] = useState(0);
  const [qty, setQty] = useState(5);
  const [disc, setDisc] = useState(50);
  const [mode, setMode] = useState<null | "barcode" | "ai">(null);
  const [aiHit, setAiHit] = useState(false);

  useEffect(() => {
    if (!mode) return;
    const t = setTimeout(() => {
      if (mode === "barcode") { setName("Bánh Mì Bơ Tỏi Hàn Quốc"); setOrig(45000); setAiHit(false); }
      else { setName("Bánh Danish Nho"); setOrig(35000); setQty(5); setDisc(50); setAiHit(true); }
      setMode(null);
    }, mode === "ai" ? 1200 : 1500);
    return () => clearTimeout(t);
  }, [mode]);

  const price = Math.round((orig * (100 - disc)) / 100 / 1000) * 1000;
  const ready = name.trim() && orig > 0 && qty > 0;

  return (
    <div className="space-y-3 px-3">
      <div className="flex items-baseline justify-between"><span className="micro">Quản lý xả kho 1 chạm</span><span className="text-[11px] text-muted-foreground">Nhập nhanh</span></div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setMode("barcode")} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-left active:scale-[0.98]">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted"><ScanLine className="h-4.5 w-4.5" /></span>
          <span className="min-w-0"><span className="block text-[12.5px] font-bold">Quét Barcode</span><span className="block truncate text-[10.5px] text-muted-foreground">Tự điền tên & giá</span></span>
        </button>
        <button onClick={() => setMode("ai")} className="flex items-center gap-2 rounded-xl border border-mint-border bg-mint p-3 text-left active:scale-[0.98]">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"><Zap className="h-4.5 w-4.5" /></span>
          <span className="min-w-0"><span className="block text-[12.5px] font-bold text-primary">AI Vision</span><span className="block truncate text-[10.5px] text-muted-foreground">Chụp kệ, nhận diện</span></span>
        </button>
      </div>

      {mode && (
        <Sheet title={mode === "ai" ? "AI Vision nhận diện" : "Quét mã vạch"} onClose={() => setMode(null)}>
          <Viewfinder img={mode === "ai" ? cake : undefined} label={mode === "ai" ? "Đang phân tích kệ bánh..." : "Đưa mã vạch vào khung hình"} />
        </Sheet>
      )}

      <div className="space-y-3 rounded-xl border border-border bg-card p-3">
        {aiHit && (
          <div className="flex items-center gap-2 rounded-lg border border-mint-border bg-mint px-2.5 py-1.5 text-[11px] font-semibold text-primary">
            <BadgeCheck className="h-3.5 w-3.5" />AI phát hiện 5 bánh • Đề xuất giảm 50%
          </div>
        )}
        <label className="block">
          <span className="micro">Tên món</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Quét hoặc nhập tên món"
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-[13px] outline-none focus:border-primary" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="micro">Giá gốc (đ)</span>
            <input inputMode="numeric" value={orig ? orig.toLocaleString("vi-VN") : ""} onChange={(e) => setOrig(Number(e.target.value.replace(/\D/g, "")) || 0)} placeholder="0"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-[13px] tabular-nums outline-none focus:border-primary" />
          </label>
          <div>
            <span className="micro">Số lượng</span>
            <div className="mt-1 flex items-center justify-between rounded-lg border border-input">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-9 w-9 place-items-center"><Minus className="h-4 w-4" /></button>
              <span className="text-[14px] font-bold tabular-nums">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid h-9 w-9 place-items-center text-primary"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
        <div>
          <span className="micro">Mức giảm giá</span>
          <div className="mt-1 grid grid-cols-3 gap-1.5">
            {[30, 50, 70].map((p) => (
              <button key={p} onClick={() => setDisc(p)}
                className={`rounded-lg border py-2 text-[12.5px] font-bold ${disc === p ? "border-primary bg-mint text-primary" : "border-border"}`}>{p}%</button>
            ))}
          </div>
        </div>
        <div className="flex items-baseline justify-between border-t border-dashed border-border pt-2.5 text-[12px]">
          <span className="text-muted-foreground">Giá Flash Sale</span>
          <span><span className="mr-1.5 text-muted-foreground line-through">{vnd(orig)}</span><b className="text-[15px] text-primary">{vnd(price)}</b></span>
        </div>
        <button disabled={!ready} onClick={() => { onPublish({ name: name.trim(), orig, qty, disc }); setName(""); setOrig(0); setQty(5); setDisc(50); setAiHit(false); }}
          className="w-full rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground active:scale-[0.99] disabled:opacity-40">
          Đăng xả kho ngay
        </button>
      </div>
    </div>
  );
}

function Handover({ pending, onHandover }: { pending: Pending[]; onHandover: (p: Pending) => void }) {
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState<Pending | null>(null);

  useEffect(() => {
    if (!scanning) return;
    const t = setTimeout(() => { setScanning(false); setFound(pending[0] ?? null); }, 1500);
    return () => clearTimeout(t);
  }, [scanning, pending]);

  return (
    <div className="space-y-3 px-3">
      <button disabled={!pending.length} onClick={() => setScanning(true)}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary py-5 text-[15px] font-bold text-primary-foreground shadow-sm active:scale-[0.99] disabled:opacity-40">
        <ScanLine className="h-6 w-6" />Quét QR nhận đồ của khách
      </button>
      <span className="micro block">Khách đang chờ lấy ({pending.length})</span>
      {pending.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] font-bold">{p.id}</p>
            <p className="truncate text-[11.5px] text-muted-foreground">{p.customer} • {p.items[0]?.name}</p>
          </div>
          <span className="shrink-0 text-[12px] font-semibold tabular-nums">{vnd(p.total)}</span>
        </div>
      ))}
      {!pending.length && <p className="py-8 text-center text-[12.5px] text-muted-foreground">Không còn đơn chờ nhận.</p>}

      {scanning && (
        <Sheet title="Quét mã khách hàng" onClose={() => setScanning(false)}>
          <div className="relative">
            <Viewfinder label="Đang đọc mã QR của khách..." />
            <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-30">
              <QRCodeSVG value={pending[0]?.id ?? "-"} size={110} bgColor="transparent" fgColor="currentColor" className="text-background" />
            </div>
          </div>
        </Sheet>
      )}

      {found && (
        <Sheet title="Xác minh đơn hàng" onClose={() => setFound(null)}>
          <div className="flex items-center gap-2 rounded-lg border border-mint-border bg-mint px-3 py-2 text-[12px] font-semibold text-primary">
            <BadgeCheck className="h-4 w-4" />Mã hợp lệ • Còn hiệu lực
          </div>
          <div className="mt-3 space-y-1.5 rounded-lg border border-border p-3 text-[12.5px]">
            <Row l="Mã đơn" r={found.id} />
            <Row l="Khách hàng" r={found.customer} />
          </div>
          <p className="micro mt-3 mb-1.5">Danh sách món</p>
          <div className="divide-y divide-border rounded-lg border border-border">
            {found.items.map((i) => (
              <div key={i.name} className="flex justify-between gap-2 px-3 py-2 text-[12.5px]">
                <span className="truncate font-medium">{i.name}</span><span className="shrink-0 font-semibold">x{i.qty}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg border border-border p-3 text-[12.5px]">
            <span className="flex items-center gap-1.5 font-semibold text-primary"><Check className="h-4 w-4" />Đã thanh toán • {found.pay}</span>
            <b className="tabular-nums">{vnd(found.total)}</b>
          </div>
          <button onClick={() => { onHandover(found); setFound(null); }}
            className="mt-4 w-full rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground active:scale-[0.99]">
            Xác nhận đã giao hàng
          </button>
        </Sheet>
      )}
    </div>
  );
}


/* ================= SHARED ================= */

function BottomNav({ items, active, onChange }: {
  items: { k: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[];
  active: string; onChange: (k: string) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-md -translate-x-1/2 grid-cols-3 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      {items.map(({ k, label, icon: Icon, badge }) => (
        <button key={k} onClick={() => onChange(k)} className={`relative flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-semibold ${active === k ? "text-primary" : "text-muted-foreground"}`}>
          <span className="relative">
            <Icon className="h-5 w-5" />
            {!!badge && <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-urgent px-1 text-[9px] font-bold text-primary-foreground">{badge}</span>}
          </span>
          <span className="truncate">{label}</span>
        </button>
      ))}
    </nav>
  );
}
