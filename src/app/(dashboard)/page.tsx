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
    History
} from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
    const [profile, setProfile] = useState<any>(null)
    const [pendingJudgments, setPendingJudgments] = useState<any[]>([])
    const [recentTransactions, setRecentTransactions] = useState<any[]>([])
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const weeklyGoal = 50.00
    const currentGoalProgress = 32.50 // Placeholder

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            setProfile(profileData)

            // Fetch Recent Transactions
            const { data: recentData } = await supabase
                .from('transactions')
                .select(`
                  *,
                  target:target_user_id(display_name),
                  type:malus_type_id(name, icon, amount)
                `)
                .order('created_at', { ascending: false })
                .limit(5)
            setRecentTransactions(recentData || [])

            // Fetch Top 3 for Mini-Leaderboard
            const { data: topPlayers } = await supabase
                .from('profiles')
                .select('display_name, balance')
                .order('balance', { ascending: true })
                .limit(3)
            setLeaderboard(topPlayers || [])

            // Fetch Pending Judgments
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

    if (loading) return <div className="loading">Inizializzando il salvadanaio...</div>

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
                            <div className="balance-badge">
                                <TrendingUp size={14} /> <span>+2.30 oggi</span>
                            </div>
                            <button className="details-btn">
                                <History size={16} /> Dettagli Saldo
                            </button>
                        </div>
                        <div className="piggy-illustration">
                            <div className="circle-bg"></div>
                            <span className="piggy-icon">💰</span>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="quick-actions">
                        <div className="action-column">
                            <div className="column-header">
                                <AlertCircle size={18} className="malus-icon" />
                                <h3>Aggiungi Malus</h3>
                            </div>
                            <Link href="/assegna/auto" className="action-card">
                                <div className="action-icon cafe">☕</div>
                                <div className="action-info">
                                    <span className="action-name">Caffè Extra</span>
                                    <span className="action-desc">Multa distrazione</span>
                                </div>
                                <span className="action-amount">- €0.50</span>
                            </Link>
                            <Link href="/assegna/auto" className="action-card">
                                <div className="action-icon talk">🎙️</div>
                                <div className="action-info">
                                    <span className="action-name">Parlato troppo</span>
                                    <span className="action-desc">Disturbo quiete</span>
                                </div>
                                <span className="action-amount">- €1.00</span>
                            </Link>
                        </div>

                        <div className="action-column">
                            <div className="column-header">
                                <CheckCircle2 size={18} className="bonus-icon" />
                                <h3>Aggiungi Bonus</h3>
                            </div>
                            <div className="action-card">
                                <div className="action-icon cake">🍰</div>
                                <div className="action-info">
                                    <span className="action-name">Torta in ufficio</span>
                                    <span className="action-desc">Gentilezza</span>
                                </div>
                                <span className="action-amount bonus">+ €1.50</span>
                            </div>
                            <div className="action-card">
                                <div className="action-icon help">🤝</div>
                                <div className="action-info">
                                    <span className="action-name">Aiuto Task</span>
                                    <span className="action-desc">Collaborazione</span>
                                </div>
                                <span className="action-amount bonus">+ €2.00</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent History */}
                    <section className="history-section">
                        <div className="section-header">
                            <h3>Storico Transazioni</h3>
                            <Link href="/storico" className="view-all">Vedi tutto</Link>
                        </div>
                        <div className="history-list card">
                            {recentTransactions.map((tx) => (
                                <div key={tx.id} className="history-item">
                                    <div className={`status-dot ${tx.status}`}></div>
                                    <div className="history-info">
                                        <p className="tx-name">{tx.type?.name || 'Transazione'}</p>
                                        <p className="tx-meta">Oggi, {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <span className={`tx-amount ${tx.amount > 0 ? 'plus' : 'minus'}`}>
                                        {tx.amount > 0 ? '+' : ''}€{Math.abs(tx.amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}
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
                                    <div className="rank-badge">#4</div>
                                </div>
                            </div>
                            <h4>Sei al 4° posto!</h4>
                            <p>Ti mancano €3.20 per il podio</p>
                        </div>

                        <div className="mini-ranking">
                            {leaderboard.map((user, idx) => (
                                <div key={idx} className="ranking-item">
                                    <span className="rank-num">{idx + 1}</span>
                                    <div className="user-dot"></div>
                                    <span className="user-name">{user.display_name}</span>
                                    <span className="user-score">€{user.balance.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <Link href="/classifica" className="wide-btn">
                            Vedi Classifica Completa
                        </Link>
                    </div>

                    {/* Weekly Goal Card */}
                    <div className="widget-card goal-widget">
                        <h3>Obiettivo Settimanale</h3>
                        <div className="progress-container">
                            <div className="progress-labels">
                                <span className="status">IN CORSO</span>
                                <span className="percentage">65%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                        <p className="goal-hint">
                            Mancano €6.50 per sbloccare la <em>"Cena di Team"</em>!
                        </p>
                    </div>

                    {/* Pending Judgments Sidebar */}
                    {pendingJudgments.length > 0 && (
                        <div className="widget-card pending-widget">
                            <h3>Richieste in Sospeso</h3>
                            <div className="mini-pending-list">
                                {pendingJudgments.slice(0, 2).map((tx) => (
                                    <div key={tx.id} className="mini-pending-item">
                                        <p><strong>{tx.target?.display_name}</strong> è colpevole di {tx.type?.name}?</p>
                                        <div className="mini-actions">
                                            <button className="mini-btn approve">Sì</button>
                                            <button className="mini-btn reject">No</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .dashboard-layout {
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .main-content-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 2rem;
                    align-items: start;
                }

                .hero-balance-card {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    border-radius: 24px;
                    padding: 2.5rem;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 193, 142, 0.2);
                    margin-bottom: 2rem;
                }

                .balance-info .label {
                    font-size: 0.95rem;
                    font-weight: 600;
                    opacity: 0.9;
                }

                .balance-info .amount {
                    font-size: 3.5rem;
                    font-weight: 900;
                    margin: 0.5rem 0;
                    letter-spacing: -0.02em;
                }

                .balance-badge {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 0.4rem 0.8rem;
                    border-radius: 100px;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                }

                .details-btn {
                    padding: 0.75rem 1.25rem;
                    background: black;
                    color: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }

                .piggy-illustration {
                    position: relative;
                    width: 180px;
                    height: 180px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .circle-bg {
                    position: absolute;
                    width: 150px;
                    height: 150px;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 50%;
                }

                .piggy-icon {
                    font-size: 5rem;
                    position: relative;
                    z-index: 1;
                }

                .quick-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                .action-column h3 {
                    font-size: 1.1rem;
                    font-weight: 800;
                    margin: 0;
                }

                .column-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                }

                .malus-icon { color: var(--accent); }
                .bonus-icon { color: var(--primary); }

                .action-card {
                    background: var(--white);
                    border-radius: 18px;
                    padding: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 0.75rem;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid transparent;
                    transition: all 0.2s;
                    cursor: pointer;
                }

                .action-card:hover {
                    box-shadow: var(--shadow);
                    transform: translateY(-2px);
                    border-color: var(--gray-200);
                }

                .action-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    background: var(--bg);
                }

                .action-info { flex: 1; }
                .action-name { display: block; font-weight: 700; color: var(--navy); }
                .action-desc { font-size: 0.75rem; color: var(--gray-500); }
                .action-amount { font-weight: 800; color: var(--accent); font-size: 0.95rem; }
                .action-amount.bonus { color: var(--primary); }

                .history-section {
                    margin-top: 1rem;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                }

                .section-header h3 { font-size: 1.1rem; font-weight: 800; margin: 0; }
                .view-all { color: var(--primary); font-size: 0.85rem; font-weight: 700; }

                .history-list {
                    background: white;
                    border-radius: 20px;
                    padding: 0.5rem;
                }

                .history-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    border-bottom: 1px solid var(--gray-100);
                }

                .history-item:last-child { border: none; }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }
                .status-dot.approved { background: var(--accent); }
                .status-dot.pending { background: #FACC15; }
                .status-dot.rejected { background: var(--gray-200); }

                .history-info { flex: 1; }
                .tx-name { font-weight: 700; color: var(--navy); margin: 0; }
                .tx-meta { font-size: 0.75rem; color: var(--gray-500); margin: 0; }
                .tx-amount { font-weight: 800; }
                .tx-amount.minus { color: var(--accent); }
                .tx-amount.plus { color: var(--primary); }

                /* Widgets */
                .widget-card {
                    background: var(--navy);
                    color: white;
                    border-radius: 24px;
                    padding: 1.75rem;
                    margin-bottom: 1.5rem;
                    box-shadow: var(--shadow-lg);
                }

                .widget-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .widget-header h3 { color: white; margin: 0; font-size: 1.1rem; }
                .header-icon { color: #FACC15; }

                .my-rank-status {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .rank-avatar {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 1rem;
                }

                .avatar-inner {
                    width: 70px;
                    height: 70px;
                    border-radius: 20px;
                    background: #FFD29D;
                    color: var(--navy);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: 800;
                    position: relative;
                    border: 3px solid rgba(255,255,255,0.1);
                }

                .rank-badge {
                    position: absolute;
                    bottom: -8px;
                    right: -8px;
                    background: var(--primary);
                    color: white;
                    font-size: 0.75rem;
                    padding: 2px 6px;
                    border-radius: 6px;
                    border: 2px solid var(--navy);
                }

                .my-rank-status h4 { color: white; margin: 0.5rem 0 0.25rem 0; font-size: 1.2rem; }
                .my-rank-status p { font-size: 0.85rem; opacity: 0.7; margin: 0; }

                .mini-ranking {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                }

                .ranking-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                }

                .rank-num { font-weight: 800; color: var(--primary); width: 12px; }
                .user-dot { width: 32px; height: 32px; background: rgba(255,255,255,0.1); border-radius: 50%; }
                .user-name { flex: 1; font-weight: 600; font-size: 0.9rem; }
                .user-score { font-weight: 700; font-size: 0.9rem; }

                .wide-btn {
                    display: block;
                    text-align: center;
                    padding: 1rem;
                    border-radius: 14px;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    font-weight: 700;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }

                .wide-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .goal-widget {
                    background: var(--white);
                    color: var(--navy);
                }

                .goal-widget h3 { color: var(--navy); margin-bottom: 1.5rem; }

                .progress-container {
                    background: var(--bg);
                    padding: 1.25rem;
                    border-radius: 16px;
                    margin-bottom: 1rem;
                }

                .progress-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                    font-weight: 800;
                    font-size: 0.75rem;
                }

                .progress-labels .status { color: var(--primary); }

                .progress-bar {
                    height: 10px;
                    background: var(--gray-100);
                    border-radius: 5px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: var(--primary);
                    border-radius: 5px;
                }

                .goal-hint {
                    font-size: 0.8rem;
                    color: var(--gray-500);
                    text-align: center;
                    margin: 0;
                }

                @media (max-width: 1024px) {
                    .main-content-grid {
                        grid-template-columns: 1fr;
                    }

                    .right-column {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 1.5rem;
                    }
                }

                @media (max-width: 640px) {
                    .right-column { grid-template-columns: 1fr; }
                    .quick-actions { grid-template-columns: 1fr; }
                    .hero-balance-card { flex-direction: column; text-align: center; padding: 2rem; }
                    .piggy-illustration { width: 120px; height: 120px; margin-top: 1rem; }
                    .piggy-icon { font-size: 3.5rem; }
                    .balance-info .amount { font-size: 2.5rem; }
                }
            `}</style>
        </div>
    )
}
