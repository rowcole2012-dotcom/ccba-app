import React, { useMemo, useState } from "react";

const emptySeason = {
  year: "",
  era: "",
  teamCount: "",
  champion: "",
  runnerUp: "",
  mvp: "",
  smvp: "",
  tmvp: "",
  dmvp: "",
  cmvp: "",
  notes: "",
};

const starterRecords = [
  {
    id: 1,
    year: "2067",
    era: "Global Era",
    teamCount: "16 Team",
    champion: "7 Miami",
    runnerUp: "8 Texas",
    mvp: "7 Miami",
    smvp: "5 Great Britain",
    tmvp: "8 Texas",
    dmvp: "3 Duke",
    cmvp: "7 Miami",
    notes: "Miami wins the first CCBA title of the Global Era.",
    image: null,
  },
  {
    id: 2,
    year: "2068",
    era: "Global Era",
    teamCount: "16 Team",
    champion: "5 UCLA",
    runnerUp: "3 Texas",
    mvp: "UCLA",
    smvp: "UCLA",
    tmvp: "Texas",
    dmvp: "Texas",
    cmvp: "UCLA",
    notes: "UCLA wins Championship, MVP, SMVP, and CMVP in the same bracket.",
    image: null,
  },
];

function getChampionLeaders(records) {
  const counts = {};
  records.forEach((record) => {
    if (!record.champion) return;
    counts[record.champion] = (counts[record.champion] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function filterRecords(records, query) {
  const q = query.trim().toLowerCase();
  if (!q) return records;
  return records.filter((record) =>
    Object.values(record).some((value) => String(value ?? "").toLowerCase().includes(q))
  );
}

function runAppTests() {
  const tests = [];
  const leaders = getChampionLeaders(starterRecords);
  tests.push({
    name: "Champion leaders include both starter champions",
    pass: leaders.length === 2 && leaders.some(([team]) => team === "7 Miami") && leaders.some(([team]) => team === "5 UCLA"),
  });

  const searchTexas = filterRecords(starterRecords, "texas");
  tests.push({
    name: "Search finds Texas records",
    pass: searchTexas.length === 2,
  });

  const searchUcla = filterRecords(starterRecords, "ucla");
  tests.push({
    name: "Search finds UCLA record",
    pass: searchUcla.length === 1 && searchUcla[0].year === "2068",
  });

  return tests;
}

export default function CCBATrackerApp() {
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [season, setSeason] = useState({
    ...emptySeason,
    year: "2069",
    era: "Global Era",
    teamCount: "16 Team",
  });
  const [records, setRecords] = useState(starterRecords);
  const [testsOpen, setTestsOpen] = useState(false);

  const filteredRecords = useMemo(() => filterRecords(records, query), [records, query]);
  const champs = useMemo(() => getChampionLeaders(records), [records]);
  const tests = useMemo(() => runAppTests(), []);

  function updateSeason(field, value) {
    setSeason((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  }

  function resetForm() {
    setSeason({ ...emptySeason, year: "2069", era: "Global Era", teamCount: "16 Team" });
    setPhoto(null);
    setPhotoName("");
    setEditingId(null);
  }

  function saveSeason() {
    if (!season.year.trim() || !season.champion.trim()) {
      alert("Add at least a year and champion first.");
      return;
    }

    if (editingId) {
      setRecords((prev) =>
        prev.map((record) =>
          record.id === editingId ? { ...season, id: editingId, image: photo } : record
        )
      );
    } else {
      setRecords((prev) => [...prev, { ...season, id: Date.now(), image: photo }]);
    }

    resetForm();
  }

  function editRecord(record) {
    setEditingId(record.id);
    setSeason({
      year: record.year,
      era: record.era,
      teamCount: record.teamCount,
      champion: record.champion,
      runnerUp: record.runnerUp,
      mvp: record.mvp,
      smvp: record.smvp,
      tmvp: record.tmvp,
      dmvp: record.dmvp,
      cmvp: record.cmvp,
      notes: record.notes,
    });
    setPhoto(record.image);
    setPhotoName(record.image ? "Saved bracket photo" : "");
  }

  function deleteRecord(id) {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  }

  return (
    <div className="ccba-page">
      <style>{css}</style>

      <main className="ccba-shell">
        <section className="hero">
          <div>
            <p className="pill">🏆 Cole's College Basketball Association</p>
            <h1>CCBA Photo Import Tracker</h1>
            <p className="hero-text">
              Upload bracket photos, type in the winners and awards, then build your official CCBA history database.
            </p>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <strong>{records.length}</strong>
              <span>Seasons</span>
            </div>
            <div className="stat-card">
              <strong>{champs.length}</strong>
              <span>Champions</span>
            </div>
            <div className="stat-card">
              <strong>1v1</strong>
              <span>Format</span>
            </div>
          </div>
        </section>

        <section className="layout">
          <aside className="card form-card">
            <div className="section-title">
              <span>📷</span>
              <h2>Import Bracket Photo</h2>
            </div>

            <label className="upload-box">
              <span className="upload-icon">📸</span>
              <strong>Upload a bracket or winners photo</strong>
              <small>PNG, JPG, or screenshot</small>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} />
            </label>

            {photo ? (
              <div className="preview-box">
                <p>{photoName}</p>
                <img src={photo} alt="Uploaded bracket preview" />
              </div>
            ) : null}

            <div className="note-box">
              <b>Photo import note:</b> This app saves and previews your photos. Automatic text reading from photos can be added later with OCR.
            </div>

            <div className="field-grid two">
              <Field label="Year" value={season.year} onChange={(value) => updateSeason("year", value)} />
              <Field label="Team Count" value={season.teamCount} onChange={(value) => updateSeason("teamCount", value)} placeholder="16 Team" />
            </div>

            <Field label="Era" value={season.era} onChange={(value) => updateSeason("era", value)} placeholder="Global Era" />

            <div className="field-grid two">
              <Field label="Champion" value={season.champion} onChange={(value) => updateSeason("champion", value)} placeholder="5 UCLA" />
              <Field label="Runner-Up" value={season.runnerUp} onChange={(value) => updateSeason("runnerUp", value)} placeholder="3 Texas" />
            </div>

            <div className="field-grid two">
              {[
                ["mvp", "MVP"],
                ["smvp", "SMVP"],
                ["tmvp", "TMVP"],
                ["dmvp", "DMVP"],
                ["cmvp", "CMVP"],
              ].map(([key, label]) => (
                <Field key={key} label={label} value={season[key]} onChange={(value) => updateSeason(key, value)} />
              ))}
            </div>

            <label className="field full">
              <span>Notes</span>
              <textarea
                value={season.notes}
                onChange={(event) => updateSeason("notes", event.target.value)}
                placeholder="Add upset, rivalry, transfer, or dynasty notes..."
              />
            </label>

            <div className="button-row">
              <button className="primary-button" onClick={saveSeason}>
                {editingId ? "💾 Save Changes" : "➕ Add Season"}
              </button>
              <button className="secondary-button" onClick={resetForm}>Clear</button>
            </div>
          </aside>

          <section className="main-column">
            <div className="card">
              <div className="database-header">
                <div>
                  <h2>CCBA Season Database</h2>
                  <p>Search champions, awards, years, eras, and notes.</p>
                </div>
                <input
                  className="search-input"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search CCBA history..."
                />
              </div>

              <div className="table">
                <div className="table-head">
                  <span>Year</span>
                  <span>Era</span>
                  <span>Champ</span>
                  <span>Runner-Up</span>
                  <span>MVP</span>
                  <span>SMVP</span>
                  <span>TMVP</span>
                  <span>Actions</span>
                </div>

                {filteredRecords.length === 0 ? (
                  <div className="empty-state">No seasons match your search.</div>
                ) : (
                  filteredRecords.map((record) => (
                    <article className="record-row" key={record.id}>
                      <div className="record-main">
                        <strong>{record.year}</strong>
                        <span>{record.era}</span>
                        <b>{record.champion}</b>
                        <span>{record.runnerUp}</span>
                        <span>{record.mvp}</span>
                        <span>{record.smvp}</span>
                        <span>{record.tmvp}</span>
                        <div className="actions">
                          <button onClick={() => editRecord(record)} aria-label={`Edit ${record.year}`}>✏️</button>
                          <button onClick={() => deleteRecord(record.id)} aria-label={`Delete ${record.year}`}>🗑️</button>
                        </div>
                      </div>

                      <div className="record-details">
                        <b>DMVP:</b> {record.dmvp || "—"} <b>CMVP:</b> {record.cmvp || "—"} {record.notes || "No notes yet."}
                      </div>

                      {record.image ? (
                        <img className="record-image" src={record.image} alt={`${record.year} bracket`} />
                      ) : null}
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="bottom-grid">
              <div className="card">
                <div className="section-title">
                  <span>👑</span>
                  <h2>Championship Leaders</h2>
                </div>
                <div className="leader-list">
                  {champs.length === 0 ? <p>No champions yet.</p> : null}
                  {champs.map(([team, total], index) => (
                    <div className="leader" key={team}>
                      <span className="rank">{index + 1}</span>
                      <strong>{team}</strong>
                      <b>{total} title{total === 1 ? "" : "s"}</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="section-title">
                  <span>🏅</span>
                  <h2>Official CCBA Rules</h2>
                </div>
                <ul className="rules-list">
                  <li><b>Era Rule:</b> Every era lasts 3 seasons.</li>
                  <li><b>Game Format:</b> All games are 1-v-1.</li>
                  <li><b>International Rule:</b> International teams play each other in the first round.</li>
                  <li><b>Eligibility:</b> Every player gets 4 years of eligibility.</li>
                </ul>
              </div>
            </div>

            <div className="card tests-card">
              <button className="test-toggle" onClick={() => setTestsOpen((open) => !open)}>
                {testsOpen ? "Hide" : "Show"} app tests
              </button>
              {testsOpen ? (
                <div className="test-list">
                  {tests.map((test) => (
                    <div className={test.pass ? "test pass" : "test fail"} key={test.name}>
                      <span>{test.pass ? "✅" : "❌"}</span>
                      <span>{test.name}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

const css = `
* { box-sizing: border-box; }
body { margin: 0; }
.ccba-page {
  min-height: 100vh;
  background: #f8fafc;
  color: #0f172a;
  font-family: Arial, Helvetica, sans-serif;
  padding: 24px;
}
.ccba-shell {
  max-width: 1280px;
  margin: 0 auto;
}
.hero {
  background: #020617;
  color: white;
  border-radius: 28px;
  padding: 28px;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.2);
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 999px;
  padding: 6px 12px;
  margin: 0 0 12px;
  font-size: 14px;
}
h1 {
  font-size: clamp(34px, 5vw, 56px);
  margin: 0;
  line-height: 1;
  letter-spacing: -0.04em;
}
.hero-text {
  color: #cbd5e1;
  max-width: 680px;
  line-height: 1.5;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 110px);
  gap: 12px;
  align-content: center;
}
.stat-card {
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 16px;
  text-align: center;
}
.stat-card strong {
  display: block;
  font-size: 30px;
}
.stat-card span {
  color: #cbd5e1;
  font-size: 12px;
}
.layout {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 24px;
  align-items: start;
}
.main-column {
  display: grid;
  gap: 24px;
}
.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 28px;
  padding: 22px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}
.form-card {
  display: grid;
  gap: 18px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.section-title h2,
.database-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 900;
}
.upload-box {
  cursor: pointer;
  border: 2px dashed #cbd5e1;
  border-radius: 24px;
  background: #f1f5f9;
  padding: 26px;
  text-align: center;
  display: grid;
  gap: 6px;
  justify-items: center;
}
.upload-box:hover {
  background: #e2e8f0;
}
.upload-box input {
  display: none;
}
.upload-icon {
  font-size: 38px;
}
.upload-box small {
  color: #64748b;
}
.preview-box p {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
}
.preview-box img,
.record-image {
  width: 100%;
  max-height: 280px;
  object-fit: contain;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.note-box {
  background: #fffbeb;
  color: #92400e;
  border-radius: 18px;
  padding: 14px;
  font-size: 14px;
  line-height: 1.4;
}
.field-grid {
  display: grid;
  gap: 12px;
}
.field-grid.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.field {
  display: grid;
  gap: 6px;
}
.field span {
  color: #64748b;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.field input,
.field textarea,
.search-input {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: white;
  padding: 11px 12px;
  font-size: 14px;
  outline: none;
}
.field textarea {
  min-height: 92px;
  resize: vertical;
}
.button-row {
  display: flex;
  gap: 12px;
}
.primary-button,
.secondary-button,
.actions button,
.test-toggle {
  border-radius: 14px;
  padding: 10px 14px;
  font-weight: 900;
  cursor: pointer;
}
.primary-button {
  flex: 1;
  color: white;
  background: #020617;
  border: 0;
}
.secondary-button,
.actions button,
.test-toggle {
  background: white;
  border: 1px solid #cbd5e1;
  color: #0f172a;
}
.database-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}
.database-header p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}
.search-input {
  max-width: 320px;
}
.table {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
}
.table-head,
.record-main {
  display: grid;
  grid-template-columns: 0.7fr 1fr 1fr 1fr 1fr 1fr 1fr 0.8fr;
  gap: 12px;
  align-items: center;
}
.table-head {
  background: #f1f5f9;
  color: #64748b;
  padding: 12px 14px;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}
.record-row {
  padding: 14px;
  border-top: 1px solid #e2e8f0;
}
.record-row:first-of-type {
  border-top: 0;
}
.record-main {
  font-size: 14px;
}
.record-main b,
.record-main strong {
  color: #020617;
}
.record-details {
  margin-top: 12px;
  background: #f8fafc;
  color: #475569;
  border-radius: 14px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
}
.record-details b + b {
  margin-left: 12px;
}
.actions {
  display: flex;
  gap: 8px;
}
.record-image {
  margin-top: 12px;
  max-height: 200px;
}
.empty-state {
  padding: 22px;
  color: #64748b;
  text-align: center;
}
.bottom-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}
.leader-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}
.leader {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  gap: 12px;
  align-items: center;
  background: #f1f5f9;
  border-radius: 16px;
  padding: 12px;
}
.rank {
  height: 32px;
  width: 32px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: white;
  font-weight: 900;
}
.rules-list {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: grid;
  gap: 10px;
}
.rules-list li {
  background: #f1f5f9;
  border-radius: 16px;
  padding: 12px;
  line-height: 1.4;
}
.tests-card {
  display: grid;
  gap: 12px;
}
.test-toggle {
  justify-self: start;
}
.test-list {
  display: grid;
  gap: 8px;
}
.test {
  border-radius: 14px;
  padding: 10px;
  display: flex;
  gap: 8px;
}
.test.pass {
  background: #ecfdf5;
  color: #065f46;
}
.test.fail {
  background: #fef2f2;
  color: #991b1b;
}
@media (max-width: 980px) {
  .hero,
  .database-header {
    flex-direction: column;
    align-items: stretch;
  }
  .layout,
  .bottom-grid {
    grid-template-columns: 1fr;
  }
  .stat-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .search-input {
    max-width: none;
  }
}
@media (max-width: 760px) {
  .ccba-page {
    padding: 14px;
  }
  .field-grid.two,
  .stat-grid {
    grid-template-columns: 1fr;
  }
  .table-head {
    display: none;
  }
  .record-main {
    grid-template-columns: 1fr 1fr;
  }
}
`;
