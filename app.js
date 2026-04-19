/* ═══════════════════════════════════════════════════════════════
   SuperPrompt Studio – Template Library
   ═══════════════════════════════════════════════════════════════ */

const TEMPLATES = [
  // ── BUSINESS ──
  {
    id: 'tpl-001',
    title: 'Executive Summary Generator',
    category: 'business',
    tags: ['executive', 'summary', 'management'],
    rating: 5,
    description: 'Erstellt professionelle Executive Summaries für Berichte, Projekte und Strategiepapiere.',
    config: {
      role: 'expert',
      task: 'Erstelle eine prägnante Executive Summary für folgendes Dokument/Projekt: [INHALT HIER EINFÜGEN]',
      context: 'Zielgruppe: Top-Management und Entscheidungsträger, die wenig Zeit haben und schnell den Kern verstehen müssen.',
      format: 'strukturiert',
      tone: 'professionell',
      length: '2',
      language: 'deutsch',
      constraints: 'Maximal 300 Wörter. Keine Fachabkürzungen ohne Erklärung. Keine Floskeln.',
      cot: false,
      selfcritique: true,
    }
  },
  {
    id: 'tpl-002',
    title: 'SWOT-Analyse Pro',
    category: 'business',
    tags: ['swot', 'strategie', 'analyse'],
    rating: 5,
    description: 'Führt eine tiefgehende SWOT-Analyse mit strategischen Handlungsempfehlungen durch.',
    config: {
      role: 'analyst',
      task: 'Führe eine vollständige SWOT-Analyse für folgendes Unternehmen/Projekt durch: [NAME & BESCHREIBUNG]',
      context: 'Berücksichtige aktuelle Markttrends, Wettbewerber und interne Faktoren.',
      format: 'tabelle',
      tone: 'akademisch',
      length: '4',
      language: 'deutsch',
      constraints: 'Jeweils mindestens 5 Punkte pro Quadrant. Immer mit konkreten Handlungsempfehlungen abschließen.',
      cot: true,
      selfcritique: false,
    }
  },
  {
    id: 'tpl-003',
    title: 'Meeting-Agenda Ersteller',
    category: 'business',
    tags: ['meeting', 'agenda', 'organisation'],
    rating: 4,
    description: 'Erstellt strukturierte Meeting-Agendas mit Zeitplanung und Zielen.',
    config: {
      role: 'expert',
      task: 'Erstelle eine strukturierte Meeting-Agenda für folgendes Treffen: Thema: [THEMA], Dauer: [X Minuten], Teilnehmer: [ROLLEN]',
      context: 'Das Meeting soll effizient sein und klare Ergebnisse liefern.',
      format: 'schritt-für-schritt',
      tone: 'professionell',
      length: '3',
      language: 'deutsch',
      constraints: 'Jeder Punkt mit Zeitangabe. Verantwortliche benennen. Klare Zieldefinition am Anfang.',
      cot: false,
      selfcritique: false,
    }
  },

  // ── CODING ──
  {
    id: 'tpl-004',
    title: 'Code Review Experte',
    category: 'coding',
    tags: ['code', 'review', 'qualität'],
    rating: 5,
    description: 'Führt professionelle Code Reviews durch mit Fokus auf Sicherheit, Performance und Best Practices.',
    config: {
      role: 'developer',
      task: 'Führe ein umfassendes Code Review des folgenden Codes durch:\n\n```\n[CODE HIER EINFÜGEN]\n```',
      context: 'Sprache: [PROGRAMMIERSPRACHE]. Framework: [FALLS RELEVANT]. Fokus: Produktionscode.',
      format: 'strukturiert',
      tone: 'präzise',
      length: '4',
      language: 'deutsch',
      constraints: 'Kritische Issues zuerst. Dann Verbesserungsvorschläge. Dann Lob. Immer konkrete Code-Beispiele für Verbesserungen liefern.',
      cot: true,
      selfcritique: false,
    }
  },
  {
    id: 'tpl-005',
    title: 'Bug Hunter & Debugger',
    category: 'coding',
    tags: ['debug', 'bug', 'fehler'],
    rating: 5,
    description: 'Analysiert Fehlermeldungen und Code systematisch und findet die Ursache von Bugs.',
    config: {
      role: 'developer',
      task: 'Analysiere folgenden Bug und finde die Ursache:\n\nFehler: [FEHLERMELDUNG]\nCode: [CODE]\nErwartetes Verhalten: [WAS SOLL PASSIEREN]\nTatsächliches Verhalten: [WAS PASSIERT]',
      context: 'Systematische Fehleranalyse, dann Lösungsvorschläge mit Erklärung.',
      format: 'schritt-für-schritt',
      tone: 'präzise',
      length: '3',
      language: 'deutsch',
      constraints: 'Erst Ursache erklären, dann Lösung zeigen, dann präventive Maßnahmen.',
      cot: true,
      selfcritique: false,
    }
  },
  {
    id: 'tpl-006',
    title: 'API-Dokumentation Generator',
    category: 'coding',
    tags: ['api', 'dokumentation', 'developer'],
    rating: 4,
    description: 'Erstellt vollständige, professionelle API-Dokumentation im OpenAPI/Swagger-Stil.',
    config: {
      role: 'developer',
      task: 'Erstelle eine vollständige API-Dokumentation für folgenden Endpoint/Code: [CODE/BESCHREIBUNG]',
      context: 'Zielgruppe: Entwickler, die die API integrieren wollen.',
      format: 'markdown',
      tone: 'präzise',
      length: '4',
      language: 'englisch',
      constraints: 'Immer mit Beispiel-Request und Response. Alle Parameter erklären. Fehlercodes dokumentieren.',
      cot: false,
      selfcritique: false,
    }
  },

  // ── WRITING ──
  {
    id: 'tpl-007',
    title: 'Blog-Artikel Meister',
    category: 'writing',
    tags: ['blog', 'artikel', 'content'],
    rating: 5,
    description: 'Schreibt SEO-optimierte, fesselnde Blog-Artikel mit perfekter Struktur.',
    config: {
      role: 'copywriter',
      task: 'Schreibe einen umfassenden Blog-Artikel zum Thema: [THEMA]',
      context: 'Zielgruppe: [ZIELGRUPPE]. Ziel: [INFORMIEREN/ÜBERZEUGEN/UNTERHALTEN]. Keyword: [HAUPTKEYWORD]',
      format: 'markdown',
      tone: 'freundlich',
      length: '5',
      language: 'deutsch',
      constraints: 'H2/H3-Struktur. Einleitung mit Hook. Zwischenüberschriften alle 300 Wörter. Abschluss mit Call-to-Action. Keine Füllwörter.',
      cot: false,
      selfcritique: true,
    }
  },
  {
    id: 'tpl-008',
    title: 'E-Mail Optimierer',
    category: 'writing',
    tags: ['email', 'kommunikation', 'business'],
    rating: 4,
    description: 'Schreibt oder optimiert E-Mails für maximale Wirkung und Klarheit.',
    config: {
      role: 'copywriter',
      task: 'Schreibe/Optimiere folgende E-Mail:\n\nAnlass: [ANLASS]\nEmpfänger: [PERSON/ROLLE]\nHauptziel: [WAS WILLST DU ERREICHEN]\nAktueller Entwurf (falls vorhanden): [ENTWURF]',
      context: 'Professionelle E-Mail-Kommunikation im Geschäftsumfeld.',
      format: 'strukturiert',
      tone: 'professionell',
      length: '2',
      language: 'deutsch',
      constraints: 'Betreffzeile mitliefern. Kurze Absätze. Klarer CTA am Ende. Keine Phrasen wie "Mit freundlichen Grüßen" ohne Kontext.',
      cot: false,
      selfcritique: false,
    }
  },

  // ── MARKETING ──
  {
    id: 'tpl-009',
    title: 'Social Media Content Paket',
    category: 'marketing',
    tags: ['social media', 'content', 'instagram', 'linkedin'],
    rating: 5,
    description: 'Erstellt komplette Content-Pakete für verschiedene Social-Media-Plattformen.',
    config: {
      role: 'creative',
      task: 'Erstelle ein komplettes Social-Media-Content-Paket für folgendes Thema/Produkt: [BESCHREIBUNG]\n\nBenötigt: 3x LinkedIn-Post, 3x Instagram-Caption, 5x Tweet/X-Post',
      context: 'Marke: [MARKENNAME]. Zielgruppe: [ZIELGRUPPE]. Ton der Marke: [TON]',
      format: 'strukturiert',
      tone: 'kreativ',
      length: '4',
      language: 'deutsch',
      constraints: 'Plattform-spezifische Längen beachten. Emojis strategisch einsetzen. Hashtag-Vorschläge hinzufügen.',
      cot: false,
      selfcritique: false,
    }
  },
  {
    id: 'tpl-010',
    title: 'Landingpage Copy',
    category: 'marketing',
    tags: ['landingpage', 'conversion', 'copywriting'],
    rating: 5,
    description: 'Schreibt hochkonvertierende Landingpage-Texte nach bewährten Copywriting-Formeln.',
    config: {
      role: 'copywriter',
      task: 'Schreibe alle Texte für eine Landingpage für folgendes Produkt/Service: [PRODUKTBESCHREIBUNG]\n\nBenötigt: Headline, Subheadline, Hero-Text, 3 Kernvorteile, Social Proof Sektion, CTA-Texte, FAQ',
      context: 'Zielgruppe: [ZIELGRUPPE]. Hauptproblem das gelöst wird: [PROBLEM]. USP: [USP]',
      format: 'strukturiert',
      tone: 'professionell',
      length: '5',
      language: 'deutsch',
      constraints: 'AIDA-Formel anwenden. Emotionale Trigger nutzen. Jeden Vorteil aus Kundenperspektive formulieren.',
      cot: true,
      selfcritique: true,
    }
  },

  // ── LEARNING ──
  {
    id: 'tpl-011',
    title: 'Lernplan Creator',
    category: 'learning',
    tags: ['lernen', 'studium', 'plan'],
    rating: 5,
    description: 'Erstellt personalisierte, strukturierte Lernpläne für jedes Thema.',
    config: {
      role: 'teacher',
      task: 'Erstelle einen detaillierten Lernplan für folgendes Thema: [THEMA]\n\nVorkenntnisse: [NIVEAU: Anfänger/Fortgeschritten/Experte]\nVerfügbare Zeit: [X Stunden/Woche]\nZiel: [WAS WILLST DU KÖNNEN]',
      context: 'Wissenschaftlich fundierte Lernmethoden nutzen. Spaced Repetition und Active Recall einbauen.',
      format: 'schritt-für-schritt',
      tone: 'freundlich',
      length: '4',
      language: 'deutsch',
      constraints: 'Wochenplan mit konkreten Aufgaben. Ressourcen benennen. Meilensteine definieren. Lernkontrolle einbauen.',
      cot: true,
      selfcritique: false,
    }
  },
  {
    id: 'tpl-012',
    title: 'Konzept-Erklärer (ELI5+)',
    category: 'learning',
    tags: ['erklärung', 'konzept', 'verstehen'],
    rating: 4,
    description: 'Erklärt komplexe Konzepte auf mehreren Verständnisstufen – von simpel bis tiefgehend.',
    config: {
      role: 'teacher',
      task: 'Erkläre das folgende Konzept auf 3 Ebenen: [KONZEPT]\n\n1. Für einen 10-Jährigen (ELI10)\n2. Für einen interessierten Laien\n3. Für einen Fachmann des Nachbargebiets',
      context: 'Analogien und Alltagsbeispiele sind essentiell.',
      format: 'strukturiert',
      tone: 'freundlich',
      length: '4',
      language: 'deutsch',
      constraints: 'Immer mit einer Kernaussage in einem Satz starten. Keine Fremdwörter ohne sofortige Erklärung.',
      cot: false,
      selfcritique: false,
    }
  },

  // ── ANALYSIS ──
  {
    id: 'tpl-013',
    title: 'Daten-Analyst Pro',
    category: 'analysis',
    tags: ['daten', 'analyse', 'insights'],
    rating: 5,
    description: 'Analysiert Daten, findet Muster und leitet handlungsrelevante Insights ab.',
    config: {
      role: 'analyst',
      task: 'Analysiere folgende Daten und leite wichtige Insights ab:\n\n[DATEN HIER EINFÜGEN]',
      context: 'Geschäftskontext: [KONTEXT]. Entscheidung die getroffen werden soll: [ENTSCHEIDUNG]',
      format: 'strukturiert',
      tone: 'akademisch',
      length: '4',
      language: 'deutsch',
      constraints: 'Erst Muster & Trends. Dann Anomalien. Dann Handlungsempfehlungen. Unsicherheiten klar kennzeichnen.',
      cot: true,
      selfcritique: true,
    }
  },
  {
    id: 'tpl-014',
    title: 'Wettbewerbs-Analyse',
    category: 'analysis',
    tags: ['wettbewerb', 'markt', 'konkurrenz'],
    rating: 4,
    description: 'Erstellt tiefgehende Wettbewerbsanalysen mit strategischen Empfehlungen.',
    config: {
      role: 'analyst',
      task: 'Erstelle eine Wettbewerbsanalyse für: Mein Unternehmen/Produkt: [BESCHREIBUNG]\nWettbewerber: [LISTE DER KONKURRENTEN]',
      context: 'Markt: [MARKT]. Ziel: Strategische Positionierung und Differenzierung.',
      format: 'tabelle',
      tone: 'akademisch',
      length: '5',
      language: 'deutsch',
      constraints: 'Vergleichsmatrix erstellen. Differenzierungsmöglichkeiten aufzeigen. Blue-Ocean-Chancen identifizieren.',
      cot: true,
      selfcritique: false,
    }
  },

  // ── CREATIVE ──
  {
    id: 'tpl-015',
    title: 'Story Generator',
    category: 'creative',
    tags: ['story', 'fiction', 'kreativ'],
    rating: 5,
    description: 'Generiert fesselnde Geschichten mit starken Charakteren und spannenden Plots.',
    config: {
      role: 'creative',
      task: 'Schreibe eine fesselnde Geschichte mit folgenden Parametern:\n\nGenre: [GENRE]\nHauptcharakter: [CHARAKTER]\nKonflikt: [KONFLIKT]\nSetting: [ORT/ZEIT]',
      context: 'Storytelling nach dem 3-Akt-Schema. Starker Einstieg, spannende Mitte, befriedigender Abschluss.',
      format: 'fließtext',
      tone: 'kreativ',
      length: '4',
      language: 'deutsch',
      constraints: 'Zeigen statt erzählen. Lebhafte Beschreibungen. Dialog einbauen. Cliffhanger-Elemente nutzen.',
      cot: false,
      selfcritique: true,
    }
  },
  {
    id: 'tpl-016',
    title: 'Brainstorming Catalyst',
    category: 'creative',
    tags: ['brainstorming', 'ideen', 'innovation'],
    rating: 5,
    description: 'Generiert unkonventionelle Ideen und Lösungsansätze mit verschiedenen Kreativitätstechniken.',
    config: {
      role: 'creative',
      task: 'Generiere 20+ kreative Ideen für folgendes Problem/Ziel: [PROBLEM/ZIEL]',
      context: 'Alle Ideen willkommen – von pragmatisch bis verrückt. Quantity over quality in dieser Phase.',
      format: 'stichpunkte',
      tone: 'kreativ',
      length: '3',
      language: 'deutsch',
      constraints: 'SCAMPER-Methode anwenden. Mindestens 5 "wilde" Ideen dabei. Ideen nach Umsetzbarkeit gruppieren.',
      cot: false,
      selfcritique: false,
    }
  },
];

/* ─── Prompt Tips ─── */
const PROMPT_TIPS = [
  "🎯 Sei spezifisch: Je konkreter deine Aufgabe, desto präziser die Antwort. Vermeide vage Formulierungen.",
  "👤 Gib der KI eine Rolle: 'Agiere als erfahrener ...' verbessert die Antwortqualität erheblich.",
  "📏 Definiere das Format: Sag explizit, ob du Stichpunkte, Tabellen oder Fließtext willst.",
  "🔗 Nutze Chain-of-Thought: 'Denke Schritt für Schritt' führt zu tieferen, besser begründeten Antworten.",
  "📋 Gib Beispiele: Few-Shot-Prompting mit 1-3 Beispielen kann die Ausgabequalität verdoppeln.",
  "⚡ Nutze Constraints: 'Maximal 200 Wörter' oder 'Kein Fachjargon' macht Prompts schärfer.",
  "🔄 Iteriere: Gute Prompts entstehen durch Verfeinerung. Starte grob und verfeinere.",
  "🎭 Rollenspiel nutzen: 'Erkläre es mir wie einem 10-Jährigen' passt die Komplexität an.",
  "📊 Strukturiere Ausgaben: Bitte explizit um Überschriften, Nummerierungen oder Tabellen.",
  "✅ Definiere Erfolg: Sage der KI, woran du eine gute Antwort erkennst.",
  "🧠 Tree-of-Thought: Für komplexe Probleme lass die KI mehrere Lösungswege parallel erkunden.",
  "🔍 Selbstkritik aktivieren: 'Überprüfe deine Antwort auf Fehler' verbessert Genauigkeit deutlich.",
  "🎯 One Task at a Time: Ein gut formulierter Prompt = eine klare Aufgabe. Nicht alles auf einmal.",
  "💡 Kontext ist König: 5 Sätze Kontext können eine Antwort komplett transformieren.",
  "🌡️ Temperatur-Metapher: Für kreative Aufgaben mehr Freiheit lassen, für Fakten strenger formulieren.",
];

/* ─── Modifier Texts ─── */
const MODIFIER_TEXTS = {
  'tree-of-thought': '\n\n[TECHNIK: Tree-of-Thought]\nErforsche mehrere verschiedene Gedankenpfade parallel. Bewerte jeden Pfad, bevor du den vielversprechendsten vertiefst. Stelle deine Überlegungen transparent dar.',
  'react': '\n\n[TECHNIK: ReAct Pattern]\nNutze das ReAct-Muster: Thought → Action → Observation → Repeat. Beschreibe deine Gedanken, die Aktion die du vornimmst und was du beobachtest, bevor du zur nächsten Iteration gehst.',
  'zero-shot-cot': '\n\nDenke dieses Problem Schritt für Schritt durch, bevor du zur finalen Antwort kommst. Zeige deinen kompletten Denkweg.',
  'structured-output': '\n\n[AUSGABEFORMAT]\nStrukturiere deine Antwort klar mit:\n## Zusammenfassung\n## Hauptteil (mit Unterabschnitten)\n## Schlussfolgerungen\n## Nächste Schritte',
  'role-play': '\n\n[ROLLENSPIEL-MODUS AKTIVIERT]\nBleibe vollständig in deiner zugewiesenen Rolle. Antworte aus dieser Perspektive, nutze den entsprechenden Fachjargon und die typische Denkweise dieser Rolle.',
  'socratic': '\n\n[SOKRATISCHER DIALOG]\nNutze die sokratische Methode: Stelle klärende Fragen, hinterfrage Annahmen und führe durch gezieltes Fragen zum Kern der Wahrheit. Stelle am Ende 3 weiterführende Fragen.',
  'think-step': '\n\nDenke Schritt für Schritt. Beginne nicht mit der Antwort, sondern leite sie systematisch her.',
  'verify': '\n\nVerifiziere deine Faktenaussagen. Markiere unsichere Informationen als [UNVERIFIED]. Gib Quellen oder Begründungen für deine wichtigsten Behauptungen an.',
  'alternatives': '\n\nPräsentiere mindestens 3 verschiedene Alternativen oder Lösungsansätze. Diskutiere die Vor- und Nachteile jeder Option.',
  'pros-cons': '\n\nStelle eine ausgewogene Pro-Contra-Analyse bereit. Sei ehrlich über Schwächen und Stärken. Keine einseitige Darstellung.',
  'expert-level': '\n\nAntworte auf dem Niveau eines ausgewiesenen Experten. Nutze präzise Fachterminologie, gehe in die Tiefe und vermeide Vereinfachungen die die Genauigkeit beeinträchtigen.',
  'concise': '\n\nSei maximal prägnant. Kein Fülltext. Jedes Wort muss einen Mehrwert liefern. Kürze ist Stärke.',
  'tldr': '\n\nFüge am Ende eine TL;DR-Zusammenfassung in maximal 3 Sätzen hinzu.',
  'action-items': '\n\nLeite konkrete Action-Items ab. Jeder Punkt: Wer macht Was bis Wann. Format: ☑️ [Person] → [Aktion] → [Deadline]',
  'sources': '\n\nNenne die wichtigsten Quellen, Bücher, Studien oder Experten zu diesem Thema. Unterscheide zwischen bekannten Fakten und deinen Einschätzungen.',
  'eli5': '\n\nErkläre deine Antwort zusätzlich so, als würdest du sie einem neugierigen 5-Jährigen erklären. Nutze einfache Worte und lebhafte Analogien.',
  'timeline': '\n\nStelle die wichtigsten Punkte als chronologischen Zeitstrahl dar. Format: [ZEITPUNKT] → [EREIGNIS/SCHRITT]',
  'comparison': '\n\nErstelle eine übersichtliche Vergleichsmatrix/Tabelle mit den wichtigsten Kriterien. Klares Gewinner-Fazit am Ende.',
};

const LENGTH_LABELS = ['', 'Nano', 'Kurz', 'Mittel', 'Lang', 'Episch'];
const LENGTH_DESCRIPTORS = ['', 'in 1-2 Sätzen', 'in 2-4 Sätzen', 'mit angemessenem Umfang', 'ausführlich und tiefgehend', 'extrem detailliert und umfassend'];
