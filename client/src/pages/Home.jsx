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
  const [popularItems, setPopularItems] = useState([]);

  useEffect(() => {
    fetch("/api/food/menu", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPopularItems(data.slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>

        <div className="hero-content animate-fade-in-up">
          <span className="hero-badge">
            <i className="fa-solid fa-fire"></i> #1 Food Delivery in Town
          </span>
          <h1 className="hero-title">
            Delicious Food,
            <br />
            <span className="gradient-text">Delivered Fresh</span>
          </h1>
          <p className="hero-subtitle">
            From our kitchen to your doorstep. Fresh ingredients, authentic
            recipes, and a taste you'll love coming back for.
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

          <div className="hero-trust">
            <div className="trust-avatars">
              <div className="trust-avatar" style={{ background: "#ff6b35" }}>M</div>
              <div className="trust-avatar" style={{ background: "#22c55e" }}>A</div>
              <div className="trust-avatar" style={{ background: "#3b82f6" }}>N</div>
              <div className="trust-avatar" style={{ background: "#8b5cf6" }}>U</div>
            </div>
            <div className="trust-text">
              <strong>500+</strong> happy customers this month
            </div>
          </div>
        </div>

        <div className="hero-visual animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="hero-card">
            <div className="hero-card-img">
              <img src="/images/food-banner.jpg" alt="Delicious food" />
            </div>
            <div className="floating-badge badge-top">
              <i className="fa-solid fa-star" style={{ color: "#f59e0b" }}></i>
              <span>4.9 Rating</span>
            </div>
            <div className="floating-badge badge-bottom">
              <i className="fa-solid fa-clock" style={{ color: "#22c55e" }}></i>
              <span>25 min delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon"><i className="fa-solid fa-burger"></i></div>
            <div className="stat-number"><CountUp end={50} suffix="+" /></div>
            <div className="stat-label">Menu Items</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><i className="fa-solid fa-users"></i></div>
            <div className="stat-number"><CountUp end={500} suffix="+" /></div>
            <div className="stat-label">Happy Customers</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><i className="fa-solid fa-truck-fast"></i></div>
            <div className="stat-number"><CountUp end={25} /></div>
            <div className="stat-label">Min Avg Delivery</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><i className="fa-solid fa-star"></i></div>
            <div className="stat-number"><CountUp end={49} suffix="" /></div>
            <div className="stat-label">Customer Rating</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-tag">Why MANU?</span>
          <h2 className="section-title">What Makes Us Special</h2>
          <p className="section-subtitle">
            We're not just delivering food — we're delivering happiness.
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
              <i className="fa-solid fa-bolt" style={{ color: "#16a34a" }}></i>
            </div>
            <h3>Fast Delivery</h3>
            <p>Lightning-fast delivery to your doorstep. Your food arrives hot, fresh, and on time.</p>
          </div>

          <div className="feature-card animate-fade-in-up">
            <div className="feature-icon" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)" }}>
              <i className="fa-solid fa-shield-halved" style={{ color: "#2563eb" }}></i>
            </div>
            <h3>Safe & Hygienic</h3>
            <p>Prepared in certified kitchens following strict hygiene and safety standards.</p>
          </div>

          <div className="feature-card animate-fade-in-up">
            <div className="feature-icon" style={{ background: "linear-gradient(135deg, #faf5ff, #f3e8ff)" }}>
              <i className="fa-solid fa-heart" style={{ color: "#9333ea" }}></i>
            </div>
            <h3>Made with Love</h3>
            <p>Every dish is crafted with passion by experienced chefs who care about your taste buds.</p>
          </div>
        </div>
      </section>

      {/* Popular Items */}
      {popularItems.length > 0 && (
        <section className="popular-section">
          <div className="section-header">
            <span className="section-tag">Customer Favorites</span>
            <h2 className="section-title">Most Popular Dishes</h2>
            <p className="section-subtitle">
              These are the dishes our customers can't stop ordering.
            </p>
          </div>

          <div className="popular-grid stagger">
            {popularItems.map((item, idx) => (
              <div key={item._id} className="popular-card animate-fade-in-up">
                <div className="popular-rank">#{idx + 1}</div>
                <div className="popular-img">
                  <img src={item.imageUrl} alt={item.name} />
                </div>
                <div className="popular-info">
                  <h4>{item.name}</h4>
                  <p className="popular-category">{item.category}</p>
                  <div className="popular-bottom">
                    <span className="popular-price">${item.price}</span>
                    <Link to="/menu" className="popular-order-btn">
                      Order Now <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="popular-cta">
            <Link to="/menu" className="btn-view-all">
              View Full Menu <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Order?</h2>
          <p>
            Join hundreds of happy customers. Browse our menu and get your
            favorite food delivered in minutes.
          </p>
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
