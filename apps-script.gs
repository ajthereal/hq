// HQ sync. Paste into script.google.com, change TOKEN, deploy as Web app.
const TOKEN = 'GANTI-DENGAN-KODE-RAHASIA-KAMU';

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
function write_(n, rows) {
  const s = sh_(n); s.clear();
  if (!rows.length) return;
  const h = [...new Set(rows.flatMap(r => Object.keys(r)))];
  const out = [h].concat(rows.map(r => h.map(k => r[k] == null ? '' : String(r[k]))));
  const g = s.getRange(1, 1, out.length, h.length);
  g.setNumberFormat('@'); g.setValues(out);
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doGet(e) {
  if (e.parameter.token !== TOKEN) return json_({ error: 'token' });
  if (e.parameter.name === 'events') return json_({ rows: events_(e.parameter.from, e.parameter.to) });
  return json_({ rows: read_(e.parameter.name) });
}
function doPost(e) {
  const b = JSON.parse(e.postData.contents);
  if (b.token !== TOKEN) return json_({ error: 'token' });
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try { write_(b.name, b.rows); } finally { lock.releaseLock(); }
  return json_({ ok: true });
}
