/*
 * KEAM 2026 Mock Test Portal Main Logic
 * Extracted from index.html for modularization
 * All exam logic, state, and UI rendering
 */

// CONSTANTS & SECTION DEFINITIONS
const EXAM_DURATION_MS = 3 * 60 * 60 * 1000; // Strict 3 hours in milliseconds
const SESSION_KEY = 'keam_session_2026';

const SECTIONS = [
  { name: 'Physics',     short: 'PHY', count: 45, badge: 'badge-phy', color: '#8b5cf6' },
  { name: 'Chemistry',   short: 'CHE', count: 30, badge: 'badge-che', color: '#f87171' },
  { name: 'Mathematics', short: 'MAT', count: 75, badge: 'badge-mat', color: '#f59e0b' },
];

let QUESTIONS = [];
let state = {
  current: 0,
  answers: [],
  visited: [],
  marked: [],
  timerInterval: null,
  endTime: null,       // epoch ms — the source of truth for time
  submitted: false,
};

function transformKeamData(rows) {
  if (!Array.isArray(rows)) return rows;
  if (rows.length > 0 && rows[0].options) return rows;
  const keyMap = { A: 0, B: 1, C: 2, D: 3, E: 4 };
  return rows.map(row => ({
    subject: row.subject || row.Subject || '',
    question: row.question || row.Question || '',
    options: [
      row.A || row.option_a || '',
      row.B || row.option_b || '',
      row.C || row.option_c || '',
      row.D || row.option_d || '',
      row.E || row.option_e || '',
    ].filter(Boolean),
    answer: typeof keyMap[(row.answer || row.Answer || '').toUpperCase()] !== 'undefined'
      ? keyMap[(row.answer || row.Answer || '').toUpperCase()]
      : parseInt(row.answer || '0') || 0,
  }));
}

function getSubjectShort(subjectName) {
  const name = (subjectName || '').toLowerCase();
  if (name.includes('phy')) return 'PHY';
  if (name.includes('che')) return 'CHE';
  return 'MAT';
}

async function loadQuestions() {
  try {
    const data = await window.dataController.fetchData('KEAM_QUESTIONS', transformKeamData);
    const raw = data && data.questions ? data.questions : (Array.isArray(data) ? data : []);

    QUESTIONS = raw.map(q => ({
      ...q,
      section: getSubjectShort(q.subject),
      sectionName: q.subject || '',
    }));

    if (QUESTIONS.length === 0) throw new Error('No questions found in data source.');

    const total = QUESTIONS.length;
    document.querySelector('.stat-card .stat-num').textContent = total;
    document.getElementById('hdr-rem').textContent = total;
    document.getElementById('p-skip').textContent = total;
    document.getElementById('modal-total').textContent = total;

    // ── CHECK FOR AN ACTIVE SESSION ──
    const saved = loadSession();
    if (saved && saved.total === total && saved.endTime && saved.endTime > Date.now()) {
      state.answers  = saved.answers;
      state.marked   = saved.marked;
      state.visited  = saved.visited;
      state.current  = saved.current || 0;
      state.endTime  = saved.endTime;
      resumeExam();
      return;
    }
    if (saved && saved.total === total && saved.endTime && saved.endTime <= Date.now()) {
      state.answers  = saved.answers;
      state.marked   = saved.marked;
      state.visited  = saved.visited;
      state.endTime  = saved.endTime;
      submitExam();
      return;
    }
    document.getElementById('load-status').style.display = 'none';
    document.getElementById('start-btn').style.display = 'inline-block';
    document.getElementById('start-btn').disabled = false;
    document.getElementById('start-note').style.display = 'block';
  } catch (err) {
    console.error('[KEAM] Question loading failed:', err);
    document.getElementById('load-status').innerHTML = `
      <div style="color:var(--red-warn); font-family:var(--mono); font-size:0.85rem;">
        ⚠ Failed to load questions: ${err.message}<br>
        <button onclick=\"loadQuestions()\" style=\"margin-top:0.75rem; padding:0.4rem 1rem; background:var(--accent); color:white; border:none; border-radius:6px; cursor:pointer; font-family:var(--font); font-weight:600;\">Retry</button>
      </div>
    `;
  }
}

function startExam() {
  state.endTime = Date.now() + EXAM_DURATION_MS;
  const total = QUESTIONS.length;
  state.answers  = new Array(total).fill(-1);
  state.visited  = new Array(total).fill(false);
  state.marked   = new Array(total).fill(false);
  state.current  = 0;
  state.visited[0] = true;
  state.submitted = false;
  saveSession();
  showExamUI();
}
function resumeExam() {
  state.submitted = false;
  showExamUI();
}
function showExamUI() {
  document.getElementById('landing').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  const examEl = document.getElementById('exam');
  examEl.style.display = 'flex';
  buildSectionTabs();
  buildPalette();
  renderQuestion();
  updateHeader();
  startTimer();
}
function buildSectionTabs() {
  const el = document.getElementById('section-tabs');
  let start = 0;
  el.innerHTML = SECTIONS.map((sec, i) => {
    const html = `<button class=\"sec-tab ${i===0?'active':''}\" id=\"sectab-${i}\" onclick=\"jumpToSection(${start})\">${sec.name} (${sec.count})</button>`;
    start += sec.count;
    return html;
  }).join('');
}
function jumpToSection(idx) {
  state.current = Math.min(idx, QUESTIONS.length - 1);
  state.visited[state.current] = true;
  renderQuestion();
  updatePalette();
}
function navigate(dir) {
  const next = state.current + dir;
  if (next < 0 || next >= QUESTIONS.length) return;
  state.current = next;
  state.visited[next] = true;
  renderQuestion();
  updatePalette();
}
function jumpTo(i) {
  state.current = i;
  state.visited[i] = true;
  renderQuestion();
  updatePalette();
}

function renderQuestion() {
  const q = QUESTIONS[state.current];
  const i = state.current;
  if (!q) return;
  document.getElementById('q-num').textContent = `Question ${i + 1} of ${QUESTIONS.length}`;
  const sec = SECTIONS.find(s => s.short === q.section) || SECTIONS[0];
  const badge = document.getElementById('q-badge');
  badge.textContent = q.section;
  badge.className = `q-subject-badge ${sec.badge}`;
  document.getElementById('q-text').textContent = q.question;
  const opts = document.getElementById('options-list');
  const keys = ['A', 'B', 'C', 'D', 'E'];
  opts.innerHTML = (q.options || []).map((opt, j) => `
    <button class=\"option-btn ${state.answers[i] === j ? 'selected' : ''}\" onclick=\"selectAnswer(${j})\">\n      <span class=\"option-key\">${keys[j]}</span>\n      <span>${opt}</span>\n    </button>\n  `).join('');
  let start = 0;
  SECTIONS.forEach((s, si) => {
    const tab = document.getElementById(`sectab-${si}`);
    if (tab) tab.classList.toggle('active', i >= start && i < start + s.count);
    start += s.count;
  });
  document.querySelector('.q-area').scrollTo({ top: 0, behavior: 'smooth' });
  saveSession();
}
function selectAnswer(j) {
  state.answers[state.current] = j;
  renderQuestion();
  updatePalette();
  updateHeader();
}
function markForReview() {
  state.marked[state.current] = !state.marked[state.current];
  updatePalette();
  saveSession();
}
function clearAnswer() {
  state.answers[state.current] = -1;
  renderQuestion();
  updatePalette();
  updateHeader();
}

function buildPalette() {
  const container = document.getElementById('palette-container');
  let html = '';
  let start = 0;
  SECTIONS.forEach((sec, si) => {
    html += `<div class=\"palette-section-label\" style=\"margin-top:${si>0?'0.5rem':'0'}\">${sec.name}</div>`;
    html += `<div class=\"palette-grid\">`;
    for (let i = start; i < start + sec.count && i < QUESTIONS.length; i++) {
      html += `<button class=\"pal-btn\" id=\"pal-${i}\" onclick=\"jumpTo(${i})\">${i+1}</button>`;
    }
    html += `</div>`;
    start += sec.count;
  });
  container.innerHTML = html;
  updatePalette();
}
function updatePalette() {
  let answered = 0, notAnswered = 0, marked = 0, notVisited = 0;
  for (let i = 0; i < QUESTIONS.length; i++) {
    const btn = document.getElementById(`pal-${i}`);
    if (!btn) continue;
    btn.className = 'pal-btn';
    if (i === state.current) btn.classList.add('current');
    if (state.marked[i]) { btn.classList.add('marked'); marked++; }
    else if (state.answers[i] !== -1) { btn.classList.add('answered'); answered++; }
    else if (state.visited[i]) { btn.classList.add('not-answered'); notAnswered++; }
    else { notVisited++; }
  }
  document.getElementById('p-ans').textContent  = answered;
  document.getElementById('p-not').textContent  = notAnswered;
  document.getElementById('p-mrk').textContent  = marked;
  document.getElementById('p-skip').textContent = notVisited;
}
function updateHeader() {
  const answered = state.answers.filter(a => a !== -1).length;
  document.getElementById('hdr-ans').textContent = answered;
  document.getElementById('hdr-rem').textContent = QUESTIONS.length - answered;
}

function startTimer() {
  clearInterval(state.timerInterval);
  const el = document.getElementById('timer');
  const tick = () => {
    const remaining = Math.max(0, state.endTime - Date.now());
    const totalSecs = Math.floor(remaining / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if (totalSecs <= 120)      el.className = 'timer danger';
    else if (totalSecs <= 600) el.className = 'timer warn';
    else                        el.className = 'timer';
    if (remaining <= 0) {
      clearInterval(state.timerInterval);
      submitExam();
    }
  };
  tick();
  state.timerInterval = setInterval(tick, 500);
}

function openSubmitModal() {
  const answered = state.answers.filter(a => a !== -1).length;
  document.getElementById('modal-ans').textContent = answered;
  document.getElementById('submit-modal').classList.add('open');
}
function closeSubmitModal() {
  document.getElementById('submit-modal').classList.remove('open');
}
function submitExam() {
  if (state.submitted) return;
  state.submitted = true;
  clearInterval(state.timerInterval);
  closeSubmitModal();
  clearSession();
  showResults();
}

function showResults() {
  document.getElementById('exam').style.display = 'none';
  document.getElementById('result').style.display = 'block';
  let totalScore = 0, totalCorrect = 0, totalWrong = 0, totalSkip = 0;
  const sectionData = SECTIONS.map(sec => ({
    name: sec.name, color: sec.color,
    correct: 0, wrong: 0, skip: 0,
    total: sec.count, maxMarks: sec.count * 4
  }));
  let qIdx = 0;
  SECTIONS.forEach((sec, si) => {
    for (let i = 0; i < sec.count && qIdx < QUESTIONS.length; i++, qIdx++) {
      const q = QUESTIONS[qIdx];
      const ans = state.answers[qIdx];
      if (ans === -1) {
        totalSkip++; sectionData[si].skip++;
      } else if (ans === q.answer) {
        totalCorrect++; totalScore += 4; sectionData[si].correct++;
      } else {
        totalWrong++; totalScore -= 1; sectionData[si].wrong++;
      }
    }
    sectionData[si].score = sectionData[si].correct * 4 - sectionData[si].wrong;
  });
  document.getElementById('r-score').textContent   = totalScore;
  document.getElementById('r-correct').textContent = totalCorrect;
  document.getElementById('r-wrong').textContent   = totalWrong;
  document.getElementById('r-skip').textContent    = totalSkip;
  const acc = (totalCorrect + totalWrong) > 0 ? Math.round(totalCorrect / (totalCorrect + totalWrong) * 100) : 0;
  document.getElementById('r-acc').textContent = acc + '%';
  const pct = totalScore / 600;
  document.getElementById('r-title').textContent = pct >= 0.75 ? '🎉 Excellent Performance!' : pct >= 0.5  ? '👍 Good Effort!' : pct >= 0.3  ? '📚 Keep Practising!' : '📖 Review & Revise!';
  const circumference = 377;
  setTimeout(() => {
    document.getElementById('score-arc').style.strokeDashoffset = circumference - (Math.max(0, pct) * circumference);
  }, 100);
  document.getElementById('section-results').innerHTML = sectionData.map(s => {
    const barPct = Math.max(0, s.score / s.maxMarks * 100);
    return `
      <div class=\"sec-result-card\">\n        <div class=\"sec-res-head\">\n          <div class=\"sec-res-name\">${s.name}</div>\n          <div class=\"sec-res-score\" style=\"color:${s.color}\">${s.score} / ${s.maxMarks}</div>\n        </div>\n        <div style=\"display:flex;gap:1rem;font-size:0.75rem;color:var(--muted);margin-bottom:0.6rem;font-family:var(--mono)\">\n          <span style=\"color:var(--green)\">✓ ${s.correct}</span>\n          <span style=\"color:var(--red-warn)\">✗ ${s.wrong}</span>\n          <span>○ ${s.skip} skipped</span>\n        </div>\n        <div class=\"sec-bar\">\n          <div class=\"sec-bar-fill\" style=\"width:${barPct}%;background:${s.color}\"></div>\n        </div>\n      </div>\n    `;
  }).join('');
  renderAnswerReview();
}

const KEYS = ['A', 'B', 'C', 'D', 'E'];
function renderAnswerReview(filter = 'all') {
  const list = document.getElementById('review-list');
  list.innerHTML = QUESTIONS.map((q, i) => {
    const picked   = state.answers[i];
    const correct  = q.answer;
    const isCorrect = picked === correct;
    const isSkip    = picked === -1;
    const isWrong   = !isCorrect && !isSkip;
    if (filter === 'correct' && !isCorrect) return '';
    if (filter === 'wrong'   && !isWrong)   return '';
    if (filter === 'skip'    && !isSkip)     return '';
    const statusClass = isCorrect ? 'rs-correct' : isSkip ? 'rs-skip' : 'rs-wrong';
    const statusLabel = isCorrect ? '✓ Correct'  : isSkip ? '○ Skipped' : '✗ Wrong';
    const optionsHTML = (q.options || []).map((opt, j) => {
      let cls = '';
      if (j === correct) cls = 'correct';
      else if (j === picked) cls = 'wrong-pick';
      return '<div class=\"review-opt ' + cls + '\">' + '<span class=\"review-opt-key\">' + KEYS[j] + '</span>' + '<span>' + opt + '</span>' + '</div>';
    }).join('');
    return '<div class=\"review-item\">' + '<div class=\"review-item-header\">' + '<span class=\"review-q-num\">Q' + (i + 1) + '</span>' + '<span class=\"review-q-text\">' + q.question + '</span>' + '<span class=\"review-status ' + statusClass + '\">' + statusLabel + '</span>' + '</div>' + '<div class=\"review-options\">' + optionsHTML + '</div>' + '</div>';
  }).join('');
  if (!list.innerHTML.trim()) {
    list.innerHTML = '<div style=\"padding:2rem;text-align:center;color:var(--muted);font-family:var(--mono);font-size:0.8rem;\">No questions in this category.</div>';
  }
}
function filterReview(type, btn) {
  document.querySelectorAll('.review-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAnswerReview(type);
}

function saveSession() {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      total:    QUESTIONS.length,
      current:  state.current,
      answers:  state.answers,
      marked:   state.marked,
      visited:  state.visited,
      endTime:  state.endTime,
    }));
  } catch (e) { /* storage full or unavailable */ }
}
function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function restartExam() {
  clearInterval(state.timerInterval);
  clearSession();
  state = {
    current: 0,
    answers: new Array(QUESTIONS.length).fill(-1),
    visited: new Array(QUESTIONS.length).fill(false),
    marked:  new Array(QUESTIONS.length).fill(false),
    timerInterval: null,
    endTime: null,
    submitted: false,
  };
  state.visited[0] = true;
  document.getElementById('result').style.display = 'none';
  document.getElementById('exam').style.display = 'none';
  document.getElementById('landing').style.display = 'flex';
}

window.addEventListener('DOMContentLoaded', loadQuestions);