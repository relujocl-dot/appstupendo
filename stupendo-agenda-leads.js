(function(){
"use strict";

var state = {
  ready:false,
  open:false,
  loading:false,
  loadedOnce:false,
  roleTimer:null,
  context:null,
  incomplete:[],
  whatsapp:[]
};

var DISMISSED_STORAGE = "stupendo_agenda_dismissed_leads";

function $(id){ return document.getElementById(id); }
function esc(value){
  return String(value || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}
function money(n){ return "$" + Math.round(Number(n || 0)).toLocaleString("es-CL"); }
function fmtDate(value){
  if(!value) return "-";
  var d = new Date(value);
  if(isNaN(d.getTime())) return String(value).slice(0,16);
  return d.toLocaleString("es-CL",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
}
function normalizePhone(raw){
  var digits = String(raw || "").replace(/\D+/g,"");
  if(!digits) return "";
  if(digits.indexOf("56") === 0) return digits;
  if(digits.length === 9) return "56" + digits;
  if(digits.length === 8) return "569" + digits;
  return digits;
}
function whatsappUrl(phone, message){
  var normalized = normalizePhone(phone);
  return normalized ? "https://wa.me/" + normalized + "?text=" + encodeURIComponent(message || "") : "";
}
function parseJson(value){
  if(!value) return {};
  if(typeof value === "object") return value;
  try { return JSON.parse(value); } catch(e) { return {}; }
}
function dismissedMap(){
  try { return JSON.parse(localStorage.getItem(DISMISSED_STORAGE) || "{}") || {}; } catch(e) { return {}; }
}
function saveDismissed(map){
  try { localStorage.setItem(DISMISSED_STORAGE, JSON.stringify(map || {})); } catch(e) {}
}
function leadKey(row, type){
  var id = row && row.id;
  if(id) return String(type || "lead") + ":" + String(id);
  return String(type || "lead") + ":" + String(row && (row.phone || row.phone_normalized || "") || "") + ":" + String(row && (row.created_at || "") || "");
}
function isLeadDismissed(row, type, dismissed){
  var key = leadKey(row, type);
  if(dismissed[key]) return true;
  var id = row && row.id;
  if(!id) return false;
  var legacyPrefix = String(type || "lead") + ":" + String(id) + ":";
  return Object.keys(dismissed).some(function(item){ return item.indexOf(legacyPrefix) === 0; });
}
function isConvertedLead(row){
  var status = String(row && row.status || "").toLowerCase();
  return status === "confirmado" || status === "converted" || status === "convertido" || !!(row && row.converted_reserva_id);
}
function rawValue(row, key){
  var raw = parseJson(row && row.raw_data);
  return row && row[key] != null && row[key] !== "" ? row[key] : raw[key];
}
function serviceText(row){
  var services = row && (row.servicios || rawValue(row,"servicios"));
  if(Array.isArray(services) && services.length){
    return services.map(function(item){
      return (item.qty && Number(item.qty) > 1 ? item.qty + " x " : "") + (item.name || item.title || item.id || "Servicio");
    }).join(" + ");
  }
  return rawValue(row,"service") || rawValue(row,"intent") || row.step || row.funnel_step || "-";
}
function trackingText(row){
  var raw = parseJson(row && row.raw_data);
  var tracking = parseJson(row && row.tracking_data);
  function val(key){ return row[key] || raw[key] || tracking[key] || ""; }
  var parts = [];
  var campaign = val("campaign") || val("utm_campaign") || val("campaign_id");
  var adset = val("adset") || val("adset_id");
  var ad = val("ad") || val("ad_id") || val("utm_content");
  if(campaign) parts.push("Campaña: " + campaign);
  if(adset) parts.push("Conjunto: " + adset);
  if(ad) parts.push("Anuncio: " + ad);
  if(!parts.length && (val("fbclid") || val("gclid") || val("igclid"))) parts.push("Click ID capturado");
  return parts.join(" · ");
}
function leadMessage(row){
  var name = row.name || "";
  var services = serviceText(row);
  return [
    name ? "Hola " + name + "," : "Hola,",
    "",
    "Soy Sebasti\u00e1n de Stupendo. Vi que alcanzaste a avanzar con una cotizaci\u00f3n/reserva y te escribo por si quieres que te ayude a terminarla.",
    "",
    services && services !== "-" ? "Servicio: " + services : "",
    row.comuna ? "Comuna: " + row.comuna : "",
    row.total ? "Total estimado: " + money(row.total) : "",
    "",
    "Si te acomoda, puedo revisar disponibilidad y dejarlo agendado."
  ].filter(Boolean).join("\n");
}
function injectStyles(){
  if($("ra-leads-style")) return;
  var style = document.createElement("style");
  style.id = "ra-leads-style";
  style.textContent =
    ".ra-leads-panel{margin:0 0 12px;border:1px solid rgba(205,163,73,.24);border-radius:16px;background:#0b2448;color:#eef4ff;box-shadow:0 16px 38px rgba(0,0,0,.22);overflow:hidden}" +
    ".ra-leads-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 14px;border-bottom:1px solid rgba(205,163,73,.18)}" +
    ".ra-leads-title{margin:0;color:#fff;font-size:17px;font-weight:900}.ra-leads-sub{margin:3px 0 0;color:#a9b8d2;font-size:12px;font-weight:700}" +
    ".ra-leads-tabs{display:flex;gap:6px;flex-wrap:wrap}.ra-leads-tab,.ra-leads-action{border:1px solid rgba(205,163,73,.24);border-radius:999px;background:#0e2a52;color:#fff;padding:7px 10px;font-size:11px;font-weight:900;cursor:pointer}" +
    ".ra-leads-tab.is-active,.ra-leads-action:hover{background:#fff;color:#08224b;border-color:#fff}.ra-leads-body{padding:10px 12px 14px}" +
    ".ra-leads-grid{display:grid;gap:8px}.ra-lead-card{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1.8fr) auto;gap:10px;align-items:start;border:1px solid rgba(205,163,73,.14);border-radius:14px;background:#071d3f;padding:10px}" +
    ".ra-lead-main{font-weight:900;color:#fff}.ra-lead-meta{margin-top:4px;color:#a9b8d2;font-size:11px;line-height:1.35}.ra-lead-service{color:#eef4ff;font-size:12px;line-height:1.35;overflow-wrap:anywhere}" +
    ".ra-lead-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.ra-lead-btn{border:1px solid rgba(255,255,255,.2);border-radius:10px;background:#fff;color:#08224b;padding:7px 9px;font-size:11px;font-weight:900;text-decoration:none;cursor:pointer}" +
    ".ra-leads-empty{border:1px dashed rgba(205,163,73,.24);border-radius:14px;padding:14px;text-align:center;color:#a9b8d2;background:#071d3f}.ra-lead-badge{display:inline-flex;border-radius:999px;padding:3px 7px;background:#fffaf0;color:#08224b;font-size:10px;font-weight:900;margin-top:5px}" +
    ".ra-leads-window{position:fixed;right:16px;bottom:18px;z-index:100000;width:min(420px,calc(100vw - 28px));border:1px solid rgba(205,163,73,.34);border-radius:16px;background:#071d3f;color:#eef4ff;box-shadow:0 22px 60px rgba(0,0,0,.34);overflow:hidden}.ra-leads-window-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;border-bottom:1px solid rgba(205,163,73,.18);background:#0b2448}.ra-leads-window-title{font-size:14px;font-weight:900;color:#fff}.ra-leads-window-close{border:1px solid rgba(255,255,255,.2);border-radius:999px;background:#fff;color:#08224b;width:28px;height:28px;font-weight:900;cursor:pointer}.ra-leads-window-body{display:grid;gap:8px;padding:10px;max-height:56vh;overflow:auto}.ra-leads-window .ra-lead-card{grid-template-columns:1fr;padding:9px}.ra-leads-window .ra-lead-actions{justify-content:flex-start}" +
    "@media(max-width:860px){.ra-lead-card{grid-template-columns:1fr}.ra-lead-actions{justify-content:flex-start}}";
  document.head.appendChild(style);
}
function currentTab(){
  var active = document.querySelector(".ra-leads-tab.is-active");
  return active ? active.getAttribute("data-leads-tab") : "incomplete";
}
function setTab(tab){
  Array.prototype.slice.call(document.querySelectorAll(".ra-leads-tab")).forEach(function(btn){
    btn.classList.toggle("is-active", btn.getAttribute("data-leads-tab") === tab);
  });
  renderBody();
}
function leadCard(row, type){
  var raw = parseJson(row.raw_data);
  var phone = row.phone || row.phone_normalized || raw.phone || "";
  var name = row.name || raw.name || "Sin nombre";
  var service = serviceText(row);
  var comuna = row.comuna || raw.comuna || "";
  var created = row.last_activity_at || row.created_at;
  var status = row.status || row.funnel_step || row.step || row.intent || "";
  var total = row.total || row.estimated_value || raw.total || 0;
  var source = row.source || row.utm_source || raw.utm_source || (row.fbclid ? "Meta Ads" : "Sin fuente");
  var tracking = trackingText(row);
  var url = whatsappUrl(phone, leadMessage(Object.assign({}, row, {name:name, phone:phone, comuna:comuna, total:total})));
  return '<article class="ra-lead-card">' +
    '<div><div class="ra-lead-main">' + esc(name) + '</div>' +
    '<div class="ra-lead-meta">' + esc(phone || "Sin tel\u00e9fono") + (comuna ? " &middot; " + esc(comuna) : "") + '<br>' + esc(fmtDate(created)) + '</div>' +
    '<span class="ra-lead-badge">' + esc(type === "whatsapp" ? "WhatsApp" : "Incompleto") + '</span></div>' +
    '<div class="ra-lead-service"><strong>' + esc(service) + '</strong>' +
    '<div class="ra-lead-meta">' + esc(source) + (status ? " &middot; " + esc(status) : "") + (total ? " &middot; " + money(total) : "") + (tracking ? '<br>' + esc(tracking) : "") + '</div></div>' +
    '<div class="ra-lead-actions">' +
    (url ? '<a class="ra-lead-btn" href="' + esc(url) + '" target="_blank" rel="noopener">Wsp</a>' : '') +
    '<button type="button" class="ra-lead-btn" data-copy-lead="' + esc(row.id || "") + '" data-lead-type="' + esc(type) + '">Copiar</button>' +
    '</div></article>';
}
function renderBody(){
  var body = $("ra-leads-body");
  if(!body) return;
  if(state.loading){
    body.innerHTML = '<div class="ra-leads-empty">Cargando leads...</div>';
    return;
  }
  var tab = currentTab();
  var rows = tab === "whatsapp" ? state.whatsapp : state.incomplete;
  if(!rows.length){
    body.innerHTML = '<div class="ra-leads-empty">No hay leads para mostrar en esta vista.</div>';
    return;
  }
  body.innerHTML = '<div class="ra-leads-grid">' + rows.map(function(row){ return leadCard(row, tab); }).join("") + '</div>';
  Array.prototype.slice.call(body.querySelectorAll("[data-copy-lead]")).forEach(function(btn){
    btn.addEventListener("click", function(){
      var id = btn.getAttribute("data-copy-lead");
      var type = btn.getAttribute("data-lead-type");
      var list = type === "whatsapp" ? state.whatsapp : state.incomplete;
      var row = list.find(function(item){ return String(item.id || "") === String(id || ""); });
      if(!row) return;
      var text = leadMessage(row);
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){ alert("Lead copiado."); }).catch(function(){ alert(text); });
      }else{
        alert(text);
      }
    });
  });
}
function renderShell(){
  var box = $("ra-leads-box");
  if(!box) return;
  if(!state.open){
    box.innerHTML = "";
    return;
  }
  injectStyles();
  box.innerHTML =
    '<section class="ra-leads-panel">' +
    '<div class="ra-leads-head"><div><h2 class="ra-leads-title">Leads</h2><p class="ra-leads-sub">Reservas incompletas y clics a WhatsApp recientes.</p></div>' +
    '<div class="ra-leads-tabs"><button type="button" class="ra-leads-tab is-active" data-leads-tab="incomplete">Incompletos</button><button type="button" class="ra-leads-tab" data-leads-tab="whatsapp">WhatsApp</button><button type="button" class="ra-leads-action" id="ra-leads-refresh">Refrescar</button></div></div>' +
    '<div id="ra-leads-body" class="ra-leads-body"></div>' +
    '</section>';
  Array.prototype.slice.call(box.querySelectorAll("[data-leads-tab]")).forEach(function(btn){
    btn.addEventListener("click", function(){ setTab(btn.getAttribute("data-leads-tab")); });
  });
  $("ra-leads-refresh").addEventListener("click", loadLeads);
  renderBody();
}
function renderLeadWindow(){
  injectStyles();
  var existing = $("ra-leads-window");
  if(existing) existing.remove();
  var dismissed = dismissedMap();
  var rows = [];
  state.incomplete.forEach(function(row){ rows.push({row:row,type:"incomplete"}); });
  state.whatsapp.forEach(function(row){ rows.push({row:row,type:"whatsapp"}); });
  rows = rows.filter(function(item){ return !isLeadDismissed(item.row, item.type, dismissed); }).slice(0, 4);
  if(!rows.length) return;
  var wrap = document.createElement("section");
  wrap.id = "ra-leads-window";
  wrap.className = "ra-leads-window";
  wrap.innerHTML =
    '<div class="ra-leads-window-head"><div><div class="ra-leads-window-title">Nuevos leads</div><div class="ra-leads-sub">Al cerrar, no vuelven al frontis.</div></div><button type="button" class="ra-leads-window-close" aria-label="Cerrar leads">x</button></div>' +
    '<div class="ra-leads-window-body">' + rows.map(function(item){ return leadCard(item.row, item.type); }).join("") + '</div>';
  document.body.appendChild(wrap);
  wrap.querySelector(".ra-leads-window-close").addEventListener("click", function(){
    var map = dismissedMap();
    rows.forEach(function(item){ map[leadKey(item.row, item.type)] = Date.now(); });
    saveDismissed(map);
    wrap.remove();
  });
}
async function selectSafe(table, orderField){
  try {
    var query = state.context.sb.from(table).select("*").order(orderField || "created_at", { ascending:false, nullsFirst:false }).limit(50);
    var res = await query;
    if(res.error) throw res.error;
    return {data:res.data || [], error:null};
  } catch(e) {
    return {data:[], error:e};
  }
}
async function loadLeads(){
  if(!state.context || !state.context.sb) return;
  state.loading = true;
  renderBody();
  var incomplete = await selectSafe("leads_incompletos", "last_activity_at");
  var whatsapp = await selectSafe("whatsapp_leads", "created_at");
  state.incomplete = incomplete.data.filter(function(row){ return !isConvertedLead(row); });
  state.whatsapp = whatsapp.data;
  state.loading = false;
  state.loadedOnce = true;
  renderBody();
  renderLeadWindow();
  if(incomplete.error && whatsapp.error){
    var body = $("ra-leads-body");
    if(body) body.innerHTML = '<div class="ra-leads-empty">No se pudieron cargar los leads. Revisa permisos/RLS de Supabase.</div>';
  }
}
function showForRole(){
  var btn = $("ra-leads-toggle");
  if(!btn) return;
  var role = state.context && typeof state.context.role === "function" ? state.context.role() : "";
  if(role === "admin"){
    btn.style.display = "";
    if(!state.loadedOnce && !state.loading) loadLeads();
  }else{
    btn.style.display = "none";
    state.open = false;
    renderShell();
  }
}
function startRoleWatcher(){
  if(state.roleTimer) return;
  var tries = 0;
  state.roleTimer = setInterval(function(){
    tries += 1;
    showForRole();
    var role = state.context && typeof state.context.role === "function" ? state.context.role() : "";
    if(role || tries > 40){
      clearInterval(state.roleTimer);
      state.roleTimer = null;
    }
  }, 250);
}
function init(context){
  state.context = context || window.StupendoAgendaLeadsContext || state.context;
  if(!state.context) return;
  var btn = $("ra-leads-toggle");
  var box = $("ra-leads-box");
  if(!btn || !box) return;
  showForRole();
  startRoleWatcher();
  if(!state.ready){
    state.ready = true;
    btn.addEventListener("click", function(){
      state.open = !state.open;
      btn.textContent = state.open ? "Ocultar leads" : "Leads";
      renderShell();
      if(state.open && !state.incomplete.length && !state.whatsapp.length) loadLeads();
    });
  }
}

window.StupendoAgendaLeads = { init:init, refresh:loadLeads };

if(window.StupendoAgendaLeadsContext) {
  setTimeout(function(){ init(window.StupendoAgendaLeadsContext); }, 0);
}
})();
