import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export default function Login() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedRole = location.state?.role || localStorage.getItem('selectedRole') || null

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const [showModal, setShowModal]   = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMsg, setResetMsg]     = useState('')
  const [resetErr, setResetErr]     = useState('')
  const [resetLoad, setResetLoad]   = useState(false)

  const roleConfig = {
    admin:      { label: 'Administrateur',          color: '#7dba3a' },
    operateur:  { label: "Op\u00e9rateur",           color: '#006DB7' },
    technicien: { label: 'Technicien Maintenance',   color: '#64748b' },
    qualite:    { label: 'Responsable Qualit\u00e9', color: '#f59e0b' },
  }
  const rc = selectedRole ? (roleConfig[selectedRole] || { label: 'Utilisateur', color: '#7dba3a' }) : { label: 'Utilisateur', color: '#7dba3a' }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {

  const response = await axios.post(
    'http://localhost:8000/auth/login',
    { username, password }
  )

  const selectedRole =
    location.state?.role ||
    localStorage.getItem("selectedRole")

  if (
    selectedRole &&
    response.data.role !== selectedRole
  ) {
    setError(
      "Ce compte ne correspond pas au profil sélectionné."
    )
    return
  }

  localStorage.setItem(
  'token',
  response.data.access_token
)

localStorage.setItem(
  'role',
  response.data.role
)

// njibo les infos dyal user
const meResponse = await axios.get(
  "http://localhost:8000/users/me",
  {
    headers: {
      Authorization: `Bearer ${response.data.access_token}`
    }
  }
)
localStorage.setItem(
  "userId",
  meResponse.data.id
);

const user = meResponse.data

localStorage.setItem(
  "profileNom",
  `${user.full_name || ""} ${user.prenom || ""}`.trim()
)

localStorage.removeItem('selectedRole')

// bach Navbar trefresha direct
window.dispatchEvent(
  new Event("profileUpdated")
)

window.location.href = '/dashboard'

} catch {

  setError(
    "Les identifiants sont incorrects. Vérifiez votre nom d’utilisateur et mot de passe."
  )

} finally {
  setLoading(false)
}
  }

  const handleResetRequest = async (e) => {
    e.preventDefault()
    setResetLoad(true)
    setResetErr('')
    setResetMsg('')
    try {
      await axios.post('http://localhost:8000/auth/forgot-password', { email: resetEmail })
      setResetMsg("Email envoye ! Verifiez votre boite mail (et le dossier spam).")
    } catch (err) {
      setResetErr(err.response?.data?.detail || "Aucun compte trouve avec cet email.")
    } finally {
      setResetLoad(false)
    }
  }

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:"'Segoe UI', sans-serif" }}>

      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
        <img src="/login.png" alt="OCP" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0.3))' }} />
      </div>

      <div style={{ width:480, display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', padding:'40px 48px' }}>
        <div style={{ width:'100%' }}>

          <div style={{ textAlign:'center', marginBottom:24 }}>
            <img src="/logo_ocp.png" alt="OCP" style={{ height:90, objectFit:'contain' }} />
          </div>

          <h1 style={{ fontSize:26, fontWeight:800, color:'#0d1b2e', margin:'0 0 8px', lineHeight:1.2 }}>
            Connectez-vous {"\u00e0"} votre espace OCP
          </h1>
          <p style={{ fontSize:14, color:'#718096', marginBottom:24, lineHeight:1.6 }}>
            Acc{"\u00e9"}dez {"\u00e0"} votre tableau de bord pour surveiller la qualit{"\u00e9"} de production en temps r{"\u00e9"}el
          </p>

          {selectedRole && (
            <div style={{ display:'inline-flex', alignItems:'center', padding:'6px 16px', borderRadius:99, border:`1.5px solid ${rc.color}`, color:rc.color, fontSize:13, fontWeight:600, marginBottom:20 }}>
              {rc.label}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{ width:'100%', padding:'13px 16px', marginBottom:12, borderRadius:10, border:'1.5px solid #e2e8f0', background:'#f0f4ff', fontSize:14, color:'#0d1b2e', boxSizing:'border-box', outline:'none' }}
            />

            <div style={{ position:'relative', marginBottom:12 }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width:'100%', padding:'13px 44px 13px 16px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', fontSize:14, color:'#0d1b2e', boxSizing:'border-box', outline:'none' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#718096', padding:4 }}>
                {showPass ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <span onClick={() => navigate('/role-select')}
                style={{ fontSize:13, color:rc.color, cursor:'pointer', fontWeight:500 }}>
                Changer de profil
              </span>
              <span onClick={() => { setShowModal(true); setResetMsg(''); setResetErr('') }}
                style={{ fontSize:13, color:'#e53e3e', cursor:'pointer', fontWeight:500, textDecoration:'underline' }}>
                Mot de passe oubli{"\u00e9"} ?
              </span>
            </div>

            {error && (
              <div style={{ background:'#fff5f5', border:'1px solid #fed7d7', borderRadius:8, padding:'10px 14px', marginBottom:14, color:'#c53030', fontSize:13, display:'flex', alignItems:'flex-start', gap:8 }}>
                <span>&#9888;</span> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'14px', background:rc.color, color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer', opacity:loading?0.75:1 }}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:20 }}>
            <span onClick={() => navigate('/')}
              style={{ fontSize:13, color:'#718096', cursor:'pointer', textDecoration:'underline' }}>
              Retour {"\u00e0"} l{"\u2019"}accueil
            </span>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:'36px', width:420, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize:20, fontWeight:700, color:'#0d1b2e', marginBottom:8 }}>Mot de passe oubli{"\u00e9"} ?</h2>
            <p style={{ fontSize:14, color:'#718096', marginBottom:24, lineHeight:1.6 }}>
              Entrez votre adresse email pour recevoir un lien de r{"\u00e9"}initialisation.
            </p>

            {resetMsg ? (
              <div style={{ background:'#f0fff4', border:'1px solid #9ae6b4', borderRadius:8, padding:14, color:'#276749', fontSize:14, marginBottom:16 }}>
                {resetMsg}
              </div>
            ) : (
              <form onSubmit={handleResetRequest}>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                  style={{ width:'100%', padding:'12px 16px', borderRadius:8, border:'1.5px solid #e2e8f0', fontSize:14, marginBottom:12, boxSizing:'border-box', outline:'none' }}
                />
                {resetErr && (
                  <p style={{ color:'#e53e3e', fontSize:13, marginBottom:12 }}>{resetErr}</p>
                )}
                <button type="submit" disabled={resetLoad}
                  style={{ width:'100%', padding:'12px', background:'#7dba3a', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:700, cursor:'pointer', opacity:resetLoad?0.7:1 }}>
                  {resetLoad ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
              </form>
            )}

            <button onClick={() => setShowModal(false)}
              style={{ width:'100%', marginTop:12, padding:'10px', background:'transparent', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, color:'#718096', cursor:'pointer' }}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}