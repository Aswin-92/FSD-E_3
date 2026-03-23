/**
 * RTESE - Real-Time Event Synchronization Engine
 * Core JS Module (ES6+ / vanilla)
 */

'use strict';

const API_BASE     = 'php/';
const POLL_MS      = 2500;
const HEARTBEAT_MS = 15000;
const MAX_FEED     = 120;

const state = {
  user:       null,
  channel:    { id: 1, name: 'general', color: '#22D3EE' },
  channels:   [],
  users:      [],
  events:     [],
  lastSince:  null,
  pollTimer:  null,
  hbTimer:    null,
  paused:     false,
  eventCount: 0,
};

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

async function api(file, params = {}, method = 'GET', body = null) {
  const url = new URL(API_BASE + file, location.href);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function login(username, password) {
  const data = await api('users.php', { action: 'login', username, password });
  state.user = data.user;
  document.getElementById('login-overlay').style.display = 'none';
  initApp();
}

async function initApp() {
  renderUserBadge();
  await loadChannels();
  await loadUsers();
  await loadStats();
  startHeartbeat();
  setStatus(true);
}

function renderUserBadge() {
  const u  = state.user;
  const el = $('#user-badge');
  el.innerHTML =
    '<span class="avatar" style="background:' + u.avatar_color + '">' + u.username[0].toUpperCase() + '</span>' +
    '<span>' + u.username + '</span>' +
    '<span style="color:var(--text-dim);font-size:9px">[' + u.role + ']</span>';
}

async function loadChannels() {
  const data = await api('users.php', { action: 'channels' });
  state.channels = data.channels;
  renderChannels();
  selectChannel(state.channels[0]);
}

function renderChannels() {
  const list = $('#channel-list');
  list.innerHTML = state.channels.map(function(ch) {
    var isActive = ch.id === state.channel.id ? ' active' : '';
    return '<div class="channel-item' + isActive + '" data-id="' + ch.id + '" onclick="selectChannelById(' + ch.id + ')">' +
           '<span class="channel-dot" style="background:' + ch.color + '"></span>' +
           '<span>#' + ch.name + '</span>' +
           '<span class="channel-badge">' + ch.event_count + '</span>' +
           '</div>';
  }).join('');
}

function selectChannelById(id) {
  var ch = state.channels.find(function(c) { return c.id === id; });
  if (ch) selectChannel(ch);
}

function selectChannel(ch) {
  if (!ch) return;
  state.channel   = ch;
  state.events    = [];
  state.lastSince = null;
  $('#stream-title').textContent = '#' + ch.name;
  $('#stream-meta').textContent  = ch.description || '';
  $('#event-feed').innerHTML     = '';
  renderChannels();
  restartPoller();
}

async function loadUsers() {
  const data = await api('users.php', { action: 'list' });
  state.users = data.users;
  renderUsers();
}

function renderUsers() {
  const list = $('#user-list');
  list.innerHTML = state.users.map(function(u) {
    return '<div class="user-item">' +
           '<div class="online-ring' + (u.is_online ? ' online' : '') + '">' +
           '<span class="avatar" style="background:' + u.avatar_color + ';width:20px;height:20px;font-size:9px">' +
           u.username[0].toUpperCase() + '</span></div>' +
           '<span>' + u.username + '</span>' +
           '<span style="font-size:9px;color:var(--text-dim);margin-left:auto">' + u.role + '</span>' +
           '</div>';
  }).join('');
}

function restartPoller() {
  clearTimeout(state.pollTimer);
  poll();
}

async function poll() {
  if (state.paused) { state.pollTimer = setTimeout(poll, POLL_MS); return; }
  try {
    const since = state.lastSince || new Date(Date.now() - 10000).toISOString().slice(0, 23);
    const data  = await api('events.php', {
      action:     'poll',
      channel_id: state.channel.id,
      since:      since,
    });
    if (data.events && data.events.length) {
      state.lastSince = data.server_ts;
      data.events.forEach(addEvent);
      updateStats();
    }
  } catch (e) {
    logEntry('error', 'Poll failed: ' + e.message);
  }
  state.pollTimer = setTimeout(poll, POLL_MS);
}

const TYPE_COLORS = {
  message:   { bg: 'var(--bg-hover)',  fg: 'var(--text-muted)' },
  alert:     { bg: 'var(--red-dim)',   fg: 'var(--red)'        },
  deploy:    { bg: 'var(--amber-dim)', fg: 'var(--amber)'      },
  analytics: { bg: 'var(--cyan-dim)',  fg: 'var(--cyan)'       },
  heartbeat: { bg: 'var(--green-dim)', fg: 'var(--green)'      },
  error:     { bg: 'var(--red-dim)',   fg: 'var(--red)'        },
};

function addEvent(ev) {
  state.events.push(ev);
  state.eventCount++;

  const feed    = $('#event-feed');
  const color   = TYPE_COLORS[ev.type] || TYPE_COLORS.message;
  const payload = ev.payload;
  const msg     = payload.message || payload.text || JSON.stringify(payload);
  const ts      = new Date(ev.created_at).toLocaleTimeString();

  const card = document.createElement('div');
  card.className  = 'event-card new';
  card.dataset.id = ev.id;
  card.innerHTML  =
    '<div><span class="event-type-badge" style="background:' + color.bg + ';color:' + color.fg + '">' + ev.type + '</span></div>' +
    '<div class="event-body">' +
    '<div class="event-username" style="color:' + (ev.avatar_color || 'var(--cyan)') + '">' + ev.username + '</div>' +
    '<div class="event-payload">' + escHtml(msg) + '</div>' +
    '</div>' +
    '<div class="event-meta">' +
    '<div>' + ts + '</div>' +
    '<div class="event-status status-' + ev.status + '">' + ev.status + '</div>' +
    '<div style="margin-top:4px"><button onclick="ackEvent(' + ev.id + ')" class="btn" style="padding:2px 6px;font-size:9px">ACK</button></div>' +
    '</div>';

  feed.insertBefore(card, feed.firstChild);
  setTimeout(function() { card.classList.remove('new'); }, 800);
  while (feed.children.length > MAX_FEED) feed.removeChild(feed.lastChild);

  logEntry(ev.type, '[' + ev.username + '] ' + msg.slice(0, 60));
  addTicker(ev.username + ' -> ' + ev.type + ': ' + msg.slice(0, 40));
}

async function ackEvent(eventId) {
  try {
    await api('events.php', { action: 'ack' }, 'POST', {
      event_id: eventId,
      user_id:  state.user.id,
    });
    const card = $('[data-id="' + eventId + '"]');
    if (card) {
      const s = $('.event-status', card);
      if (s) { s.textContent = 'acknowledged'; s.className = 'event-status status-acknowledged'; }
    }
    toast('Event acknowledged', 'success');
  } catch (e) {
    toast('ACK failed: ' + e.message, 'error');
  }
}

async function publishEvent() {
  const msgEl = $('#compose-message');
  const msg   = msgEl.value.trim();
  if (!msg) { toast('Message cannot be empty', 'error'); return; }

  const typeEl = document.querySelector('.type-chip.selected');
  const type   = typeEl ? typeEl.dataset.type : 'message';

  try {
    await api('events.php', { action: 'publish' }, 'POST', {
      channel_id: state.channel.id,
      user_id:    state.user.id,
      type:       type,
      payload:    { message: msg, ts: Date.now() },
    });
    msgEl.value = '';
    toast('Event published', 'success');
    clearTimeout(state.pollTimer);
    poll();
  } catch (e) {
    toast('Publish failed: ' + e.message, 'error');
  }
}

async function loadStats() { await updateStats(); }

async function updateStats() {
  try {
    const data = await api('events.php', { action: 'stats' });
    const ev   = data.events;
    $('#stat-total').textContent   = fmtNum(ev.total_events);
    $('#stat-pending').textContent = fmtNum(ev.pending);
    $('#stat-acked').textContent   = fmtNum(ev.acknowledged);
    $('#stat-rate').textContent    = fmtNum(ev.last_minute) + '/min';
    $('#stat-online').textContent  = data.online_users;
  } catch (_) {}
}

function logEntry(type, msg) {
  const panel = $('#log-panel');
  const ts    = new Date().toLocaleTimeString();
  const color = (TYPE_COLORS[type] && TYPE_COLORS[type].fg) || 'var(--text-muted)';
  const el    = document.createElement('div');
  el.className = 'log-entry';
  el.innerHTML =
    '<span class="log-ts">'   + ts             + '</span>' +
    '<span class="log-type" style="color:' + color + '">' + type + '</span>' +
    '<span class="log-msg">'  + escHtml(msg)   + '</span>';
  panel.insertBefore(el, panel.firstChild);
  while (panel.children.length > 200) panel.removeChild(panel.lastChild);
}

const tickerMsgs = [];
function addTicker(msg) {
  tickerMsgs.unshift(msg);
  if (tickerMsgs.length > 10) tickerMsgs.pop();
  $('#ticker-inner').textContent = tickerMsgs.join('  .  ');
}

function startHeartbeat() {
  clearInterval(state.hbTimer);
  state.hbTimer = setInterval(async function() {
    try {
      await api('users.php', { action: 'heartbeat', user_id: state.user.id });
      await loadUsers();
    } catch (_) {}
  }, HEARTBEAT_MS);
}

function togglePause() {
  state.paused = !state.paused;
  const btn = $('#btn-pause');
  btn.textContent = state.paused ? 'Resume' : 'Pause';
  btn.style.color = state.paused ? 'var(--amber)' : '';
  toast(state.paused ? 'Stream paused' : 'Stream resumed', 'info');
}

function clearFeed() {
  $('#event-feed').innerHTML = '';
  state.events    = [];
  state.lastSince = null;
  toast('Feed cleared', 'info');
}

function setStatus(live) {
  const dot  = $('#status-dot');
  const text = $('#status-text');
  dot.className    = 'status-dot' + (live ? ' live' : '');
  text.textContent = live ? 'LIVE' : 'OFFLINE';
}

function selectType(chip) {
  document.querySelectorAll('.type-chip').forEach(function(c) { c.classList.remove('selected'); });
  chip.classList.add('selected');
}

function toast(msg, kind) {
  kind = kind || 'info';
  const t = document.createElement('div');
  t.className   = 'toast ' + kind;
  t.textContent = msg;
  $('#toast-container').appendChild(t);
  setTimeout(function() { t.remove(); }, 3200);
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtNum(n) {
  const v = parseInt(n) || 0;
  return v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(v);
}

function startDemo() {
  const types = ['message', 'alert', 'deploy', 'analytics', 'heartbeat'];
  const msgs  = [
    'User signed up via OAuth',
    'Deploy pipeline triggered on main branch',
    'CPU spike detected on prod-3',
    'New purchase: Order #8821',
    'Health check OK - all services nominal',
    'Cache miss rate exceeded threshold',
    'Backup completed successfully',
    'Rate limit hit for IP 203.0.113.42',
  ];
  let i = 0;
  const demo = setInterval(async function() {
    if (i++ >= 12) { clearInterval(demo); return; }
    await api('events.php', { action: 'publish' }, 'POST', {
      channel_id: state.channel.id,
      user_id:    state.user.id,
      type:       types[Math.floor(Math.random() * types.length)],
      payload:    { message: msgs[Math.floor(Math.random() * msgs.length)], demo: true },
    });
  }, 800);
  toast('Demo stream started (12 events)', 'info');
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.target.id === 'compose-message' && !e.shiftKey) {
    e.preventDefault();
    publishEvent();
  }
  if (e.key === 'Escape') clearFeed();
});

document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const u     = document.getElementById('login-username').value;
  const p     = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';
  try {
    await login(u, p);
  } catch (err) {
    errEl.textContent = 'Invalid username or password.';
  }
});

// ── Expose functions required by inline onclick handlers in HTML ──────────────
window.selectChannelById = selectChannelById;
window.ackEvent          = ackEvent;
window.publishEvent      = publishEvent;
window.togglePause       = togglePause;
window.clearFeed         = clearFeed;
window.selectType        = selectType;
window.startDemo         = startDemo;
