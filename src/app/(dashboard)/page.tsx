'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    ArrowRight,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Plus,
    Minus,
    TrendingUp,
    Target,
    Flame,
    Trophy,
    History,
    Gavel
} from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
    const [profile, setProfile] = useState<any>(null)
    const [pendingJudgments, setPendingJudgments] = useState<any[]>([])
    const [recentTransactions, setRecentTransactions] = useState<any[]>([])
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [malusTypes, setMalusTypes] = useState<any[]>([])
    const [myRank, setMyRank] = useState<number>(0)
    const [todayChange, setTodayChange] = useState<number>(0)
    const [pointsToPodium, setPointsToPodium] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const weeklyGoal = 100.00
    const [totalCollection, setTotalCollection] = useState(0)

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            setProfile(profileData)

            // 2. Fetch All Profiles for Rank & Total Progress
            const { data: allProfiles } = await supabase
                .from('profiles')
                .select('id, display_name, balance')
                .order('balance', { ascending: true })

            if (allProfiles) {
                const rank = allProfiles.findIndex(p => p.id === user.id) + 1
                setMyRank(rank)
                setLeaderboard(allProfiles.slice(0, 3))

                const total = allProfiles.reduce((acc, p) => acc + Number(p.balance), 0)
                setTotalCollection(total)

                if (rank > 3) {
                    const thirdPlaceBalance = Number(allProfiles[2].balance)
                    setPointsToPodium(Math.max(0, Number(profileData?.balance || 0) - thirdPlaceBalance))
                }
            }

            // 3. Fetch Recent Transactions
            const { data: recentData } = await supabase
                .from('transactions')
                .select(`
                  *,
                  target:target_user_id(display_name),
                  type:malus_type_id(name, icon, amount)
                `)
                .order('created_at', { ascending: false })
                .limit(10)

            setRecentTransactions(recentData || [])

            // 4. Calculate Today's Change
            const today = new Date().setHours(0, 0, 0, 0)
            const change = (recentData || [])
                .filter(tx => new Date(tx.created_at).getTime() > today && tx.status === 'approved' && tx.target_user_id === user.id)
                .reduce((acc, tx) => acc + Number(tx.amount), 0)
            setTodayChange(change)

            // 5. Fetch Malus Types for Quick Actions
            const { data: types } = await supabase
                .from('malus_types')
                .select('*')
                .eq('is_active', true)
                .limit(4)
            setMalusTypes(types || [])

            // 6. Fetch Pending Judgments
            const { data: pendingData } = await supabase
                .from('transactions')
                .select(`
                  *,
                  target:target_user_id(display_name),
                  proposer:proposed_by_user_id(display_name),
                  type:malus_type_id(name, icon)
                `)
                .eq('status', 'pending')
                .neq('target_user_id', user.id)
                .neq('proposed_by_user_id', user.id)
            setPendingJudgments(pendingData || [])

            setLoading(false)
        }

        fetchData()

        const channel = supabase
            .channel('dashboard-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchData())
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Sincronizzazione caveau...</p>
            <style jsx>{`
                .loading-container { height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; color: var(--navy); }
                .spinner { width: 40px; height: 40px; border: 4px solid var(--gray-100); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )

    const goalPercentage = Math.min(100, Math.round((totalCollection / weeklyGoal) * 100))

    return (
        <div className="dashboard-layout">
            <div className="main-content-grid">
                {/* Left Column */}
                <div className="left-column">
                    {/* Hero Balance Card */}
                    <div className="hero-balance-card">
                        <div className="balance-info">
                            <span className="label">Il Mio Saldo Attuale</span>
                            <h1 className="amount">€{profile?.balance?.toFixed(2) || '0.00'}</h1>
                            {todayChange > 0 && (
                                <div className="balance-badge">
                                    <TrendingUp size={14} /> <span>+€{todayChange.toFixed(2)} oggi</span>
                                </div>
                            )}
                            <Link href="/storico" className="details-link">
                                <History size={16} /> Dettagli Saldo
                            </Link>
                        </div>
                        <div className="piggy-illustration">
                            <div className="circle-bg"></div>
                            <span className="piggy-icon">💰</span>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="quick-actions">
                        <div className="action-column single-column">
                            <div className="column-header">
                                <AlertCircle size={18} className="malus-icon" />
                                <h3>Malus Rapidi</h3>
                            </div>
                            <div className="actions-grid">
                                {malusTypes.map(type => (
                                    <Link key={type.id} href="/assegna/auto" className="action-card">
                                        <div className="action-icon">{type.icon || '🐷'}</div>
                                        <div className="action-info">
                                            <span className="action-name">{type.name}</span>
                                            <span className="action-desc">{type.amount > 1 ? 'Sanzione Grave' : 'Sanzione Lieve'}</span>
                                        </div>
                                        <span className="action-amount">- €{Math.abs(type.amount).toFixed(2)}</span>
                                    </Link>
                                ))}
                                {malusTypes.length === 0 && (
                                    <p className="empty-msg">Nessun tipo di malus configurato.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent History */}
                    <section className="history-section">
                        <div className="section-header">
                            <h3>Attività Recente</h3>
                            <Link href="/storico" className="view-all">Vedi tutto</Link>
                        </div>
                        <div className="history-list card">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((tx) => (
                                    <div key={tx.id} className="history-item">
                                        <div className={`status-dot ${tx.status}`}></div>
                                        <div className="history-info">
                                            <p className="tx-name">
                                                <strong>{tx.target?.display_name}</strong>: {tx.type?.name || tx.description}
                                            </p>
                                            <p className="tx-meta">
                                                {new Date(tx.created_at).toLocaleDateString()} alle {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <span className={`tx-amount ${tx.amount > 0 ? 'plus' : 'minus'}`}>
                                            {tx.status === 'rejected' || tx.status === 'cancelled' ? (
                                                <span className="strikethrough">€{Math.abs(tx.amount).toFixed(2)}</span>
                                            ) : (
                                                <>€{Math.abs(tx.amount).toFixed(2)}</>
                                            )}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-history">Ancora nessuna sanzione... siate più cattivi! 😉</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column (Widgets) */}
                <div className="right-column">
                    {/* Mini Leaderboard Card */}
                    <div className="widget-card leaderboard-widget">
                        <div className="widget-header">
                            <h3>Classifica</h3>
                            <Trophy size={18} className="header-icon" />
                        </div>

                        <div className="my-rank-status">
                            <div className="rank-avatar">
                                <div className="avatar-inner">
                                    <span>{profile?.display_name?.charAt(0)}</span>
                                    <div className="rank-badge">#{myRank}</div>
                                </div>
                            </div>
                            <h4>{myRank === 1 ? '🥇 Sei in testa!' : `Sei al ${myRank}° posto!`}</h4>
                            {myRank > 3 && pointsToPodium > 0 ? (
                                <p>Ti mancano €{pointsToPodium.toFixed(2)} per il podio</p>
                            ) : myRank <= 3 ? (
                                <p>Mantieni la posizione! 🏆</p>
                            ) : null}
                        </div>

                        <div className="mini-ranking">
                            {leaderboard.map((user, idx) => (
                                <div key={idx} className="ranking-item">
                                    <span className="rank-num">{idx + 1}</span>
                                    <div className="user-dot">{user.display_name.charAt(0)}</div>
                                    <span className="user-name">{user.display_name}</span>
                                    <span className="user-score">€{Number(user.balance).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <Link href="/classifica" className="wide-btn">
                            Vedi Classifica Completa
                        </Link>
                    </div>

                    {/* Weekly Goal Card */}
                    <div className="widget-card goal-widget">
                        <h3>Fondo Comune</h3>
                        <div className="progress-container">
                            <div className="progress-labels">
                                <span className="status">{goalPercentage >= 100 ? 'RAGGIUNTO' : 'IN CORSO'}</span>
                                <span className="percentage">{goalPercentage}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${goalPercentage}%` }}></div>
                            </div>
                        </div>
                        <div className="goal-info">
                            <p className="total-amount">Totale: €{totalCollection.toFixed(2)} / €{weeklyGoal.toFixed(2)}</p>
                            <p className="goal-hint">
                                {goalPercentage >= 100
                                    ? 'Obiettivo sbloccato! Preparate le forchette! 🥂'
                                    : `Mancano €${(weeklyGoal - totalCollection).toFixed(2)} per la "Cena di Team"!`}
                            </p>
                        </div>
                    </div>

                    {/* Pending Judgments Sidebar */}
                    {pendingJudgments.length > 0 && (
                        <div className="widget-card pending-widget">
                            <div className="widget-header">
                                <h3>Giudizi Richiesti</h3>
                                <Gavel size={18} className="header-icon" />
                            </div>
                            <div className="mini-pending-list">
                                {pendingJudgments.slice(0, 3).map((tx) => (
                                    <Link key={tx.id} href={`/giudica/${tx.id}`} className="mini-pending-item">
                                        <p><strong>{tx.target?.display_name}</strong> accusato di <em>{tx.type?.name}</em></p>
                                        <div className="proposer-info">Da {tx.proposer?.display_name}</div>
                                        <div className="go-btn"><ArrowRight size={14} /></div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .dashboard-layout { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .main-content-grid { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; align-items: start; }

                .hero-balance-card {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    border-radius: 28px;
                    padding: 3rem;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 193, 142, 0.2);
                    margin-bottom: 2.5rem;
                }

                .balance-info .label { font-size: 1rem; font-weight: 600; opacity: 0.9; }
                .balance-info .amount { font-size: 4rem; font-weight: 950; margin: 0.5rem 0; letter-spacing: -0.04em; }
                .balance-badge { background: rgba(255, 255, 255, 0.2); padding: 0.5rem 1rem; border-radius: 100px; display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 800; margin-bottom: 1.5rem; }

                .details-link { display: inline-flex; align-items: center; gap: 0.5rem; color: white; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 2px; font-size: 0.9rem; font-weight: 700; transition: opacity 0.2s; }
                .details-link:hover { opacity: 0.8; }

                .piggy-illustration { position: relative; width: 200px; height: 200px; display: flex; align-items: center; justify-content: center; }
                .circle-bg { position: absolute; width: 160px; height: 160px; background: rgba(255, 255, 255, 0.15); border-radius: 50%; animation: pulse 3s infinite; }
                @keyframes pulse { 0% { transform: scale(1); opacity: 0.15; } 50% { transform: scale(1.1); opacity: 0.25; } 100% { transform: scale(1); opacity: 0.15; } }
                .piggy-icon { font-size: 6rem; position: relative; z-index: 1; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1)); }

                .quick-actions { margin-bottom: 3rem; }
                .action-column h3 { font-size: 1.25rem; font-weight: 800; margin: 0; color: var(--navy); }
                .column-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
                .malus-icon { color: var(--accent); }

                .actions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
                .action-card { background: white; border-radius: 20px; padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; box-shadow: var(--shadow-sm); border: 1px solid var(--gray-100); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
                .action-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); border-color: var(--primary-light); }

                .action-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; background: var(--bg); }
                .action-info { flex: 1; }
                .action-name { display: block; font-weight: 800; color: var(--navy); font-size: 1rem; }
                .action-desc { font-size: 0.8rem; color: var(--gray-500); font-weight: 500; }
                .action-amount { font-weight: 900; color: var(--accent); font-size: 1.1rem; }

                .history-section { margin-top: 1rem; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .section-header h3 { font-size: 1.25rem; font-weight: 800; margin: 0; color: var(--navy); }
                .view-all { color: var(--primary); font-size: 0.9rem; font-weight: 800; }

                .history-list { background: white; border-radius: 24px; padding: 1rem; border: 1px solid var(--gray-100); }
                .history-item { display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem; border-bottom: 1px solid var(--gray-50); transition: background 0.2s; }
                .history-item:last-child { border: none; }
                .history-item:hover { background: var(--bg); border-radius: 12px; }

                .status-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
                .status-dot.approved { background: var(--primary); box-shadow: 0 0 10px rgba(0, 193, 142, 0.3); }
                .status-dot.pending { background: #FACC15; }
                .status-dot.rejected, .status-dot.cancelled { background: var(--gray-300); }
                .status-dot.contested { background: var(--accent); }

                .history-info { flex: 1; }
                .tx-name { color: var(--navy); margin: 0; font-size: 1rem; }
                .tx-meta { font-size: 0.8rem; color: var(--gray-400); margin-top: 0.25rem; font-weight: 500; }
                .tx-amount { font-weight: 900; font-size: 1.1rem; color: var(--navy); }
                .tx-amount.minus { color: var(--accent); }
                .tx-amount.plus { color: var(--primary); }
                .strikethrough { text-decoration: line-through; opacity: 0.4; }

                .widget-card { background: var(--navy); color: white; border-radius: 28px; padding: 2rem; margin-bottom: 2rem; box-shadow: var(--shadow-xl); }
                .widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
                .widget-header h3 { color: white; margin: 0; font-size: 1.25rem; font-weight: 800; }
                .header-icon { color: var(--primary); }

                .my-rank-status { text-align: center; margin-bottom: 2.5rem; }
                .avatar-inner { width: 84px; height: 84px; border-radius: 24px; background: linear-gradient(135deg, #FFD29D, #ffb347); color: var(--navy); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; position: relative; border: 4px solid rgba(255,255,255,0.15); margin: 0 auto 1.5rem auto; }
                .rank-badge { position: absolute; bottom: -10px; right: -10px; background: var(--primary); color: white; font-size: 0.85rem; padding: 4px 10px; border-radius: 10px; border: 3px solid var(--navy); font-weight: 900; }
                .my-rank-status h4 { color: white; margin: 0.5rem 0 0.5rem 0; font-size: 1.5rem; font-weight: 900; }
                .my-rank-status p { font-size: 1rem; opacity: 0.8; font-weight: 500; }

                .mini-ranking { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; }
                .ranking-item { display: flex; align-items: center; gap: 1rem; background: rgba(255, 255, 255, 0.05); padding: 1rem 1.25rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
                .rank-num { font-weight: 900; color: var(--primary); width: 15px; font-size: 1rem; }
                .user-dot { width: 36px; height: 36px; background: rgba(255,255,255,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary-light); }
                .user-name { flex: 1; font-weight: 700; font-size: 1rem; }
                .user-score { font-weight: 900; font-size: 1rem; color: var(--primary-light); }

                .wide-btn { display: block; text-align: center; padding: 1.25rem; border-radius: 18px; background: rgba(255,255,255,0.08); color: white; font-weight: 800; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.1); }
                .wide-btn:hover { background: var(--primary); border-color: var(--primary); transform: translateY(-2px); }

                .goal-widget { background: white; color: var(--navy); border: 1px solid var(--gray-100); }
                .goal-widget h3 { color: var(--navy); margin-bottom: 2rem; }
                .progress-container { background: var(--bg); padding: 1.5rem; border-radius: 20px; margin-bottom: 1.5rem; }
                .progress-labels { display: flex; justify-content: space-between; margin-bottom: 1rem; font-weight: 900; font-size: 0.85rem; text-transform: uppercase; }
                .progress-bar { height: 14px; background: var(--gray-200); border-radius: 7px; overflow: hidden; }
                .progress-fill { height: 100%; background: var(--primary); border-radius: 7px; transition: width 1s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .goal-info { text-align: center; }
                .total-amount { font-weight: 900; color: var(--navy); font-size: 1.1rem; margin-bottom: 0.5rem; }
                .goal-hint { font-size: 0.9rem; color: var(--gray-500); font-weight: 600; line-height: 1.4; }

                .pending-widget { background: linear-gradient(135deg, var(--accent) 0%, #e11d48 100%); }
                .pending-widget h3 { color: white; }
                .pending-widget .header-icon { color: white; }
                .mini-pending-list { display: flex; flex-direction: column; gap: 1rem; }
                .mini-pending-item { background: rgba(255,255,255,0.15); padding: 1.25rem; border-radius: 18px; color: white; display: block; transition: all 0.2s; position: relative; border: 1px solid rgba(255,255,255,0.1); }
                .mini-pending-item:hover { background: rgba(255,255,255,0.25); transform: translateX(5px); }
                .mini-pending-item p { margin: 0 0 0.5rem 0; font-size: 0.95rem; line-height: 1.4; padding-right: 20px; }
                .proposer-info { font-size: 0.75rem; opacity: 0.8; font-weight: 700; text-transform: uppercase; }
                .go-btn { position: absolute; top: 1.25rem; right: 1.25rem; }

                .empty-msg, .empty-history { text-align: center; color: var(--gray-400); padding: 2rem; font-style: italic; font-weight: 500; font-size: 0.9rem; }

                @media (max-width: 1024px) { .main-content-grid { grid-template-columns: 1fr; } .right-column { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; } }
                @media (max-width: 768px) { .right-column { grid-template-columns: 1fr; } .hero-balance-card { padding: 2rem; } .balance-info .amount { font-size: 3rem; } .piggy-illustration { display: none; } }
            `}</style>
        </div>
    )
}
