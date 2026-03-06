'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Gavel, Check, X, AlertCircle, Clock, MessageSquare, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react'

export default function ContestationsAdminPage() {
    const [contestations, setContestations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchContestations()
    }, [])

    async function fetchContestations() {
        setLoading(true)
        const { data } = await supabase
            .from('transactions')
            .select(`
                *,
                target:target_user_id(display_name, email),
                proposer:proposed_by_user_id(display_name),
                type:malus_type_id(name, icon, amount)
            `)
            .eq('status', 'contested')
            .order('contested_at', { ascending: false })
        setContestations(data || [])
        setLoading(false)
    }

    const handleDecision = async (txId: string, status: 'approved' | 'cancelled') => {
        const { error } = await supabase
            .from('transactions')
            .update({ status })
            .eq('id', txId)

        if (!error) {
            setContestations(contestations.filter(c => c.id !== txId))
        }
    }

    if (loading && contestations.length === 0) return <div className="loading">Consultando gli archivi legali...</div>

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div className="title-block">
                    <h1>Corte d'Appello</h1>
                    <p>Revisione delle sanzioni contestate e giudizio finale.</p>
                </div>
            </header>

            {contestations.length === 0 ? (
                <div className="empty-state card">
                    <div className="empty-icon">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2>Tutto in Ordine</h2>
                    <p>Non ci sono contestazioni pendenti. Il clima aziendale sembra sereno!</p>
                </div>
            ) : (
                <div className="contestations-list">
                    {contestations.map(c => (
                        <div key={c.id} className="contestation-card card animate-in">
                            <div className="card-header">
                                <div className="header-left">
                                    <div className="malus-badge">
                                        {c.type?.icon || '⚖️'}
                                    </div>
                                    <div className="header-info">
                                        <h3>{c.target?.display_name} contestazione</h3>
                                        <p className="timestamp">
                                            <Clock size={12} />
                                            Contestato il {new Date(c.contested_at).toLocaleString('it-IT')}
                                        </p>
                                    </div>
                                </div>
                                <div className="amount-tag">
                                    -€{Math.abs(c.amount).toFixed(2)}
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="debate-grid">
                                    <div className="debate-box accusation">
                                        <div className="box-label">
                                            <ShieldAlert size={14} />
                                            Accusa di {c.proposer?.display_name || 'Sistema'}
                                        </div>
                                        <p className="text">"{c.description || c.type?.name}"</p>
                                    </div>

                                    <div className="debate-box defense">
                                        <div className="box-label">
                                            <MessageSquare size={14} />
                                            Difesa di {c.target?.display_name}
                                        </div>
                                        <p className="text italic">"{c.contestation_reason || 'Nessun motivo specificato.'}"</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-footer">
                                <button
                                    className="judge-btn reject"
                                    onClick={() => handleDecision(c.id, 'cancelled')}
                                >
                                    <XCircle size={18} />
                                    <span>Annulla Sanzione</span>
                                </button>
                                <button
                                    className="judge-btn confirm"
                                    onClick={() => handleDecision(c.id, 'approved')}
                                >
                                    <CheckCircle2 size={18} />
                                    <span>Conferma Sanzione</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .admin-container { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .admin-header { margin-bottom: 3rem; }
                .title-block h1 { font-size: 2rem; font-weight: 800; color: var(--navy); margin-bottom: 0.5rem; }
                .title-block p { color: var(--gray-500); font-weight: 500; }

                .empty-state {
                    text-align: center;
                    padding: 5rem 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                }
                .empty-icon { color: var(--primary); }
                .empty-state h2 { font-size: 1.5rem; font-weight: 800; color: var(--navy); }
                .empty-state p { color: var(--gray-500); font-weight: 500; }

                .contestations-list { display: flex; flex-direction: column; gap: 2rem; margin-bottom: 4rem; }

                .contestation-card {
                    padding: 0;
                    overflow: hidden;
                    border: 1px solid var(--gray-100);
                    box-shadow: var(--shadow-sm);
                }

                .card-header {
                    padding: 1.5rem 2rem;
                    background: var(--bg);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--gray-100);
                }

                .header-left { display: flex; align-items: center; gap: 1.25rem; }
                .malus-badge {
                    width: 48px;
                    height: 48px;
                    background: white;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    box-shadow: var(--shadow-sm);
                }

                .header-info h3 { font-size: 1.1rem; font-weight: 800; color: var(--navy); }
                .timestamp { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--gray-400); font-weight: 600; margin-top: 0.2rem; }

                .amount-tag {
                    padding: 0.5rem 1rem;
                    background: white;
                    color: var(--accent);
                    border-radius: 10px;
                    font-weight: 900;
                    font-size: 1.1rem;
                    border: 1px solid var(--gray-100);
                }

                .card-body { padding: 2rem; }
                .debate-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }

                .debate-box {
                    padding: 1.5rem;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .debate-box.accusation { background: #f8fafc; border-left: 4px solid var(--navy); }
                .debate-box.defense { background: #fff1f2; border-left: 4px solid var(--accent); }

                .box-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .accusation .box-label { color: var(--navy); }
                .defense .box-label { color: var(--accent); }

                .text { font-size: 0.95rem; font-weight: 500; color: var(--navy); line-height: 1.5; }
                .italic { font-style: italic; }

                .card-footer {
                    padding: 1.5rem 2rem;
                    background: white;
                    border-top: 1px solid var(--gray-100);
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                .judge-btn {
                    padding: 0.8rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    transition: all 0.2s;
                }
                .judge-btn.reject { color: var(--gray-500); background: var(--bg); }
                .judge-btn.reject:hover { background: #fff1f2; color: var(--accent); }
                .judge-btn.confirm { background: var(--navy); color: white; }
                .judge-btn.confirm:hover { background: #1e293b; transform: translateY(-2px); box-shadow: var(--shadow); }

                .animate-in { animation: slideUp 0.3s ease-out; }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .debate-grid { grid-template-columns: 1fr; gap: 1rem; }
                    .card-footer { flex-direction: column; }
                    .judge-btn { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    )
}
