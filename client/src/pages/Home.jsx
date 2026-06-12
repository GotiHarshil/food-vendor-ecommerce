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

// Reveal-on-scroll: adds `.is-visible` to every `.reveal` inside the page.
// `trigger` re-runs the setup so reveal elements rendered later (e.g. async
// data like today's specials) also get observed.
function useScrollReveal(containerRef, trigger) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const els = root.querySelectorAll(".reveal");

    // Fallback: if IntersectionObserver is unavailable, just show everything.
    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      // threshold 0 so anything already in view (above the fold) reveals on load;
      // small negative bottom margin gives a gentle reveal as lower sections enter.
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [containerRef, trigger]);
}

export default function Home() {
  const [todaysSpecials, setTodaysSpecials] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, totalOrders: 0, totalUsers: 0 });
  const [storeInfo, setStoreInfo] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const pageRef = useRef(null);
  useScrollReveal(pageRef, todaysSpecials.length);

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
    <div className="home-page" ref={pageRef}>
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
          <div className="hero-mesh"></div>
          <div className="hero-glow"></div>
          <div className="hero-pattern"></div>
        </div>

        <div className="hero-content animate-fade-in-up">
          <span className="hero-badge">
            <i className="fa-solid fa-fire"></i> Fresh &amp; Authentic Street Food
          </span>
          <h1 className="hero-title">
            Crave It.
            <br />
            <span className="gradient-text">Order It.</span> Devour It.
          </h1>
          <p className="hero-subtitle">
            Bold flavors, fresh from our kitchen. Order online, skip the wait, and
            pick up a taste you won't stop thinking about.
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
            <div className="hero-card-glow"></div>
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
      <section className="stats-section reveal">
        {statsLoading ? (
          <div className="stats-loading">
            <i className="fa-solid fa-spinner stats-spinner"></i>
            <span>Loading stats...</span>
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
              <div className="stat-number stat-number-sm">NYC</div>
              <div className="stat-label">42W 46th St</div>
            </div>
          </div>
        )}
      </section>

      {/* Today's Special */}
      {todaysSpecials.length > 0 && (
        <section className="special-section">
          <div className="section-header reveal">
            <span className="section-tag"><i className="fa-solid fa-fire"></i> Today's Special</span>
            <h2 className="section-title">Chef's Picks for Today</h2>
            <p className="section-subtitle">
              Hand-selected by our chef — available for a limited time only!
            </p>
          </div>

          <div className="special-grid">
            {todaysSpecials.map((item, i) => (
              <div
                key={item._id}
                className="special-card reveal"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
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
        <div className="section-header reveal">
          <span className="section-tag">Why MANU?</span>
          <h2 className="section-title">What Makes Us Special</h2>
          <p className="section-subtitle">
            We're not just making food — we're crafting experiences.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card reveal" style={{ transitionDelay: "0ms" }}>
            <div className="feature-icon" style={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)" }}>
              <i className="fa-solid fa-leaf" style={{ color: "#ea580c" }}></i>
            </div>
            <h3>Fresh Ingredients</h3>
            <p>Locally sourced, hand-picked ingredients ensuring the highest quality in every dish.</p>
          </div>

          <div className="feature-card reveal" style={{ transitionDelay: "80ms" }}>
            <div className="feature-icon" style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}>
              <i className="fa-solid fa-bell" style={{ color: "#16a34a" }}></i>
            </div>
            <h3>Order &amp; Pickup</h3>
            <p>Order online and we'll notify you when your food is ready for pickup. No waiting!</p>
          </div>

          <div className="feature-card reveal" style={{ transitionDelay: "160ms" }}>
            <div className="feature-icon" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)" }}>
              <i className="fa-solid fa-shield-halved" style={{ color: "#2563eb" }}></i>
            </div>
            <h3>Safe &amp; Hygienic</h3>
            <p>Prepared in a certified kitchen following strict hygiene and safety standards.</p>
          </div>

          <div className="feature-card reveal" style={{ transitionDelay: "240ms" }}>
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
        <div className="section-header reveal">
          <span className="section-tag">How it Works</span>
          <h2 className="section-title">Three Simple Steps</h2>
        </div>

        <div className="steps-grid">
          <div className="step-card reveal" style={{ transitionDelay: "0ms" }}>
            <div className="step-number">1</div>
            <h3>Browse &amp; Order</h3>
            <p>Pick your favorites from our menu and add them to your cart.</p>
          </div>
          <div className="step-connector"><i className="fa-solid fa-arrow-right"></i></div>
          <div className="step-card reveal" style={{ transitionDelay: "120ms" }}>
            <div className="step-number">2</div>
            <h3>Get Notified</h3>
            <p>We'll let you know as soon as your order is ready for pickup.</p>
          </div>
          <div className="step-connector"><i className="fa-solid fa-arrow-right"></i></div>
          <div className="step-card reveal" style={{ transitionDelay: "240ms" }}>
            <div className="step-number">3</div>
            <h3>Pick Up &amp; Enjoy</h3>
            <p>Come to our store, grab your food, and enjoy every bite!</p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section reveal">
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
  );
}
