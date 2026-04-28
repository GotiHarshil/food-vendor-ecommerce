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

  useEffect(() => {
    // Fetch today's specials
    fetch("/api/food/todays-special", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setTodaysSpecials(data))
      .catch(() => {});

    // Fetch real stats
    fetch("/api/food/stats", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});

    // Fetch store info
    fetch("/api/food/store-info", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setStoreInfo(data))
      .catch(() => {});
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
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80" alt="Delicious food spread" />
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
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon"><i className="fa-solid fa-burger"></i></div>
            <div className="stat-number"><CountUp end={stats.totalItems} suffix="+" /></div>
            <div className="stat-label">Menu Items</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><i className="fa-solid fa-receipt"></i></div>
            <div className="stat-number"><CountUp end={stats.totalOrders} suffix="" /></div>
            <div className="stat-label">Orders Served</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><i className="fa-solid fa-users"></i></div>
            <div className="stat-number"><CountUp end={stats.totalUsers} suffix="" /></div>
            <div className="stat-label">Registered Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><i className="fa-solid fa-location-dot"></i></div>
            <div className="stat-number" style={{ fontSize: "1rem", fontWeight: 700 }}>NYC</div>
            <div className="stat-label">42W 46th St</div>
          </div>
        </div>
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
  );
}
