/* ═══════════════════════════════════════════════════════════════
   SuperPrompt Studio – Main Stylesheet
   ═══════════════════════════════════════════════════════════════ */

/* ─── CSS Variables ─── */
:root {
  --bg-base:        #0f0f14;
  --bg-surface:     #17171f;
  --bg-elevated:    #1e1e2a;
  --bg-hover:       #25253a;
  --bg-card:        #1a1a26;

  --accent:         #7c6af7;
  --accent-light:   #a294ff;
  --accent-glow:    rgba(124, 106, 247, 0.25);
  --accent-2:       #f7946a;
  --accent-3:       #6af7c2;

  --text-primary:   #e8e8f0;
  --text-secondary: #9090b0;
  --text-muted:     #5a5a78;

  --border:         rgba(255,255,255,0.08);
  --border-strong:  rgba(255,255,255,0.15);

  --success:        #4ade80;
  --warning:        #facc15;
  --danger:         #f87171;
  --info:           #60a5fa;

  --radius-sm:      6px;
  --radius-md:      12px;
  --radius-lg:      18px;
  --radius-xl:      24px;

  --shadow-sm:      0 2px 8px rgba(0,0,0,0.3);
  --shadow-md:      0 4px 20px rgba(0,0,0,0.4);
  --shadow-lg:      0 8px 40px rgba(0,0,0,0.5);
  --shadow-glow:    0 0 30px rgba(124,106,247,0.2);

  --header-h:       60px;
  --sidebar-w:      340px;
  --tips-w:         280px;
  --font-mono:      'JetBrains Mono', 'Fira Code', monospace;
  --transition:     0.2s ease;
}

/* Light Theme */
body.light {
  --bg-base:        #f0f0f8;
  --bg-surface:     #ffffff;
  --bg-elevated:    #f7f7ff;
  --bg-hover:       #ebebff;
  --bg-card:        #ffffff;
  --text-primary:   #1a1a2e;
  --text-secondary: #5a5a7a;
  --text-muted:     #9090b0;
  --border:         rgba(0,0,0,0.1);
  --border-strong:  rgba(0,0,0,0.18);
  --shadow-sm:      0 2px 8px rgba(0,0,0,0.08);
  --shadow-md:      0 4px 20px rgba(0,0,0,0.1);
  --shadow-lg:      0 8px 40px rgba(0,0,0,0.12);
}

/* ─── Reset & Base ─── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 15px; scroll-behavior: smooth; }

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--bg-base);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
  transition: background var(--transition), color var(--transition);
}

/* ─── Scrollbar ─── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--text-muted); border-radius: 99px; }

/* ─── Typography ─── */
h1, h2, h3, h4 { font-weight: 700; line-height: 1.2; }
h1 { font-size: 1.8rem; }
h2 { font-size: 1.1rem; }
h3 { font-size: 1rem; }
h4 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.75rem; }

a { color: var(--accent-light); text-decoration: none; }

/* ════════════════════════════════════════════
   HEADER
   ════════════════════════════════════════════ */
#app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--header-h);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 100%;
  padding: 0 1.5rem;
  max-width: 100%;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 800;
  white-space: nowrap;
  margin-right: 1rem;
}

.logo-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  background: var(--accent);
  border-radius: var(--radius-sm);
  color: #fff;
  font-size: 0.9rem;
  box-shadow: var(--shadow-glow);
}

.logo-accent { color: var(--accent-light); }

.header-nav {
  display: flex;
  gap: 0.25rem;
  flex: 1;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
}

.nav-btn:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.nav-btn.active {
  background: var(--accent-glow);
  border-color: var(--accent);
  color: var(--accent-light);
}

.header-actions { display: flex; gap: 0.5rem; margin-left: auto; }

.icon-btn {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition);
  font-size: 0.9rem;
}

.icon-btn:hover { color: var(--text-primary); background: var(--bg-hover); }

/* ════════════════════════════════════════════
   MAIN & VIEWS
   ════════════════════════════════════════════ */
#app-main { min-height: calc(100vh - var(--header-h)); }

.view { display: none; }
.view.active { display: block; }

/* ════════════════════════════════════════════
   BUILDER LAYOUT
   ════════════════════════════════════════════ */
.builder-layout {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr var(--tips-w);
  gap: 0;
  height: calc(100vh - var(--header-h));
  overflow: hidden;
}

.panel {
  background: var(--bg-surface);
  overflow-y: auto;
  overflow-x: hidden;
}

.builder-config { border-right: 1px solid var(--border); }
.builder-tips   { border-left: 1px solid var(--border); }

.builder-preview {
  background: var(--bg-base);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: inherit;
  z-index: 10;
}

.panel-header h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.panel-header h2 i { color: var(--accent-light); }
.panel-header h3 { font-size: 0.9rem; }

.panel-header-actions { display: flex; gap: 0.5rem; }

/* ─── Config Groups ─── */
.config-group {
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.config-group:last-of-type { border-bottom: none; }

.group-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.6rem;
}

.group-label i { color: var(--accent-light); font-size: 0.75rem; }

.label-value {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--accent-light);
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

/* ─── Form Controls ─── */
.text-input,
.textarea-input,
.select-input {
  width: 100%;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  padding: 0.55rem 0.75rem;
  transition: border-color var(--transition), box-shadow var(--transition);
  outline: none;
  resize: vertical;
}

.text-input:focus,
.textarea-input:focus,
.select-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.text-input::placeholder,
.textarea-input::placeholder { color: var(--text-muted); }

.select-input { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239090b0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.6rem center; background-size: 1rem; padding-right: 2rem; }

.select-sm { font-size: 0.8rem; padding: 0.4rem 0.7rem; }

.hidden { display: none !important; }

/* ─── Chip Groups ─── */
.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chip {
  padding: 0.3rem 0.75rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 99px;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition);
}

.chip:hover {
  border-color: var(--accent);
  color: var(--accent-light);
}

.chip.active {
  background: var(--accent-glow);
  border-color: var(--accent);
  color: var(--accent-light);
}

/* ─── Range Input ─── */
.range-input {
  width: 100%;
  accent-color: var(--accent);
  cursor: pointer;
  height: 4px;
  margin: 0.4rem 0;
}

.range-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

/* ─── Toggle Switch ─── */
.toggle-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-switch input { opacity: 0; width: 0; height: 0; }

.toggle-slider {
  position: absolute;
  inset: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 99px;
  cursor: pointer;
  transition: all var(--transition);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background: var(--text-muted);
  border-radius: 50%;
  transition: all var(--transition);
}

input:checked + .toggle-slider { background: var(--accent); border-color: var(--accent); }
input:checked + .toggle-slider::before { left: calc(100% - 19px); background: #fff; }

/* ─── Config Actions ─── */
.config-actions {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-top: 1px solid var(--border);
  background: var(--bg-surface);
  position: sticky;
  bottom: 0;
}

/* ─── Buttons ─── */
.btn-primary, .btn-secondary, .btn-ghost, .btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  border: none;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
  text-decoration: none;
}

.btn-primary {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 2px 12px var(--accent-glow);
}
.btn-primary:hover { background: var(--accent-light); transform: translateY(-1px); box-shadow: 0 4px 20px var(--accent-glow); }
.btn-primary:active { transform: translateY(0); }

.btn-secondary {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-strong);
}
.btn-secondary:hover { background: var(--bg-hover); border-color: var(--accent); color: var(--accent-light); }
.btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}
.btn-ghost:hover { background: var(--bg-elevated); color: var(--text-primary); }

.btn-danger {
  background: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
}
.btn-danger:hover { background: rgba(248,113,113,0.1); }

.btn-lg { padding: 0.75rem 1.25rem; font-size: 0.95rem; }
.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.78rem; }

/* ════════════════════════════════════════════
   PREVIEW / OUTPUT
   ════════════════════════════════════════════ */
#prompt-output-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  gap: 0.75rem;
  min-height: 300px;
}

.empty-icon {
  font-size: 3rem;
  color: var(--accent-light);
  opacity: 0.4;
  margin-bottom: 0.5rem;
}

.empty-state h3 { color: var(--text-primary); }
.empty-state p { color: var(--text-secondary); font-size: 0.9rem; }
.empty-state .hint { font-size: 0.8rem; color: var(--text-muted); }

/* Output Meta */
.output-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.stat-badge {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 99px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.quality-badge {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 99px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  color: var(--success);
  font-weight: 600;
}

/* Output Sections */
.output-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  overflow: hidden;
  animation: fadeSlideIn 0.3s ease;
}

.output-section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.output-section-header .section-icon { color: var(--accent-light); }

.output-section-body {
  padding: 1rem;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: var(--font-mono);
}

/* Raw Output */
.output-raw-wrapper { margin-top: 1rem; }

.collapse-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0;
  font-family: inherit;
  transition: color var(--transition);
}
.collapse-toggle:hover { color: var(--accent-light); }

.output-raw {
  margin-top: 0.75rem;
  padding: 1rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-secondary);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
}

/* Variations */
.variations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
}

.variation-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.85rem;
  cursor: pointer;
  transition: all var(--transition);
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.variation-card:hover {
  border-color: var(--accent);
  background: var(--bg-hover);
  color: var(--text-primary);
}

.variation-card .var-label {
  font-weight: 600;
  color: var(--accent-light);
  font-size: 0.75rem;
  margin-bottom: 0.4rem;
  text-transform: uppercase;
}

/* ════════════════════════════════════════════
   POWER MODIFIERS (Right Panel)
   ════════════════════════════════════════════ */
.modifier-group { padding: 0.9rem 1.25rem; border-bottom: 1px solid var(--border); }

.modifier-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.modifier-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.75rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: all var(--transition);
}

.modifier-btn:hover {
  border-color: var(--accent);
  color: var(--accent-light);
  background: var(--accent-glow);
  transform: translateX(3px);
}

.modifier-btn.applied {
  background: var(--accent-glow);
  border-color: var(--accent);
  color: var(--accent-light);
}

/* Tips Section */
.tips-section { padding: 0.9rem 1.25rem; }

.tip-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-sm);
  padding: 0.85rem;
}

.tip-card p {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

/* ════════════════════════════════════════════
   VIEW HEADERS
   ════════════════════════════════════════════ */
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-surface);
}

.view-header h1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.4rem;
}

.view-header h1 i { color: var(--accent-light); }

.view-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.75rem;
}

.search-box i { color: var(--text-muted); font-size: 0.85rem; }

.search-box input {
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  width: 200px;
}

.search-box input::placeholder { color: var(--text-muted); }

/* ════════════════════════════════════════════
   CARD GRID (Library & Templates)
   ════════════════════════════════════════════ */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1.5rem 2rem;
}

.prompt-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all var(--transition);
  cursor: default;
  animation: fadeSlideIn 0.3s ease;
}

.prompt-card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-glow);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
  line-height: 1.3;
}

.card-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.badge-business  { background: rgba(96,165,250,0.1);  color: var(--info);    border: 1px solid rgba(96,165,250,0.25);  }
.badge-coding    { background: rgba(74,222,128,0.1);  color: var(--success); border: 1px solid rgba(74,222,128,0.25);  }
.badge-writing   { background: rgba(124,106,247,0.1); color: var(--accent-light); border: 1px solid rgba(124,106,247,0.25); }
.badge-marketing { background: rgba(247,148,106,0.1); color: var(--accent-2); border: 1px solid rgba(247,148,106,0.25); }
.badge-learning  { background: rgba(250,204,21,0.1);  color: var(--warning); border: 1px solid rgba(250,204,21,0.25);  }
.badge-analysis  { background: rgba(106,247,194,0.1); color: var(--accent-3); border: 1px solid rgba(106,247,194,0.25); }
.badge-creative  { background: rgba(248,113,113,0.1); color: var(--danger);  border: 1px solid rgba(248,113,113,0.25); }
.badge-allgemein { background: var(--bg-elevated); color: var(--text-secondary); border: 1px solid var(--border); }

.card-preview {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.card-tag {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 99px;
  padding: 0.15rem 0.5rem;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.card-date { font-size: 0.7rem; color: var(--text-muted); margin-left: auto; }

.card-actions {
  display: flex;
  gap: 0.4rem;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}

.card-actions .btn-ghost,
.card-actions .btn-secondary { flex: 1; }

/* Template Stars */
.template-stars {
  display: flex;
  gap: 0.1rem;
  color: var(--warning);
  font-size: 0.7rem;
}

/* ════════════════════════════════════════════
   TEMPLATE CATEGORIES
   ════════════════════════════════════════════ */
.template-categories {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-surface);
}

.cat-btn {
  padding: 0.4rem 1rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 99px;
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition);
}

.cat-btn:hover { border-color: var(--accent); color: var(--accent-light); }
.cat-btn.active { background: var(--accent-glow); border-color: var(--accent); color: var(--accent-light); }

/* ════════════════════════════════════════════
   HISTORY
   ════════════════════════════════════════════ */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 1.5rem 2rem;
  max-width: 900px;
}

.history-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
  animation: fadeSlideIn 0.3s ease;
}

.history-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
  margin-top: 0.4rem;
  box-shadow: 0 0 8px var(--accent-glow);
}

.history-content { flex: 1; min-width: 0; }

.history-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.history-preview {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.35rem;
}

.history-time { font-size: 0.72rem; color: var(--text-muted); }

.history-actions { display: flex; gap: 0.35rem; align-items: flex-start; }

/* ════════════════════════════════════════════
   MODALS
   ════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal {
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalIn 0.2s ease;
}

.modal-wide { max-width: 720px; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
}

.modal-close {
  width: 30px; height: 30px;
  display: grid; place-items: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all var(--transition);
}
.modal-close:hover { color: var(--danger); border-color: var(--danger); }

.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
}

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }

.prompt-view-content {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 1rem;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 400px;
  overflow-y: auto;
}

.prompt-view-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.25rem;
}

/* ════════════════════════════════════════════
   TOAST
   ════════════════════════════════════════════ */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  z-index: 999;
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 0;
}

.toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.toast.toast-success #toast-icon { color: var(--success); }
.toast.toast-error   #toast-icon { color: var(--danger); }
.toast.toast-info    #toast-icon { color: var(--info); }

/* ════════════════════════════════════════════
   ANIMATIONS
   ════════════════════════════════════════════ */
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.generating { animation: pulse 1s ease infinite; }

/* ════════════════════════════════════════════
   RESPONSIVE
   ════════════════════════════════════════════ */
@media (max-width: 1200px) {
  :root {
    --sidebar-w: 300px;
    --tips-w: 240px;
  }
}

@media (max-width: 960px) {
  .builder-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    height: auto;
    overflow: visible;
  }

  .builder-config { border-right: none; border-bottom: 1px solid var(--border); }
  .builder-tips   { border-left: none; border-top: 1px solid var(--border); }

  .panel { overflow-y: visible; }
  .builder-preview { min-height: 60vh; overflow: visible; }

  #prompt-output-wrapper { overflow: visible; }

  .config-actions { position: relative; }
}

@media (max-width: 768px) {
  :root { --header-h: 54px; }

  .header-inner { padding: 0 1rem; }

  .nav-btn span:not(.nav-btn i) { display: none; }
  .nav-btn { padding: 0.4rem 0.6rem; }

  .view-header { padding: 1rem; }

  .card-grid { padding: 1rem; grid-template-columns: 1fr; }
  .history-list { padding: 1rem; }
  .template-categories { padding: 0.75rem 1rem; }

  .search-box input { width: 140px; }

  .modal { max-width: 100%; max-height: 95vh; }
}

@media (max-width: 480px) {
  .logo-text { display: none; }
  .header-logo { margin-right: 0; }

  .view-header h1 { font-size: 1.1rem; }

  .panel-header-actions { display: none; }
  #btn-copy, #btn-save-prompt {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 50;
  }
}
