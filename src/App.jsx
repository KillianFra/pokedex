import React, { useState, useEffect } from 'react'
import Pokedex from './components/Pokedex'
import Navbar from './components/Navbar'
import TrainerProfile from './components/TrainerProfile'
import Collection from './components/Collection'
import './App.css'

function App() {
  const [path, setPath] = useState(window.location.pathname || '/')

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = (to) => {
    if (to === path) return
    window.history.pushState({}, '', to)
    setPath(to)
  }

  return (
    <div className="App">
      {/* Navbar receives navigate so links are SPA-like */}
      {path !== '/' && <Navbar navigate={navigate} />}

      {path === '/' && <Pokedex />}
      {path === '/collection' && <Collection />}
      {path === '/pokedex' && <TrainerProfile />}
    </div>
  )
}

export default App
