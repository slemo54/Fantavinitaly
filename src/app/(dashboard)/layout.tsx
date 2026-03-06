'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NotificationManager from '@/components/NotificationManager'
import {
  BarChart3,
  PlusCircle,
  LogOut,
  Home,
  Menu,
  X,
  Settings,
  UserPlus,
  AlertTriangle,
  Gavel,
  Search as SearchIcon,
  Bell
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }
    getProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const isActive = (path: string) => pathname === path

  return (
    <div className="layout-container">
      <NotificationManager />

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">🐷</div>
            <span className="logo-text">Salvadanaio</span>
          </div>
        </div>

        <nav className="nav-menu">
          <Link href="/" className={isActive('/') ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
            <Home size={20} /> <span>Home</span>
          </Link>
          <Link href="/classifica" className={isActive('/classifica') ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
            <BarChart3 size={20} /> <span>Classifica</span>
          </Link>
          <Link href="/regolamento" className={isActive('/regolamento') ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
            <Settings size={20} /> <span>Regolamento</span>
          </Link>
          <Link href="/storico" className={isActive('/storico') ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
            <AlertTriangle size={20} /> <span>Storico</span>
          </Link>

          {profile?.role === 'admin' && (
            <div className="admin-section">
              <p className="section-label">Sistema</p>
              <Link href="/admin/utenti" className={isActive('/admin/utenti') ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                <UserPlus size={20} /> <span>Utenti</span>
              </Link>
              <Link href="/admin/tipi-malus" className={isActive('/admin/tipi-malus') ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                <PlusCircle size={20} /> <span>Malus</span>
              </Link>
              <Link href="/admin/contestazioni" className={isActive('/admin/contestazioni') ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>
                <Gavel size={20} /> <span>Appelli</span>
              </Link>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> <span>Esci</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      {/* Main Content Area */}
      <div className="content-area">
        <header className="top-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
              <Menu size={20} />
            </button>
            <div className="search-bar">
              <SearchIcon size={18} className="search-icon" />
              <input type="text" placeholder="Cerca collega..." />
            </div>
          </div>
          <div className="header-right">
            <button className="icon-btn">
              <Bell size={20} />
            </button>
            <div className="user-nav">
              <div className="user-avatar">
                {profile?.display_name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>

      <style jsx>{`
                .layout-container {
                    display: flex;
                    min-height: 100vh;
                    background-color: var(--bg);
                }

                .sidebar {
                    width: 260px;
                    background-color: var(--white);
                    border-right: 1px solid var(--gray-200);
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    z-index: 1001;
                    transition: transform 0.3s ease;
                }

                .sidebar-header {
                    padding: 1.5rem 2rem;
                }

                .logo-container {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .logo-icon {
                    font-size: 1.5rem;
                    background: var(--accent);
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(255, 107, 53, 0.3);
                }

                .logo-text {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: var(--navy);
                    letter-spacing: -0.02em;
                }

                .nav-menu {
                    flex: 1;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .nav-menu :global(a) {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.8rem 1rem;
                    border-radius: 12px;
                    color: var(--gray-500);
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                }

                .nav-menu :global(a):hover {
                    background-color: var(--gray-100);
                    color: var(--navy);
                }

                .nav-menu :global(a).active {
                    background-color: rgba(0, 193, 142, 0.1);
                    color: var(--primary);
                }

                .admin-section {
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--gray-100);
                }

                .section-label {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--gray-500);
                    margin-bottom: 0.5rem;
                    padding-left: 1rem;
                    font-weight: 800;
                }

                .sidebar-footer {
                    padding: 1rem;
                    border-top: 1px solid var(--gray-100);
                }

                .logout-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.8rem 1rem;
                    background: none;
                    color: var(--gray-500);
                    font-weight: 600;
                    border-radius: 12px;
                    transition: all 0.2s;
                    border: none;
                }

                .logout-btn:hover {
                    background-color: #fff1f2;
                    color: #e11d48;
                }

                .content-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .top-header {
                    height: 70px;
                    background-color: var(--white);
                    border-bottom: 1px solid var(--gray-200);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 2rem;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex: 1;
                }

                .mobile-menu-btn {
                    display: none;
                    background: none;
                    color: var(--navy);
                }

                .search-bar {
                    display: flex;
                    align-items: center;
                    background-color: var(--gray-100);
                    border-radius: 12px;
                    padding: 0 1rem;
                    width: 100%;
                    max-width: 400px;
                }

                .search-icon {
                    color: var(--gray-500);
                }

                .search-bar input {
                    background: none;
                    border: none;
                    padding: 0.75rem;
                    width: 100%;
                    outline: none;
                    font-weight: 500;
                    color: var(--navy);
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .icon-btn {
                    background: none;
                    color: var(--gray-500);
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .icon-btn:hover {
                    background-color: var(--gray-100);
                    color: var(--navy);
                }

                .user-nav {
                    display: flex;
                    align-items: center;
                }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background-color: var(--primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    box-shadow: 0 4px 10px rgba(0, 193, 142, 0.2);
                }

                .main-content {
                    padding: 2rem;
                    flex: 1;
                }

                .overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }

                @media (max-width: 768px) {
                    .sidebar {
                        position: fixed;
                        transform: translateX(-100%);
                    }

                    .sidebar.open {
                        transform: translateX(0);
                    }

                    .mobile-menu-btn {
                        display: block;
                    }

                    .search-bar {
                        display: none;
                    }

                    .top-header {
                        padding: 0 1rem;
                    }
                }
            `}</style>
    </div>
  )
}
