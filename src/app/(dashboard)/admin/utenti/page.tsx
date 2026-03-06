'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, UserMinus, Shield, User, Save, X, RefreshCw, Search, MoreVertical, Coins, Mail, UserCheck } from 'lucide-react'

export default function UsersAdminPage() {
    const [profiles, setProfiles] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [isAddingUser, setIsAddingUser] = useState(false)
    const [newUser, setNewUser] = useState({
        displayName: '',
        email: '',
        role: 'user' as 'admin' | 'user'
    })
    const supabase = createClient()

    useEffect(() => {
        fetchProfiles()
    }, [])

    async function fetchProfiles() {
        setLoading(true)
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('display_name')
        setProfiles(data || [])
        setLoading(false)
    }

    const filteredProfiles = profiles.filter(p =>
        p.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleToggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin'
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)

        if (!error) {
            setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p))
        }
    }

    const handleUpdateBalance = async (userId: string, currentBalance: number, amount: number) => {
        const newBalance = Math.max(0, currentBalance + amount)
        const { error } = await supabase
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', userId)

        if (!error) {
            setProfiles(profiles.map(p => p.id === userId ? { ...p, balance: newBalance } : p))
        }
    }

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        alert('La creazione utenti richiede integrazione backend. Aggiungi manualmente in Supabase Dashboard.')
        setIsAddingUser(false)
    }

    if (loading && profiles.length === 0) return <div className="loading">Sincronizzazione membri...</div>

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div className="title-block">
                    <h1>Membri del Team</h1>
                    <p>Gestisci profili, ruoli e monitora i saldi individuali.</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Cerca per nome o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="members-grid">
                {filteredProfiles.map(p => (
                    <div key={p.id} className="member-card card">
                        <div className="card-top">
                            <div className="member-avatar">
                                {p.display_name.charAt(0)}
                            </div>
                            <div className="member-status">
                                <span className={`role-badge ${p.role}`}>
                                    {p.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                                    {p.role}
                                </span>
                            </div>
                        </div>

                        <div className="member-info">
                            <h3>{p.display_name}</h3>
                            <p className="email">
                                <Mail size={12} />
                                {p.email || 'Nessuna email'}
                            </p>
                        </div>

                        <div className="member-stats">
                            <div className="stat-item">
                                <Coins size={14} className="stat-icon" />
                                <div className="stat-content">
                                    <span className="label">Saldo Attuale</span>
                                    <span className="value">€{p.balance.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="member-controls">
                            <div className="balance-ajustment">
                                <button onClick={() => handleUpdateBalance(p.id, p.balance, -0.50)} className="adj-btn minus">-0.50</button>
                                <button onClick={() => handleUpdateBalance(p.id, p.balance, 0.50)} className="adj-btn plus">+0.50</button>
                            </div>
                            <div className="role-adjustment">
                                <button
                                    className="role-btn"
                                    onClick={() => handleToggleRole(p.id, p.role)}
                                    title={p.role === 'admin' ? 'Declassa a Utente' : 'Promuovi ad Admin'}
                                >
                                    {p.role === 'admin' ? <UserMinus size={16} /> : <UserCheck size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .admin-container { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .admin-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; gap: 2rem; }
                .title-block h1 { font-size: 2rem; font-weight: 800; color: var(--navy); margin-bottom: 0.5rem; }
                .title-block p { color: var(--gray-500); font-weight: 500; }

                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: white;
                    padding: 0.75rem 1.25rem;
                    border-radius: 14px;
                    border: 1px solid var(--gray-100);
                    color: var(--gray-400);
                    width: 320px;
                    box-shadow: var(--shadow-sm);
                }
                .search-bar input { border: none; outline: none; font-size: 0.9rem; font-weight: 500; width: 100%; color: var(--navy); }

                .members-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .member-card {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    transition: all 0.3s ease;
                }
                .member-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }

                .card-top { display: flex; justify-content: space-between; align-items: flex-start; }
                .member-avatar {
                    width: 48px;
                    height: 48px;
                    background: var(--bg);
                    color: var(--navy);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 1.25rem;
                }

                .role-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 100px;
                    font-size: 0.65rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .role-badge.admin { background: #fee2e2; color: #991b1b; }
                .role-badge.user { background: #f1f5f9; color: #475569; }

                .member-info h3 { font-size: 1.15rem; font-weight: 800; color: var(--navy); margin-bottom: 0.25rem; }
                .member-info .email { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--gray-500); font-weight: 500; }

                .member-stats {
                    background: var(--bg);
                    padding: 1rem;
                    border-radius: 12px;
                }
                .stat-item { display: flex; align-items: center; gap: 0.75rem; }
                .stat-icon { color: var(--primary); }
                .stat-content { display: flex; flex-direction: column; }
                .stat-content .label { font-size: 0.7rem; font-weight: 700; color: var(--gray-500); text-transform: uppercase; }
                .stat-content .value { font-size: 1rem; font-weight: 800; color: var(--navy); }

                .member-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 1rem;
                    border-top: 1px solid var(--gray-100);
                }

                .balance-ajustment { display: flex; gap: 0.5rem; }
                .adj-btn {
                    padding: 0.4rem 0.8rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    transition: all 0.2s;
                }
                .adj-btn.minus { background: white; border: 1px solid var(--gray-100); color: var(--accent); }
                .adj-btn.minus:hover { background: #fff1f2; }
                .adj-btn.plus { background: white; border: 1px solid var(--gray-100); color: var(--primary); }
                .adj-btn.plus:hover { background: #f0fdf4; }

                .role-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--gray-400);
                    transition: all 0.2s;
                }
                .role-btn:hover { background: var(--bg); color: var(--navy); }

                @media (max-width: 640px) {
                    .admin-header { flex-direction: column; align-items: flex-start; }
                    .search-bar { width: 100%; }
                }
            `}</style>
        </div>
    )
}
