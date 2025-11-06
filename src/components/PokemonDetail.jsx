import React, { useState, useEffect } from 'react';
import './PokemonDetail.css';

const PokemonDetail = ({ pokemonId, onBack, onPokemonSelect }) => {
  const [pokemon, setPokemon] = useState(null);
  const [pokemonSpecies, setPokemonSpecies] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState(null);
  const [locations, setLocations] = useState([]);
  const [allEvolutions, setAllEvolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      try {
        setLoading(true);
        
        // Fetch from both APIs in parallel
        const [pokeBuildResponse, pokeApiResponse] = await Promise.all([
          fetch(`https://pokebuildapi.fr/api/v1/pokemon/${pokemonId}`),
          fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
        ]);
        
        if (!pokeBuildResponse.ok || !pokeApiResponse.ok) {
          throw new Error('Failed to fetch Pokemon data');
        }
        
        const [pokeBuildData, pokeApiData] = await Promise.all([
          pokeBuildResponse.json(),
          pokeApiResponse.json()
        ]);
        
        // Combine data from both APIs
        const combinedPokemon = {
          ...pokeBuildData,
          height: pokeApiData.height / 10, // Convert decimeters to meters
          weight: pokeApiData.weight / 10, // Convert hectograms to kilograms
          baseExperience: pokeApiData.base_experience,
          abilities: pokeApiData.abilities,
          moves: pokeApiData.moves,
          sprites: pokeApiData.sprites,
          captureRate: null, // Will be set from species data
          habitat: null, // Will be set from species data
          growthRate: null, // Will be set from species data
          flavorText: null // Will be set from species data
        };
        
        setPokemon(combinedPokemon);
        
        // Fetch additional species data
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        if (speciesResponse.ok) {
          const speciesData = await speciesResponse.json();
          setPokemonSpecies(speciesData);
          
          // Fetch evolution chain
          const evolutionResponse = await fetch(speciesData.evolution_chain.url);
          if (evolutionResponse.ok) {
            const evolutionData = await evolutionResponse.json();
            setEvolutionChain(evolutionData);
            
            // Process evolution chain
            await processEvolutionChain(evolutionData, pokeBuildData);
          }
        }
        
        // Fetch location encounters
        const locationResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`);
        if (locationResponse.ok) {
          const locationData = await locationResponse.json();
          setLocations(locationData);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching Pokemon details:', err);
        setError('Failed to load Pokémon details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const processEvolutionChain = async (evolutionData, currentPokemonData) => {
      const evolutions = [];
      
      const processChain = (chain) => {
        // Add current Pokemon to evolutions if it's not the main Pokemon
        const speciesId = parseInt(chain.species.url.split('/').slice(-2, -1)[0]);
        if (speciesId !== currentPokemonData.pokedexId) {
          evolutions.push({
            name: chain.species.name,
            id: speciesId,
            evolutionDetails: []
          });
        }
        
        // Process evolution details for next evolutions
        if (chain.evolves_to && chain.evolves_to.length > 0) {
          chain.evolves_to.forEach(evolution => {
            const evolutionId = parseInt(evolution.species.url.split('/').slice(-2, -1)[0]);
            evolutions.push({
              name: evolution.species.name,
              id: evolutionId,
              evolutionDetails: evolution.evolution_details
            });
            
            // Recursively process further evolutions
            processChain(evolution);
          });
        }
      };
      
      processChain(evolutionData.chain);
      
      // Remove duplicates and current Pokemon
      const uniqueEvolutions = evolutions.filter((evolution, index, self) => 
        evolution.id !== currentPokemonData.pokedexId && 
        index === self.findIndex(e => e.id === evolution.id)
      );
      
      // Fetch images for evolutions from PokeBuild API
      const evolutionPromises = uniqueEvolutions.map(async (evolution) => {
        try {
          const evolutionResponse = await fetch(`https://pokebuildapi.fr/api/v1/pokemon/${evolution.id}`);
          if (evolutionResponse.ok) {
            const evolutionImageData = await evolutionResponse.json();
            return {
              ...evolution,
              pokedexId: evolution.id,
              image: evolutionImageData.image,
              pokeBuildName: evolutionImageData.name
            };
          }
          return evolution;
        } catch (err) {
          console.error(`Error fetching evolution image ${evolution.id}:`, err);
          return evolution;
        }
      });
      
      const evolutionResults = await Promise.all(evolutionPromises);
      setAllEvolutions(evolutionResults);
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
          <p>Chargement des détails du Pokémon...</p>
        </div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="pokemon-detail-container">
        <button className="back-button" onClick={onBack}>
          ← Retour au Pokédex
        </button>
        <div className="error-detail">
          <p>{error || 'Pokémon non trouvé'}</p>
          <button className="retry-button" onClick={onBack}>
            Retour au Pokédex
          </button>
        </div>
      </div>
    );
  }

  const formatId = (id) => `#${String(id).padStart(3, '0')}`;
  console.log('pokemon', pokemon);
  return (
    <div className="pokemon-detail-container">
      <button className="back-button" onClick={onBack}>
        ← Retour au Pokédex
      </button>
      
      <div className="pokemon-detail-content">
        <div className="pokemon-header">
          <div className="pokemon-id">{formatId(pokemon.pokedexId)}</div>
          <h1 className="pokemon-title">{pokemon.name_fr || pokemon.nom || pokemon.name || (pokemon.names && (pokemon.names.fr || pokemon.names['fr']))}</h1>
          
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
            <div className="pokemon-type-effectiveness">
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

          {pokemonSpecies?.flavor_text_entries && (
            <div className="pokemon-description">
              <h3>Description</h3>
              <p className="flavor-text">
                {pokemonSpecies.flavor_text_entries
                  .find(entry => entry.language.name === 'fr')?.flavor_text
                  .replace(/\f/g, ' ')
                  .replace(/\n/g, ' ') || 
                  pokemonSpecies.flavor_text_entries
                  .find(entry => entry.language.name === 'en')?.flavor_text
                  .replace(/\f/g, ' ')
                  .replace(/\n/g, ' ') || 'Aucune description disponible.'}
              </p>
            </div>
          )}

          <div className="pokemon-basic-info">
            <h3>Informations de Base</h3>
            <div className="basic-info-item">
              <span className="info-label">Taille</span>
              <span className="info-value">{pokemon.height ? `${pokemon.height} m` : 'Inconnu'}</span>
            </div>
            <div className="basic-info-item">
              <span className="info-label">Poids</span>
              <span className="info-value">{pokemon.weight ? `${pokemon.weight} kg` : 'Inconnu'}</span>
            </div>
            <div className="basic-info-item">
              <span className="info-label">Expérience de Base</span>
              <span className="info-value">{pokemon.baseExperience || 'Inconnu'}</span>
            </div>
            <div className="basic-info-item">
              <span className="info-label">Génération</span>
              <span className="info-value">{pokemon.apiGeneration || 'Inconnu'}</span>
            </div>
            {pokemonSpecies?.capture_rate && (
              <div className="basic-info-item">
                <span className="info-label">Taux de Capture</span>
                <span className="info-value">{pokemonSpecies.capture_rate}</span>
              </div>
            )}
            {pokemonSpecies?.habitat && (
              <div className="basic-info-item">
                <span className="info-label">Habitat</span>
                <span className="info-value">{pokemonSpecies.habitat.name.replace('-', ' ').toUpperCase()}</span>
              </div>
            )}
          </div>

          <div className="pokemon-abilities">
            <h3>Capacités & Attaques</h3>
            <div className="abilities-section">
              <div className="natural-abilities">
                <h4>Capacités Naturelles</h4>
                <div className="abilities-grid">
                  {pokemon.abilities?.map((ability, index) => (
                    <div key={index} className="ability-item">
                      <div className="ability-name">
                        {ability.ability.name.replace(/[-_]/g, ' ').toUpperCase()}
                        {ability.is_hidden && <span className="hidden-ability"> (Cachée)</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {pokemon.moves && pokemon.moves.length > 0 && (
                <div className="learnable-moves">
                  <h4>Attaques Notables</h4>
                  <div className="moves-grid">
                    {pokemon.moves
                      .filter(move => {
                        // Show moves that can be learned by leveling up in Red/Blue
                        return move.version_group_details && move.version_group_details.some(detail => 
                          detail && 
                          detail.version_group && 
                          detail.learn_method &&
                          (detail.version_group.name === 'red-blue' || 
                           detail.version_group.name === 'yellow') &&
                          detail.learn_method.name === 'level-up' &&
                          detail.level_learned_at !== null &&
                          detail.level_learned_at <= 50
                        );
                      })
                      .sort((a, b) => {
                        const aLevel = a.version_group_details.find(detail => 
                          detail && 
                          detail.version_group &&
                          (detail.version_group.name === 'red-blue' || 
                           detail.version_group.name === 'yellow')
                        )?.level_learned_at || 0;
                        const bLevel = b.version_group_details.find(detail => 
                          detail && 
                          detail.version_group &&
                          (detail.version_group.name === 'red-blue' || 
                           detail.version_group.name === 'yellow')
                        )?.level_learned_at || 0;
                        return aLevel - bLevel;
                      })
                      .slice(0, 8)
                      .map((move, index) => {
                        const moveDetail = move.version_group_details.find(detail => 
                          detail && 
                          detail.version_group &&
                          (detail.version_group.name === 'red-blue' || 
                           detail.version_group.name === 'yellow')
                        );
                        return (
                          <div key={index} className="move-item">
                            <div className="move-name">
                              {move.move && move.move.name ? move.move.name.replace(/[-_]/g, ' ').toUpperCase() : 'Attaque Inconnue'}
                            </div>
                            <div className="move-level">
                              Lv. {moveDetail?.level_learned_at || '?'}
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pokemon-info-section">
            <div className="stats-grid">
              <div className="stat-category">
                <h3>Statistiques de Base</h3>
                <div className="stat-item-detail">
                  <span className="stat-name">PV</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${(pokemon.stats.HP / 255) * 100}%` }}></div>
                  </div>
                  <span className="stat-value">{pokemon.stats.HP}</span>
                </div>
                <div className="stat-item-detail">
                  <span className="stat-name">Attaque</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${(pokemon.stats.attack / 255) * 100}%` }}></div>
                  </div>
                  <span className="stat-value">{pokemon.stats.attack}</span>
                </div>
                <div className="stat-item-detail">
                  <span className="stat-name">Défense</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${(pokemon.stats.defense / 255) * 100}%` }}></div>
                  </div>
                  <span className="stat-value">{pokemon.stats.defense}</span>
                </div>
                <div className="stat-item-detail">
                  <span className="stat-name">Att. Spé.</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${(pokemon.stats.special_attack / 255) * 100}%` }}></div>
                  </div>
                  <span className="stat-value">{pokemon.stats.special_attack}</span>
                </div>
                <div className="stat-item-detail">
                  <span className="stat-name">Déf. Spé.</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${(pokemon.stats.special_defense / 255) * 100}%` }}></div>
                  </div>
                  <span className="stat-value">{pokemon.stats.special_defense}</span>
                </div>
                <div className="stat-item-detail">
                  <span className="stat-name">Vitesse</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${(pokemon.stats.speed / 255) * 100}%` }}></div>
                  </div>
                  <span className="stat-value">{pokemon.stats.speed}</span>
                </div>
              </div>
            </div>

            {allEvolutions && allEvolutions.length > 0 && (
              <div className="evolutions-section">
                <h3>Chaîne d'Évolution</h3>
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
                          alt={evolution.pokeBuildName || evolution.name}
                          className="evolution-image"
                        />
                      </div>
                      <div className="evolution-info">
                        <span className="evolution-name">
                          {evolution.pokeBuildName || evolution.name}
                        </span>
                        <span className="evolution-id">#{String(evolution.pokedexId).padStart(3, '0')}</span>
                        {evolution.evolutionDetails && evolution.evolutionDetails.length > 0 && (
                          <div className="evolution-conditions">
                            {evolution.evolutionDetails.map((detail, detailIndex) => (
                              <div key={detailIndex} className="evolution-condition">
                                {detail.min_level && (
                                  <span className="condition-text">Niveau {detail.min_level}</span>
                                )}
                                {detail.item && (
                                  <span className="condition-text">
                                    Utiliser {detail.item.name.replace('-', ' ')}
                                  </span>
                                )}
                                {detail.trigger && (
                                  <span className="condition-trigger">
                                    ({detail.trigger.name.replace('-', ' ')})
                                  </span>
                                )}
                                {detail.time_of_day && (
                                  <span className="condition-text">
                                    Pendant {detail.time_of_day}
                                  </span>
                                )}
                                {detail.min_happiness && (
                                  <span className="condition-text">
                                    Bonheur {detail.min_happiness}+
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(() => {
              // Filter locations to only show Red/Blue (1st generation) locations
              const redBlueLocations = locations.filter(location => 
                location.version_details.some(version => 
                  version.version.name === 'red' || version.version.name === 'blue'
                )
              );
              
              return redBlueLocations.length > 0 && (
                <div className="locations-section">
                  <h3>Où le Trouver (Rouge/Bleu)</h3>
                  <div className="locations-grid">
                    {redBlueLocations.slice(0, 6).map((location, index) => (
                      <div key={index} className="location-item">
                        <div className="location-name">
                          {location.location_area.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="location-games">
                          {location.version_details
                            .filter(version => version.version.name === 'red' || version.version.name === 'blue')
                            .map((version, vIndex) => (
                              <span key={vIndex} className="game-version">
                                {version.version.name.toUpperCase()}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;