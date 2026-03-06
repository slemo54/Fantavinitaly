'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, UserMinus, Shield, User, Save, X, RefreshCw, Search, MoreVertical, Coins, Mail, UserCheck, TrendingUp, TrendingDown } from 'lucide-react'

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

    if (loading && profiles.length === 0) {
        return (
            <div className="loading-container">
                <RefreshCw className="animate-spin" />
                <p>Sincronizzazione membri...</p>
                <style jsx>{`
                    .loading-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 60vh;
                        gap: 1rem;
                        font-weight: 700;
                        color: var(--gray-500);
                    }
                `}</style>
            </div>
        )
    }

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
                    <div key={p.id} className="member-card card animate-in">
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
                                <Mail size={14} />
                                {p.email || 'Nessuna email'}
                            </p>
                        </div>

                        <div className="member-stats">
                            <div className="stat-item">
                                <div className="stat-icon-wrapper">
                                    <Coins size={20} />
                                </div>
                                <div className="stat-content">
                                    <span className="label">Saldo Disponibile</span>
                                    <span className="value">€{p.balance.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="member-controls">
                            <div className="balance-adjustment">
                                <button
                                    onClick={() => handleUpdateBalance(p.id, p.balance, -0.50)}
                                    className="adj-btn minus"
                                    title="Sottrai 0.50€"
                                >
                                    <TrendingDown size={14} />
                                    <span>-0.50</span>
                                </button>
                                <button
                                    onClick={() => handleUpdateBalance(p.id, p.balance, 0.50)}
                                    className="adj-btn plus"
                                    title="Aggiungi 0.50€"
                                >
                                    <TrendingUp size={14} />
                                    <span>+0.50</span>
                                </button>
                            </div>
                            <div className="role-adjustment">
                                <button
                                    className="role-btn"
                                    onClick={() => handleToggleRole(p.id, p.role)}
                                    title={p.role === 'admin' ? 'Declassa a Utente' : 'Promuovi ad Admin'}
                                >
                                    {p.role === 'admin' ? <UserMinus size={18} /> : <UserCheck size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .admin-container { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .admin-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; gap: 2rem; }
                .title-block h1 { font-size: 2.2rem; font-weight: 800; color: var(--navy); margin-bottom: 0.5rem; letter-spacing: -0.03em; }
                .title-block p { color: var(--gray-500); font-weight: 500; font-size: 1.1rem; }

                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: white;
                    padding: 0.85rem 1.25rem;
                    border-radius: 16px;
                    border: 1px solid var(--gray-200);
                    color: var(--gray-400);
                    width: 380px;
                    transition: all 0.2s;
                    box-shadow: var(--shadow-sm);
                }
                .search-bar:focus-within {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px rgba(0, 193, 142, 0.1);
                    width: 420px;
                }
                .search-bar input { border: none; outline: none; font-size: 1rem; font-weight: 500; width: 100%; color: var(--navy); }

                .members-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .member-card {
                    padding: 1.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid var(--gray-100);
                    background: white;
                }
                .member-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-xl); border-color: var(--primary-light); }

                .card-top { display: flex; justify-content: space-between; align-items: flex-start; }
                .member-avatar {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, var(--primary-light), var(--primary));
                    color: white;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 1.5rem;
                    box-shadow: 0 4px 12px rgba(0, 193, 142, 0.2);
                }

                .role-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.35rem 0.85rem;
                    border-radius: 100px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .role-badge.admin { background: #fee2e2; color: #991b1b; }
                .role-badge.user { background: #f1f5f9; color: #475569; }

                .member-info h3 { font-size: 1.3rem; font-weight: 800; color: var(--navy); margin-bottom: 0.35rem; letter-spacing: -0.01em; }
                .member-info .email { display: flex; align-items: center; gap: 0.6rem; font-size: 0.9rem; color: var(--gray-500); font-weight: 500; }

                .member-stats {
                    background: var(--bg);
                    padding: 1.25rem;
                    border-radius: 16px;
                    border: 1px solid var(--gray-100);
                }
                .stat-item { display: flex; align-items: center; gap: 1rem; }
                .stat-icon-wrapper { 
                    width: 40px; 
                    height: 40px; 
                    background: white; 
                    border-radius: 12px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: var(--primary); 
                    box-shadow: var(--shadow-sm);
                }
                .stat-content { display: flex; flex-direction: column; }
                .stat-content .label { font-size: 0.75rem; font-weight: 700; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.02em; }
                .stat-content .value { font-size: 1.15rem; font-weight: 900; color: var(--navy); }

                .member-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 1.25rem;
                    border-top: 1px solid var(--gray-100);
                    gap: 0.75rem;
                }

                .balance-adjustment { display: flex; gap: 0.6rem; }
                .adj-btn {
                    padding: 0.5rem 0.9rem;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    transition: all 0.2s;
                    border: 1px solid var(--gray-100);
                    background: white;
                }
                .adj-btn.minus { color: var(--accent); }
                .adj-btn.minus:hover { background: #fff1f2; border-color: var(--accent-light); }
                .adj-btn.plus { color: var(--primary); }
                .adj-btn.plus:hover { background: #f0fdf4; border-color: var(--primary-light); }

                .role-btn {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--gray-400);
                    background: var(--bg);
                    transition: all 0.2s;
                }
                .role-btn:hover { background: var(--navy); color: white; transform: rotate(15deg); }

                .animate-in { animation: slideUp 0.3s ease-out both; }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .admin-header { flex-direction: column; align-items: stretch; }
                    .search-bar { width: 100%; }
                    .search-bar:focus-within { width: 100%; }
                }
            `}</style>
        </div>
    )
}
