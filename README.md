/* ═══════════════════════════════════════════════════════════════
   SuperPrompt Studio – Main Application Logic
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── State ─── */
const state = {
  currentView:       'builder',
  currentPrompt:     '',
  currentConfig:     {},
  appliedModifiers:  new Set(),
  tipIndex:          0,
  currentModalData:  null,
  libraryData:       [],
  historyData:       [],
};

/* ─── DOM Refs ─── */
const $ = id => document.getElementById(id);

/* ════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initBuilder();
  initModifiers();
  initTips();
  initTemplateView();
  initLibraryView();
  initHistoryView();
  initModalHandlers();
  restoreLastConfig();
});

/* ════════════════════════════════════════════
   THEME
   ════════════════════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem('sps_theme') || 'dark';
  if (saved === 'light') document.body.classList.add('light');
  $('btn-theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('sps_theme', document.body.classList.contains('light') ? 'light' : 'dark');
  });
}

/* ════════════════════════════════════════════
   NAVIGATION
   ════════════════════════════════════════════ */
function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
}

function switchView(viewName) {
  state.currentView = viewName;

  // Update nav
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === viewName);
  });

  // Update views
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.id === 'view-' + viewName);
    v.classList.toggle('hidden', v.id !== 'view-' + viewName);
  });

  // Load data for views
  if (viewName === 'library')   renderLibrary();
  if (viewName === 'history')   renderHistory();
  if (viewName === 'templates') renderTemplates();
}

/* ════════════════════════════════════════════
   BUILDER
   ════════════════════════════════════════════ */
function initBuilder() {
  // Role custom input
  $('cfg-role').addEventListener('change', () => {
    $('cfg-role-custom').classList.toggle('hidden', $('cfg-role').value !== 'custom');
  });

  // Format chips
  initChipGroup('cfg-format-chips', true);

  // Tone chips
  initChipGroup('cfg-tone-chips', true);

  // Length slider
  const slider = $('cfg-length');
  slider.addEventListener('input', () => {
    $('cfg-length-label').textContent = LENGTH_LABELS[parseInt(slider.value)];
  });

  // Generate button
  $('btn-generate').addEventListener('click', generatePrompt);

  // Reset
  $('btn-reset-config').addEventListener('click', resetConfig);

  // Copy button
  $('btn-copy').addEventListener('click', () => copyToClipboard(state.currentPrompt));

  // Save button
  $('btn-save-prompt').addEventListener('click', openSaveModal);

  // Toggle raw
  $('toggle-raw').addEventListener('click', () => {
    const raw = $('output-raw');
    raw.classList.toggle('hidden');
    $('toggle-raw').innerHTML = raw.classList.contains('hidden')
      ? '<i class="fa-solid fa-code"></i> Rohdaten anzeigen'
      : '<i class="fa-solid fa-code"></i> Rohdaten ausblenden';
  });

  // Variations
  $('btn-gen-variations').addEventListener('click', () => generateVariations(state.currentConfig));
}

function initChipGroup(groupId, singleSelect = false) {
  const group = $(groupId);
  if (!group) return;
  group.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (singleSelect) group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.toggle('active');
    });
  });
}

/* ─── Collect Config ─── */
function collectConfig() {
  const role     = $('cfg-role').value;
  const roleLabel = role === 'custom' ? $('cfg-role-custom').value.trim() : getRoleLabel(role);
  const format   = getActiveChips('cfg-format-chips')[0] || 'strukturiert';
  const tone     = getActiveChips('cfg-tone-chips')[0]   || 'professionell';
  const length   = parseInt($('cfg-length').value);

  return {
    role:          role,
    roleLabel:     roleLabel,
    task:          $('cfg-task').value.trim(),
    context:       $('cfg-context').value.trim(),
    format:        format,
    tone:          tone,
    length:        length,
    lengthLabel:   LENGTH_LABELS[length],
    lengthDesc:    LENGTH_DESCRIPTORS[length],
    language:      $('cfg-language').value,
    constraints:   $('cfg-constraints').value.trim(),
    examples:      $('cfg-examples').value.trim(),
    cot:           $('cfg-cot').checked,
    selfcritique:  $('cfg-selfcritique').checked,
    modifiers:     Array.from(state.appliedModifiers),
  };
}

function getActiveChips(groupId) {
  return Array.from(document.querySelectorAll(`#${groupId} .chip.active`)).map(c => c.dataset.value);
}

function getRoleLabel(val) {
  const map = {
    expert:      'einem ausgewiesenen Experten auf diesem Gebiet',
    teacher:     'einer erfahrenen Lehrerin / einem erfahrenen Lehrer',
    coach:       'einem professionellen Coach und Mentor',
    analyst:     'einer strategischen Analystin',
    creative:    'einer erfahrenen Kreativdirektorin',
    developer:   'einem Senior Software-Entwickler mit 15+ Jahren Erfahrung',
    copywriter:  'einem professionellen Texter mit Conversion-Expertise',
    researcher:  'einem wissenschaftlichen Forscher',
  };
  return map[val] || '';
}

/* ─── Generate Prompt ─── */
function generatePrompt() {
  const config = collectConfig();

  if (!config.task) {
    showToast('Bitte gib eine Aufgabe ein!', 'error');
    $('cfg-task').focus();
    return;
  }

  state.currentConfig = config;
  saveLastConfig(config);

  // Show generating state
  const btn = $('btn-generate');
  btn.classList.add('generating');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generiere …';
  btn.disabled = true;

  // Simulate brief generation delay for UX
  setTimeout(() => {
    try {
      const prompt = buildPromptText(config);
      state.currentPrompt = prompt;
      displayOutput(prompt, config);
      addHistoryEntry({
        title:   config.task.slice(0, 60) + (config.task.length > 60 ? '…' : ''),
        preview: prompt.slice(0, 120) + '…',
        prompt:  prompt,
        config:  config,
      });
      state.historyData = loadHistory();
    } catch(e) {
      showToast('Fehler beim Generieren: ' + e.message, 'error');
    }

    btn.classList.remove('generating');
    btn.innerHTML = '<i class="fa-solid fa-bolt-lightning"></i> Superprompt generieren';
    btn.disabled = false;
  }, 400);
}

/* ─── Build Prompt ─── */
function buildPromptText(cfg) {
  const sections = [];

  // 1. Rolle
  if (cfg.roleLabel) {
    sections.push(`# ROLLE\nDu agierst als ${cfg.roleLabel}. Behalte diese Rolle konsequent während der gesamten Antwort bei.`);
  }

  // 2. Aufgabe
  if (cfg.task) {
    sections.push(`# AUFGABE\n${cfg.task}`);
  }

  // 3. Kontext
  if (cfg.context) {
    sections.push(`# KONTEXT\n${cfg.context}`);
  }

  // 4. Chain of Thought
  if (cfg.cot) {
    sections.push(`# DENKPROZESS\nDenke das Problem Schritt für Schritt durch. Zeige deinen Denkweg transparent, bevor du die finale Antwort gibst. Strukturiere deine Gedanken klar.`);
  }

  // 5. Beispiele / Few-Shot
  if (cfg.examples) {
    sections.push(`# BEISPIELE (FEW-SHOT)\n${cfg.examples}`);
  }

  // 6. Format & Ausgabe
  const formatInstructions = buildFormatInstructions(cfg);
  if (formatInstructions) {
    sections.push(`# AUSGABEFORMAT\n${formatInstructions}`);
  }

  // 7. Stil & Ton
  sections.push(`# STIL & TON\n- Ton: ${cfg.tone}\n- Sprache: ${cfg.language}\n- Länge: ${cfg.lengthDesc}`);

  // 8. Constraints
  if (cfg.constraints) {
    sections.push(`# EINSCHRÄNKUNGEN\n${cfg.constraints.split('\n').map(l => l.trim() ? `• ${l.trim()}` : '').filter(Boolean).join('\n')}`);
  }

  // 9. Self-Critique
  if (cfg.selfcritique) {
    sections.push(`# QUALITÄTSSICHERUNG\nNach deiner Antwort: Überprüfe kritisch, ob deine Ausgabe die Aufgabe vollständig erfüllt. Falls nicht, korrigiere und verbessere sie. Markiere überarbeitete Teile mit [REVIDIERT].`);
  }

  // 10. Modifier Texts
  if (cfg.modifiers && cfg.modifiers.length > 0) {
    const modTexts = cfg.modifiers
      .filter(m => MODIFIER_TEXTS[m])
      .map(m => MODIFIER_TEXTS[m].trim())
      .join('\n\n');
    if (modTexts) sections.push(`# ERWEITERTE TECHNIKEN\n${modTexts}`);
  }

  return sections.join('\n\n---\n\n');
}

function buildFormatInstructions(cfg) {
  const formatMap = {
    'fließtext':        'Antworte in fließendem, gut strukturiertem Prosatext.',
    'stichpunkte':      'Antworte in prägnanten Stichpunkten. Jeden Punkt auf einer neuen Zeile mit Bullet-Symbol.',
    'strukturiert':     'Nutze klare Abschnitte mit Überschriften (##) und Unterabschnitten (###). Logische Reihenfolge.',
    'tabelle':          'Präsentiere die Informationen in einer übersichtlichen Tabelle mit klar beschrifteten Spalten und Zeilen.',
    'markdown':         'Nutze vollständiges Markdown: Überschriften, **Fett**, *Kursiv*, Listen, Code-Blöcke, Tabellen.',
    'json':             'Antworte ausschließlich in validem JSON. Kein Text außerhalb des JSON-Objekts.',
    'code':             'Gib den Code direkt aus, in korrekten Code-Fencing-Blöcken mit Sprach-Annotation. Mit Inline-Kommentaren.',
    'schritt-für-schritt': 'Antworte in nummerierten Schritten. Jeder Schritt klar abgegrenzt. Erkläre den Zweck jedes Schritts.',
  };
  return formatMap[cfg.format] || '';
}

/* ─── Display Output ─── */
function displayOutput(prompt, config) {
  $('output-empty').classList.add('hidden');
  $('output-result').classList.remove('hidden');
  $('variations-wrapper').classList.remove('hidden');

  // Stats
  const wordCount = prompt.split(/\s+/).filter(w => w.length > 0).length;
  const charCount = prompt.length;
  $('output-stats').textContent = `${wordCount} Wörter · ${charCount} Zeichen`;

  // Quality score
  const quality = calcQuality(config);
  $('output-quality').textContent = `⭐ Qualität: ${quality.label}`;
  $('output-quality').title = quality.tips.join(' | ');

  // Sections
  const sectionsEl = $('output-sections');
  sectionsEl.innerHTML = '';

  const parts = prompt.split(/\n---\n/);
  const icons = {
    'ROLLE': 'fa-user-tie', 'AUFGABE': 'fa-bullseye', 'KONTEXT': 'fa-circle-info',
    'DENKPROZESS': 'fa-brain', 'BEISPIELE': 'fa-lightbulb', 'AUSGABEFORMAT': 'fa-list-check',
    'STIL': 'fa-palette', 'EINSCHRÄNKUNGEN': 'fa-ban', 'QUALITÄTSSICHERUNG': 'fa-magnifying-glass-chart',
    'ERWEITERTE': 'fa-flask',
  };

  parts.forEach(part => {
    const trimmed = part.trim();
    if (!trimmed) return;

    const firstLine = trimmed.split('\n')[0].replace(/^#+ /, '');
    const body      = trimmed.split('\n').slice(1).join('\n').trim();
    const iconKey   = Object.keys(icons).find(k => firstLine.toUpperCase().includes(k)) || '';

    const section = document.createElement('div');
    section.className = 'output-section';
    section.innerHTML = `
      <div class="output-section-header">
        <i class="fa-solid ${icons[iconKey] || 'fa-chevron-right'} section-icon"></i>
        ${escHtml(firstLine)}
      </div>
      <div class="output-section-body">${escHtml(body)}</div>
    `;
    sectionsEl.appendChild(section);
  });

  // Raw
  $('output-raw').textContent = prompt;
  $('output-raw').classList.add('hidden');
  $('toggle-raw').innerHTML = '<i class="fa-solid fa-code"></i> Rohdaten anzeigen';

  // Enable buttons
  $('btn-copy').disabled = false;
  $('btn-save-prompt').disabled = false;

  // Generate variations
  generateVariations(config);

  // Scroll to top of preview
  const wrapper = $('prompt-output-wrapper');
  if (wrapper) wrapper.scrollTop = 0;
}

/* ─── Quality Calculator ─── */
function calcQuality(cfg) {
  let score = 0;
  const tips = [];

  if (cfg.task)        { score += 30; } else { tips.push('Aufgabe fehlt'); }
  if (cfg.roleLabel)   { score += 15; } else { tips.push('Rolle hinzufügen'); }
  if (cfg.context)     { score += 15; } else { tips.push('Kontext hinzufügen'); }
  if (cfg.constraints) { score += 10; } else { tips.push('Einschränkungen definieren'); }
  if (cfg.examples)    { score += 10; } else { tips.push('Beispiele hinzufügen'); }
  if (cfg.cot)         { score +=  5; }
  if (cfg.selfcritique){ score +=  5; }
  if (cfg.modifiers && cfg.modifiers.length > 0) { score += Math.min(10, cfg.modifiers.length * 3); }

  let label;
  if (score >= 90) label = '🏆 Exzellent';
  else if (score >= 70) label = '🌟 Sehr gut';
  else if (score >= 50) label = '✅ Gut';
  else if (score >= 30) label = '📝 Mittel';
  else label = '⚡ Basis';

  return { score, label, tips };
}

/* ─── Variations ─── */
function generateVariations(config) {
  if (!config.task) return;

  const variationsList = $('variations-list');
  variationsList.innerHTML = '';

  const variations = [
    {
      label: '🎯 Präzise',
      modifier: { tone: 'präzise', selfcritique: true, cot: true },
    },
    {
      label: '🎨 Kreativ',
      modifier: { tone: 'kreativ', format: 'fließtext' },
    },
    {
      label: '⚡ Kurz & Knapp',
      modifier: { length: 1, constraints: (config.constraints || '') + ' Maximal 100 Wörter. Extrem prägnant.' },
    },
    {
      label: '📚 Ausführlich',
      modifier: { length: 5, cot: true },
    },
  ];

  variations.forEach(v => {
    const varConfig = { ...config, ...v.modifier };
    const varPrompt = buildPromptText(varConfig);
    const preview   = varPrompt.replace(/#+\s+[A-ZÄÖÜ\s&()]+\n/g, '').replace(/---/g, '').trim().slice(0, 180);

    const card = document.createElement('div');
    card.className = 'variation-card';
    card.innerHTML = `<div class="var-label">${escHtml(v.label)}</div>${escHtml(preview)}…`;
    card.addEventListener('click', () => {
      state.currentPrompt = varPrompt;
      state.currentConfig = varConfig;
      displayOutput(varPrompt, varConfig);
      showToast('Variation geladen!', 'success');
    });
    variationsList.appendChild(card);
  });
}

/* ─── Reset Config ─── */
function resetConfig() {
  $('cfg-role').value = '';
  $('cfg-role-custom').value = '';
  $('cfg-role-custom').classList.add('hidden');
  $('cfg-task').value = '';
  $('cfg-context').value = '';
  $('cfg-constraints').value = '';
  $('cfg-examples').value = '';
  $('cfg-length').value = 3;
  $('cfg-length-label').textContent = 'Mittel';
  $('cfg-language').value = 'deutsch';
  $('cfg-cot').checked = false;
  $('cfg-selfcritique').checked = false;

  // Reset chips
  document.querySelectorAll('#cfg-format-chips .chip').forEach((c, i) => c.classList.toggle('active', i === 2));
  document.querySelectorAll('#cfg-tone-chips .chip').forEach((c, i) => c.classList.toggle('active', i === 0));

  // Reset modifiers
  state.appliedModifiers.clear();
  document.querySelectorAll('.modifier-btn').forEach(b => b.classList.remove('applied'));

  // Reset output
  $('output-empty').classList.remove('hidden');
  $('output-result').classList.add('hidden');
  $('variations-wrapper').classList.add('hidden');
  $('btn-copy').disabled = true;
  $('btn-save-prompt').disabled = true;

  state.currentPrompt = '';
  showToast('Konfiguration zurückgesetzt', 'info');
}

/* ─── Restore Last Config ─── */
function restoreLastConfig() {
  const last = loadLastConfig();
  if (!last) return;

  try {
    if (last.role && last.role !== 'custom') $('cfg-role').value = last.role;
    if (last.task)        $('cfg-task').value = last.task;
    if (last.context)     $('cfg-context').value = last.context;
    if (last.constraints) $('cfg-constraints').value = last.constraints;
    if (last.examples)    $('cfg-examples').value = last.examples;
    if (last.length)      { $('cfg-length').value = last.length; $('cfg-length-label').textContent = LENGTH_LABELS[last.length]; }
    if (last.language)    $('cfg-language').value = last.language;
    if (last.cot != null) $('cfg-cot').checked = last.cot;
    if (last.selfcritique != null) $('cfg-selfcritique').checked = last.selfcritique;

    if (last.format) {
      document.querySelectorAll('#cfg-format-chips .chip').forEach(c => {
        c.classList.toggle('active', c.dataset.value === last.format);
      });
    }
    if (last.tone) {
      document.querySelectorAll('#cfg-tone-chips .chip').forEach(c => {
        c.classList.toggle('active', c.dataset.value === last.tone);
      });
    }
  } catch(e) { /* ignore restore errors */ }
}

/* ════════════════════════════════════════════
   MODIFIERS
   ════════════════════════════════════════════ */
function initModifiers() {
  document.querySelectorAll('.modifier-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.modifier;
      if (state.appliedModifiers.has(key)) {
        state.appliedModifiers.delete(key);
        btn.classList.remove('applied');
        showToast(`Modifier entfernt: ${btn.textContent.trim()}`, 'info');
      } else {
        state.appliedModifiers.add(key);
        btn.classList.add('applied');
        showToast(`Modifier aktiviert: ${btn.textContent.trim()}`, 'success');
      }
    });
  });
}

/* ════════════════════════════════════════════
   TIPS ROTATOR
   ════════════════════════════════════════════ */
function initTips() {
  showTip(0);
  $('btn-next-tip').addEventListener('click', () => {
    state.tipIndex = (state.tipIndex + 1) % PROMPT_TIPS.length;
    showTip(state.tipIndex);
  });

  // Auto-rotate every 15 seconds
  setInterval(() => {
    state.tipIndex = (state.tipIndex + 1) % PROMPT_TIPS.length;
    showTip(state.tipIndex);
  }, 15000);
}

function showTip(index) {
  const el = $('tip-text');
  if (!el) return;
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = PROMPT_TIPS[index];
    el.style.opacity = '1';
    el.style.transition = 'opacity 0.3s ease';
  }, 150);
}

/* ════════════════════════════════════════════
   TEMPLATE VIEW
   ════════════════════════════════════════════ */
function initTemplateView() {
  renderTemplates();

  // Category filter
  $('template-cat-filter').addEventListener('click', e => {
    const btn = e.target.closest('.cat-btn');
    if (!btn) return;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTemplates(btn.dataset.cat, $('template-search').value);
  });

  // Search
  $('template-search').addEventListener('input', () => {
    const activeCat = document.querySelector('.cat-btn.active')?.dataset.cat || 'all';
    renderTemplates(activeCat, $('template-search').value);
  });
}

function renderTemplates(cat = 'all', search = '') {
  const grid = $('template-grid');
  grid.innerHTML = '';

  let filtered = TEMPLATES;
  if (cat !== 'all') filtered = filtered.filter(t => t.category === cat);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div><h3>Keine Templates gefunden</h3></div>';
    return;
  }

  filtered.forEach(tpl => {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${escHtml(tpl.title)}</div>
        <span class="card-badge badge-${tpl.category}">${getCatIcon(tpl.category)} ${capitalize(tpl.category)}</span>
      </div>
      <div class="card-preview">${escHtml(tpl.description)}</div>
      <div class="card-meta">
        ${tpl.tags.slice(0,3).map(t => `<span class="card-tag">#${escHtml(t)}</span>`).join('')}
        <div class="template-stars">${'★'.repeat(tpl.rating)}${'☆'.repeat(5-tpl.rating)}</div>
      </div>
      <div class="card-actions">
        <button class="btn-primary btn-sm" onclick="loadTemplate('${tpl.id}')">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Im Builder öffnen
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function loadTemplate(tplId) {
  const tpl = TEMPLATES.find(t => t.id === tplId);
  if (!tpl) return;

  const cfg = tpl.config;

  // Apply to builder
  if (cfg.role) $('cfg-role').value = cfg.role;
  if (cfg.task) $('cfg-task').value = cfg.task;
  if (cfg.context) $('cfg-context').value = cfg.context;
  if (cfg.constraints) $('cfg-constraints').value = cfg.constraints;
  if (cfg.examples) $('cfg-examples').value = cfg.examples || '';
  if (cfg.language) $('cfg-language').value = cfg.language;
  if (cfg.cot != null) $('cfg-cot').checked = cfg.cot;
  if (cfg.selfcritique != null) $('cfg-selfcritique').checked = cfg.selfcritique;

  if (cfg.length) {
    $('cfg-length').value = cfg.length;
    $('cfg-length-label').textContent = LENGTH_LABELS[cfg.length];
  }

  if (cfg.format) {
    document.querySelectorAll('#cfg-format-chips .chip').forEach(c => {
      c.classList.toggle('active', c.dataset.value === cfg.format);
    });
  }
  if (cfg.tone) {
    document.querySelectorAll('#cfg-tone-chips .chip').forEach(c => {
      c.classList.toggle('active', c.dataset.value === cfg.tone);
    });
  }

  switchView('builder');
  showToast(`Template "${tpl.title}" geladen!`, 'success');
}

/* ════════════════════════════════════════════
   LIBRARY VIEW
   ════════════════════════════════════════════ */
function initLibraryView() {
  $('library-search').addEventListener('input', () => renderLibrary());
  $('library-filter-cat').addEventListener('change', () => renderLibrary());
}

async function renderLibrary() {
  const search = $('library-search').value.trim();
  const cat    = $('library-filter-cat').value;
  const grid   = $('library-grid');
  const empty  = $('library-empty');

  grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon"><i class="fa-solid fa-spinner fa-spin"></i></div><p>Lade …</p></div>';

  const data = await loadSavedPrompts(search, cat);
  state.libraryData = data;

  grid.innerHTML = '';

  // Populate category filter
  const categories = [...new Set(data.map(d => d.category).filter(Boolean))];
  const filterEl = $('library-filter-cat');
  const currentVal = filterEl.value;
  filterEl.innerHTML = '<option value="">Alle Kategorien</option>';
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = capitalize(c);
    if (c === currentVal) opt.selected = true;
    filterEl.appendChild(opt);
  });

  if (data.length === 0) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  grid.classList.remove('hidden');
  empty.classList.add('hidden');

  data.forEach(item => {
    const tags = (item.tags || '').split(',').map(t => t.trim()).filter(Boolean);
    const date = item.created_at ? new Date(item.created_at).toLocaleDateString('de-DE') : '';

    const card = document.createElement('div');
    card.className = 'prompt-card';
    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${escHtml(item.name || 'Unbenannter Prompt')}</div>
        <span class="card-badge badge-${item.category || 'allgemein'}">${getCatIcon(item.category)} ${capitalize(item.category || 'allgemein')}</span>
      </div>
      <div class="card-preview">${escHtml((item.prompt_text || '').slice(0, 200))}</div>
      <div class="card-meta">
        ${tags.slice(0,3).map(t => `<span class="card-tag">#${escHtml(t)}</span>`).join('')}
        <span class="card-date">${date}</span>
      </div>
      ${item.note ? `<div class="card-preview" style="border-top:1px solid var(--border);padding-top:.5rem;margin-top:.25rem;font-style:italic">${escHtml(item.note)}</div>` : ''}
      <div class="card-actions">
        <button class="btn-secondary btn-sm" onclick="viewSavedPrompt('${item.id}')">
          <i class="fa-solid fa-eye"></i> Anzeigen
        </button>
        <button class="btn-secondary btn-sm" onclick="copyToClipboard(${JSON.stringify(item.prompt_text || '')})">
          <i class="fa-solid fa-copy"></i> Kopieren
        </button>
        <button class="btn-ghost btn-sm" onclick="deleteSavedPrompt('${item.id}')" title="Löschen">
          <i class="fa-solid fa-trash" style="color:var(--danger)"></i>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function viewSavedPrompt(id) {
  const item = state.libraryData.find(d => d.id === id);
  if (!item) return;

  $('modal-view-title').textContent = item.name || 'Prompt';
  $('modal-view-content').textContent = item.prompt_text || '';

  const tags = (item.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  $('modal-view-meta').innerHTML = `
    <span class="card-badge badge-${item.category || 'allgemein'}">${getCatIcon(item.category)} ${capitalize(item.category || 'allgemein')}</span>
    ${tags.map(t => `<span class="card-tag">#${escHtml(t)}</span>`).join('')}
    ${item.created_at ? `<span class="card-date">Erstellt: ${new Date(item.created_at).toLocaleDateString('de-DE')}</span>` : ''}
  `;

  state.currentModalData = item;
  openModal('modal-view');
}

async function deleteSavedPrompt(id) {
  if (!confirm('Diesen Prompt wirklich löschen?')) return;
  try {
    await deletePrompt(id);
    showToast('Prompt gelöscht', 'success');
    renderLibrary();
  } catch(e) {
    showToast('Fehler beim Löschen', 'error');
  }
}

/* ════════════════════════════════════════════
   HISTORY VIEW
   ════════════════════════════════════════════ */
function initHistoryView() {
  $('btn-clear-history').addEventListener('click', () => {
    if (!confirm('Gesamten Verlauf löschen?')) return;
    clearHistory();
    state.historyData = [];
    renderHistory();
    showToast('Verlauf gelöscht', 'success');
  });
}

function renderHistory() {
  const list  = $('history-list');
  const empty = $('history-empty');
  const data  = loadHistory();
  state.historyData = data;

  list.innerHTML = '';

  if (data.length === 0) {
    list.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  list.classList.remove('hidden');
  empty.classList.add('hidden');

  data.forEach(item => {
    const el = document.createElement('div');
    el.className = 'history-item';
    const time = formatTime(item.timestamp);
    el.innerHTML = `
      <div class="history-dot"></div>
      <div class="history-content">
        <div class="history-title">${escHtml(item.title)}</div>
        <div class="history-preview">${escHtml(item.preview)}</div>
        <div class="history-time">${time}</div>
      </div>
      <div class="history-actions">
        <button class="btn-secondary btn-sm" onclick="restoreHistoryItem('${item.id}')" title="Im Builder öffnen">
          <i class="fa-solid fa-rotate-left"></i>
        </button>
        <button class="btn-ghost btn-sm" onclick="copyToClipboard(${JSON.stringify(item.prompt || '')})" title="Kopieren">
          <i class="fa-solid fa-copy"></i>
        </button>
      </div>
    `;
    list.appendChild(el);
  });
}

function restoreHistoryItem(id) {
  const item = state.historyData.find(h => h.id === id);
  if (!item) return;

  if (item.config) {
    const cfg = item.config;
    if (cfg.role)     $('cfg-role').value = cfg.role;
    if (cfg.task)     $('cfg-task').value = cfg.task;
    if (cfg.context)  $('cfg-context').value = cfg.context;
    if (cfg.constraints) $('cfg-constraints').value = cfg.constraints;
    if (cfg.examples) $('cfg-examples').value = cfg.examples || '';
    if (cfg.language) $('cfg-language').value = cfg.language;
    if (cfg.cot != null) $('cfg-cot').checked = cfg.cot;
    if (cfg.selfcritique != null) $('cfg-selfcritique').checked = cfg.selfcritique;
    if (cfg.length)   { $('cfg-length').value = cfg.length; $('cfg-length-label').textContent = LENGTH_LABELS[cfg.length] || 'Mittel'; }

    if (cfg.format) {
      document.querySelectorAll('#cfg-format-chips .chip').forEach(c => c.classList.toggle('active', c.dataset.value === cfg.format));
    }
    if (cfg.tone) {
      document.querySelectorAll('#cfg-tone-chips .chip').forEach(c => c.classList.toggle('active', c.dataset.value === cfg.tone));
    }
  }

  if (item.prompt) {
    state.currentPrompt = item.prompt;
    state.currentConfig = item.config || {};
    displayOutput(item.prompt, item.config || {});
  }

  switchView('builder');
  showToast('Verlaufs-Eintrag geladen!', 'success');
}

/* ════════════════════════════════════════════
   MODAL HANDLERS
   ════════════════════════════════════════════ */
function initModalHandlers() {
  // Save confirm
  $('btn-confirm-save').addEventListener('click', async () => {
    const name = $('save-name').value.trim();
    if (!name) { showToast('Bitte einen Namen eingeben!', 'error'); return; }
    if (!state.currentPrompt) { showToast('Kein Prompt vorhanden!', 'error'); return; }

    try {
      $('btn-confirm-save').disabled = true;
      await savePrompt({
        name:        name,
        category:    $('save-category').value,
        tags:        $('save-tags').value,
        note:        $('save-note').value,
        prompt_text: state.currentPrompt,
        config:      state.currentConfig,
      });
      closeModal('modal-save');
      showToast('Prompt gespeichert! 🎉', 'success');
      $('save-name').value = '';
      $('save-tags').value = '';
      $('save-note').value = '';
    } catch(e) {
      showToast('Fehler beim Speichern: ' + e.message, 'error');
    } finally {
      $('btn-confirm-save').disabled = false;
    }
  });

  // Modal view – copy
  $('btn-modal-copy').addEventListener('click', () => {
    const content = $('modal-view-content').textContent;
    copyToClipboard(content);
  });

  // Modal view – edit in builder
  $('btn-modal-edit').addEventListener('click', () => {
    const item = state.currentModalData;
    if (!item || !item.prompt_text) return;
    state.currentPrompt = item.prompt_text;
    state.currentConfig = {};
    displayOutput(item.prompt_text, {});
    closeModal('modal-view');
    switchView('builder');
  });

  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
}

function openSaveModal() {
  if (!state.currentPrompt) return;
  const taskPreview = (state.currentConfig.task || 'Mein Prompt').slice(0, 50);
  $('save-name').value = taskPreview;
  openModal('modal-save');
}

function openModal(id) {
  $(id).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  $(id).classList.add('hidden');
  document.body.style.overflow = '';
}

/* ════════════════════════════════════════════
   UTILITIES
   ════════════════════════════════════════════ */
function copyToClipboard(text) {
  if (!text) { showToast('Nichts zu kopieren!', 'error'); return; }
  navigator.clipboard.writeText(text).then(() => {
    showToast('In die Zwischenablage kopiert! ✓', 'success');
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Kopiert! ✓', 'success');
  });
}

let toastTimer;
function showToast(message, type = 'success') {
  const toast = $('toast');
  const icon  = $('toast-icon');
  const msg   = $('toast-message');

  toast.className = `toast toast-${type}`;
  msg.textContent = message;

  const iconMap = {
    success: 'fa-circle-check',
    error:   'fa-circle-xmark',
    info:    'fa-circle-info',
    warning: 'fa-triangle-exclamation',
  };
  icon.className = `fa-solid ${iconMap[type] || 'fa-circle-check'}`;

  // Force reflow
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCatIcon(cat) {
  const icons = {
    business: '💼', coding: '💻', writing: '✍️', marketing: '📣',
    learning: '📚', analysis: '📊', creative: '🎨', allgemein: '📋',
  };
  return icons[cat] || '📋';
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1)    return 'Gerade eben';
  if (diffMins < 60)   return `vor ${diffMins} Min.`;
  if (diffHours < 24)  return `vor ${diffHours} Std.`;
  if (diffDays < 7)    return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
  return d.toLocaleDateString('de-DE');
}

/* ════════════════════════════════════════════
   GLOBAL EXPORTS (for inline onclick handlers)
   ════════════════════════════════════════════ */
window.switchView         = switchView;
window.loadTemplate       = loadTemplate;
window.viewSavedPrompt    = viewSavedPrompt;
window.deleteSavedPrompt  = deleteSavedPrompt;
window.restoreHistoryItem = restoreHistoryItem;
window.copyToClipboard    = copyToClipboard;
window.closeModal         = closeModal;
window.openModal          = openModal;
