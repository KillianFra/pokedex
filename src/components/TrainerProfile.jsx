import React, { useState } from 'react';
import './TrainerProfile.css';

const SAMPLE_POKEMON = [
  { id: 1, name: 'Bulbizarre', name_en: 'Bulbasaur', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
  { id: 4, name: 'Salamèche', name_en: 'Charmander', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
  { id: 7, name: 'Carapuce', name_en: 'Squirtle', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
  { id: 25, name: 'Pikachu', name_en: 'Pikachu', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
  { id: 39, name: 'Sabelette', name_en: 'Jigglypuff', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png' },
  { id: 52, name: 'Miaouss', name_en: 'Meowth', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png' },
  { id: 133, name: 'Évoli', name_en: 'Eevee', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png' },
  { id: 150, name: 'Mewtwo', name_en: 'Mewtwo', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png' },
  { id: 37, name: 'Rattata', name_en: 'Rattata', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png' },
  { id: 95, name: 'Onix', name_en: 'Onix', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png' },
  { id: 143, name: 'Élektrode', name_en: 'Snorlax', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png' },
  { id: 149, name: 'Dracolosse', name_en: 'Dragonite', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png' }
];

const initialTrainer = {
  name: 'Sacha',
  bio: "Dresseur passionné — Toujours prêt pour un combat !",
  photo: '/trainer-avatar.png',
  team: [
    { id: 25, name: 'Bulbizarre', sprite: SAMPLE_POKEMON[0].sprite },
    { id: 1, name: 'Salamèche', sprite: SAMPLE_POKEMON[1].sprite }
  ]
};

const TrainerProfile = ({ currentUser }) => {
  const [trainer, setTrainer] = useState(initialTrainer);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: trainer.name, bio: trainer.bio });
  const [adding, setAdding] = useState(false);

  const startEdit = () => {
    setDraft({ name: currentUser?.name || trainer.name, bio: trainer.bio });
    setEditing(true);
  }

  const saveProfile = () => {
    setTrainer(prev => ({ ...prev, name: draft.name, bio: draft.bio }));
    // persist name change to localStorage so reload keeps the updated display name
    try {
      const raw = localStorage.getItem('pokedex_user')
      if (raw) {
        const u = JSON.parse(raw)
        const updated = { ...u, name: draft.name }
        localStorage.setItem('pokedex_user', JSON.stringify(updated))
      }
    } catch (e) {
      // ignore
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft({ name: trainer.name, bio: trainer.bio });
    setEditing(false);
  };

  const removeFromTeam = (idx) => {
    setTrainer(prev => ({ ...prev, team: prev.team.filter((_, i) => i !== idx) }));
  };

  const addToTeam = (poke) => {
    setTrainer(prev => {
      if (prev.team.length >= 6) return prev;
      // avoid duplicates by id
      if (prev.team.some(p => p.id === poke.id)) return prev;
      return { ...prev, team: [...prev.team, poke] };
    });
    setAdding(false);
  };

  return (
    <div className="trainer-container">
      <div className="trainer-card">
        <div className="trainer-photo">
          <img src={trainer.photo} alt={trainer.name} />
        </div>
        <div className="trainer-info">
          {!editing ? (
            <>
              <h2 className="trainer-name">{currentUser?.name || trainer.name}</h2>
              <div className="trainer-role" style={{ color: '#9ca3af', marginBottom: 8 }}>Rôle: <strong>{currentUser?.role || 'Visiteur'}</strong></div>
              <p className="trainer-bio">{trainer.bio}</p>
              <div className="trainer-actions">
                <button onClick={startEdit} className="btn">Modifier profil</button>
              </div>
            </>
          ) : (
            <div className="trainer-edit">
              <label>
                Nom
                <input value={draft.name} onChange={(e) => setDraft(d => ({ ...d, name: e.target.value }))} />
              </label>
              <label>
                Bio
                <textarea value={draft.bio} onChange={(e) => setDraft(d => ({ ...d, bio: e.target.value }))} />
              </label>
              <div className="trainer-edit-actions">
                <button onClick={saveProfile} className="btn primary">Enregistrer</button>
                <button onClick={cancelEdit} className="btn">Annuler</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="team-section">
        <h3 style={{ color: '#fff' }}>{currentUser?.role === 'Soignant' ? 'Mon centre' : 'Mon équipe'}</h3>
        <p style={{ color: '#9ca3af' }}>Gérez votre {currentUser?.role === 'Soignant' ? 'centre' : 'équipe'} (max 6 Pokémon).</p>

        <div className="team-grid">
          {Array.from({ length: 6 }).map((_, idx) => {
            const p = trainer.team[idx];
            return (
              <div key={idx} className={`team-slot ${p ? 'filled' : 'empty'}`}>
                {p ? (
                  <>
                    <img src={p.sprite} alt={p.name} />
                    <div className="slot-name">{p.name}</div>
                    <button className="remove-btn" onClick={() => removeFromTeam(idx)}>Retirer</button>
                  </>
                ) : (
                  <div className="empty-placeholder">Vide</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="team-controls">
            <button onClick={() => setAdding(a => !a)} className="btn">{adding ? 'Fermer' : 'Ajouter un Pokémon'}</button>
            <span className="team-count">{trainer.team.length}/6</span>
        </div>

        {adding && (
          <div className="add-panel">
            <p style={{ color: '#9ca3af' }}>Sélectionnez un Pokémon de la collection à ajouter :</p>
            <div className="sample-list">
              {SAMPLE_POKEMON.map(p => (
                <div key={p.id} className="sample-item">
                  <img src={p.sprite} alt={p.name} />
                  <div className="sample-name" style={{ color: '#fff' }}>{p.name}</div>
                  <button className="btn small" onClick={() => addToTeam(p)} disabled={trainer.team.length >= 6 || trainer.team.some(tp => tp.id === p.id)}>Ajouter</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TrainerProfile;
