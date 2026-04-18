import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu as MenuIcon, ShoppingBag, UtensilsCrossed, X, LogOut, User } from "lucide-react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { useCart } from "../../context/cart-context";
import { useAuth } from "../../context/auth-context";
import { cn } from "../../lib/cn";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/cart", label: "Cart" },
];

export function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "glass border-b border-ink-100/70 shadow-[0_2px_20px_-10px_rgba(35,49,79,0.25)]"
          : "bg-transparent"
      )}
    >
      <Container className="flex h-18 items-center gap-6 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-extrabold tracking-tight"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ff7b00] to-brand-500 text-white shadow-[var(--shadow-glow)]">
            <UtensilsCrossed className="w-5 h-5" />
          </span>
          <span className="text-ink-900">
            MA<span className="text-gradient-brand">NU</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all",
                  isActive
                    ? "text-ink-900 bg-ink-100"
                    : "text-ink-600 hover:text-ink-900 hover:bg-ink-100/60"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/cart"
            className="relative grid h-11 w-11 place-items-center rounded-full bg-white border border-ink-200 text-ink-700 hover:border-brand-300 hover:text-brand-600 transition-all"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 px-1 place-items-center rounded-full bg-brand-500 text-white text-[11px] font-bold shadow-[var(--shadow-glow)]">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden lg:flex items-center gap-2 px-3 h-11 rounded-full bg-white border border-ink-200">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                  {(user.name || user.email || "U")[0].toUpperCase()}
                </span>
                <span className="text-sm font-semibold text-ink-800 max-w-32 truncate">
                  {user.name || user.email}
                </span>
              </span>
              <Button variant="outline" size="md" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button as={Link} to="/login" variant="outline" size="md">
                Sign in
              </Button>
              <Button as={Link} to="/signup" variant="primary" size="md">
                Get started
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden grid h-11 w-11 place-items-center rounded-full bg-white border border-ink-200 text-ink-800"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </Container>

      {open && (
        <div className="md:hidden border-t border-ink-100 bg-white">
          <Container className="py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between",
                    isActive
                      ? "text-ink-900 bg-ink-100"
                      : "text-ink-700 hover:bg-ink-100/60"
                  )
                }
              >
                {item.label}
                {item.to === "/cart" && count > 0 && (
                  <span className="rounded-full bg-brand-500 text-white text-xs px-2 py-0.5">
                    {count}
                  </span>
                )}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-ink-100 mt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-ink-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {user.name || user.email}
                  </div>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="outline" onClick={() => setOpen(false)}>
                    Sign in
                  </Button>
                  <Button as={Link} to="/signup" variant="primary" onClick={() => setOpen(false)}>
                    Get started
                  </Button>
                </>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
