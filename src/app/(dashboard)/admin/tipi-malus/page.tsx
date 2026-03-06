'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, Save, X, AlertCircle, Sparkles, Check, Info } from 'lucide-react'

export default function MalusAdminPage() {
    const [malusTypes, setMalusTypes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        amount: 0.5,
        icon: '🐷',
        description: '',
        is_active: true
    })

    const supabase = createClient()

    useEffect(() => {
        fetchMalusTypes()
    }, [])

    async function fetchMalusTypes() {
        setLoading(true)
        const { data } = await supabase
            .from('malus_types')
            .select('*')
            .order('name', { ascending: true })
        setMalusTypes(data || [])
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()

        if (editingId) {
            const { error } = await supabase
                .from('malus_types')
                .update(formData)
                .eq('id', editingId)

            if (error) setError(error.message)
            else {
                setEditingId(null)
                setIsAdding(false)
                fetchMalusTypes()
            }
        } else {
            const { error } = await supabase
                .from('malus_types')
                .insert({ ...formData, created_by: user?.id })

            if (error) setError(error.message)
            else {
                setIsAdding(false)
                fetchMalusTypes()
            }
        }

        setFormData({ name: '', amount: 0.5, icon: '🐷', description: '', is_active: true })
        setLoading(false)
    }

    const handleEdit = (type: any) => {
        setEditingId(type.id)
        setFormData({
            name: type.name,
            amount: type.amount,
            icon: type.icon || '🐷',
            description: type.description || '',
            is_active: type.is_active
        })
        setIsAdding(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Sei sicuro di voler eliminare questo tipo di malus?')) return

        const { error } = await supabase
            .from('malus_types')
            .delete()
            .eq('id', id)

        if (error) setError(error.message)
        else fetchMalusTypes()
    }

    if (loading && malusTypes.length === 0) return <div className="loading">Inizializzazione caveau...</div>

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div className="title-block">
                    <h1>Configurazione Malus</h1>
                    <p>Gestisci il catalogo delle infrazioni e i relativi importi.</p>
                </div>
                {!isAdding && (
                    <button className="add-btn" onClick={() => setIsAdding(true)}>
                        <Plus size={20} />
                        <span>Crea Nuovo Tipo</span>
                    </button>
                )}
            </header>

            {error && <div className="error-card"><AlertCircle size={20} /> {error}</div>}

            {isAdding && (
                <div className="editor-card card animate-in">
                    <div className="card-header">
                        <Sparkles size={20} className="header-icon" />
                        <h2>{editingId ? 'Modifica Configurazione' : 'Nuova Configurazione'}</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="editor-form">
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Nome Malus</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="es. Caffè dimenticato"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Importo Sanzione (€)</label>
                                <div className="price-input">
                                    <span>€</span>
                                    <input
                                        type="number"
                                        step="0.10"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Emoji Identificativa</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="🐷"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Regola di Applicazione</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Dettaglia quando questa sanzione deve essere applicata..."
                                rows={2}
                            />
                        </div>

                        <div className="form-footer">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <span className="slider"></span>
                                <span className="label-text">Stato Attivo</span>
                            </label>

                            <div className="action-buttons">
                                <button type="button" className="cancel-btn" onClick={() => {
                                    setIsAdding(false)
                                    setEditingId(null)
                                    setFormData({ name: '', amount: 0.5, icon: '🐷', description: '', is_active: true })
                                }}>
                                    Annulla
                                </button>
                                <button type="submit" className="save-btn" disabled={loading}>
                                    <Save size={18} />
                                    <span>{editingId ? 'Aggiorna Malus' : 'Salva Malus'}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="malus-list-grid">
                {malusTypes.map(type => (
                    <div key={type.id} className={`malus-item-card card ${!type.is_active ? 'disabled' : ''}`}>
                        <div className="item-header">
                            <div className="item-badge">
                                <span className="badge-icon">{type.icon || '🐷'}</span>
                            </div>
                            <div className="item-actions">
                                <button className="item-btn edit" onClick={() => handleEdit(type)} title="Modifica">
                                    <Edit2 size={16} />
                                </button>
                                <button className="item-btn delete" onClick={() => handleDelete(type.id)} title="Elimina">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="item-body">
                            <h3>{type.name}</h3>
                            <div className="item-price">€{Math.abs(type.amount).toFixed(2)}</div>
                            <p>{type.description || 'Nessuna descrizione impostata.'}</p>
                        </div>

                        <div className="item-footer">
                            <span className={`status-tag ${type.is_active ? 'active' : 'inactive'}`}>
                                {type.is_active ? 'ATTIVO' : 'INATTIVO'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .admin-container {
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3rem;
                }

                .title-block h1 { font-size: 2rem; font-weight: 800; color: var(--navy); margin-bottom: 0.5rem; }
                .title-block p { color: var(--gray-500); font-weight: 500; }

                .add-btn {
                    padding: 0.8rem 1.5rem;
                    background: var(--navy);
                    color: white;
                    border-radius: 14px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
                }

                .add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(15, 23, 42, 0.2); }

                .error-card {
                    background: #fff1f2;
                    color: #e11d48;
                    padding: 1rem 1.5rem;
                    border-radius: 14px;
                    margin-bottom: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-weight: 600;
                }

                .editor-card {
                    margin-bottom: 3rem;
                    padding: 0;
                    overflow: hidden;
                    border: 2px solid var(--primary-light);
                    box-shadow: var(--shadow-lg);
                }

                .card-header {
                    padding: 1.5rem 2rem;
                    background: var(--bg);
                    border-bottom: 1px solid var(--gray-100);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .header-icon { color: var(--primary); }
                .card-header h2 { font-size: 1.1rem; font-weight: 800; color: var(--navy); }

                .editor-form { padding: 2rem; }
                .form-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }

                .input-group label { display: block; margin-bottom: 0.75rem; font-weight: 700; color: var(--gray-600); font-size: 0.85rem; text-transform: uppercase; }
                .input-group input, .input-group textarea {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    border-radius: 12px;
                    border: 1px solid var(--gray-200);
                    background: var(--white);
                    font-weight: 500;
                    transition: border 0.2s;
                    outline: none;
                }
                .input-group input:focus { border-color: var(--primary); }

                .price-input { position: relative; display: flex; align-items: center; }
                .price-input span { position: absolute; left: 1rem; font-weight: 700; color: var(--gray-400); }
                .price-input input { padding-left: 2rem; }

                .form-footer {
                    margin-top: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--gray-100);
                }

                .toggle-switch { display: flex; align-items: center; gap: 1rem; cursor: pointer; }
                .toggle-switch input { display: none; }
                .slider {
                    width: 44px;
                    height: 24px;
                    background: var(--gray-200);
                    border-radius: 100px;
                    position: relative;
                    transition: 0.3s;
                }
                .slider::before {
                    content: '';
                    position: absolute;
                    width: 18px;
                    height: 18px;
                    background: white;
                    border-radius: 50%;
                    top: 3px;
                    left: 3px;
                    transition: 0.3s;
                }
                .toggle-switch input:checked + .slider { background: var(--primary); }
                .toggle-switch input:checked + .slider::before { transform: translateX(20px); }
                .label-text { font-weight: 700; color: var(--navy); font-size: 0.9rem; }

                .action-buttons { display: flex; gap: 1rem; }
                .cancel-btn { padding: 0.8rem 1.5rem; color: var(--gray-500); font-weight: 700; }
                .save-btn {
                    padding: 0.8rem 2rem;
                    background: var(--primary);
                    color: white;
                    border-radius: 12px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .malus-list-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .malus-item-card {
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .malus-item-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
                .malus-item-card.disabled { opacity: 0.6; background: var(--bg); }

                .item-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .item-badge {
                    width: 56px;
                    height: 56px;
                    background: var(--bg);
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                }

                .item-actions { display: flex; gap: 0.5rem; }
                .item-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    border: 1px solid var(--gray-100);
                }
                .item-btn.edit { color: var(--gray-600); }
                .item-btn.edit:hover { background: var(--bg); color: var(--navy); }
                .item-btn.delete { color: var(--accent); }
                .item-btn.delete:hover { background: #fff1f2; color: #e11d48; }

                .item-body h3 { font-size: 1.1rem; font-weight: 800; color: var(--navy); margin-bottom: 0.25rem; }
                .item-price { font-size: 1.75rem; font-weight: 900; color: var(--accent); margin-bottom: 0.75rem; }
                .item-body p { font-size: 0.85rem; color: var(--gray-500); line-height: 1.5; }

                .status-tag {
                    font-size: 0.65rem;
                    font-weight: 900;
                    padding: 0.3rem 0.75rem;
                    border-radius: 100px;
                    letter-spacing: 0.05em;
                }
                .status-tag.active { background: #dcfce7; color: #166534; }
                .status-tag.inactive { background: #f1f5f9; color: #475569; }

                .animate-in { animation: slideUp 0.3s ease-out; }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .form-grid { grid-template-columns: 1fr; }
                    .form-footer { flex-direction: column; gap: 2rem; align-items: flex-start; }
                    .action-buttons { width: 100%; }
                    .save-btn { flex: 1; justify-content: center; }
                }
            `}</style>
        </div>
    )
}
