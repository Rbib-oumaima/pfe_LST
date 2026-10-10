import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function ResetPassword() {
  const [searchParams]          = useSearchParams()
  const navigate                = useNavigate()
  const token                   = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [message, setMessage]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 4)  { setError('Mot de passe trop court.'); return }
    setLoading(true)
    try {
      await axios.post('http://localhost:8000/auth/reset-password', { token, new_password: password })
      setMessage('Mot de passe modifie avec succes !')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la reinitialisation.')
    } finally {
      setLoading(false)
    }
  }

  const green = '#7dba3a'
  const navy  = '#0d1b2e'

  return (
    <div style={{ height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:`linear-gradient(135deg, ${navy} 0%, #0d2137 50%, #0a3d2e 100%)` }}>
      <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', padding:'40px', borderRadius:'18px', width:'400px', backdropFilter:'blur(10px)' }}>

        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:48, height:48, background:green, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#fff', fontSize:14, margin:'0 auto 8px' }}>OCP</div>
          <h2 style={{ color:'#f1f5f9', fontSize:20, fontWeight:700, margin:'0 0 6px' }}>Nouveau mot de passe</h2>
          <p style={{ color:'#94a3b8', fontSize:13 }}>Choisissez un nouveau mot de passe securise</p>
        </div>

        {!token ? (
          <p style={{ color:'#f87171', textAlign:'center' }}>Lien invalide ou expire.</p>
        ) : message ? (
          <div style={{ background:'rgba(0,166,81,0.15)', border:'1px solid rgba(0,166,81,0.3)', borderRadius:10, padding:16, textAlign:'center', color:green, fontWeight:600 }}>
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width:'100%', padding:'12px', marginBottom:12, borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:14, boxSizing:'border-box' }}
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{ width:'100%', padding:'12px', marginBottom:12, borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:14, boxSizing:'border-box' }}
            />
            {error && <p style={{ color:'#f87171', fontSize:13, marginBottom:12, textAlign:'center' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{ width:'100%', padding:'12px', background:green, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:14, fontWeight:700, opacity:loading?0.7:1 }}
            >
              {loading ? 'Modification...' : 'Changer le mot de passe'}
            </button>
          </form>
        )}

        <div style={{ textAlign:'center', marginTop:16 }}>
          <span onClick={() => navigate('/login')} style={{ color:'#94a3b8', fontSize:12, cursor:'pointer', textDecoration:'underline' }}>
            Retour a la connexion
          </span>
        </div>
      </div>
    </div>
  )
}
