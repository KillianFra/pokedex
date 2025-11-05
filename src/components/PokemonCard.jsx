import React from 'react';
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
          <h3 className="pokemon-name">{pokemon.name}</h3>
          
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