# 🍷 Fanta Vinitaly - Next.js 14

Benvenuto nel nuovo **Fanta Vinitaly**! Abbiamo trasformato la vecchia applicazione PHP in una moderna Web App basata su **Next.js 14 (App Router)**, **Supabase** e **Resend**.

## 🚀 Caratteristiche
- **Design Premium**: Ispirato ai colori del vino (wine-red, gold) con glassmorphism e layout mobile-first.
- **Autenticazione**: Supporto per Login classico ed Email Magic Link via Supabase.
- **Giudizio Collettivo**: I malus proposti devono essere approvati da un terzo (giudice) per diventare effettivi.
- **Autodenuncia**: Puoi denunciarti da solo per un'approvazione immediata.
- **Hall of Shame**: Classifica dinamica con podio per i "Top Sponsor".
- **Pannello Admin**: Gestione utenti, override dei saldi e risoluzione delle contestazioni.
- **Notifiche**: Email automatiche via Resend per nuovi malus e traguardi sponsor.

## 🛠️ Configurazione Iniziale

### 1. Database (Supabase)
Copia ed esegui il contenuto dei file nella cartella `/supabase` sul tuo dashboard di Supabase:
1. Esegui `schema.sql` per creare tabelle, RLS e trigger.
2. Esegui `seed.sql` per popolare i tipi di malus predefiniti.

### 2. Variabili d'Ambiente
Rinomina `.env.local.example` in `.env.local` e inserisci le tue chiavi:
- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (per funzioni admin)
- `RESEND_API_KEY`

### 4. Migrazione Utenti (Opzionale)
Se vuoi migrare i 24 utenti storici della vecchia app PHP:
```bash
node scripts/migrate-users.mjs
```
*Assicurati che `SUPABASE_SERVICE_ROLE_KEY` sia presente nel tuo `.env.local`.*

## 🍷 Malus Predefiniti
- **Ritardo (Riunione/Lavoro)**: €0.50
- **Dimenticanza (Hardware/Task)**: €1.00
- **Errore Grave**: €2.00
- **Offerta Spontanea**: €5.00+

## ⚖️ Sistema di Giudizio
Ogni volta che qualcuno propone un malus, questo rimane in stato `pending`. 
Qualsiasi utente (diverso dall'accusatore e dall'accusato) può agire da **Giudice** direttamente dalla Dashboard per confermare o respingere l'accusa.

---
Sviluppato con ❤️ per il team Wine2Digital.
