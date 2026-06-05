import { useState, useEffect, useRef } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MEAL_IDEAS = [
  { name: "Spaghetti Bolognese", emoji: "🍝", tags: ["pasta", "beef"], time: "45 min" },
  { name: "Tacos", emoji: "🌮", tags: ["mexican", "beef"], time: "30 min" },
  { name: "Grilled Chicken", emoji: "🍗", tags: ["chicken", "healthy"], time: "35 min" },
  { name: "Pizza Night", emoji: "🍕", tags: ["italian", "fun"], time: "25 min" },
  { name: "Stir Fry", emoji: "🥢", tags: ["asian", "veggies"], time: "20 min" },
  { name: "Burgers", emoji: "🍔", tags: ["beef", "fun"], time: "30 min" },
  { name: "Salmon", emoji: "🐟", tags: ["fish", "healthy"], time: "25 min" },
  { name: "Mac & Cheese", emoji: "🧀", tags: ["pasta", "kids"], time: "20 min" },
  { name: "BBQ Ribs", emoji: "🥩", tags: ["beef", "bbq"], time: "2 hrs" },
  { name: "Veggie Curry", emoji: "🍛", tags: ["indian", "veggie"], time: "40 min" },
  { name: "Hot Dogs", emoji: "🌭", tags: ["fun", "kids"], time: "15 min" },
  { name: "Fried Rice", emoji: "🍚", tags: ["asian", "rice"], time: "25 min" },
  { name: "Chicken Soup", emoji: "🍲", tags: ["soup", "chicken"], time: "1 hr" },
  { name: "Fish & Chips", emoji: "🐠", tags: ["fish", "fried"], time: "45 min" },
  { name: "Lasagna", emoji: "🫕", tags: ["pasta", "beef"], time: "1.5 hrs" },
  { name: "Poke Bowl", emoji: "🥗", tags: ["fish", "healthy"], time: "20 min" },
];

const FAMILY_MEMBERS = [
  { name: "Dad", emoji: "👨", color: "#FF6B35" },
  { name: "Mom", emoji: "👩", color: "#E91E8C" },
  { name: "Kid 1", emoji: "🧒", color: "#00C2FF" },
  { name: "Kid 2", emoji: "👧", color: "#7B2FBE" },
];

const BG_COLORS = [
  "#FF6B35", "#E91E8C", "#00C2FF", "#7B2FBE",
  "#FFD166", "#06D6A0", "#EF476F", "#118AB2"
];

const initialWeek = () => DAYS.reduce((acc, day) => ({ ...acc, [day]: null }), {});

export default function DinnerApp() {
  const [view, setView] = useState("planner");
  const [week, setWeek] = useState(initialWeek());
  const [history, setHistory] = useState([
    { name: "Tacos", emoji: "🌮", date: "Last Monday", rating: 5, votes: ["Dad", "Kid 1"] },
    { name: "Pizza Night", emoji: "🍕", date: "Last Friday", rating: 4, votes: ["Mom", "Kid 1", "Kid 2"] },
    { name: "Stir Fry", emoji: "🥢", date: "Two weeks ago", rating: 3, votes: ["Mom"] },
  ]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeDay, setActiveDay] = useState(null);
  const [shoppingList, setShoppingList] = useState([
    { item: "Chicken breast", checked: false },
    { item: "Pasta", checked: false },
    { item: "Tomatoes", checked: true },
    { item: "Cheese", checked: false },
    { item: "Onions", checked: true },
  ]);
  const [newItem, setNewItem] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [suggestionBy, setSuggestionBy] = useState("Dad");
  const [pendingSuggestions, setPendingSuggestions] = useState([
    { meal: "Burgers", emoji: "🍔", by: "Kid 1", votes: 2 },
    { meal: "Pizza Night", emoji: "🍕", by: "Kid 2", votes: 3 },
  ]);
  const [todayIdx] = useState(2);

  // Drag & drop state
  const [dragSource, setDragSource] = useState(null); // { type: "day"|"idea", day?, meal }
  const [dragOver, setDragOver] = useState(null); // day name being hovered
  const [isDragging, setIsDragging] = useState(false);
  const [dropSuccess, setDropSuccess] = useState(null); // day name that just received a drop
  const dragGhost = useRef(null);

  const randomSuggestions = () => {
    const shuffled = [...MEAL_IDEAS].sort(() => Math.random() - 0.5).slice(0, 4);
    setSuggestions(shuffled);
  };

  useEffect(() => { randomSuggestions(); }, []);

  // ── Drag handlers ──────────────────────────────────────────
  const handleDragStart = (e, source) => {
    setDragSource(source);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    // Custom ghost
    const ghost = document.createElement("div");
    ghost.innerHTML = `<span style="font-size:36px">${source.meal.emoji}</span>`;
    ghost.style.cssText = "position:fixed;top:-100px;left:-100px;background:rgba(255,255,255,0.15);border-radius:16px;padding:10px 16px;backdrop-filter:blur(10px);border:2px solid rgba(255,255,255,0.3);pointer-events:none;";
    document.body.appendChild(ghost);
    dragGhost.current = ghost;
    e.dataTransfer.setDragImage(ghost, 30, 30);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragSource(null);
    setDragOver(null);
    if (dragGhost.current) {
      document.body.removeChild(dragGhost.current);
      dragGhost.current = null;
    }
  };

  const handleDragOver = (e, day) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(day);
  };

  const handleDrop = (e, targetDay) => {
    e.preventDefault();
    if (!dragSource) return;

    setWeek(w => {
      const next = { ...w };
      if (dragSource.type === "day") {
        const sourceDay = dragSource.day;
        const sourceMeal = dragSource.meal;
        const targetMeal = w[targetDay];
        // Swap meals between days
        next[targetDay] = sourceMeal;
        next[sourceDay] = targetMeal;
      } else {
        // From ideas panel — just assign
        next[targetDay] = dragSource.meal;
      }
      return next;
    });

    setDropSuccess(targetDay);
    setTimeout(() => setDropSuccess(null), 600);
    setDragOver(null);
  };

  const handleDropOnTrash = (e) => {
    e.preventDefault();
    if (dragSource?.type === "day") {
      setWeek(w => ({ ...w, [dragSource.day]: null }));
    }
    handleDragEnd();
  };

  // ── Touch drag state ───────────────────────────────────────
  const touchDrag = useRef(null);
  const [touchOver, setTouchOver] = useState(null);
  const dayRefs = useRef({});

  const handleTouchStart = (e, source) => {
    touchDrag.current = { source, startY: e.touches[0].clientY };
    setDragSource(source);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!touchDrag.current) return;
    const touch = e.touches[0];
    // Find which day card is under finger
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const dayCard = el?.closest("[data-day]");
    const day = dayCard?.getAttribute("data-day");
    setTouchOver(day || null);
    setDragOver(day || null);
  };

  const handleTouchEnd = () => {
    if (touchDrag.current && dragOver) {
      handleDrop({ preventDefault: () => {} }, dragOver);
    }
    touchDrag.current = null;
    setIsDragging(false);
    setDragSource(null);
    setDragOver(null);
    setTouchOver(null);
  };

  // ──────────────────────────────────────────────────────────

  const assignMeal = (meal) => {
    if (!activeDay) return;
    setWeek(w => ({ ...w, [activeDay]: meal }));
    setActiveDay(null);
  };

  const addShoppingItem = () => {
    if (!newItem.trim()) return;
    setShoppingList(l => [...l, { item: newItem.trim(), checked: false }]);
    setNewItem("");
  };

  const toggleShoppingItem = (idx) => {
    setShoppingList(l => l.map((item, i) => i === idx ? { ...item, checked: !item.checked } : item));
  };

  const submitSuggestion = () => {
    if (!suggestion.trim()) return;
    const match = MEAL_IDEAS.find(m => m.name.toLowerCase().includes(suggestion.toLowerCase()));
    setPendingSuggestions(s => [...s, { meal: suggestion, emoji: match?.emoji || "🍽️", by: suggestionBy, votes: 1 }]);
    setSuggestion("");
  };

  const upvote = (idx) => {
    setPendingSuggestions(s => s.map((item, i) => i === idx ? { ...item, votes: item.votes + 1 } : item));
  };

  const completedShopping = shoppingList.filter(i => i.checked).length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a0533 0%, #0d1b4b 50%, #0a2a1a 100%)",
      fontFamily: "'Nunito', 'Fredoka One', sans-serif",
      color: "#fff",
      overflowX: "hidden",
      userSelect: isDragging ? "none" : "auto",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
        .card { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; backdrop-filter: blur(10px); }
        .btn { cursor: pointer; border: none; border-radius: 50px; font-family: 'Nunito', sans-serif; font-weight: 800; transition: all 0.2s; }
        .btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .btn:active { transform: translateY(0); }
        .meal-pill { cursor: grab; border-radius: 16px; padding: 12px 16px; transition: all 0.2s; border: 2px solid transparent; }
        .meal-pill:hover { transform: scale(1.03); border-color: rgba(255,255,255,0.3); }
        .meal-pill:active { cursor: grabbing; }
        .day-card { border-radius: 20px; padding: 14px; transition: all 0.18s; border: 2px solid transparent; }
        .day-card.active { border-color: #FFD166 !important; box-shadow: 0 0 20px rgba(255,209,102,0.4); }
        .day-card.drag-over { border-color: #06D6A0 !important; background: rgba(6,214,160,0.12) !important; transform: scale(1.02); box-shadow: 0 0 24px rgba(6,214,160,0.35); }
        .day-card.drop-success { border-color: #FFD166 !important; animation: dropPop 0.5s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes dropPop { 0% { transform: scale(1.08); } 100% { transform: scale(1); } }
        .dragging-meal { opacity: 0.35; transform: scale(0.97); }
        .drag-handle { cursor: grab; opacity: 0.4; font-size: 16px; padding: 4px; transition: opacity 0.15s; }
        .drag-handle:hover { opacity: 0.9; }
        .nav-btn { cursor: pointer; border: none; background: none; font-family: 'Nunito', sans-serif; transition: all 0.2s; border-radius: 14px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .nav-btn.active { background: rgba(255,255,255,0.15); }
        .tag { border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 700; }
        input { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; color: white; font-family: 'Nunito', sans-serif; font-size: 15px; padding: 10px 14px; outline: none; width: 100%; }
        input::placeholder { color: rgba(255,255,255,0.4); }
        input:focus { border-color: rgba(255,209,102,0.6); background: rgba(255,255,255,0.15); }
        .star { color: #FFD166; font-size: 14px; }
        .shimmer { animation: shimmer 2s infinite; }
        @keyframes shimmer { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
        .pop-in { animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .trash-zone { transition: all 0.2s; border-radius: 16px; }
        .trash-zone.drag-active { background: rgba(239,71,111,0.2) !important; border-color: #EF476F !important; transform: scale(1.05); }
        select { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; color: white; font-family: 'Nunito', sans-serif; font-size: 14px; padding: 10px 12px; outline: none; }
        select option { background: #1a0533; color: white; }
        .idea-draggable { cursor: grab; } .idea-draggable:active { cursor: grabbing; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "24px 20px 8px", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 4 }}>🍽️</div>
        <h1 style={{ fontFamily: "'Fredoka One'", fontSize: 32, letterSpacing: 1, background: "linear-gradient(90deg, #FFD166, #FF6B35, #E91E8C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          What's for Dinner?
        </h1>
        <p style={{ fontSize: 13, opacity: 0.6, marginTop: 2 }}>The family meal planner ✨</p>
      </div>

      {/* Family Members Row */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: "12px 20px" }}>
        {FAMILY_MEMBERS.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: "2px solid rgba(255,255,255,0.3)" }}>
              {m.emoji}
            </div>
            <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 700 }}>{m.name}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: "0 16px 100px", maxWidth: 500, margin: "0 auto" }}>

        {/* PLANNER VIEW */}
        {view === "planner" && (
          <div className="pop-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h2 style={{ fontFamily: "'Fredoka One'", fontSize: 22 }}>This Week</h2>
              <button className="btn" style={{ background: "linear-gradient(135deg, #FFD166, #FF6B35)", color: "#1a0533", padding: "8px 16px", fontSize: 13 }}
                onClick={() => setView("ideas")}>+ Add Meals</button>
            </div>

            {/* Drag hint */}
            <div style={{ fontSize: 12, opacity: 0.45, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <span>✥</span> Drag meals to rearrange days • drag to 🗑 to remove
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {DAYS.map((day, i) => {
                const meal = week[day];
                const isToday = i === todayIdx;
                const isActive = activeDay === day;
                const isDragOver = dragOver === day;
                const isDropSuccess = dropSuccess === day;
                const isBeingDragged = dragSource?.type === "day" && dragSource?.day === day;

                return (
                  <div
                    key={day}
                    data-day={day}
                    ref={el => dayRefs.current[day] = el}
                    className={`day-card card ${isActive ? "active" : ""} ${isDragOver ? "drag-over" : ""} ${isDropSuccess ? "drop-success" : ""} ${isBeingDragged ? "dragging-meal" : ""}`}
                    style={{ background: isToday ? "rgba(255,209,102,0.1)" : undefined, borderColor: isToday && !isDragOver ? "rgba(255,209,102,0.25)" : undefined }}
                    onDragOver={e => handleDragOver(e, day)}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={e => handleDrop(e, day)}
                    onClick={() => !isDragging && setActiveDay(isActive ? null : day)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      {/* Day label */}
                      <div style={{ width: 44, textAlign: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, textTransform: "uppercase", letterSpacing: 1 }}>{SHORT_DAYS[i]}</div>
                        {isToday && <div style={{ fontSize: 9, color: "#FFD166", fontWeight: 800, textTransform: "uppercase" }}>Today</div>}
                      </div>

                      {meal ? (
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                          {/* Drag handle */}
                          <span
                            className="drag-handle"
                            draggable
                            onDragStart={e => { e.stopPropagation(); handleDragStart(e, { type: "day", day, meal }); }}
                            onDragEnd={handleDragEnd}
                            onTouchStart={e => handleTouchStart(e, { type: "day", day, meal })}
                            onClick={e => e.stopPropagation()}
                          >⠿</span>
                          <span style={{ fontSize: 28 }}>{meal.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: 15 }}>{meal.name}</div>
                            <div style={{ fontSize: 12, opacity: 0.5 }}>⏱ {meal.time}</div>
                          </div>
                          <button className="btn" style={{ marginLeft: "auto", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "5px 10px", fontSize: 12 }}
                            onClick={e => { e.stopPropagation(); setWeek(w => ({ ...w, [day]: null })); }}>✕</button>
                        </div>
                      ) : (
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, opacity: isDragOver ? 0.9 : 0.38 }}>
                          <span style={{ fontSize: 22 }}>{isDragOver ? "⬇️" : "🤷"}</span>
                          <span style={{ fontSize: 14, fontStyle: "italic" }}>{isDragOver ? "Drop it here!" : "Tap or drop a meal"}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick pick panel (tap) */}
                    {isActive && !isDragging && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, marginBottom: 8 }}>QUICK PICK:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {suggestions.map((s, idx) => (
                            <button key={idx} className="btn" style={{ background: `${BG_COLORS[idx % BG_COLORS.length]}33`, border: `1px solid ${BG_COLORS[idx % BG_COLORS.length]}66`, color: "white", padding: "8px 14px", fontSize: 13 }}
                              onClick={() => assignMeal(s)}>
                              {s.emoji} {s.name}
                            </button>
                          ))}
                          <button className="btn" style={{ background: "rgba(255,255,255,0.1)", color: "white", padding: "8px 14px", fontSize: 13 }}
                            onClick={randomSuggestions}>🔀 More</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Trash drop zone */}
            <div
              className={`trash-zone ${isDragging && dragSource?.type === "day" ? "drag-active" : ""}`}
              style={{ marginTop: 14, border: "2px dashed rgba(255,255,255,0.15)", padding: "14px", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 700 }}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDropOnTrash}
            >
              🗑️ Drop here to remove
            </div>

            {/* Pending Suggestions */}
            {pendingSuggestions.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontFamily: "'Fredoka One'", fontSize: 18, marginBottom: 10 }}>🗳️ Family Suggestions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {pendingSuggestions.map((s, i) => (
                    <div key={i} className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 26 }}>{s.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800 }}>{s.meal}</div>
                        <div style={{ fontSize: 12, opacity: 0.5 }}>suggested by {s.by}</div>
                      </div>
                      <button className="btn" style={{ background: "rgba(255,107,53,0.3)", color: "#FF6B35", padding: "8px 14px", fontSize: 14, fontWeight: 800 }}
                        onClick={() => upvote(i)}>👍 {s.votes}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* IDEAS VIEW */}
        {view === "ideas" && (
          <div className="pop-in">
            <h2 style={{ fontFamily: "'Fredoka One'", fontSize: 22, marginBottom: 4 }}>Dinner Ideas 💡</h2>
            <p style={{ fontSize: 13, opacity: 0.5, marginBottom: 16 }}>Tap to add • or drag straight to the planner</p>

            {/* Suggest a meal */}
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 800, marginBottom: 10, fontSize: 15 }}>🙋 Make a suggestion</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <select value={suggestionBy} onChange={e => setSuggestionBy(e.target.value)} style={{ width: 100 }}>
                  {FAMILY_MEMBERS.map(m => <option key={m.name}>{m.name}</option>)}
                </select>
                <input placeholder="What do you want?" value={suggestion} onChange={e => setSuggestion(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submitSuggestion()} />
              </div>
              <button className="btn" style={{ background: "linear-gradient(135deg, #E91E8C, #7B2FBE)", color: "white", padding: "10px 20px", fontSize: 14, width: "100%" }}
                onClick={submitSuggestion}>Submit Suggestion 🚀</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MEAL_IDEAS.map((meal, i) => {
                const alreadyAdded = Object.values(week).some(m => m?.name === meal.name);
                return (
                  <div
                    key={i}
                    className={`meal-pill card idea-draggable`}
                    style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, opacity: alreadyAdded ? 0.4 : 1 }}
                    draggable={!alreadyAdded}
                    onDragStart={e => !alreadyAdded && handleDragStart(e, { type: "idea", meal })}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      if (alreadyAdded) return;
                      const emptyDay = DAYS.find(day => !week[day]);
                      if (emptyDay) setWeek(w => ({ ...w, [emptyDay]: meal }));
                    }}
                  >
                    <span style={{ fontSize: 32 }}>{meal.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{meal.name}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 12, opacity: 0.5 }}>⏱ {meal.time}</span>
                        {meal.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="tag" style={{ background: `${BG_COLORS[i % BG_COLORS.length]}33`, color: BG_COLORS[i % BG_COLORS.length] }}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                    {alreadyAdded
                      ? <span style={{ fontSize: 12, opacity: 0.5 }}>✓ Added</span>
                      : <span style={{ fontSize: 18, opacity: 0.5 }}>⠿</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HISTORY VIEW */}
        {view === "history" && (
          <div className="pop-in">
            <h2 style={{ fontFamily: "'Fredoka One'", fontSize: 22, marginBottom: 4 }}>Past Dinners 📖</h2>
            <p style={{ fontSize: 13, opacity: 0.5, marginBottom: 16 }}>Your family's dinner memory</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[...history, ...Object.values(week).filter(Boolean).map(m => ({ ...m, date: "This week", rating: 0, votes: [] }))].map((item, i) => (
                <div key={i} className="card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: `${BG_COLORS[i % BG_COLORS.length]}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
                      {item.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{item.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>{item.date}</div>
                      {item.rating > 0 && (
                        <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
                          {[...Array(5)].map((_, si) => (
                            <span key={si} className="star" style={{ opacity: si < item.rating ? 1 : 0.2 }}>★</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {item.votes?.length > 0 && (
                      <div style={{ display: "flex" }}>
                        {item.votes.map((v, vi) => {
                          const member = FAMILY_MEMBERS.find(m => m.name === v);
                          return member ? (
                            <div key={vi} style={{ width: 28, height: 28, borderRadius: "50%", background: member.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginLeft: vi > 0 ? -8 : 0, border: "2px solid rgba(0,0,0,0.3)" }}>
                              {member.emoji}
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SHOPPING VIEW */}
        {view === "shopping" && (
          <div className="pop-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <h2 style={{ fontFamily: "'Fredoka One'", fontSize: 22 }}>Shopping List 🛒</h2>
              <span style={{ fontSize: 13, opacity: 0.6 }}>{completedShopping}/{shoppingList.length} done</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${shoppingList.length ? (completedShopping / shoppingList.length) * 100 : 0}%`, background: "linear-gradient(90deg, #06D6A0, #00C2FF)", borderRadius: 3, transition: "width 0.4s" }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input placeholder="Add item..." value={newItem} onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addShoppingItem()} />
              <button className="btn" style={{ background: "linear-gradient(135deg, #06D6A0, #00C2FF)", color: "#1a0533", padding: "10px 18px", fontSize: 16, flexShrink: 0 }}
                onClick={addShoppingItem}>+</button>
            </div>
            <button className="btn" style={{ background: "rgba(255,209,102,0.15)", border: "1px solid rgba(255,209,102,0.3)", color: "#FFD166", padding: "10px 16px", fontSize: 13, width: "100%", marginBottom: 16 }}
              onClick={() => {
                const meals = Object.values(week).filter(Boolean).map(m => m.name);
                if (meals.length) setShoppingList(l => [...l, ...meals.map(m => ({ item: `Ingredients for ${m}`, checked: false }))]);
              }}>✨ Auto-fill from this week's meals</button>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {shoppingList.map((item, i) => (
                <div key={i} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", opacity: item.checked ? 0.45 : 1 }}
                  onClick={() => toggleShoppingItem(i)}>
                  <div style={{ width: 24, height: 24, borderRadius: 8, border: `2px solid ${item.checked ? "#06D6A0" : "rgba(255,255,255,0.3)"}`, background: item.checked ? "#06D6A0" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                    {item.checked && <span style={{ color: "#1a0533", fontWeight: 900, fontSize: 14 }}>✓</span>}
                  </div>
                  <span style={{ flex: 1, fontSize: 16, fontWeight: 600, textDecoration: item.checked ? "line-through" : "none" }}>{item.item}</span>
                  <button className="btn" style={{ background: "transparent", color: "rgba(255,255,255,0.2)", padding: "4px 8px", fontSize: 16 }}
                    onClick={e => { e.stopPropagation(); setShoppingList(l => l.filter((_, li) => li !== i)); }}>✕</button>
                </div>
              ))}
            </div>
            {completedShopping === shoppingList.length && shoppingList.length > 0 && (
              <div style={{ textAlign: "center", padding: 20, fontSize: 40 }} className="shimmer">🎉</div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(15,5,35,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-around", padding: "8px 0 12px" }}>
        {[
          { id: "planner", emoji: "📅", label: "Planner" },
          { id: "ideas", emoji: "💡", label: "Ideas" },
          { id: "history", emoji: "📖", label: "History" },
          { id: "shopping", emoji: "🛒", label: "Shopping" },
        ].map(tab => (
          <button key={tab.id} className={`nav-btn ${view === tab.id ? "active" : ""}`}
            style={{ color: view === tab.id ? "#FFD166" : "rgba(255,255,255,0.5)", minWidth: 70 }}
            onClick={() => setView(tab.id)}>
            <span style={{ fontSize: 22 }}>{tab.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 800 }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
