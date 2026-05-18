<<<<<<< HEAD
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function CountUp({ end, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  const [todaysSpecials, setTodaysSpecials] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, totalOrders: 0, totalUsers: 0 });
  const [storeInfo, setStoreInfo] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    // Fetch today's specials
    fetch("/api/food/todays-special", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setTodaysSpecials(data))
      .catch((err) => {
        console.error("[Home] Error fetching today's specials:", err);
        setTodaysSpecials([]);
      });

    // Fetch real stats
    setStatsLoading(true);
    fetch("/api/food/stats", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("[Home] Stats loaded:", data);
        setStats(data || { totalItems: 0, totalOrders: 0, totalUsers: 0 });
      })
      .catch((err) => {
        console.error("[Home] Error fetching stats:", err);
        setStats({ totalItems: 0, totalOrders: 0, totalUsers: 0 });
      })
      .finally(() => setStatsLoading(false));

    // Fetch store info
    fetch("/api/food/store-info", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setStoreInfo(data))
      .catch((err) => {
        console.error("[Home] Error fetching store info:", err);
        setStoreInfo(null);
      });
  }, []);

  return (
    <div className="home-page">
      {/* Store closed banner */}
      {storeInfo && !storeInfo.isOpen && (
        <div className="store-closed-banner">
          <i className="fa-solid fa-clock"></i>
          We're currently closed. Please check back during operating hours!
        </div>
      )}

      {/* Announcement banner */}
      {storeInfo?.announcement && storeInfo.isOpen && (
        <div className="announcement-banner">
          <i className="fa-solid fa-bullhorn"></i>
          {storeInfo.announcement}
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>

        <div className="hero-content animate-fade-in-up">
          <span className="hero-badge">
            <i className="fa-solid fa-fire"></i> Fresh & Authentic Street Food
          </span>
          <h1 className="hero-title">
            Delicious Food,
            <br />
            <span className="gradient-text">Ready for Pickup</span>
          </h1>
          <p className="hero-subtitle">
            Order online and pick up fresh from our kitchen.
            Authentic recipes, quality ingredients, and a taste you'll love.
          </p>
          <div className="hero-actions">
            <Link to="/menu" className="btn-hero-primary">
              <i className="fa-solid fa-utensils"></i>
              Explore Menu
            </Link>
            <Link to="/signup" className="btn-hero-secondary">
              Create Account
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          {storeInfo && (
            <div className="hero-location">
              <i className="fa-solid fa-location-dot"></i>
              <span>{storeInfo.storeAddress}</span>
            </div>
          )}
        </div>

        <div className="hero-visual animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="hero-card">
            <div className="hero-card-img">
              <img src="https://res.cloudinary.com/dr0qdawz6/image/upload/v1779002157/food-vendor/manu-logo.png" alt="MANU Logo" />
            </div>
            <div className="floating-badge badge-top">
              <i className="fa-solid fa-star" style={{ color: "#f59e0b" }}></i>
              <span>Self Pickup</span>
            </div>
            <div className="floating-badge badge-bottom">
              <i className="fa-solid fa-bell" style={{ color: "#22c55e" }}></i>
              <span>We'll notify you!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — real data */}
      <section className="stats-section" style={{ minHeight: "200px" }}>
        {statsLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
            <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "1.2rem", marginBottom: "10px" }}>Loading stats...</div>
              <i className="fa-solid fa-spinner" style={{ animation: "spin 1s linear infinite", fontSize: "2rem" }}></i>
            </div>
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon"><i className="fa-solid fa-burger"></i></div>
              <div className="stat-number">
                {stats.totalItems > 0 ? <CountUp end={stats.totalItems} suffix="+" /> : <span>0+</span>}
              </div>
              <div className="stat-label">Menu Items</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><i className="fa-solid fa-receipt"></i></div>
              <div className="stat-number">
                {stats.totalOrders > 0 ? <CountUp end={stats.totalOrders} suffix="" /> : <span>0</span>}
              </div>
              <div className="stat-label">Orders Served</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><i className="fa-solid fa-users"></i></div>
              <div className="stat-number">
                {stats.totalUsers > 0 ? <CountUp end={stats.totalUsers} suffix="" /> : <span>0</span>}
              </div>
              <div className="stat-label">Registered Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><i className="fa-solid fa-location-dot"></i></div>
              <div className="stat-number" style={{ fontSize: "1rem", fontWeight: 700 }}>NYC</div>
              <div className="stat-label">42W 46th St</div>
            </div>
          </div>
        )}
      </section>

      {/* Today's Special */}
      {todaysSpecials.length > 0 && (
        <section className="special-section">
          <div className="section-header">
            <span className="section-tag"><i className="fa-solid fa-fire"></i> Today's Special</span>
            <h2 className="section-title">Chef's Picks for Today</h2>
            <p className="section-subtitle">
              Hand-selected by our chef — available for a limited time only!
            </p>
          </div>

          <div className="special-grid stagger">
            {todaysSpecials.map((item) => (
              <div key={item._id} className="special-card animate-fade-in-up">
                <div className="special-badge">
                  <i className="fa-solid fa-fire"></i> Special
                </div>
                <div className="special-img">
                  <img src={item.imageUrl} alt={item.name} />
                </div>
                <div className="special-info">
                  <h4>{item.name}</h4>
                  <p className="special-desc">{item.description}</p>
                  <div className="special-bottom">
                    <span className="special-price">${item.price}</span>
                    <Link to="/menu" className="special-order-btn">
                      Order Now <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-tag">Why MANU?</span>
          <h2 className="section-title">What Makes Us Special</h2>
          <p className="section-subtitle">
            We're not just making food — we're crafting experiences.
          </p>
        </div>

        <div className="features-grid stagger">
          <div className="feature-card animate-fade-in-up">
            <div className="feature-icon" style={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)" }}>
              <i className="fa-solid fa-leaf" style={{ color: "#ea580c" }}></i>
            </div>
            <h3>Fresh Ingredients</h3>
            <p>Locally sourced, hand-picked ingredients ensuring the highest quality in every dish.</p>
          </div>

          <div className="feature-card animate-fade-in-up">
            <div className="feature-icon" style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}>
              <i className="fa-solid fa-bell" style={{ color: "#16a34a" }}></i>
            </div>
            <h3>Order & Pickup</h3>
            <p>Order online and we'll notify you when your food is ready for pickup. No waiting!</p>
          </div>

          <div className="feature-card animate-fade-in-up">
            <div className="feature-icon" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)" }}>
              <i className="fa-solid fa-shield-halved" style={{ color: "#2563eb" }}></i>
            </div>
            <h3>Safe & Hygienic</h3>
            <p>Prepared in a certified kitchen following strict hygiene and safety standards.</p>
          </div>

          <div className="feature-card animate-fade-in-up">
            <div className="feature-icon" style={{ background: "linear-gradient(135deg, #faf5ff, #f3e8ff)" }}>
              <i className="fa-solid fa-heart" style={{ color: "#9333ea" }}></i>
            </div>
            <h3>Made with Love</h3>
            <p>Every dish crafted with passion by experienced chefs who care about your taste buds.</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works-section">
        <div className="section-header">
          <span className="section-tag">How it Works</span>
          <h2 className="section-title">Three Simple Steps</h2>
        </div>

        <div className="steps-grid stagger">
          <div className="step-card animate-fade-in-up">
            <div className="step-number">1</div>
            <h3>Browse & Order</h3>
            <p>Pick your favorites from our menu and add them to your cart.</p>
          </div>
          <div className="step-connector"><i className="fa-solid fa-arrow-right"></i></div>
          <div className="step-card animate-fade-in-up">
            <div className="step-number">2</div>
            <h3>Get Notified</h3>
            <p>We'll let you know as soon as your order is ready for pickup.</p>
          </div>
          <div className="step-connector"><i className="fa-solid fa-arrow-right"></i></div>
          <div className="step-card animate-fade-in-up">
            <div className="step-number">3</div>
            <h3>Pick Up & Enjoy</h3>
            <p>Come to our store, grab your food, and enjoy every bite!</p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Order?</h2>
          <p>
            Browse our menu and place your order. We'll have it freshly prepared
            and waiting for you at our store.
          </p>
          {storeInfo && (
            <div className="cta-location">
              <i className="fa-solid fa-location-dot"></i>
              {storeInfo.storeAddress}
            </div>
          )}
          <div className="cta-actions">
            <Link to="/menu" className="btn-cta-primary">
              <i className="fa-solid fa-utensils"></i>
              Browse Menu
            </Link>
            <Link to="/signup" className="btn-cta-secondary">
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>
    </div>
=======
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Leaf,
  Clock,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { FoodCard } from "../components/food/FoodCard";
import { FoodCardSkeleton } from "../components/ui/Skeleton";
import { api, endpoints } from "../lib/api";

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get(endpoints.menu)
      .then((data) => {
        if (active) setFoods(Array.isArray(data) ? data.slice(0, 4) : []);
      })
      .catch(() => active && setFoods([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="pb-20">
      <Hero />
      <Stats />
      <Featured foods={foods} loading={loading} />
      <Features />
      <CTA />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Container className="pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="animate-[fade-up_0.6s_ease_both]">
            <Badge tone="brand" className="mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Fresh today, just for you
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-ink-900 leading-[1.05]">
              Delicious food,{" "}
              <span className="text-gradient-brand">delivered.</span>
            </h1>
            <p className="mt-6 text-lg text-ink-500 max-w-xl">
              Hand-crafted dabelis, loaded specials and warm classics — made
              fresh, delivered fast. Order in seconds, smile for hours.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/menu" size="lg">
                Explore menu
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button as={Link} to="/cart" variant="outline" size="lg">
                View cart
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-2">
                {["A", "B", "C", "D"].map((c, i) => (
                  <span
                    key={c}
                    className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-200 to-brand-400 text-white text-xs font-bold border-2 border-white"
                    style={{ zIndex: 4 - i }}
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="ml-2 text-ink-900 font-bold">4.9</span>
                </div>
                <p className="text-ink-500">Loved by 12,000+ foodies</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-tr from-brand-200/40 via-brand-100/30 to-transparent rounded-[3rem] blur-3xl" />
            <div className="relative rounded-[2rem] overflow-hidden shadow-[var(--shadow-card)] border border-white">
              <img
                src="/images/food-banner.jpg"
                alt="Hero food"
                className="aspect-[4/5] w-full object-cover"
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900")
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-[var(--shadow-card)] border border-ink-100 animate-[float_5s_ease-in-out_infinite]">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold">100% Fresh</div>
                <div className="text-xs text-ink-500">Locally sourced</div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 hidden sm:flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-[var(--shadow-card)] border border-ink-100 animate-[float_6s_ease-in-out_infinite_0.5s]">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold">25 min</div>
                <div className="text-xs text-ink-500">Average delivery</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Stats() {
  const items = [
    { k: "12k+", v: "Happy customers" },
    { k: "60+", v: "Menu items" },
    { k: "25 min", v: "Avg delivery" },
    { k: "4.9★", v: "Average rating" },
  ];
  return (
    <section className="py-8">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-3xl bg-ink-900 text-white p-6 md:p-8 shadow-[0_20px_60px_-30px_rgba(35,49,79,0.7)]">
          {items.map((s) => (
            <div key={s.v} className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {s.k}
              </div>
              <div className="text-xs md:text-sm text-ink-300 mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Featured({ foods, loading }) {
  return (
    <section className="py-16">
      <Container>
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <Badge tone="ink" className="mb-3">Featured</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Hot off the kitchen
            </h2>
            <p className="mt-2 text-ink-500 max-w-xl">
              A taste of what's trending today. Fresh ingredients, bold flavors.
            </p>
          </div>
          <Button as={Link} to="/menu" variant="outline" size="md" className="shrink-0">
            See all
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <FoodCardSkeleton key={i} />
              ))
            : foods.length > 0
            ? foods.map((f) => <FoodCard key={f._id} food={f} />)
            : (
              <div className="col-span-full rounded-2xl border border-dashed border-ink-200 p-8 text-center text-ink-500">
                No items yet — your menu is ready to be filled.
              </div>
            )}
        </div>
      </Container>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Fresh ingredients",
      text: "Sourced daily from local markets — quality you can taste in every bite.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Delivered fast",
      text: "Average 25-minute delivery, hot and ready, straight to your door.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Safe & hygienic",
      text: "Contactless packaging and strict hygiene standards in every kitchen.",
    },
  ];
  return (
    <section className="py-16">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge tone="ink" className="mb-3">Why MANU</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Built around three simple ideas
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.title}
              className="group rounded-2xl bg-white p-7 border border-ink-100/80 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                {it.icon}
              </div>
              <h3 className="mt-5 text-lg font-bold text-ink-900">{it.title}</h3>
              <p className="mt-2 text-sm text-ink-500">{it.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-12">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff7b00] to-brand-600 p-10 md:p-14 text-white shadow-[var(--shadow-glow)]">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Hungry already?
              </h3>
              <p className="mt-2 text-white/85 max-w-xl">
                Browse the menu, fill your cart, and we'll handle the rest.
              </p>
            </div>
            <Button
              as={Link}
              to="/menu"
              variant="secondary"
              size="lg"
              className="!bg-white !text-ink-900 hover:!bg-ink-100"
            >
              Order now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Container>
    </section>
>>>>>>> claude/condescending-swirles-7a4876
  );
}
