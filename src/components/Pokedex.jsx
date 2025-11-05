import React, { useState, useEffect } from 'react';
import PokemonCard from './PokemonCard';
import PokemonDetail from './PokemonDetail';
import './Pokedex.css';

const Pokedex = () => {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPokemonId, setSelectedPokemonId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [idFilter, setIdFilter] = useState('');

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://pokebuildapi.fr/api/v1/pokemon/generation/1');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setPokemon(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching Pokemon:', err);
        setError('Failed to load Pokémon data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  const handlePokemonClick = (pokemonId) => {
    setSelectedPokemonId(pokemonId);
  };

  const handleBackToPokedex = () => {
    setSelectedPokemonId(null);
  };

  // Get unique types for filter dropdown
  const getAllTypes = () => {
    const types = new Set();
    pokemon.forEach(poke => {
      poke.apiTypes?.forEach(type => {
        types.add(type.name);
      });
    });
    return Array.from(types).sort();
  };

  // Filter pokemon based on search and filters
  const filteredPokemon = pokemon.filter(poke => {
    // Name search filter
    const matchesName = poke.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = !selectedType || 
      poke.apiTypes?.some(type => type.name === selectedType);
    
    // ID filter
    const matchesId = !idFilter || 
      poke.pokedexId.toString().includes(idFilter);
    
    return matchesName && matchesType && matchesId;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setIdFilter('');
  };

  // Show Pokemon detail page if one is selected
  if (selectedPokemonId) {
    return (
      <PokemonDetail 
        pokemonId={selectedPokemonId}
        onBack={handleBackToPokedex}
        onPokemonSelect={handlePokemonClick}
      />
    );
  }

  if (loading) {
    return (
      <div className="pokedex-container">
        <div className="pokedex-header">
          <img 
            src="/pokemon-logo.png" 
            alt="Pokémon" 
            className="pokemon-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <h1 className="backup-title">Pokémon</h1>
          <h2 className="pokedex-subtitle">Pokedex</h2>
        </div>
        <div className="loading-container">
          <div className="pokeball-loader">
            <div className="pokeball">
              <div className="pokeball-top"></div>
              <div className="pokeball-middle"></div>
              <div className="pokeball-bottom"></div>
            </div>
          </div>
          <p className="loading-text">Loading Pokémon...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pokedex-container">
        <div className="pokedex-header">
          <img 
            src="/pokemon-logo.png" 
            alt="Pokémon" 
            className="pokemon-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <h1 className="backup-title">Pokémon</h1>
          <h2 className="pokedex-subtitle">Pokedex</h2>
        </div>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pokedex-container">
      <div className="pokedex-header">
        <img 
          src="/pokemon-logo.png" 
          alt="Pokémon" 
          className="pokemon-logo"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'block';
          }}
        />
        <h1 className="backup-title">Pokémon</h1>
        <h2 className="pokedex-subtitle"></h2>
      </div>
      
      <div className="search-filter-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Pokémon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="search-icon">🔍</div>
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="filter-select"
        >
          <option value="">All Types</option>
          {getAllTypes().map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="ID..."
          value={idFilter}
          onChange={(e) => setIdFilter(e.target.value)}
          className="filter-input"
        />

        <button 
          onClick={clearFilters}
          className="clear-filters-btn"
        >
          Clear
        </button>
      </div>
      
      <div className="pokemon-count">
        <p>{filteredPokemon.length} of {pokemon.length} Pokémon found</p>
      </div>
      
      <div className="pokemon-grid">
        {filteredPokemon.map((poke) => (
          <PokemonCard 
            key={poke.id || poke.pokedexId} 
            pokemon={poke}
            onCardClick={handlePokemonClick}
          />
        ))}
      </div>
    </div>
  );
};

export default Pokedex;