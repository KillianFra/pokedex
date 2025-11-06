import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img 
            src="/pokemon-logo.png" 
            alt="Pokémon" 
            className="navbar-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <div className="navbar-text">
            <h1 className="navbar-title">Pokémon</h1>
            <span className="navbar-subtitle">Encyclopédie</span>
          </div>
        </div>
        
        <div className="navbar-menu">
          <div className="navbar-item">
            <span className="navbar-generation">Génération I</span>
          </div>
          <div className="navbar-item">
            <div className="navbar-stats">
              <span className="stats-label">Kanto</span>
              <span className="stats-count">151 Pokémon</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;