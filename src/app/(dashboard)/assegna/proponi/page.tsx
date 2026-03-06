'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserPlus, AlertCircle, Search, ArrowLeft, Send, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function ProposePage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([])
  const [malusTypes, setMalusTypes] = useState<any[]>([])
  const [filteredMalusTypes, setFilteredMalusTypes] = useState<any[]>([])

  const [targetId, setTargetId] = useState<string>('')
  const [selectedTypeId, setSelectedTypeId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [malusSearchTerm, setMalusSearchTerm] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('display_name')
      setProfiles(profilesData || [])
      setFilteredProfiles(profilesData || [])

      const { data: types } = await supabase
        .from('malus_types')
        .select('*')
        .eq('is_active', true)
      setMalusTypes(types || [])
      setFilteredMalusTypes(types || [])
    }
    fetchData()
  }, [])

  useEffect(() => {
    setFilteredProfiles(
      profiles.filter(p => p.display_name.toLowerCase().includes(userSearchTerm.toLowerCase()))
    )
  }, [userSearchTerm, profiles])

  useEffect(() => {
    setFilteredMalusTypes(
      malusTypes.filter(t => t.name.toLowerCase().includes(malusSearchTerm.toLowerCase()))
    )
  }, [malusSearchTerm, malusTypes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetId || !selectedTypeId || !description) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const type = malusTypes.find(t => t.id === selectedTypeId)
    const target = profiles.find(p => p.id === targetId)

    const { data: newTx, error: txError } = await supabase
      .from('transactions')
      .insert({
        target_user_id: targetId,
        proposed_by_user_id: user.id,
        malus_type_id: selectedTypeId,
        amount: type.amount,
        description,
        status: 'pending'
      })
      .select()
      .single()

    if (txError) {
      setError(txError.message)
      setLoading(false)
    } else {
      // Fetch other users for notification (excluding proposer and target)
      const { data: others } = await supabase
        .from('profiles')
        .select('email')
        .not('id', 'in', `("${user.id}","${targetId}")`)

      if (others && others.length > 0) {
        // In a real scenario, this should be an Edge Function to avoid blocking the UI
        // or potentially revealing other users' emails. For this iteration, we'll
        // call the API or utility directly if possible, but since we are client-side,
        // we should ideally use a server action or edge function.
        // For now, we'll simulate the trigger or just rely on the user seeing it in dashboard.
        console.log('Notifying users:', others.map(u => u.email))
      }

      router.push('/')
      router.refresh()
    }
  }

  const selectedUser = profiles.find(p => p.id === targetId)
  const selectedMalus = malusTypes.find(t => t.id === selectedTypeId)

  return (
    <div className="propose-page">
      <header className="selection-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} />
          <span>Torna alla Dashboard</span>
        </Link>
        <h1>Proponi un Malus</h1>
        <p>Hai visto qualcosa che non va? Segnala con ironia e lascia decidere al tribunale del team. ⚖️</p>
      </header>

      {error && <div className="error-banner"><AlertCircle size={18} /> {error}</div>}

      <form onSubmit={handleSubmit} className="propose-flow">
        {/* Section 1: Target User */}
        <section className="flow-section">
          <div className="section-header">
            <div className="step-badge">1</div>
            <h3>Scegli il "colpevole"</h3>
            <div className="step-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Cerca collega..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="user-grid">
            {filteredProfiles.map(p => (
              <div
                key={p.id}
                className={`user-card ${targetId === p.id ? 'selected' : ''}`}
                onClick={() => setTargetId(p.id)}
              >
                <div className="user-avatar">{p.display_name.charAt(0)}</div>
                <span className="user-name">{p.display_name}</span>
                {targetId === p.id && <CheckCircle2 size={16} className="selected-icon" />}
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Malus Type */}
        <section className="flow-section">
          <div className="section-header">
            <div className="step-badge">2</div>
            <h3>Qual è il reato?</h3>
            <div className="step-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Cerca malus..."
                value={malusSearchTerm}
                onChange={(e) => setMalusSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="selection-grid">
            {filteredMalusTypes.map(t => (
              <div
                key={t.id}
                className={`type-card ${selectedTypeId === t.id ? 'selected' : ''}`}
                onClick={() => setSelectedTypeId(t.id)}
              >
                <span className="type-icon">{t.icon || '🐷'}</span>
                <span className="type-name">{t.name}</span>
                <span className="type-amount">-€{Math.abs(t.amount).toFixed(2)}</span>
                {selectedTypeId === t.id && <CheckCircle2 size={16} className="selected-icon" />}
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Details & Submit */}
        <section className="flow-section details-card card">
          <div className="section-header">
            <div className="step-badge">3</div>
            <h3>Dettagli e Conferma</h3>
          </div>

          <div className="input-group">
            <label>Descrizione dell'accaduto (Obbligatoria)</label>
            <textarea
              placeholder="Racconta cosa è successo... sii creativo! ✨"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="submission-area">
            <div className="proposal-summary">
              {selectedUser && selectedMalus ? (
                <p>Proposta di <strong>-€{Math.abs(selectedMalus.amount).toFixed(2)}</strong> per <strong>{selectedUser.display_name}</strong></p>
              ) : (
                <p className="placeholder">Seleziona un utente e un malus per procedere</p>
              )}
            </div>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !targetId || !selectedTypeId || !description}
            >
              {loading ? 'Sottomissione...' : (
                <>
                  <span>Invia Proposta</span>
                  <Send size={18} />
                </>
              )}
            </button>
          </div>
        </section>
      </form>

      <style jsx>{`
                .propose-page {
                    max-width: 900px;
                    margin: 0 auto;
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .selection-header { text-align: center; margin-bottom: 3rem; }
                .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--gray-500); font-weight: 700; margin-bottom: 1.5rem; font-size: 0.9rem; }
                .selection-header h1 { font-size: 2.25rem; font-weight: 800; color: var(--navy); margin-bottom: 0.5rem; }
                .selection-header p { color: var(--gray-500); font-weight: 500; }

                .propose-flow { display: flex; flex-direction: column; gap: 3rem; margin-bottom: 5rem; }

                .flow-section { 
                    background: var(--bg);
                    padding: 2rem;
                    border-radius: 28px;
                }

                .section-header { 
                    display: flex; 
                    align-items: center; 
                    gap: 1rem; 
                    margin-bottom: 2rem;
                }

                .step-badge {
                    width: 32px;
                    height: 32px;
                    background: var(--navy);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 0.9rem;
                }

                .section-header h3 { font-size: 1.25rem; font-weight: 800; color: var(--navy); flex: 1; }

                .step-search {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: white;
                    padding: 0.5rem 1rem;
                    border-radius: 12px;
                    border: 1px solid var(--gray-100);
                    color: var(--gray-400);
                    width: 240px;
                }

                .step-search input { border: none; outline: none; font-size: 0.85rem; font-weight: 500; width: 100%; }

                .user-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 1rem;
                }

                .user-card {
                    background: white;
                    padding: 1.25rem;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    position: relative;
                    border: 2px solid transparent;
                    transition: all 0.2s;
                    box-shadow: var(--shadow-sm);
                }

                .user-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
                .user-card.selected { border-color: var(--primary); background: #f0fdf4; }

                .user-avatar {
                    width: 48px;
                    height: 48px;
                    background: var(--bg);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    color: var(--navy);
                    font-size: 1.1rem;
                }

                .user-name { font-weight: 700; color: var(--navy); font-size: 0.9rem; text-align: center; }

                .selection-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 1rem;
                }

                .type-card {
                    background: white;
                    border-radius: 20px;
                    padding: 1.5rem;
                    text-align: center;
                    cursor: pointer;
                    position: relative;
                    box-shadow: var(--shadow-sm);
                    border: 2px solid transparent;
                    transition: all 0.2s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }

                .type-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
                .type-card.selected { border-color: var(--primary); background: #f0fdf4; }

                .type-icon { font-size: 2.5rem; }
                .type-name { font-weight: 700; color: var(--navy); font-size: 0.95rem; }
                .type-amount { font-weight: 800; color: var(--accent); font-size: 1.1rem; }

                .selected-icon {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    color: var(--primary);
                }

                .details-card { background: white !important; }

                .input-group label { display: block; margin-bottom: 0.75rem; font-weight: 700; color: var(--navy); font-size: 0.9rem; }
                textarea {
                    width: 100%;
                    padding: 1rem;
                    border-radius: 14px;
                    border: 1px solid var(--gray-100);
                    background: var(--bg);
                    resize: none;
                    outline: none;
                    font-weight: 500;
                    margin-bottom: 2rem;
                }

                .submission-area {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--gray-100);
                }

                .proposal-summary p { font-size: 1rem; color: var(--gray-600); }
                .proposal-summary p.placeholder { color: var(--gray-400); font-style: italic; font-size: 0.9rem; }
                .proposal-summary strong { color: var(--navy); }

                .submit-btn {
                    padding: 1rem 2rem;
                    background: linear-gradient(135deg, var(--navy) 0%, #1e293b 100%);
                    color: white;
                    border-radius: 16px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    transition: all 0.2s;
                    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.15);
                }

                .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(15, 23, 42, 0.25); }
                .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

                @media (max-width: 640px) {
                    .section-header { flex-direction: column; align-items: flex-start; }
                    .step-search { width: 100%; }
                    .submission-area { flex-direction: column; gap: 1.5rem; text-align: center; }
                    .submit-btn { width: 100%; justify-content: center; }
                }
            `}</style>
    </div>
  )
}
