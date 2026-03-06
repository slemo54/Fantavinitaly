'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Moon, Sun } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [view, setView] = useState<'password' | 'email'>('password')
  const supabase = createClient()
  const router = useRouter()

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
    <div className="login-page">
      <header className="login-header">
        <div className="logo-brand">
          <div className="logo-icon">🐷</div>
          <span className="logo-text">Salvadanaio W2D</span>
        </div>
        <button className="theme-toggle">
          <Moon size={20} />
        </button>
      </header>

      <main className="login-main">
        <div className="login-card">
          <div className="hero-section">
            <img
              src="/piggy_bank_hero.png"
              alt="Savings"
              className="hero-image"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop";
              }}
            />
            <div className="hero-badge">
              <span className="badge-title">SMART SAVINGS</span>
              <p className="badge-text">Start your playful journey today.</p>
            </div>
          </div>

          <div className="form-section">
            <h1 className="welcome-title">Welcome Back!</h1>
            <p className="welcome-subtitle">Securely access your playful digital piggy bank</p>

            {error && <div className="error-alert">{error}</div>}
            {message && <div className="success-alert">{message}</div>}

            <form onSubmit={handlePasswordLogin} className="login-form">
              <div className="input-field">
                <label>Email Address</label>
                <div className="input-control">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    placeholder="hello@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-field">
                <div className="label-row">
                  <label>Password</label>
                  <a href="#" className="forgot-link">Forgot?</a>
                </div>
                <div className="input-control">
                  <Lock size={18} className="field-icon" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Keep me logged in</label>
              </div>

              <button className="submit-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="divider">
                <span>OR CONTINUE WITH</span>
              </div>

              <div className="social-login">
                <button type="button" className="social-btn">
                  <img src="https://www.google.com/favicon.ico" alt="Google" />
                </button>
                <button type="button" className="social-btn">
                  <span>iOS</span>
                </button>
              </div>

              <p className="footer-text">
                Don't have an account? <a href="#" className="signup-link">Create one for free</a>
              </p>
            </form>
          </div>
        </div>
      </main>

      <footer className="page-footer">
        <p>&copy; 2024 Salvadanaio W2D. All rights reserved.</p>
      </footer>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background-color: var(--white);
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
        }

        .login-header {
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          background-color: var(--primary);
          color: white;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 1.2rem;
        }

        .logo-text {
          font-weight: 800;
          font-size: 1.1rem;
          color: var(--navy);
        }

        .theme-toggle {
          background-color: var(--gray-100);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--navy);
          cursor: pointer;
        }

        .login-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: white;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-section {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 2.5rem;
          box-shadow: var(--shadow-xl);
          height: 200px;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-badge {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          padding: 1rem;
          border-radius: 12px;
        }

        .badge-title {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: 0.25rem;
        }

        .badge-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--navy);
          margin: 0;
        }

        .form-section {
          text-align: center;
        }

        .welcome-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--navy);
          margin-bottom: 0.5rem;
        }

        .welcome-subtitle {
          font-size: 0.95rem;
          color: var(--gray-500);
          margin-bottom: 2.5rem;
        }

        .login-form {
          text-align: left;
        }

        .input-field {
          margin-bottom: 1.5rem;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .input-field label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 0.5rem;
          display: block;
        }

        .forgot-link {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary);
        }

        .input-control {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 1rem;
          color: var(--gray-500);
        }

        .input-control input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border-radius: 12px;
          border: 1.5px solid var(--gray-100);
          font-weight: 500;
          transition: all 0.2s;
          outline: none;
        }

        .input-control input:focus {
          border-color: var(--primary-light);
          background-color: #fafdfc;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .remember-me label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--gray-500);
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          padding: 1.1rem;
          border-radius: 14px;
          font-weight: 800;
          font-size: 0.95rem;
          border: none;
          box-shadow: 0 10px 20px rgba(0, 193, 142, 0.2);
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 193, 142, 0.3);
        }

        .divider {
          position: relative;
          text-align: center;
          margin: 2rem 0;
        }

        .divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background-color: var(--gray-100);
        }

        .divider span {
          position: relative;
          background-color: white;
          padding: 0 1rem;
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--gray-500);
          letter-spacing: 0.05em;
        }

        .social-login {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .social-btn {
          flex: 1;
          height: 54px;
          border-radius: 12px;
          border: 1.5px solid var(--gray-100);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .social-btn:hover {
          background-color: var(--gray-100);
        }

        .social-btn img {
          width: 20px;
          height: 20px;
        }

        .social-btn span {
          font-weight: 800;
          color: var(--navy);
        }

        .footer-text {
          font-size: 0.85rem;
          color: var(--gray-500);
          font-weight: 600;
        }

        .signup-link {
          color: var(--primary);
          font-weight: 800;
        }

        .page-footer {
          padding: 2rem;
          text-align: center;
          font-size: 0.75rem;
          color: var(--gray-500);
          font-weight: 500;
        }

        .error-alert {
          background-color: #fff1f2;
          color: #e11d48;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-weight: 600;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  )
}
