import React, { useState, useEffect } from 'react'
import Pokedex from './components/Pokedex'
import Navbar from './components/Navbar'
import TrainerProfile from './components/TrainerProfile'
import Collection from './components/Collection'
import Login from './components/Login'
import './App.css'

const ACCOUNTS = [
  { username: 'soignant', password: 'soignant123', role: 'Soignant', name: 'Dr. Soins' },
  { username: 'dresseur', password: 'dresseur123', role: 'Dresseur', name: 'Sacha' }
]

function App() {
  const [path, setPath] = useState(window.location.pathname || '/')
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('pokedex_user')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    // If user tries to access /pokedex without being logged, redirect to /login
    if (path === '/pokedex' && !user) {
      navigate('/login')
    }
  }, [path, user])

  const navigate = (to) => {
    if (to === path) return
    window.history.pushState({}, '', to)
    setPath(to)
  }

  const login = ({ username, password }) => {
    const found = ACCOUNTS.find(a => a.username === username && a.password === password)
    if (found) {
      const safe = { username: found.username, role: found.role, name: found.name }
      setUser(safe)
      localStorage.setItem('pokedex_user', JSON.stringify(safe))
      navigate('/pokedex')
      return { ok: true }
    }
    return { ok: false, message: 'Identifiants incorrects' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('pokedex_user')
    navigate('/')
  }

  return (
    <div className="App">
      {/* Navbar receives navigate so links are SPA-like; render on all pages so auth state is visible everywhere */}
      <Navbar navigate={navigate} currentUser={user} onLogout={logout} />
      {path === '/collection' && <Collection />}
      {path === '/' && <Pokedex />}
      {path === '/login' && <Login onLogin={login} navigate={navigate} />}
      {path === '/pokedex' && <TrainerProfile currentUser={user} />}
    </div>
  )
}

export default App
