import { Link, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  Menu,
  X,
  User,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  Home,
} from "lucide-react"
import ThemeToggle from "./ThemeToggle"

/* Simple cn() replacement */
function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function Navbar() {
  const login = !!localStorage.getItem("token")
  const nav = useNavigate()
  const location = useLocation()

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const logoutfun = () => {
    localStorage.removeItem("token")
    nav("/login")
    setIsMobileMenuOpen(false)
  }

  const go = (path) => {
    setIsMobileMenuOpen(false)
    if (!login && path !== "/") nav("/login")
    else nav(path)
  }

  const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Chats", icon: MessageSquare, path: "/chats" },
    { label: "Profile", icon: User, path: "/profile" },
  ]

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-black/70 backdrop-blur-xl border-b border-white/10"
            : "bg-black/40"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl font-bold text-cyan-400"
          >
            SkillSwap
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.path

              return (
                <button
                  key={item.label}
                  onClick={() => go(item.path)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition",
                    active
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "text-gray-300 hover:bg-white/10"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}

            <ThemeToggle />

            {login && (
              <button
                onClick={logoutfun}
                className="ml-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-white/10"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-lg md:hidden">
          <div className="mt-20 mx-4 p-4 bg-zinc-900 rounded-xl space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={() => go(item.path)}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-gray-200 hover:bg-white/10"
                >
                  <Icon />
                  {item.label}
                </button>
              )
            })}

            {login && (
              <button
                onClick={logoutfun}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-lg bg-red-500 text-white"
              >
                <LogOut />
                Logout
              </button>
            )}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-16" />
    </>
  )
}
