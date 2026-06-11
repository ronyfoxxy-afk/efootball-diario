'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

const G = {
  bg: '#09090b', surface: '#111115', surface2: '#18181c',
  border: '#1d1d20', text: '#e4e4e7', dim: '#52525b',
  gold: '#fbe900', red: '#f87171',
}

function LoginForm() {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/admin-fskate'

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    if (!senha.trim()) return
    setLoading(true); setErro('')
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha }),
    })
    if (res.ok) {
      router.push(redirect)
      router.refresh()
    } else {
      setErro('Senha incorreta.')
      setLoading(false)
    }
  }

  return (
    <div className="admin-zone" style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'Barlow', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500&display=swap');`}</style>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Image src="/logo.png" alt="eFootball News" width={600} height={149} style={{ objectFit: 'contain', height: 44, width: 'auto', marginBottom: 12 }} />
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 16, letterSpacing: 2, textTransform: 'uppercase', color: G.dim }}>
            ADMIN
          </div>
          <div style={{ fontSize: 12, color: G.dim, marginTop: 4, letterSpacing: '1px' }}>Acesso restrito — FSKATE</div>
        </div>
        <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, padding: '2rem' }}>
          <form onSubmit={entrar}>
            <label style={{ fontSize: 10, color: G.dim, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Senha de acesso</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
              placeholder="••••••••" autoFocus
              style={{ width: '100%', background: G.surface2, border: `1px solid ${erro ? G.red : G.border}`, borderRadius: 8, padding: '12px 14px', color: G.text, fontSize: 16, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 12, letterSpacing: '4px' }} />
            {erro && <div style={{ fontSize: 12, color: G.red, marginBottom: 12 }}>⚠️ {erro}</div>}
            <button type="submit" disabled={loading || !senha}
              style={{ width: '100%', background: G.gold, color: '#0a0800', border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: 1, opacity: (loading || !senha) ? 0.6 : 1 }}>
              {loading ? 'Entrando...' : '🔐 Entrar'}
            </button>
          </form>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a href="/" style={{ fontSize: 12, color: G.dim, textDecoration: 'none' }}>← Voltar ao site</a>
        </div>
      </div>
    </div>
  )
}

export default function AdminLogin() {
  return <Suspense><LoginForm /></Suspense>
}
