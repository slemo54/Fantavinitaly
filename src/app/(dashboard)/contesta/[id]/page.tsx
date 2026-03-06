'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, Send, ShieldAlert, Clock, Info } from 'lucide-react'
import Link from 'next/link'

export default function ContestPage() {
    const { id } = useParams()
    const [transaction, setTransaction] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reason, setReason] = useState('')
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
            setError('Devi effettuare il login per contestare.')
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                type:malus_type_id(name, icon, amount)
            `)
            .eq('id', id)
            .single()

        if (error || !data) {
            setError('Transazione non trovata.')
        } else if (data.target_user_id !== user.id) {
            setError('Puoi contestare solo i malus assegnati a te.')
        } else if (data.status !== 'approved') {
            setError('Puoi contestare solo i malus già approvati.')
        } else if (new Date(data.created_at).getTime() < Date.now() - 24 * 60 * 60 * 1000) {
            setError('La finestra di 24 ore per la contestazione è scaduta.')
        } else {
            setTransaction(data)
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reason.trim()) return
        setIsProcessing(true)

        const { error } = await supabase
            .from('transactions')
            .update({
                status: 'contested',
                contested_at: new Date().toISOString(),
                contestation_reason: reason
            })
            .eq('id', id)
            .eq('status', 'approved')

        if (error) {
            setError('Errore durante l\'invio della contestazione.')
            setIsProcessing(false)
        } else {
            router.push('/')
            router.refresh()
        }
    }

    if (loading) return <div className="loading-state">⚖️ Recuperando gli atti...</div>
    if (error) return (
        <div className="error-state card">
            <AlertCircle size={48} className="error-icon" />
            <h2>Contestazione Non Disponibile</h2>
            <p>{error}</p>
            <Link href="/" className="back-btn">Torna alla Dashboard</Link>
        </div>
    )

    return (
        <div className="contest-container">
            <header className="contest-header">
                <Link href="/" className="back-link">
                    <ArrowLeft size={20} />
                    <span>Torna alla Dashboard</span>
                </Link>
                <h1>Presenta Appello</h1>
                <p>Non sei d'accordo con il giudizio? Spiega le tue ragioni all'Admin. ⚖️</p>
            </header>

            <div className="contest-card card animate-in">
                <div className="malus-summary">
                    <div className="malus-icon">{transaction.type?.icon || '⚖️'}</div>
                    <div className="malus-details">
                        <h3>{transaction.type?.name}</h3>
                        <p className="amount">-€{Math.abs(transaction.amount).toFixed(2)}</p>
                        <p className="description">"{transaction.description}"</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="contest-form">
                    <div className="input-group">
                        <label>Motivo della contestazione</label>
                        <textarea
                            placeholder="Spiega perché questo malus non deve essere applicato... sii convincente! 🛡️"
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="form-info">
                        <Clock size={16} />
                        <span>Hai tempo fino al {new Date(new Date(transaction.created_at).getTime() + 24 * 60 * 60 * 1000).toLocaleString('it-IT')}</span>
                    </div>

                    <div className="footer-actions">
                        <div className="warning">
                            <ShieldAlert size={16} />
                            <span>La decisione dell'Admin sarà finale.</span>
                        </div>
                        <button type="submit" className="submit-btn" disabled={isProcessing || !reason.trim()}>
                            {isProcessing ? 'Invio...' : (
                                <>
                                    <span>Invia Appello</span>
                                    <Send size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .contest-container { max-width: 700px; margin: 0 auto; animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .contest-header { text-align: center; margin-bottom: 3rem; }
                .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--gray-500); font-weight: 700; margin-bottom: 1.5rem; font-size: 0.9rem; }
                .contest-header h1 { font-size: 2.25rem; font-weight: 800; color: var(--navy); margin-bottom: 0.5rem; }
                .contest-header p { color: var(--gray-500); font-weight: 500; }

                .contest-card { padding: 0; overflow: hidden; }
                .malus-summary { padding: 2rem; background: var(--bg); display: flex; gap: 1.5rem; align-items: flex-start; border-bottom: 1px solid var(--gray-100); }
                .malus-icon { font-size: 2.5rem; background: white; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; border-radius: 16px; box-shadow: var(--shadow-sm); }
                .malus-details h3 { font-size: 1.25rem; margin-bottom: 0.25rem; }
                .malus-details .amount { font-weight: 800; color: var(--accent); font-size: 1.1rem; margin-bottom: 0.75rem; }
                .malus-details .description { font-style: italic; color: var(--gray-500); font-size: 0.95rem; line-height: 1.5; }

                .contest-form { padding: 2.5rem; }
                .input-group label { display: block; margin-bottom: 0.75rem; font-weight: 700; color: var(--navy); font-size: 0.95rem; }
                textarea { width: 100%; padding: 1rem; border-radius: 14px; border: 1px solid var(--gray-200); background: white; resize: none; outline: none; font-weight: 500; margin-bottom: 1rem; transition: border 0.2s; }
                textarea:focus { border-color: var(--primary); }

                .form-info { display: flex; align-items: center; gap: 0.5rem; color: var(--accent); font-size: 0.8rem; font-weight: 700; background: #fff1f2; padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 2rem; }

                .footer-actions { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; }
                .warning { display: flex; align-items: center; gap: 0.5rem; color: var(--gray-400); font-size: 0.75rem; font-weight: 600; }

                .submit-btn { padding: 1rem 2rem; background: var(--navy); color: white; border-radius: 14px; font-weight: 800; display: flex; align-items: center; gap: 0.75rem; transition: all 0.2s; }
                .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow); }
                .submit-btn:disabled { opacity: 0.5; }

                .loading-state, .error-state { text-align: center; padding: 5rem 2rem; font-weight: 700; color: var(--gray-500); }
                .error-state h2 { color: var(--navy); margin-top: 1.5rem; }
                .error-state p { margin-bottom: 2rem; }
                .back-btn { display: inline-block; padding: 0.8rem 2rem; background: var(--navy); color: white; border-radius: 12px; }

                @media (max-width: 600px) {
                    .footer-actions { flex-direction: column; text-align: center; }
                    .submit-btn { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    )
}
