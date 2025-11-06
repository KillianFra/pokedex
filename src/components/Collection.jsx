import React, { useState, useEffect } from 'react';
import './Collection.css';
import { SAMPLE_POKEMON } from '../data/samplePokemon';
import PokemonCard from './PokemonCard';

const Collection = () => {
  const STORAGE_KEY = 'pokedex_collection_v1';

  // Load collection (merge SAMPLE_POKEMON with saved nicknames)
  const [collection, setCollection] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        return SAMPLE_POKEMON.map(p => {
          const s = saved.find(x => x.id === p.id);
          return { ...p, nickname: s?.nickname ?? p.nickname ?? '' };
        });
      }
    } catch (e) {
      // ignore
    }
    return SAMPLE_POKEMON.map(p => ({ ...p, nickname: p.nickname ?? '' }));
  });

  const [selected, setSelected] = useState(null);
  const [draftName, setDraftName] = useState('');

  useEffect(() => {
    if (selected) {
      setDraftName(selected.nickname || '');
    }
  }, [selected]);

  const saveToStorage = (list) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.map(({ id, nickname }) => ({ id, nickname }))));
    } catch (e) { /* ignore */ }
  };

  const openDetail = (id) => {
    const p = collection.find(c => c.id === id);
    setSelected(p || null);
  };

  const closeDetail = () => setSelected(null);

  return (
    <div className="collection-container">
      <h2 className="collection-title">Ma collection</h2>
      <p className="collection-sub">Cliquez sur un Pokémon pour voir les détails de capture.</p>

      <div className="collection-grid">
        {collection.map(p => (
          <div key={p.id} className="collection-card" onClick={() => openDetail(p.id)}>
            <PokemonCard pokemon={{ pokedexId: p.id, image: p.sprite, name: p.nickname || p.name }} />
          </div>
        ))}
      </div>

      {selected && (
        <div className="collection-detail">
          <button className="close-btn" onClick={closeDetail}>← Retour</button>
          <div className="detail-inner">
            <div className="detail-image">
              <img src={selected.sprite} alt={selected.name} />
            </div>
            <div className="detail-info">
              <h3 className="detail-name">{selected.nickname || selected.name}</h3>

              <label style={{ display: 'block', marginTop: 8, marginBottom: 6 }}>
                Surnom&nbsp;
                <input value={draftName} onChange={(e) => setDraftName(e.target.value)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.25)', color: '#fff' }} />
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: 12 }}>
                <button className="btn" onClick={() => {
                  // save nickname
                  const updated = collection.map(c => c.id === selected.id ? { ...c, nickname: draftName } : c);
                  setCollection(updated);
                  saveToStorage(updated);
                  setSelected(prev => ({ ...prev, nickname: draftName }));
                }}>Enregistrer</button>
                <button className="btn" onClick={() => {
                  // clear nickname
                  const updated = collection.map(c => c.id === selected.id ? { ...c, nickname: '' } : c);
                  setCollection(updated);
                  saveToStorage(updated);
                  setDraftName('');
                  setSelected(prev => ({ ...prev, nickname: '' }));
                }}>Supprimer surnom</button>
              </div>

              <p className="detail-capture"><strong>Capturé le :</strong> {selected.capture?.date || 'Date inconnue'}</p>
              <p className="detail-capture"><strong>Pokéball :</strong> {selected.capture?.ball || 'Inconnue'}</p>
              <p className="detail-fake">Informations d'encyclopédie (fictives) :</p>
              <ul>
                <li>Nom FR : {selected.name}</li>
                <li>Nom EN : {selected.name_en || selected.name}</li>
                <li>ID : #{String(selected.id).padStart(3,'0')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collection;
