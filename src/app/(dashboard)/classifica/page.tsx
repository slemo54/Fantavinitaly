'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Medal, Filter, Search, ChevronRight } from 'lucide-react'

export default function LeaderboardPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState('TUTTI')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const filters = ['TUTTI', 'DEVELOPER', 'MARKETING', 'DESIGN', 'HR']

  useEffect(() => {
    async function fetchProfiles() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('balance', { ascending: true }) // Higher balance = higher rank in "shame" but mocked as lower balance = better
      setProfiles(data || [])
      setFilteredProfiles(data || [])
      setLoading(false)
    }
    fetchProfiles()

    const channel = supabase
      .channel('leaderboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchProfiles())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    if (activeFilter === 'TUTTI') {
      setFilteredProfiles(profiles)
    } else {
      // Mocking category filtering as profiles don't have a team field yet
      setFilteredProfiles(profiles.filter((_, i) => i % (filters.indexOf(activeFilter) + 1) === 0))
    }
  }, [activeFilter, profiles])

  if (loading) return <div className="loading">Calcolando le posizioni...</div>

  const top3 = filteredProfiles.slice(0, 3)
  const others = filteredProfiles.slice(3)

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <div className="title-area">
          <h1>Classifica Generale</h1>
          <p>Scopri chi sta risparmiando di più (o pagando di più!) nel team.</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">TOTALE RACCOLTO</span>
            <span className="stat-value">€1.294,00</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filter-bar">
        <div className="filter-chips">
          {filters.map(filter => (
            <button
              key={filter}
              className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Cerca utente..." />
        </div>
      </div>

      {/* Podium */}
      <section className="podium-area">
        <div className="podium-item silver">
          <div className="podium-rank">2</div>
          <div className="avatar-wrapper">
            <div className="avatar">{top3[1]?.display_name?.charAt(0)}</div>
            <div className="medal-badge">🥈</div>
          </div>
          <span className="user-name">{top3[1]?.display_name}</span>
          <span className="user-score">€{top3[1]?.balance?.toFixed(2)}</span>
        </div>

        <div className="podium-item gold">
          <div className="podium-rank">1</div>
          <div className="avatar-wrapper">
            <div className="avatar main">{top3[0]?.display_name?.charAt(0)}</div>
            <div className="medal-badge main">🥇</div>
            <Trophy size={24} className="trophy-overlay" />
          </div>
          <span className="user-name">{top3[0]?.display_name}</span>
          <span className="user-score">€{top3[0]?.balance?.toFixed(2)}</span>
        </div>

        <div className="podium-item bronze">
          <div className="podium-rank">3</div>
          <div className="avatar-wrapper">
            <div className="avatar">{top3[2]?.display_name?.charAt(0)}</div>
            <div className="medal-badge">🥉</div>
          </div>
          <span className="user-name">{top3[2]?.display_name}</span>
          <span className="user-score">€{top3[2]?.balance?.toFixed(2)}</span>
        </div>
      </section>

      {/* Leaderboard Table */}
      <section className="table-area card">
        <div className="table-header">
          <span className="rank-col">#</span>
          <span className="user-col">UTENTE</span>
          <span className="team-col">TEAM</span>
          <span className="score-col">BILANCIO</span>
          <span className="status-col">STATO</span>
        </div>
        <div className="table-body">
          {others.map((p, idx) => (
            <div key={p.id} className="table-row">
              <span className="rank-col">{idx + 4}</span>
              <div className="user-col">
                <div className="user-avatar">{p.display_name?.charAt(0)}</div>
                <span className="user-display-name">{p.display_name}</span>
              </div>
              <span className="team-col">
                <span className="team-badge">Developer</span>
              </span>
              <span className="score-col">€{p.balance?.toFixed(2)}</span>
              <span className="status-col">
                <span className="trend-badge positive">
                  <ChevronRight size={14} style={{ transform: 'rotate(-45deg)' }} /> +€0.50
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
                .leaderboard-page {
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 2.5rem;
                }

                .title-area h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--navy); }
                .title-area p { color: var(--gray-500); font-weight: 500; font-size: 0.95rem; }

                .header-stats .stat-item {
                    text-align: right;
                }

                .stat-label { font-size: 0.7rem; font-weight: 800; color: var(--gray-400); display: block; }
                .stat-value { font-size: 1.5rem; font-weight: 900; color: var(--primary); }

                .filter-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3rem;
                    gap: 1rem;
                }

                .filter-chips {
                    display: flex;
                    gap: 0.75rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                }

                .filter-chip {
                    padding: 0.6rem 1.25rem;
                    border-radius: 100px;
                    background: var(--white);
                    border: 1px solid var(--gray-100);
                    color: var(--gray-500);
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .filter-chip.active {
                    background: var(--navy);
                    color: white;
                    border-color: var(--navy);
                }

                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: white;
                    padding: 0.6rem 1rem;
                    border-radius: 12px;
                    border: 1px solid var(--gray-100);
                    color: var(--gray-400);
                    max-width: 300px;
                    width: 100%;
                }

                .search-box input {
                    border: none;
                    outline: none;
                    font-weight: 500;
                    width: 100%;
                }

                .podium-area {
                    display: flex;
                    justify-content: center;
                    align-items: flex-end;
                    gap: 1rem;
                    margin-bottom: 4rem;
                }

                .podium-item {
                    flex: 1;
                    max-width: 220px;
                    background: var(--white);
                    border-radius: 24px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    box-shadow: var(--shadow-sm);
                    position: relative;
                }

                .podium-item.gold {
                    padding: 2.5rem 1.5rem;
                    transform: translateY(-20px);
                    box-shadow: var(--shadow-lg);
                    border: 2px solid var(--primary-light);
                    z-index: 2;
                }

                .podium-rank {
                    position: absolute;
                    top: 1rem;
                    left: 1.25rem;
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: var(--gray-100);
                }

                .avatar-wrapper {
                    position: relative;
                    margin-bottom: 1.5rem;
                }

                .avatar {
                    width: 70px;
                    height: 70px;
                    border-radius: 20px;
                    background: var(--bg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--navy);
                    border: 4px solid white;
                }

                .avatar.main {
                    width: 90px;
                    height: 90px;
                    background: #FFD29D;
                    font-size: 2rem;
                }

                .medal-badge {
                    position: absolute;
                    bottom: -8px;
                    right: -8px;
                    font-size: 1.5rem;
                    background: white;
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }

                .medal-badge.main {
                    width: 44px;
                    height: 44px;
                    font-size: 1.75rem;
                }

                .trophy-overlay {
                    position: absolute;
                    top: -15px;
                    right: -15px;
                    color: #FACC15;
                    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
                }

                .user-name { font-weight: 800; color: var(--navy); margin-bottom: 0.25rem; font-size: 1rem; }
                .user-score { font-weight: 900; color: var(--primary); font-size: 1.25rem; }

                .table-area {
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    margin-bottom: 4rem;
                }

                .table-header {
                    display: grid;
                    grid-template-columns: 80px 1fr 180px 150px 150px;
                    padding: 1.25rem 2rem;
                    background: var(--bg);
                    font-weight: 800;
                    font-size: 0.75rem;
                    color: var(--gray-500);
                    letter-spacing: 0.05em;
                }

                .table-row {
                    display: grid;
                    grid-template-columns: 80px 1fr 180px 150px 150px;
                    padding: 1.25rem 2rem;
                    align-items: center;
                    border-bottom: 1px solid var(--gray-100);
                    transition: background 0.2s;
                }

                .table-row:hover { background: var(--bg); }

                .rank-col { font-weight: 800; color: var(--gray-300); }

                .user-col { display: flex; align-items: center; gap: 1rem; }
                .user-avatar { width: 40px; height: 40px; border-radius: 12px; background: var(--gray-100); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--navy); }
                .user-display-name { font-weight: 700; color: var(--navy); }

                .team-badge {
                    padding: 0.35rem 0.75rem;
                    background: #E0F2FE;
                    color: #0369A1;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 800;
                }

                .score-col { font-weight: 800; color: var(--navy); }

                .trend-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.25rem 0.6rem;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .trend-badge.positive { background: #DCFCE7; color: #166534; }

                @media (max-width: 768px) {
                    .podium-area { flex-direction: column; align-items: center; }
                    .podium-item { width: 100%; max-width: 100%; transform: none !important; margin-bottom: 1rem; }
                    .table-header, .table-row { grid-template-columns: 50px 1fr 100px; padding: 1rem; }
                    .team-col, .status-col { display: none; }
                }
            `}</style>
    </div>
  )
}
