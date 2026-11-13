// HQ sync. Paste into script.google.com, change TOKEN, deploy as Web app.
const TOKEN = 'CHANGE-THIS-TO-YOUR-SECRET-CODE';

function ss_() {
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty('SSID');
  if (id) return SpreadsheetApp.openById(id);
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const again = p.getProperty('SSID');
    if (again) return SpreadsheetApp.openById(again);
    const s = SpreadsheetApp.create('HQ Data');
    p.setProperty('SSID', s.getId());
    return s;
  } finally { lock.releaseLock(); }
}
// Read-only: events from your main Google calendar, from..to as yyyy-MM-dd (to is exclusive).
function events_(from, to) {
  const cal = CalendarApp.getDefaultCalendar(), tz = cal.getTimeZone();
  const f = (d, p) => Utilities.formatDate(d, tz, p);
  return cal.getEvents(new Date(from + 'T00:00:00+07:00'), new Date(to + 'T00:00:00+07:00')).map(ev => {
    const a = ev.isAllDayEvent();
    return {
      id: ev.getId(), t: ev.getTitle(), a: a ? '1' : '0', loc: ev.getLocation() || '',
      s: a ? f(ev.getAllDayStartDate(), 'yyyy-MM-dd') : f(ev.getStartTime(), 'yyyy-MM-dd HH:mm'),
      e: a ? f(new Date(ev.getAllDayEndDate().getTime() - 1), 'yyyy-MM-dd') : f(ev.getEndTime(), 'yyyy-MM-dd HH:mm')
    };
  });
}
function sh_(n) { const s = ss_(); return s.getSheetByName(n) || s.insertSheet(n); }
function read_(n) {
  const v = sh_(n).getDataRange().getValues();
  if (v.length < 2) return [];
  const h = v[0];
  return v.slice(1).map(r => { const o = {}; h.forEach((k, i) => { if (k) o[k] = String(r[i]); }); return o; });
}
// Keeps two safety copies of a tab before it is overwritten: "_bak_<name>" (refreshed at most every
// 10 minutes, so a bad save can be undone) and "_day_<name>" (the state at the first save of each day).
// Copies are made inside Google Sheets (copyTo), which is far faster than reading and rewriting the data.
function backup_(n) {
  if (n.indexOf('_bak_') === 0 || n.indexOf('_day_') === 0) return;
  const s = ss_().getSheetByName(n);
  if (!s || s.getLastRow() < 2) return;
  const p = PropertiesService.getScriptProperties(), now = Date.now();
  const copy = (name) => { const b = sh_(name); b.clear(); s.getDataRange().copyTo(b.getRange(1, 1), { contentsOnly: true }); };
  const kb = 'bak_' + n;
  if (now - Number(p.getProperty(kb) || 0) > 10 * 60000) { copy('_bak_' + n); p.setProperty(kb, String(now)); }
  const kd = 'day_' + n, today = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd');
  if (p.getProperty(kd) !== today) { copy('_day_' + n); p.setProperty(kd, today); }
}
// Writes the new rows over the old ones, then clears whatever is left below or to the right.
// The tab is never empty in between, so reads do not need to wait for a save to finish.
function write_(n, rows) {
  backup_(n);
  const s = sh_(n);
  if (!rows.length) { s.clear(); return; }
  const h = [...new Set(rows.flatMap(r => Object.keys(r)))];
  const out = [h].concat(rows.map(r => h.map(k => r[k] == null ? '' : String(r[k]))));
  const g = s.getRange(1, 1, out.length, h.length);
  g.setNumberFormat('@'); g.setValues(out);
  const lr = s.getLastRow(), lc = s.getLastColumn();
  if (lr > out.length) s.getRange(out.length + 1, 1, lr - out.length, Math.max(lc, h.length)).clearContent();
  if (lc > h.length) s.getRange(1, h.length + 1, out.length, lc - h.length).clearContent();
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doGet(e) {
  try {
    if (e.parameter.token !== TOKEN) return json_({ error: 'token' });
    if (e.parameter.name === '_info') return json_({ rows: [{ id: ss_().getId(), url: ss_().getUrl(), v: 2 }] });
    if (e.parameter.name === '_rec') return json_(recs_());
    if (e.parameter.name === '_file') return json_(file_(e.parameter.id, Number(e.parameter.part) || 0));
    if (e.parameter.name === 'events') return json_({ rows: events_(e.parameter.from, e.parameter.to) });
    // Reads never wait for the lock: saves overwrite in place, so a tab is never empty mid-save.
    return json_({ rows: read_(e.parameter.name) });
  } catch (err) { return json_({ error: 'server', message: String(err) }); }
}
function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return json_({ error: 'bad-request' }); }
  if (b.token !== TOKEN) return json_({ error: 'token' });
  if (b.action === 'event') {
    // Add a meeting: default 2 hours on your main calendar (AJ Jonathan).
    const st = new Date(b.date + 'T' + b.time + ':00+07:00');
    CalendarApp.getDefaultCalendar().createEvent(b.title, st, new Date(st.getTime() + (b.minutes || 120) * 60000));
    return json_({ ok: true });
  }
  if (typeof b.name !== 'string' || !b.name || !Array.isArray(b.rows)) return json_({ error: 'bad-request' });
  try {
    ss_(); // make sure the sheet exists before taking the lock
    const lock = LockService.getScriptLock(); lock.waitLock(30000);
    try {
      // Never let an empty write wipe a tab that still has data (a safety copy is kept either way).
      const cur = ss_().getSheetByName(b.name);
      const had = cur ? Math.max(cur.getLastRow() - 1, 0) : 0;
      if (!b.rows.length && had >= 2 && !b.force) return json_({ error: 'empty-refused', had: had });
      write_(b.name, b.rows);
    } finally { lock.releaseLock(); }
    return json_({ ok: true });
  } catch (err) { return json_({ error: 'server', message: String(err) }); }
}

// Habit reminders: each habit with a time becomes a 15-minute event on a calendar called
// "HQ Habits" for the next 7 days, with a popup at start time. Only changes are written.
function syncHabits() {
  const tz = 'Asia/Jakarta', f = (d, p) => Utilities.formatDate(d, tz, p);
  const cals = CalendarApp.getCalendarsByName('HQ Habits');
  const cal = cals.length ? cals[0] : CalendarApp.createCalendar('HQ Habits');
  ss_();
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  let all; try { all = read_('habits'); } finally { lock.releaseLock(); }
  if (!all.length) return; // empty or unreadable tab: leave the calendar alone, never delete events
  const habits = all.filter(h => h.name && h.time);
  const want = {};
  for (let i = 0; i < 7; i++) {
    const day = new Date(Date.now() + i * 864e5), ds = f(day, 'yyyy-MM-dd'), wd = Number(f(day, 'u'));
    habits.forEach(h => {
      const x = String(h.days || '').toLowerCase().replace(/\s/g, '');
      if (x && x !== 'daily' && x !== 'setiap hari' && x.split(',').indexOf(String(wd)) < 0) return;
      const tm = String(h.time).replace('.', ':').padStart(5, '0');
      want[(h.id || h.name) + '|' + ds] = { title: h.name, start: new Date(ds + 'T' + tm + ':00+07:00'), sig: h.name + '|' + tm };
    });
  }
  const from = new Date(Date.now() - 864e5), to = new Date(Date.now() + 9 * 864e5), have = {};
  cal.getEvents(from, to).forEach(ev => {
    const k = ev.getTag('k'), sig = ev.getTag('sig');
    if (k && want[k] && want[k].sig === sig && !have[k]) have[k] = true; else ev.deleteEvent();
  });
  Object.keys(want).forEach(k => {
    if (have[k]) return;
    const w = want[k];
    if (w.start.getTime() < Date.now() - 36e5) return;
    const ev = cal.createEvent(w.title, w.start, new Date(w.start.getTime() + 15 * 60000));
    ev.setTag('k', k); ev.setTag('sig', w.sig); ev.removeAllReminders(); ev.addPopupReminder(0);
  });
}
// Run once from the editor: asks for permissions and schedules syncHabits every hour.
function setup() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('syncHabits').timeBased().everyHours(1).create();
  syncHabits();
}

// ---- Library and Recordings: sends one 3 MB piece of a file from the Drive folders below ----
const EBOOKS_FOLDER = '1gJu91UUigdbea4N9M51dfzsTYOVUMw0E';
const RECORDINGS_FOLDER = '1pqRUoKIHG8eKSQWMWPq1o-Syu2Wvxcv1'; // Drive folder "Meeting Recordings"
function inFolders_(f) {
  const ps = f.getParents();
  while (ps.hasNext()) { const id = ps.next().getId(); if (id === EBOOKS_FOLDER || id === RECORDINGS_FOLDER) return true; }
  return false;
}
function file_(id, part) {
  const f = DriveApp.getFileById(id);
  if (!inFolders_(f)) return { error: 'not-in-folder' };
  const size = f.getSize(), CH = 3 * 1024 * 1024, n = Math.max(1, Math.ceil(size / CH));
  if (part < 0 || part >= n) return { error: 'bad-request' };
  const a = part * CH, b = Math.min(size, a + CH) - 1;
  const r = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + id + '?alt=media',
    { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), Range: 'bytes=' + a + '-' + b }, muteHttpExceptions: true });
  const c = r.getResponseCode();
  if (c >= 300) return { error: 'server', message: 'Drive answered ' + c };
  if (c === 200 && n > 1) return { error: 'server', message: 'Drive ignored the range' };
  return { n: n, part: part, size: size, mime: f.getMimeType(), data: Utilities.base64Encode(r.getContent()) };
}
// Lists the audio and video files in the "Meeting Recordings" folder, newest first.
function recs_() {
  const folder = DriveApp.getFolderById(RECORDINGS_FOLDER), it = folder.getFiles(), out = [];
  while (it.hasNext()) {
    const f = it.next(), m = f.getMimeType(), nm = f.getName();
    if (/^(audio|video)\//.test(m) || /\.(m4a|mp3|mp4|wav|aac|mov|caf|m4v)$/i.test(nm))
      out.push({ id: f.getId(), name: nm, size: f.getSize(), mime: m, ts: f.getDateCreated().getTime() });
  }
  out.sort((a, b) => b.ts - a.ts);
  return { rows: out, folder: folder.getUrl() };
}
// Run this once in the Apps Script editor to give the script permission to read Drive.
function authDrive() { DriveApp.getFolderById(EBOOKS_FOLDER).getName(); DriveApp.getFolderById(RECORDINGS_FOLDER).getName(); }
