import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/reels.css";

const Saved = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadSaved() {
      setLoading(true);
      setError(null);

      try {
        // Controller route: GET /api/food/save (getSavedFood)
        const res = await fetch("http://localhost:3000/api/food/save", {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          if (res.status === 401) throw new Error("Unauthorized. Please log in.");
          const txt = await res.text();
          throw new Error(txt || `Fetch error: ${res.status}`);
        }

        const data = await res.json();
        if (cancelled) return;

        // Prefer `foodItems` if controller returned that (newer, normalized shape)
        let parsed = Array.isArray(data.foodItems) ? data.foodItems : [];

        // If not present, fall back to `savedFoods` which may be populated save docs
        if (parsed.length === 0 && data.savedFoods) {
          const savedFoods = data.savedFoods;
          if (Array.isArray(savedFoods)) {
            parsed = savedFoods.map((s) => s.food).filter(Boolean);
          } else if (savedFoods.food) {
            parsed = [savedFoods.food];
          } else if (Array.isArray(savedFoods.food)) {
            parsed = savedFoods.food;
          }
        }

        setItems(parsed);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(err.message || "Failed to load saved items");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSaved();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div style={{ color: "#fff", padding: 20 }}>Loading saved...</div>;
  if (error) return <div style={{ color: "#fff", padding: 20 }}>{error}</div>;
  if (items.length === 0) return <div style={{ color: "#fff", padding: 20 }}>No saved items yet.</div>;

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ color: "#fff" }}>Saved</h2>
      <div className="videos-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        {items.map((it) => (
          <div key={it._id} className="video-tile" onClick={() => navigate("/") }>
            <video src={it.video} className="video-tile-content" muted playsInline />
            <div className="video-overlay">
              <span className="video-label">video</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Saved;
