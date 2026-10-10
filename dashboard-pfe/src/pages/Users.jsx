import { useEffect, useState } from "react"
import { userService } from "../services/api"
import { useTheme } from "../context/ThemeContext"
import { Users, Shield, UserCog, Wrench, Trash2, Eye, Pencil } from "lucide-react"

function getC(dark) {
  return {
    bg:      dark ? '#0d1b2e' : '#f0f4f8',
    card:    dark ? '#0f2233' : '#ffffff',
    cardAlt: dark ? '#0a1929' : '#f8fafc',
    border:  dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0',
    text:    dark ? '#f1f5f9' : '#0A2647',
    muted:   dark ? '#94a3b8' : '#64748B',
    thead:   dark ? '#081524' : '#F8FAFC',
    inputBg: dark ? '#0a1929' : '#ffffff',
    rowHov:  dark ? 'rgba(255,255,255,0.04)' : '#f0f7ff',
  }
}

export default function UsersPage() {
  const { theme: mode } = useTheme()
  const dark = mode === 'dark'
  const C = getC(dark)

  const [users, setUsers]               = useState([])
  const [showModal, setShowModal]       = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [form, setForm] = useState({ full_name:'', username:'', email:'', password:'', role:'operateur' })

  const loadUsers = async () => {
    try { const data = await userService.getAll(); setUsers(data) }
    catch (err) { console.error(err) }
  }
  useEffect(() => { loadUsers() }, [])

  const admins     = users.filter(u => u.role === 'admin').length
  const operateurs = users.filter(u => u.role === 'operateur').length
  const techniciens= users.filter(u => u.role === 'technicien').length

  const handleCreateUser = async () => {
    try {
      await userService.create(form)
      setShowModal(false)
      setForm({ full_name:'', username:'', email:'', password:'', role:'operateur' })
      loadUsers()
    } catch (err) { alert(JSON.stringify(err.response?.data, null, 2)) }
  }

  const handleView = (user) => { setSelectedUser(user); setShowViewModal(true) }
  const handleEdit = (user) => {
    setSelectedUser(user)
    setForm({ full_name:user.full_name||'', username:user.username||'', email:user.email||'', password:'', role:user.role||'operateur' })
    setShowModal(true)
  }
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return
    try { await userService.delete(id); loadUsers() }
    catch { alert('Erreur suppression') }
  }

  const inputStyle = {
    width:'100%', padding:'12px', marginBottom:'10px',
    border:`1px solid ${C.border}`, borderRadius:'8px', fontSize:'14px',
    boxSizing:'border-box', background:C.inputBg, color:C.text, outline:'none',
  }

  const th = { padding:'14px', textAlign:'left', color:C.muted, fontSize:13, borderBottom:`1px solid ${C.border}`, fontWeight:700, letterSpacing:0.8, textTransform:'uppercase' }
  const td = { padding:'14px', borderBottom:`1px solid ${C.border}`, color:C.text, fontSize:13 }

  return (
    <div style={{ padding:28, minHeight:'100vh', background:C.bg, transition:'background 0.3s' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:25 }}>
        <div>
          <h1 style={{ margin:0, fontSize:28, fontWeight:700, color:C.text }}>Gestion des Utilisateurs</h1>
          <p style={{ marginTop:5, color:C.muted }}>Gestion des comptes et des rôles</p>
        </div>
        <button onClick={() => { setSelectedUser(null); setForm({ full_name:'', username:'', email:'', password:'', role:'operateur' }); setShowModal(true) }}
          style={{ background:'linear-gradient(135deg,#006DB7,#00A651)', color:'#fff', border:'none', padding:'10px 20px', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:13, boxShadow:'0 3px 10px rgba(0,109,183,0.3)' }}>
          + Ajouter Utilisateur
        </button>
      </div>

      {/* KPI */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:25 }}>
        {[
          { icon:<Users size={24}/>,   value:users.length, title:'Total' },
          { icon:<Shield size={24}/>,  value:admins,       title:'Admins' },
          { icon:<UserCog size={24}/>, value:operateurs,   title:'Opérateurs' },
          { icon:<Wrench size={24}/>,  value:techniciens,  title:'Techniciens' },
        ].map(({ icon, value, title }) => (
          <div key={title} style={{ background:C.card, borderRadius:16, padding:20, boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 5px 18px rgba(0,0,0,.06)', border:`1px solid ${C.border}`, transition:'background 0.3s' }}>
            <div style={{ color:'#7dba3a', marginBottom:12 }}>{icon}</div>
            <div style={{ fontSize:28, fontWeight:700, color:C.text }}>{value}</div>
            <div style={{ color:C.muted, marginTop:5 }}>{title}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:C.card, borderRadius:18, overflow:'hidden', boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,.08)', border:`1px solid ${C.border}`, transition:'background 0.3s' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:C.thead }}>
              <th style={th}>Nom complet</th>
              <th style={th}>Username</th>
              <th style={th}>Email</th>
              <th style={th}>Rôle</th>
              <th style={th}>Statut</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={user.id}
                style={{ background: i%2===0 ? C.card : C.cardAlt, transition:'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background=C.rowHov}
                onMouseLeave={e => e.currentTarget.style.background= i%2===0 ? C.card : C.cardAlt}
              >
                <td style={td}>{user.full_name}</td>
                <td style={td}>{user.username}</td>
                <td style={td}>{user.email||'-'}</td>
                <td style={td}>
                  <span style={{ background: dark ? 'rgba(125,186,58,0.15)' : '#EAF7E1', color:'#4D7C0F', padding:'4px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                    {user.role}
                  </span>
                </td>
                <td style={td}>
                  <span style={{ color: user.is_active ? '#16A34A' : '#DC2626', fontWeight:600 }}>
                    {user.is_active ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td style={td}>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => handleView(user)} style={{ border:'none', background:'#DBEAFE', color:'#2563EB', padding:'8px', borderRadius:8, cursor:'pointer', display:'flex' }}><Eye size={16}/></button>
                    <button onClick={() => handleEdit(user)} style={{ border:'none', background:'#FEF3C7', color:'#D97706', padding:'8px', borderRadius:8, cursor:'pointer', display:'flex' }}><Pencil size={16}/></button>
                    <button onClick={() => handleDelete(user.id)} style={{ border:'none', background:'#FEE2E2', color:'#DC2626', padding:'8px', borderRadius:8, cursor:'pointer', display:'flex' }}><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Ajouter/Modifier */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:9999 }}>
          <div style={{ background:C.card, padding:28, borderRadius:16, width:500, border:`1px solid ${C.border}`, boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin:'0 0 20px', color:C.text, fontSize:18, fontWeight:800 }}>
              {selectedUser ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}
            </h2>
            {['full_name','username','email'].map(field => (
              <input key={field} placeholder={field === 'full_name' ? 'Nom complet' : field === 'username' ? 'Username' : 'Email'}
                value={form[field]} onChange={e => setForm({ ...form, [field]:e.target.value })} style={inputStyle} />
            ))}
            <input type="password" placeholder="Mot de passe" value={form.password} onChange={e => setForm({ ...form, password:e.target.value })} style={inputStyle} />
            <select value={form.role} onChange={e => setForm({ ...form, role:e.target.value })} style={inputStyle}>
              <option value="admin">Admin</option>
              <option value="operateur">Operateur</option>
              <option value="technicien">Technicien</option>
            </select>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
              <button onClick={() => setShowModal(false)} style={{ padding:'9px 18px', borderRadius:9, border:`1.5px solid ${C.border}`, background:C.inputBg, color:C.muted, cursor:'pointer', fontSize:13, fontWeight:600 }}>Annuler</button>
              <button onClick={handleCreateUser} style={{ padding:'9px 20px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#006DB7,#00A651)', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700 }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Voir */}
      {showViewModal && selectedUser && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:99999 }}>
          <div style={{ background:C.card, width:800, maxWidth:'95%', borderRadius:24, padding:30, boxShadow:'0 25px 60px rgba(0,0,0,.3)', border:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:25 }}>
              <div style={{ width:100, height:100, borderRadius:'50%', background: dark ? 'rgba(125,186,58,0.15)' : '#EAF7E1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:42, fontWeight:800, color:'#7dba3a', boxShadow:'0 10px 25px rgba(125,186,58,.25)' }}>
                {selectedUser.full_name?.charAt(0)}
              </div>
              <div>
                <h2 style={{ margin:0, fontSize:32, fontWeight:800, color:C.text }}>{selectedUser.full_name}</h2>
                <div style={{ marginTop:10, display:'inline-block', padding:'8px 16px', borderRadius:20,
                  background: selectedUser.role==='admin' ? '#FEE2E2' : selectedUser.role==='technicien' ? '#DBEAFE' : '#EAF7E1',
                  color: selectedUser.role==='admin' ? '#DC2626' : selectedUser.role==='technicien' ? '#2563EB' : '#4D7C0F',
                  fontWeight:700 }}>
                  {selectedUser.role}
                </div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:15 }}>
              {[
                ['ID', selectedUser.id],
                ['Nom complet', selectedUser.full_name||'-'],
                ["Nom d'utilisateur", selectedUser.username],
                ['Email', selectedUser.email||'-'],
                ['Rôle', selectedUser.role],
                ['Statut', selectedUser.is_active ? 'Actif' : 'Désactivé'],
                ['Date création', selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('fr-FR') : '-'],
                ['Site', 'OCP Jorf Lasfar'],
                ['Permissions', selectedUser.role==='admin' ? 'Accès complet' : selectedUser.role==='technicien' ? 'Maintenance & incidents' : 'Consultation dashboard'],
                ['Dernière connexion', "Aujourd'hui"],
              ].map(([label, value]) => (
                <div key={label} style={{ background:C.cardAlt, padding:15, borderRadius:12, border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:12, color:C.muted, marginBottom:5 }}>{label}</div>
                  <div style={{ fontWeight:600, color:C.text }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:25 }}>
              <button onClick={() => setShowViewModal(false)} style={{ background:'linear-gradient(135deg,#006DB7,#00A651)', color:'#fff', border:'none', padding:'12px 24px', borderRadius:10, cursor:'pointer', fontWeight:700 }}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}