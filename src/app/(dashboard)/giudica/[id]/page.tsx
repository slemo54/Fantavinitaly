'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { Gavel, Check, X, Clock, AlertCircle, ShieldAlert, MessageSquare, Info } from 'lucide-react'
import Link from 'next/link'

export default function JudgePage() {
    const { id } = useParams()
    const [transaction, setTransaction] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchTransaction()
    }, [id])

    async function fetchTransaction() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setError('Devi effettuare il login per giudicare.')
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                target:target_user_id(display_name, email),
                proposer:proposed_by_user_id(display_name),
                type:malus_type_id(name, icon, amount)
            `)
            .eq('id', id)
            .single()

        if (error || !data) {
            setError('Transazione non trovata o già giudicata.')
        } else if (data.status !== 'pending') {
            setError('Questa proposta è già stata elaborata.')
        } else if (data.target_user_id === user.id || data.proposed_by_user_id === user.id) {
            setError('Non puoi giudicare una proposta in cui sei coinvolto direttamente.')
        } else {
            setTransaction(data)
        }
        setLoading(false)
    }

    const handleDecision = async (decision: 'approved' | 'rejected') => {
        setIsProcessing(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('transactions')
            .update({
                status: decision,
                judged_by_user_id: user.id,
                judged_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('status', 'pending') // Optimistic locking

        if (error) {
            setError('Si è verificato un errore durante il giudizio.')
            setIsProcessing(false)
        } else {
            router.push('/')
            router.refresh()
        }
    }

    if (loading) return <div className="loading-state">⚖️ Convocando la giuria...</div>
    if (error) return (
        <div className="error-state card">
            <AlertCircle size={48} className="error-icon" />
            <h2>Accesso Negato</h2>
            <p>{error}</p>
            <Link href="/" className="back-btn">Torna alla Dashboard</Link>
        </div>
    )

    return (
        <div className="judge-container">
            <header className="judge-header">
                <div className="title-block">
                    <h1>Aula di Tribunale</h1>
                    <p>Revisione del caso e verdetto finale. Sii giusto, ma inflessibile! 👨‍⚖️</p>
                </div>
            </header>

            <div className="case-overview">
                <div className="malus-highlight card">
                    <div className="malus-icon">{transaction.type?.icon || '⚖️'}</div>
                    <div className="malus-info">
                        <h3>{transaction.type?.name}</h3>
                        <p className="amount">-€{Math.abs(transaction.amount).toFixed(2)}</p>
                    </div>
                    <div className="time-remaining">
                        <Clock size={16} />
                        <span>Decidi in fretta!</span>
                    </div>
                </div>

                <div className="debate-grid">
                    <div className="debate-box accusation card">
                        <div className="box-label">
                            <ShieldAlert size={16} />
                            Accusa di {transaction.proposer?.display_name}
                        </div>
                        <p className="text">"{transaction.description}"</p>
                        <div className="target-info">
                            Contro <strong>{transaction.target?.display_name}</strong>
                        </div>
                    </div>

                    <div className="judge-actions card">
                        <h3>Il tuo verdetto</h3>
                        <p>Analizza le prove e decidi se il malus è meritato.</p>

                        <div className="action-buttons">
                            <button
                                className="judge-btn reject"
                                onClick={() => handleDecision('rejected')}
                                disabled={isProcessing}
                            >
                                <X size={20} />
                                <span>Innocente</span>
                            </button>
                            <button
                                className="judge-btn approve"
                                onClick={() => handleDecision('approved')}
                                disabled={isProcessing}
                            >
                                <Check size={20} />
                                <span>Colpevole</span>
                            </button>
                        </div>

                        <div className="disclaimer">
                            <Info size={14} />
                            <span>Il tuo giudizio è immediato e irrevocabile (salvo appello admin).</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .judge-container { max-width: 1000px; margin: 0 auto; animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .judge-header { text-align: center; margin-bottom: 3rem; }
                .title-block h1 { font-size: 2.5rem; font-weight: 800; color: var(--navy); margin-bottom: 0.5rem; }
                .title-block p { color: var(--gray-500); font-weight: 500; font-size: 1.1rem; }

                .case-overview { display: flex; flex-direction: column; gap: 2rem; }

                .malus-highlight {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    padding: 2rem;
                    background: var(--navy);
                    color: white;
                }
                .malus-icon { font-size: 3rem; background: rgba(255,255,255,0.1); width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 20px; }
                .malus-info h3 { font-size: 1.5rem; color: white; margin-bottom: 0.25rem; font-weight: 800; }
                .malus-info .amount { font-size: 1.25rem; color: var(--primary-light); font-weight: 900; }
                .time-remaining { margin-left: auto; display: flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.05); padding: 0.75rem 1.25rem; border-radius: 100px; font-size: 0.9rem; font-weight: 700; color: var(--gray-200); }

                .debate-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; }

                .debate-box { border-left: 6px solid var(--accent); position: relative; }
                .box-label { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent); margin-bottom: 1.5rem; }
                .debate-box .text { font-size: 1.25rem; font-weight: 500; color: var(--navy); line-height: 1.6; margin-bottom: 2rem; font-style: italic; }
                .target-info { font-size: 1rem; color: var(--gray-500); border-top: 1px solid var(--gray-100); padding-top: 1.5rem; }
                .target-info strong { color: var(--navy); }

                .judge-actions { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; }
                .judge-actions h3 { font-size: 1.5rem; margin-bottom: 0.25rem; }
                .judge-actions p { color: var(--gray-500); margin-bottom: 1rem; }

                .action-buttons { display: flex; gap: 1rem; width: 100%; }
                .judge-btn { flex: 1; padding: 1.25rem; border-radius: 18px; font-weight: 800; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; transition: all 0.2s; }
                .judge-btn.reject { background: var(--gray-100); color: var(--gray-600); }
                .judge-btn.reject:hover { background: #fee2e2; color: #b91c1c; transform: translateY(-3px); }
                .judge-btn.approve { background: var(--primary); color: white; }
                .judge-btn.approve:hover { background: var(--primary-dark); transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0, 193, 142, 0.2); }

                .disclaimer { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--gray-400); font-weight: 600; margin-top: 1rem; }

                .loading-state, .error-state { text-align: center; padding: 5rem 2rem; font-weight: 700; color: var(--gray-500); }
                .error-state h2 { color: var(--navy); margin-top: 1.5rem; }
                .error-state p { margin-bottom: 2rem; }
                .back-btn { display: inline-block; padding: 0.8rem 2rem; background: var(--navy); color: white; border-radius: 12px; }

                @media (max-width: 800px) {
                    .debate-grid { grid-template-columns: 1fr; }
                    .malus-highlight { flex-direction: column; text-align: center; }
                    .time-remaining { margin: 1rem 0 0 0; }
                }
            `}</style>
        </div>
    )
}
