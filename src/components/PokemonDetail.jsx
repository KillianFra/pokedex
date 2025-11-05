import React, { useState, useEffect } from 'react';
import './PokemonDetail.css';

const PokemonDetail = ({ pokemonId, onBack, onPokemonSelect }) => {
  const [pokemon, setPokemon] = useState(null);
  const [allEvolutions, setAllEvolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://pokebuildapi.fr/api/v1/pokemon/${pokemonId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setPokemon(data);
        
        // Collect all evolutions (both pre-evolutions and next evolutions)
        const evolutions = [];
        
        // Add pre-evolutions if they exist (ensure it's an array)
        if (data.apiPreEvolution && Array.isArray(data.apiPreEvolution) && data.apiPreEvolution.length > 0) {
          evolutions.push(...data.apiPreEvolution);
        }
        
        // Add next evolutions if they exist (ensure it's an array)
        if (data.apiEvolutions && Array.isArray(data.apiEvolutions) && data.apiEvolutions.length > 0) {
          evolutions.push(...data.apiEvolutions);
        }
        
        // Fetch full data for each evolution to get images
        const evolutionPromises = evolutions.map(async (evolution) => {
          try {
            const evolutionResponse = await fetch(`https://pokebuildapi.fr/api/v1/pokemon/${evolution.pokedexId}`);
            if (evolutionResponse.ok) {
              const evolutionData = await evolutionResponse.json();
              return {
                pokedexId: evolutionData.pokedexId,
                name: evolutionData.name,
                image: evolutionData.image,
                isPreEvolution: data.apiPreEvolution && Array.isArray(data.apiPreEvolution) && data.apiPreEvolution.some(pre => pre.pokedexId === evolution.pokedexId)
              };
            }
            return null;
          } catch (err) {
            console.error(`Error fetching evolution ${evolution.pokedexId}:`, err);
            return null;
          }
        });
        
        const evolutionResults = await Promise.all(evolutionPromises);
        const validEvolutions = evolutionResults.filter(evolution => evolution !== null);
        
        setAllEvolutions(validEvolutions);
        setError(null);
      } catch (err) {
        console.error('Error fetching Pokemon details:', err);
        setError('Failed to load Pokémon details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (pokemonId) {
      fetchPokemonDetail();
    }
  }, [pokemonId]);

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
      'Ténèbres': '#705848',
      'Dark': '#705848',
      'Fée': '#EE99AC',
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

  if (loading) {
    return (
      <div className="pokemon-detail-container">
        <div className="loading-detail">
          <div className="pokeball-loader">
            <div className="pokeball">
              <div className="pokeball-top"></div>
              <div className="pokeball-middle"></div>
              <div className="pokeball-bottom"></div>
            </div>
          </div>
          <p>Loading Pokémon details...</p>
        </div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="pokemon-detail-container">
        <button className="back-button" onClick={onBack}>
          ← Back to Pokédex
        </button>
        <div className="error-detail">
          <p>{error || 'Pokémon not found'}</p>
          <button className="retry-button" onClick={onBack}>
            Back to Pokédex
          </button>
        </div>
      </div>
    );
  }

  const formatId = (id) => `#${String(id).padStart(3, '0')}`;

  return (
    <div className="pokemon-detail-container">
      <button className="back-button" onClick={onBack}>
        ← Back to Pokédex
      </button>
      
      <div className="pokemon-detail-content">
        <div className="pokemon-header">
          <div className="pokemon-id">{formatId(pokemon.pokedexId)}</div>
          <h1 className="pokemon-title">{pokemon.name}</h1>
          
          <div className="pokemon-types-detail">
            {pokemon.apiTypes?.map((type, index) => (
              <div 
                key={index}
                className="type-badge-detail"
                style={{ backgroundColor: getTypeColor(type.name) }}
              >
                {type.image && (
                  <img 
                    src={type.image} 
                    alt={type.name}
                    className="type-image-detail"
                  />
                )}
                <span>{type.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pokemon-main-content">
          <div className="pokemon-image-section">
            <img 
              src={pokemon.image} 
              alt={pokemon.name}
              className="pokemon-image-detail"
            />
          </div>

          <div className="pokemon-basic-info">
            <h3>Basic Info</h3>
            <div className="basic-info-item">
              <span className="info-label">Height</span>
              <span className="info-value">{pokemon.height || 'Unknown'}</span>
            </div>
            <div className="basic-info-item">
              <span className="info-label">Weight</span>
              <span className="info-value">{pokemon.weight || 'Unknown'}</span>
            </div>
            <div className="basic-info-item">
              <span className="info-label">Generation</span>
              <span className="info-value">{pokemon.apiGeneration || 'Unknown'}</span>
            </div>
            <div className="basic-info-item">
              <span className="info-label">Category</span>
              <span className="info-value">{pokemon.category || 'Pokémon'}</span>
            </div>
          </div>

          <div className="pokemon-abilities">
            <h3>Types</h3>
            <div className="abilities-grid">
              {pokemon.apiTypes?.map((type, index) => (
                <div key={index} className="ability-item">
                  <div className="ability-name">{type.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pokemon-type-effectiveness">
            <h3>Type Information</h3>
            <div className="type-effectiveness-grid">
              {pokemon.apiTypes?.map((type, index) => (
                <div key={index} className="effectiveness-item">
                  <img 
                    src={type.image} 
                    alt={type.name}
                    className="type-image-detail"
                  />
                  <div className="effectiveness-multiplier">{type.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pokemon-info-section">
            <div className="stats-grid">
              <div className="stat-category">
                <h3>Base Stats</h3>
                <div className="stat-item-detail">
                  <span className="stat-name">HP</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${(pokemon.stats.HP / 255) * 100}%` }}></div>
                  </div>
                  <span className="stat-value">{pokemon.stats.HP}</span>
                </div>
                <div className="stat-item-detail">
                  <span className="stat-name">Attack</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${(pokemon.stats.attack / 255) * 100}%` }}></div>
                  </div>
                  <span className="stat-value">{pokemon.stats.attack}</span>
                </div>
                <div className="stat-item-detail">
                  <span className="stat-name">Defense</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${(pokemon.stats.defense / 255) * 100}%` }}></div>
                  </div>
                  <span className="stat-value">{pokemon.stats.defense}</span>
                </div>
                <div className="stat-item-detail">
                  <span className="stat-name">Sp. Attack</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${(pokemon.stats.special_attack / 255) * 100}%` }}></div>
                  </div>
                  <span className="stat-value">{pokemon.stats.special_attack}</span>
                </div>
                <div className="stat-item-detail">
                  <span className="stat-name">Sp. Defense</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${(pokemon.stats.special_defense / 255) * 100}%` }}></div>
                  </div>
                  <span className="stat-value">{pokemon.stats.special_defense}</span>
                </div>
                <div className="stat-item-detail">
                  <span className="stat-name">Speed</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${(pokemon.stats.speed / 255) * 100}%` }}></div>
                  </div>
                  <span className="stat-value">{pokemon.stats.speed}</span>
                </div>
              </div>
            </div>

            {allEvolutions && allEvolutions.length > 0 && (
              <div className="evolutions-section">
                <h3>Evolution Chain</h3>
                <div className="evolutions-grid">
                  {allEvolutions.map((evolution, index) => (
                    <div 
                      key={index} 
                      className="evolution-item"
                      onClick={() => onPokemonSelect && onPokemonSelect(evolution.pokedexId)}
                    >
                      <div className="evolution-image-container">
                        <img 
                          src={evolution.image} 
                          alt={evolution.name}
                          className="evolution-image"
                        />
                      </div>
                      <div className="evolution-info">
                        <span className="evolution-name">{evolution.name}</span>
                        <span className="evolution-id">#{String(evolution.pokedexId).padStart(3, '0')}</span>
                        <span className="evolution-type">
                          {evolution.isPreEvolution ? 'Pre-evolution' : 'Evolution'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;