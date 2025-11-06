import React, { useState } from 'react';
import './TrainerProfile.css';

import { SAMPLE_POKEMON } from '../data/samplePokemon';

const initialTrainer = {
  name: 'Sacha',
  bio: "Dresseur passionné — Toujours prêt pour un combat !",
  photo: '/trainer-avatar.png',
  team: [
    { id: SAMPLE_POKEMON[0].id, name: SAMPLE_POKEMON[0].name, sprite: SAMPLE_POKEMON[0].sprite },
    { id: SAMPLE_POKEMON[3].id, name: SAMPLE_POKEMON[3].name, sprite: SAMPLE_POKEMON[3].sprite }
  ]
};

const TrainerProfile = () => {
  const [trainer, setTrainer] = useState(initialTrainer);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: trainer.name, bio: trainer.bio });
  const [adding, setAdding] = useState(false);

  const saveProfile = () => {
    setTrainer(prev => ({ ...prev, name: draft.name, bio: draft.bio }));
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
              <h2 className="trainer-name">{trainer.name}</h2>
              <p className="trainer-bio">{trainer.bio}</p>
              <div className="trainer-actions">
                <button onClick={() => setEditing(true)} className="btn">Modifier profil</button>
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
        <h3 style={{ color: '#fff' }}>Mon équipe</h3>
        <p style={{ color: '#9ca3af' }}>Gérez votre équipe (max 6 Pokémon).</p>

        <div className="team-grid">
          {Array.from({ length: 6 }).map((_, idx) => {
            const p = trainer.team[idx];
            return (
              <div key={idx} className={`team-slot ${p ? 'filled' : 'empty'}`}>
                {p ? (
                  <>
                    <img src={p.sprite} alt={p.name} />
                          <div className="slot-name">{(function(){
                            try {
                              const raw = localStorage.getItem('pokedex_collection_v1');
                              if (raw) {
                                const saved = JSON.parse(raw);
                                const s = saved.find(x => x.id === p.id);
                                if (s && s.nickname) return s.nickname;
                              }
                            } catch (e) {}
                            return p.name;
                          })()}</div>
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
