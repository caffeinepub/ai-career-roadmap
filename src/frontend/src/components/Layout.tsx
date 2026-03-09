import { Button } from "@/components/ui/button";
import {
  Award,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Page = "dashboard" | "courses" | "certificates";

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "courses" as Page, label: "Courses", icon: BookOpen },
  { id: "certificates" as Page, label: "Certificates", icon: Award },
];

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { clear, identity } = useInternetIdentity();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal ? `${principal.slice(0, 8)}...` : "";

  return (
    <div className="min-h-screen mesh-bg">
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center glow-cyan">
              <GraduationCap className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-lg gradient-text">
              CareerPath AI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                data-ocid={`nav.${item.id}.link`}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {shortPrincipal && (
              <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-3 py-1 rounded-full">
                {shortPrincipal}
              </span>
            )}
            <Button
              data-ocid="nav.logout.button"
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-muted-foreground hover:text-destructive gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-white/5 overflow-hidden"
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    data-ocid={`mobile.nav.${item.id}.link`}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium w-full text-left transition-all ${
                      currentPage === item.id
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
                <Button
                  data-ocid="mobile.nav.logout.button"
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="justify-start gap-2 text-destructive w-full mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>

      <footer className="border-t border-white/5 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}

export function LoginPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md w-full"
      >
        <div className="relative rounded-3xl p-8 glass-bright glow-cyan overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 bg-cover bg-center rounded-3xl"
            style={{
              backgroundImage:
                "url('/assets/generated/hero-bg.dim_1600x900.jpg')",
            }}
          />
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center glow-cyan">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-2 gradient-text">
              CareerPath AI
            </h1>
            <p className="text-muted-foreground text-sm mb-2 font-mono uppercase tracking-widest">
              For 12th Grade Graduates
            </p>
            <p className="text-foreground/80 text-base mb-8">
              Discover your ideal career, build skills with AI-curated courses,
              and earn certificates that matter.
            </p>
            <Button
              data-ocid="login.primary_button"
              onClick={onLogin}
              size="lg"
              className="w-full bg-primary text-primary-foreground font-display font-semibold text-base gap-2 rounded-xl glow-cyan hover:opacity-90 transition-opacity"
            >
              <LogIn className="w-5 h-5" />
              Sign In to Get Started
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Powered by Internet Identity — secure & decentralized
            </p>
          </div>
        </div>
      </motion.div>
      <footer className="absolute bottom-6 text-center w-full text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
