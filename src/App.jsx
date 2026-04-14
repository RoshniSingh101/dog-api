import React, { useState, useEffect } from 'react';
import './App.css'; // Don't forget to import the CSS!

const App = () => {
  const [currentDog, setCurrentDog] = useState(null);
  const [banList, setBanList] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [allBreeds, setAllBreeds] = useState([]);

  const API_KEY = import.meta.env.VITE_DOG_API_KEY;

  useEffect(() => {
    const loadBreeds = async () => {
      try {
        const res = await fetch('https://api.thedogapi.com/v1/breeds', {
          headers: { 'x-api-key': API_KEY }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setAllBreeds(data);
      } catch (e) {
        console.error("Initialization Error:", e);
      }
    };
    loadBreeds();
  }, [API_KEY]);

  const fetchRandomDog = async () => {
    if (allBreeds.length === 0) return;
    setLoading(true);

    try {
      const available = allBreeds.filter(b => (
        !banList.has(b.name) && 
        !banList.has(`${b.weight.imperial} lbs`) && 
        !banList.has(b.life_span)
      ));

      if (available.length === 0) {
        alert("Ban list too restrictive!");
        return;
      }

      const randomBreed = available[Math.floor(Math.random() * available.length)];
      const imgRes = await fetch(`https://api.thedogapi.com/v1/images/search?breed_ids=${randomBreed.id}`, {
        headers: { 'x-api-key': API_KEY }
      });
      const imgData = await imgRes.json();

      if (imgData.length > 0) {
        setCurrentDog({
          url: imgData[0].url,
          breed: randomBreed.name,
          weight: `${randomBreed.weight.imperial} lbs`,
          life: randomBreed.life_span
        });
      }
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = (val) => {
    if (!val) return;
    const next = new Set(banList);
    next.has(val) ? next.delete(val) : next.add(val);
    setBanList(next);
  };

  return (
    <div className="container">
      <main className="main-card">
        <h1>🐶 Dog Discovery</h1>
        <p>Discover breeds and curate your ban list!</p>
        
        <button onClick={fetchRandomDog} disabled={loading} className="btn-primary">
          {loading ? 'Searching...' : 'Fetch Random Dog'}
        </button>

        {currentDog && (
          <div className="dog-view">
            <img src={currentDog.url} className="dog-image" alt="dog" />
            <div className="button-group">
              <button onClick={() => toggleBan(currentDog.breed)} className="attr-button">
                Breed: <strong>{currentDog.breed}</strong>
              </button>
              <button onClick={() => toggleBan(currentDog.weight)} className="attr-button">
                Weight: <strong>{currentDog.weight}</strong>
              </button>
              <button onClick={() => toggleBan(currentDog.life)} className="attr-button">
                Life: <strong>{currentDog.life}</strong>
              </button>
            </div>
          </div>
        )}
      </main>

      <aside className="sidebar">
        <h3>🚫 Banned Attributes</h3>
        <div className="ban-scroll-area">
          {[...banList].map(item => (
            <div key={item} onClick={() => toggleBan(item)} className="ban-item">
              {item} <span>×</span>
            </div>
          ))}
        </div>
        {banList.size > 0 && (
          <button onClick={() => setBanList(new Set())} className="clear-btn">
            Clear All Bans
          </button>
        )}
      </aside>
    </div>
  );
};

export default App;