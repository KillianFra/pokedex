import React, { useEffect, useState } from 'react';
import './PokemonCard.css';

const PokemonCard = ({ pokemon, onCardClick }) => {
  // Handle card click
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(pokemon.pokedexId);
    }
  };

  // Get type color for glassmorphism styling
  const getTypeColor = (typeName) => {
    const colors = {
      'Normal': '#A8A878',
      'Feu': '#F08030',
      'Fire': '#F08030',
      'Eau': '#6890F0',
      'Water': '#6890F0',
      'Plante': '#78C850',
      'Grass': '#78C850',
      'Électrik': '#F8D030',
      'Electric': '#F8D030',
      'Psy': '#F85888',
      'Psychic': '#F85888',
      'Glace': '#98D8D8',
      'Ice': '#98D8D8',
      'Dragon': '#7038F8',
      'T\u00e9n\u00e8bres': '#705848',
      'Dark': '#705848',
      'F\u00e9e': '#EE99AC',
      'Fairy': '#EE99AC',
      'Combat': '#C03028',
      'Fighting': '#C03028',
      'Poison': '#A040A0',
      'Sol': '#E0C068',
      'Ground': '#E0C068',
      'Vol': '#A890F0',
      'Flying': '#A890F0',
      'Insecte': '#A8B820',
      'Bug': '#A8B820',
      'Roche': '#B8A038',
      'Rock': '#B8A038',
      'Spectre': '#705898',
      'Ghost': '#705898',
      'Acier': '#B8B8D0',
      'Steel': '#B8B8D0'
    };
    return colors[typeName] || '#68A090';
  };

  // Format Pokemon ID with leading zeros
  const formatId = (id) => `#${String(id).padStart(3, '0')}`;

  // Get primary type for card styling
  const primaryType = pokemon.apiTypes?.[0]?.name || 'Normal';
  const primaryColor = getTypeColor(primaryType);

  // Prefer French name when available; otherwise try to fetch it lazily from PokeAPI species
  const [frenchName, setFrenchName] = useState(null);
  const [localNickname, setLocalNickname] = useState(null);

  const STORAGE_KEY = 'pokedex_collection_v1';

  const getDisplayName = (p) => {
    if (!p) return '';
    return (localNickname || p.name_fr || p.nom || (p.names && (p.names.fr || p.names['fr'])) || frenchName || p.name || '').toString();
  };

  useEffect(() => {
    let mounted = true;
    // load local nickname if present
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const me = saved.find(x => x.id === pokemon?.pokedexId);
        if (me && mounted) setLocalNickname(me.nickname || null);
      }
    } catch (e) { /* ignore */ }

    const hasFrench = pokemon?.name_fr || pokemon?.nom || (pokemon.names && (pokemon.names.fr || pokemon.names['fr']));
    if (!hasFrench && pokemon?.pokedexId) {
      // fetch species to get localized names (fr)
      const id = pokemon.pokedexId;
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (!mounted || !data) return;
          const fr = data.names?.find(n => n.language?.name === 'fr');
          if (fr && fr.name) setFrenchName(fr.name);
        })
        .catch(() => {/* ignore fetch errors */});
    }
    return () => { mounted = false };
  }, [pokemon]);

  return (
    <div 
      className="pokemon-card" 
      onClick={handleCardClick}
      style={{ 
        '--primary-color': primaryColor,
        '--bg-image': `url(${pokemon.image})`
      }}
    >
      <div className="pokemon-card-background"></div>
      
      <div className="pokemon-card-content">
        <div className="pokemon-number">
          {formatId(pokemon.pokedexId)}
        </div>
        
        <div className="pokemon-info-bottom">
          <h3 className="pokemon-name">{getDisplayName(pokemon)}</h3>
          
          <div className="pokemon-types">
            {pokemon.apiTypes?.map((type, index) => (
              <div 
                key={index}
                className="type-icon"
                style={{ backgroundColor: getTypeColor(type.name) }}
                data-tooltip={type.name}
              >
                {type.image ? (
                  <img 
                    src={type.image} 
                    alt={type.name}
                    className="type-image"
                  />
                ) : (
                  <span className="type-text">{type.name.charAt(0)}</span>
                )}
                <span className="type-tooltip">{type.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;