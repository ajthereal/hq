// HQ Telegram reminders. Add this as a second file ("telegram") in the same Apps Script project as apps-script.gs.
// 1. Paste your bot token from @BotFather between the quotes below.
// 2. Open your bot in Telegram and tap Start (or send it any message).
// 3. Choose telegramSetup in the function menu and press Run. You get a test message when it works.
// The token stays in your own Apps Script, never in the public HQ repo.
const TG_BOT = 'PASTE-YOUR-BOT-TOKEN-HERE';

const TG_TZ = 'Asia/Jakarta', TG_URL = 'https://ajthereal.github.io/hq/', TG_PEOPLE = 3, TG_NAMES = 2;
const TG_JOBS = ['tgMorning', 'tgMidday', 'tgEvening'];

function telegramSetup() {
  if (!TG_BOT || TG_BOT.indexOf('PASTE') === 0) throw new Error('Paste your bot token on line 6 first, then Run again.');
  const p = PropertiesService.getScriptProperties();
  const up = tgApi_('getUpdates', {});
  const msgs = (up.result || []).map(u => u.message || u.my_chat_member || {}).filter(m => m.chat);
  if (!msgs.length) throw new Error('Open your bot in Telegram, tap Start or send it any message, then Run again.');
  p.setProperty('TG_CHAT', String(msgs[msgs.length - 1].chat.id));
  ScriptApp.getProjectTriggers().forEach(t => { if (TG_JOBS.indexOf(t.getHandlerFunction()) > -1) ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('tgMorning').timeBased().everyDays(1).atHour(6).nearMinute(45).inTimezone(TG_TZ).create();
  ScriptApp.newTrigger('tgMidday').timeBased().everyDays(1).atHour(13).nearMinute(0).inTimezone(TG_TZ).create();
  ScriptApp.newTrigger('tgEvening').timeBased().everyDays(1).atHour(20).nearMinute(30).inTimezone(TG_TZ).create();
  tgSend_('setup', 'HQ reminders are on.\nMorning plan around 06:45, a midday check around 13:00 if you are behind, and an evening wrap around 20:30 if something is left.');
}

// ---------- the three messages ----------
function tgMorning() {
  const d = tgDay_(), lines = [];
  const hab = d.habits.length, ev = d.events.length;
  lines.push('<b>' + tgEsc_(d.title) + '</b>');
  lines.push([hab + (hab === 1 ? ' habit' : ' habits'), ev + (ev === 1 ? ' meeting' : ' meetings'), d.overdue.length + ' overdue'].join(' · '));
  if (ev) lines.push('First: ' + tgEsc_(d.events[0].time + ' ' + d.events[0].t));
  if (d.follow.length) lines.push('Reach today (' + d.follow.length + ' due): ' + tgEsc_(d.follow.slice(0, 5).map(p => p.name).join(', ')));
  if (d.bdays.length) lines.push('Birthday: ' + tgEsc_(d.bdays.join(', ')));
  lines.push('Goal: ' + TG_PEOPLE + ' people, ' + TG_NAMES + ' new names.');
  tgSend_('morning', lines.join('\n'));
}
function tgMidday() {
  const d = tgDay_();
  if (d.reached >= TG_PEOPLE && d.names >= TG_NAMES) return tgLog_('midday', 'quiet', 'on track');
  const lines = ['<b>Midday check</b>', d.reached + ' of ' + TG_PEOPLE + ' people reached, ' + d.names + ' of ' + TG_NAMES + ' new names.'];
  const next = d.follow.filter(p => !p.today);
  if (d.reached < TG_PEOPLE && next.length) lines.push('Next up: ' + tgEsc_(next.slice(0, 2).map(p => p.name).join(', ')));
  tgSend_('midday', lines.join('\n'));
}
function tgEvening() {
  const d = tgDay_(), left = d.habits.filter(h => !h.done), lines = ['<b>Evening wrap</b>'];
  if (d.overdue.length) lines.push(d.overdue.length + ' overdue: ' + tgEsc_(d.overdue.slice(0, 3).join(', ')));
  if (d.nodate) lines.push(d.nodate + ' without a date');
  if (left.length) lines.push(left.length + (left.length === 1 ? ' habit' : ' habits') + ' left: ' + tgEsc_(left.slice(0, 3).map(h => h.name).join(', ')));
  if (d.reached < TG_PEOPLE) lines.push(d.reached + ' of ' + TG_PEOPLE + ' people reached. Talked to someone? Log it so tomorrow\'s list is right.');
  if (lines.length === 1) return tgLog_('evening', 'quiet', 'all clear');
  tgSend_('evening', lines.join('\n'));
}

// ---------- today's numbers, read the same way HQ reads them ----------
function tgDay_() {
  const now = new Date(), f = (x, p) => Utilities.formatDate(x, TG_TZ, p);
  const iso = f(now, 'yyyy-MM-dd'), td = tgDn_(iso), wd = Number(f(now, 'u'));
  const tasks = read_('tasks').filter(r => r.t && r.done !== 'true');
  const dayOf = r => r.date ? tgDn_(r.date) : (r.day === '' || r.day == null || isNaN(Number(r.day)) ? null : Number(r.day));
  const overdue = tasks.filter(r => { const x = dayOf(r); return x != null && x < td; }).map(r => r.t);
  const nodate = tasks.filter(r => dayOf(r) == null).length;
  const log = read_('habitlog');
  const habits = read_('habits').filter(h => h.name).map((h, i) => {
    const id = h.id || ('h' + i + '-' + h.name.toLowerCase().replace(/[^a-z0-9]+/g, ''));
    const x = String(h.days || '').toLowerCase().replace(/\s/g, '');
    const due = !x || x === 'daily' || x === 'setiap hari' || x.split(',').indexOf(String(wd)) > -1;
    return { name: h.name, due: due, done: log.some(l => l.date === iso && l.hid === id) };
  }).filter(h => h.due);
  const cal = CalendarApp.getDefaultCalendar();
  const events = cal.getEventsForDay(now).filter(e => !e.isAllDayEvent()).map(e => ({ t: e.getTitle(), time: f(e.getStartTime(), 'HH.mm') }));
  const ppl = read_('people');
  const touched = {};
  read_('touchlog').forEach(x => { if (x.date === iso) touched[x.pid] = 1; });
  const follow = ppl.filter(p => p.name && p.stage !== 'Not Now' && p.nextDate && tgDn_(p.nextDate) != null && tgDn_(p.nextDate) <= td)
    .map(p => ({ name: String(p.name).trim(), late: td - tgDn_(p.nextDate), today: p.lastContact === iso }))
    .sort((a, b) => b.late - a.late);
  const bdays = ppl.filter(p => p.name && tgBday_(p.birthday, now)).map(p => String(p.name).trim());
  return {
    title: f(now, 'EEEE d MMM'), overdue: overdue, nodate: nodate, habits: habits, events: events, follow: follow, bdays: bdays,
    reached: Object.keys(touched).length, names: ppl.filter(p => p.added === iso).length
  };
}
function tgDn_(s) { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? Math.floor(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5) : null; }
// Accepts 2026-11-24, 24-11, 24/11/1985 or 24 Nov.
function tgBday_(b, now) {
  b = String(b || '').trim().toLowerCase(); if (!b) return false;
  const dd = Number(Utilities.formatDate(now, TG_TZ, 'd')), mm = Number(Utilities.formatDate(now, TG_TZ, 'M'));
  const mn = { jan: 1, feb: 2, mar: 3, apr: 4, mei: 5, may: 5, jun: 6, jul: 7, agu: 8, aug: 8, ags: 8, sep: 9, okt: 10, oct: 10, nov: 11, des: 12, dec: 12 };
  let m = b.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if (m) return +m[3] === dd && +m[2] === mm;
  m = b.match(/^(\d{1,2})[-\/.](\d{1,2})/); if (m) return +m[1] === dd && +m[2] === mm;
  m = b.match(/^(\d{1,2})\s*([a-z]{3})/); if (m) return +m[1] === dd && mn[m[2]] === mm;
  return false;
}

// ---------- sending, and a log HQ can show ----------
function tgEsc_(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function tgApi_(method, body) {
  const r = UrlFetchApp.fetch('https://api.telegram.org/bot' + TG_BOT + '/' + method, {
    method: 'post', contentType: 'application/json', payload: JSON.stringify(body), muteHttpExceptions: true });
  let j = {}; try { j = JSON.parse(r.getContentText()); } catch (e) {}
  if (!j.ok) throw new Error('Telegram said: ' + (j.description || ('HTTP ' + r.getResponseCode())));
  return j;
}
function tgSend_(kind, text) {
  try {
    const chat = PropertiesService.getScriptProperties().getProperty('TG_CHAT');
    if (!chat) throw new Error('No chat linked yet. Run telegramSetup.');
    tgApi_('sendMessage', { chat_id: chat, text: text, parse_mode: 'HTML', disable_web_page_preview: true,
      reply_markup: { inline_keyboard: [[{ text: 'Open HQ', url: TG_URL }]] } });
    tgLog_(kind, 'sent', '');
  } catch (e) { tgLog_(kind, 'failed', String(e.message || e)); throw e; }
}
function tgLog_(kind, status, note) {
  const s = sh_('tglog');
  if (s.getLastRow() < 1) s.getRange(1, 1, 1, 4).setValues([['time', 'kind', 'status', 'note']]);
  s.getRange(s.getLastRow() + 1, 1, 1, 4).setNumberFormat('@')
    .setValues([[Utilities.formatDate(new Date(), TG_TZ, 'yyyy-MM-dd HH:mm'), kind, status, String(note).slice(0, 200)]]);
}
