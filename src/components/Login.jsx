import React, { useState } from 'react'
import './Login.css'

const Login = ({ onLogin, navigate }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const submit = (e) => {
    e.preventDefault()
    setError(null)
    if (!username || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }
    const res = onLogin ? onLogin({ username, password }) : { ok: false }
    if (res.ok) return
    setError(res.message || 'Échec de la connexion')
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <h2>Connexion</h2>
        <p className="login-help">Utilisez un des comptes codés en dur: <br/> <strong>soignant / soignant123</strong> ou <strong>dresseur / dresseur123</strong></p>

        <label>
          Nom d'utilisateur
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>

        <label>
          Mot de passe
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {error && <div className="login-error">{error}</div>}

        <div className="login-actions">
          <button className="btn primary" type="submit">Se connecter</button>
          <button className="btn" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Retour</button>
        </div>
      </form>
    </div>
  )
}

export default Login
