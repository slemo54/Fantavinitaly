'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertCircle, Search, Filter, ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

export default function AutoAssignPage() {
  const [malusTypes, setMalusTypes] = useState<any[]>([])
  const [filteredTypes, setFilteredTypes] = useState<any[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      const { data: types } = await supabase
        .from('malus_types')
        .select('*')
        .eq('is_active', true)
      setMalusTypes(types || [])
      setFilteredTypes(types || [])
    }
    fetchData()
  }, [])

  useEffect(() => {
    setFilteredTypes(
      malusTypes.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, malusTypes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const type = malusTypes.find(t => t.id === selectedType)

    const { error } = await supabase.from('transactions').insert({
      target_user_id: user.id,
      proposed_by_user_id: user.id,
      malus_type_id: selectedType,
      amount: type.amount,
      description,
      status: 'approved',
      judged_by_user_id: user.id,
      judged_at: new Date().toISOString()
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="selection-page">
      <header className="selection-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} />
          <span>Torna alla Dashboard</span>
        </Link>
        <h1>Scegli il tuo Malus</h1>
        <p>Ammettere i propri "peccati" è il primo passo per una birra in compagnia. 🍺</p>
      </header>

      <div className="selection-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Cerca un malus... (es. Caffè, Ritardo)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-chips">
          <button className="filter-chip active">Tutti</button>
          <button className="filter-chip">Frequenti</button>
          <button className="filter-chip">Gravi</button>
        </div>
      </div>

      {error && <div className="error-banner"><AlertCircle size={18} /> {error}</div>}

      <form onSubmit={handleSubmit} className="assignment-flow">
        <div className="grid-container">
          <div className="selection-grid">
            {filteredTypes.map((type) => (
              <div
                key={type.id}
                className={`type-card ${selectedType === type.id ? 'selected' : ''}`}
                onClick={() => setSelectedType(type.id)}
              >
                <div className="card-inner">
                  <span className="type-icon">{type.icon || '🐷'}</span>
                  <span className="type-name">{type.name}</span>
                  <span className="type-amount">-€{Math.abs(type.amount).toFixed(2)}</span>
                </div>
                {selectedType === type.id && (
                  <div className="selection-check">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-details card">
          <h3>Dettagli Aggiuntivi</h3>
          <div className="input-group">
            <label>Cosa è successo esattamente?</label>
            <textarea
              placeholder="Aggiungi una breve nota ironica..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="submission-area">
            <div className="summary-info">
              <span className="label">Saldo finale previsto:</span>
              <span className="value">€{(profile?.balance - (malusTypes.find(t => t.id === selectedType)?.amount || 0)).toFixed(2)}</span>
            </div>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !selectedType}
            >
              {loading ? 'Elaborazione...' : (
                <>
                  <span>Conferma Malus</span>
                  <Send size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <style jsx>{`
                .selection-page {
                    max-width: 900px;
                    margin: 0 auto;
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .selection-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--gray-500);
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                }

                .selection-header h1 { font-size: 2rem; font-weight: 800; color: var(--navy); margin-bottom: 0.5rem; }
                .selection-header p { color: var(--gray-500); font-weight: 500; }

                .selection-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .search-box {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: white;
                    padding: 0.8rem 1.25rem;
                    border-radius: 14px;
                    border: 1px solid var(--gray-100);
                    color: var(--gray-400);
                }

                .search-box input { border: none; outline: none; width: 100%; font-weight: 500; }

                .filter-chips { display: flex; gap: 0.5rem; }
                .filter-chip {
                    padding: 0.6rem 1.25rem;
                    border-radius: 100px;
                    background: white;
                    border: 1px solid var(--gray-100);
                    color: var(--gray-500);
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                }

                .filter-chip.active {
                    background: var(--navy);
                    color: white;
                    border-color: var(--navy);
                }

                .error-banner {
                    background: #fff1f2;
                    color: #e11d48;
                    padding: 1rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 600;
                }

                .assignment-flow {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .grid-container {
                    background: var(--bg);
                    padding: 1rem;
                    border-radius: 24px;
                }

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
                }

                .type-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
                .type-card.selected { border-color: var(--primary); background: #f0fdf4; }

                .card-inner { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
                .type-icon { font-size: 2.5rem; }
                .type-name { font-weight: 700; color: var(--navy); font-size: 0.95rem; }
                .type-amount { font-weight: 800; color: var(--accent); font-size: 1.1rem; }

                .selection-check {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: var(--primary);
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .form-details { margin-bottom: 4rem; }
                .form-details h3 { margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: 800; color: var(--navy); }
                
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
                    transition: border 0.2s;
                }
                textarea:focus { border-color: var(--primary-light); }

                .submission-area {
                    margin-top: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 2rem;
                    border-top: 1px solid var(--gray-100);
                }

                .summary-info { display: flex; flex-direction: column; }
                .summary-info .label { font-size: 0.75rem; font-weight: 700; color: var(--gray-400); }
                .summary-info .value { font-size: 1.5rem; font-weight: 900; color: var(--navy); }

                .submit-btn {
                    padding: 1rem 2rem;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    color: white;
                    border-radius: 16px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    transition: all 0.2s;
                    box-shadow: 0 10px 20px rgba(0, 193, 142, 0.2);
                }

                .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0, 193, 142, 0.3); }
                .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

                @media (max-width: 640px) {
                    .selection-controls { flex-direction: column; align-items: stretch; }
                    .submission-area { flex-direction: column; gap: 1.5rem; text-align: center; }
                    .summary-info { align-items: center; }
                    .submit-btn { width: 100%; justify-content: center; }
                }
            `}</style>
    </div>
  )
}
