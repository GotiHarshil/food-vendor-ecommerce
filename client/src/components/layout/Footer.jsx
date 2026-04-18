import { Link } from "react-router-dom";
import { UtensilsCrossed, Mail } from "lucide-react";
import { Container } from "../ui/Container";

const Instagram = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);
const Twitter = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2H21l-6.49 7.41L22 22h-6.297l-4.92-6.43L4.97 22H2.215l6.95-7.94L2 2h6.45l4.45 5.88L18.244 2zm-1.103 18h1.567L7.01 4H5.32l11.82 16z" />
  </svg>
);
const Facebook = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13 22v-8h2.7l.4-3.1H13V8.9c0-.9.3-1.5 1.5-1.5H16V4.7c-.3 0-1.2-.1-2.3-.1-2.3 0-3.7 1.4-3.7 3.9v2.4H7.2V14H10v8h3z" />
  </svg>
);

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-ink-100 bg-white/70 backdrop-blur">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ff7b00] to-brand-500 text-white shadow-[var(--shadow-glow)]">
                <UtensilsCrossed className="w-5 h-5" />
              </span>
              <span className="text-ink-900">
                MA<span className="text-gradient-brand">NU</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-ink-500 max-w-xs">
              Fresh, fast, and made with love. Order in seconds — taste the
              difference.
            </p>
          </div>

          <FooterCol
            title="Explore"
            links={[
              { to: "/", label: "Home" },
              { to: "/menu", label: "Menu" },
              { to: "/cart", label: "Cart" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { to: "#", label: "About" },
              { to: "#", label: "Careers" },
              { to: "#", label: "Contact" },
            ]}
          />

          <div>
            <h4 className="text-sm font-bold text-ink-900 uppercase tracking-wider">
              Stay in the loop
            </h4>
            <p className="mt-3 text-sm text-ink-500">
              New drops, offers, and stories — in your inbox, no spam.
            </p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full h-11 rounded-full border border-ink-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 rounded-full bg-ink-900 text-white text-sm font-semibold hover:bg-ink-800"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-ink-100">
          <p className="text-xs text-ink-500">
            © {year} MANU. Crafted with care.
          </p>
          <div className="flex items-center gap-3">
            <Social href="#" label="Instagram"><Instagram className="w-4 h-4" /></Social>
            <Social href="#" label="Twitter"><Twitter className="w-4 h-4" /></Social>
            <Social href="#" label="Facebook"><Facebook className="w-4 h-4" /></Social>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-ink-900 uppercase tracking-wider">
        {title}
      </h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-sm text-ink-500 hover:text-brand-600 transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Social({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full bg-white border border-ink-200 text-ink-700 hover:border-brand-300 hover:text-brand-600 transition-all"
    >
      {children}
    </a>
  );
}
