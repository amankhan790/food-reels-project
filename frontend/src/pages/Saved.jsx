import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/reels.css";

const Saved = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSaved() {
      setLoading(true);
      const savedIds = JSON.parse(localStorage.getItem("savedReels")) || [];
      if (savedIds.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/food", { credentials: "include" });
        const data = await res.json();
        const all = Array.isArray(data.foodItems) ? data.foodItems : [];
        const filtered = all.filter((it) => savedIds.includes(it._id));
        setItems(filtered);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadSaved();
  }, []);

  if (loading) return <div style={{ color: '#fff', padding: 20 }}>Loading saved...</div>;

  if (items.length === 0) return <div style={{ color: '#fff', padding: 20 }}>No saved items yet.</div>;

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ color: '#fff' }}>Saved</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((it) => (
          <div key={it._id} className="saved-card" onClick={() => navigate('/') }>
            <div style={{ color: '#fff', fontWeight: 600 }}>{it.name || it.description}</div>
            <div style={{ color: '#bbb', fontSize: 13 }}>{it.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Saved;
