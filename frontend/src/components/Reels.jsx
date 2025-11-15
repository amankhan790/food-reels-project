import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/reels.css";

export default function Reels() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [reels, setReels] = useState([]);
  const [liked, setLiked] = useState({});
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReels() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:3000/api/food", {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Unauthorized. Please log in to view reels.");
          }
          const txt = await res.text();
          throw new Error(txt || `Fetch error: ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) {
          // controller returns { message, foodItems }
          const items = Array.isArray(data.foodItems) ? data.foodItems : [];
          setReels(items);
          console.log(items);

          // initialize liked/saved state from server data and localStorage
          const savedIds = JSON.parse(localStorage.getItem("savedReels")) || [];
          const initLiked = {};
          const initSaved = {};
          items.forEach((it) => {
            initLiked[it._id] = false;
            initSaved[it._id] = savedIds.includes(it._id);
          });
          setLiked(initLiked);
          setSaved(initSaved);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load reels");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadReels();

    return () => {
      cancelled = true;
    };
  }, []);

  // observe visible items to autoplay
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(container.querySelectorAll(".reel-item"));
    if (items.length === 0) return;

    const options = { root: container, rootMargin: "0px", threshold: 0.75 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target.querySelector("video");
        if (!video) return;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    }, options);

    items.forEach((it) => observer.observe(it));

    const onVisibility = () => {
      const vids = container.querySelectorAll("video");
      vids.forEach((v) => {
        if (document.hidden) v.pause();
      });
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
    };
  }, [reels]);

  const handleTogglePlay = (e) => {
    const video = e.currentTarget.closest(".reel-item").querySelector("video");
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const likeApiToggle = async (id) => {
    try {
      const res = await fetch("http://localhost:3000/api/food/like", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodId: id }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Like API error: ${res.status}`);
      }
      return true;
    } catch (err) {
      console.error("Like API error", err);
      return false;
    }
  };

  const saveApiToggle = async (id) => {
    try {
      const res = await fetch("http://localhost:3000/api/food/save", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodId: id }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Save API error: ${res.status}`);
      }
      return true;
    } catch (err) {
      console.error("Save API error", err);
      return false;
    }
  };

  const toggleLike = async (ev, id) => {
    ev.stopPropagation();
    
    // optimistic update
    const prevLiked = !!liked[id];
    setLiked((prev) => ({ ...prev, [id]: !prevLiked }));
    setReels((prev) =>
      prev.map((r) =>
        r._id === id
          ? { ...r, likes: (r.likes || 0) + (prevLiked ? -1 : 1) }
          : r
      )
    );

    const ok = await likeApiToggle(id);
    if (!ok) {
      // revert
      setLiked((prev) => ({ ...prev, [id]: prevLiked }));
      setReels((prev) =>
        prev.map((r) =>
          r._id === id
            ? { ...r, likes: Math.max(0, (r.likes || 0) + (prevLiked ? 1 : -1)) }
            : r
        )
      );
      alert("Failed to update like. Please try again.");
    }
  };

  const toggleSave = async (ev, id) => {
    ev.stopPropagation();

    const prevSaved = !!saved[id];

    // optimistic update for UI and localStorage (so Saved page still works)
    setSaved((prev) => {
      const next = { ...prev, [id]: !prevSaved };
      const savedArr = Object.keys(next).filter((k) => next[k]);
      localStorage.setItem("savedReels", JSON.stringify(savedArr));
      return next;
    });
    setReels((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, saves: (r.saves || 0) + (prevSaved ? -1 : 1) } : r
      )
    );

    const ok = await saveApiToggle(id);
    if (!ok) {
      // revert
      setSaved((prev) => ({ ...prev, [id]: prevSaved }));
      setReels((prev) =>
        prev.map((r) =>
          r._id === id
            ? { ...r, saves: Math.max(0, (r.saves || 0) + (prevSaved ? 1 : -1)) }
            : r
        )
      );
      const savedArr = Object.keys(saved).filter((k) => saved[k]);
      localStorage.setItem("savedReels", JSON.stringify(savedArr));
      alert("Failed to update save. Please try again.");
    }
  };

  const openComments = (ev, id) => {
    ev.stopPropagation();
    alert("Open comments for reel: " + id);
  };

  if (loading) {
    return (
      <div className="reels-container" ref={containerRef}>
        <div className="reel-item" style={{ justifyContent: "center" }}>
          <div style={{ color: "#fff" }}>Loading reels...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reels-container" ref={containerRef}>
        <div className="reel-item" style={{ justifyContent: "center" }}>
          <div style={{ color: "#fff", padding: 20, textAlign: "center" }}>
            {error}
            <div style={{ marginTop: 12 }}>
              <a
                href="/user/login"
                style={{ color: "#fff", textDecoration: "underline" }}
              >
                Go to login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="reels-container" ref={containerRef}>
        <div className="reel-item" style={{ justifyContent: "center" }}>
          <div style={{ color: "#fff" }}>No reels available yet.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="reels-container" ref={containerRef}>
      {reels.map((r) => (
        <div
          key={r._id || r._id}
          className="reel-item"
          onClick={handleTogglePlay}
        >
          <video
            src={r.video}
            className="reel-video"
            muted
            loop
            playsInline
            preload="auto"
            audio
          />

          <div className="reel-gradient" />

          <div className="reel-overlay">
            <div className="reel-desc">{r.description || r.name}</div>
            <button
              className="visit-store"
              onClick={(ev) => {
                ev.stopPropagation();
                const partnerId = r.foodPartner?._id || r.foodPartner;
                if (partnerId) {
                  navigate(`/food-partner/profile/${partnerId}`);
                }
              }}
            >
              Visit Store
            </button>
          </div>

          <div className="reel-actions">
            <button
              className={`action-btn like ${liked[r._id] ? "active" : ""}`}
              onClick={(ev) => toggleLike(ev, r._id)}
              aria-label="like"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 21s-7.5-4.9-10-8.2C-1 6.2 5.4 2 8.6 5.1 10 6.6 12 9 12 9s2-2.4 3.4-3.9C18.6 2 25 6.2 22 12.8 19.5 16.1 12 21 12 21z"
                  stroke="none"
                  fill="currentColor"
                />
              </svg>
              <div className="action-count">
                {(r.likes || 0) + (liked[r._id] ? 1 : 0)}
              </div>
            </button>

            <button
              className={`action-btn save ${saved[r._id] ? "active" : ""}`}
              onClick={(ev) => toggleSave(ev, r._id)}
              aria-label="save"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 2h12v18l-6-3-6 3V2z" fill="currentColor" />
              </svg>
              <div className="action-count">
                {(r.saves || 0) + (saved[r._id] ? 1 : 0)}
              </div>
            </button>

            <button
              className="action-btn comment"
              onClick={(ev) => openComments(ev, r._id)}
              aria-label="comment"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  fill="currentColor"
                />
              </svg>
              <div className="action-count">{r.comments || 0}</div>
            </button>
          </div>

          <nav className="bottom-nav">
            <button
              className="nav-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                navigate("/");
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V11.5z"
                  fill="currentColor"
                />
              </svg>
              <div className="nav-label">home</div>
            </button>
            <button
              className="nav-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                navigate("/saved");
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 2h12v18l-6-3-6 3V2z" fill="currentColor" />
              </svg>
              <div className="nav-label">saved</div>
            </button>
          </nav>
        </div>
      ))}
    </div>
  );
}
