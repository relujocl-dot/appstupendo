(function(){
var SUPABASE_URL = "https://kjyjfxmabizlerdouetb.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeWpmeG1hYml6bGVyZG91ZXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODE3MzUsImV4cCI6MjA4ODQ1NzczNX0.qckYFtMdMISZ2sUY_loXZ-jvhoXc7DzaFQFBOiMWksY";
var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
var WHATSAPP_STATUS_UPDATE_URL = "https://kjyjfxmabizlerdouetb.supabase.co/functions/v1/send_whatsapp_status_update";
var MARK_PAID_MANUAL_URL = "https://kjyjfxmabizlerdouetb.supabase.co/functions/v1/mark_paid_manual";
var SEND_CONVERSION_EVENT_URL = "https://kjyjfxmabizlerdouetb.supabase.co/functions/v1/send_conversion_event";
var loginCard = document.getElementById("ra-login-card");
var appEl = document.getElementById("ra-app");
var userEl = document.getElementById("ra-user");
var loginBtn = document.getElementById("ra-login-btn");
var loginStatusEl = document.getElementById("ra-login-status");
var emailEl = document.getElementById("ra-email");
var passwordEl = document.getElementById("ra-password");
var logoutEl = document.getElementById("ra-logout");
var statusEl = document.getElementById("ra-status");
var agendaSummaryEl = document.getElementById("ra-agenda-summary");
var listEl = document.getElementById("ra-list");
var rangeEl = document.getElementById("ra-range");
var filterActiveEl = document.getElementById("ra-filter-active");
var filterPendingEl = document.getElementById("ra-filter-pending");
var filterConfirmedEl = document.getElementById("ra-filter-confirmed");
var filterOnTheWayEl = document.getElementById("ra-filter-on-the-way");
var filterInServiceEl = document.getElementById("ra-filter-in-service");
var filterFinalizadaEl = document.getElementById("ra-filter-finalizada");
var filterCancelledEl = document.getElementById("ra-filter-cancelled");
var filterUnassignedEl = document.getElementById("ra-filter-unassigned");
var filterPaidEl = document.getElementById("ra-filter-paid");
var filterPaymentPendingEl = document.getElementById("ra-filter-payment-pending");
var filterProofEl = document.getElementById("ra-filter-proof");
var filterMpApprovedEl = document.getElementById("ra-filter-mp-approved");
var adminFiltersEl = document.getElementById("ra-admin-filters");
var finanzasLinkEl = document.getElementById("ra-finanzas-link");
var autoCloseOverdueEl = document.getElementById("ra-auto-close-overdue");
var quickReservaEl = document.getElementById("ra-quick-reserva");
var quickQuoteEl = document.getElementById("ra-quick-quote");
var proofModalEl = document.getElementById("ra-proof-modal");
var proofBodyEl = document.getElementById("ra-proof-body");
var proofCloseEl = document.getElementById("ra-proof-close");
var proofOpenNewEl = document.getElementById("ra-proof-open-new");
var allRows = [];
var activeFilter = "active";
var activeOperators = [];
var currentRole = null;
var currentProfile = null;
var restoreScrollY = null;
var GARANTIA_SLOTS = ["10:00","12:00","14:00","17:00"];
var KARIN_OPERATOR_ID = "091a0cf4-d5a5-4962-a9f5-2aac0e0ca010";
var OPERATOR2_ID = "0d1fa964-d8fd-4671-97ba-651d0f3ec65e";
var KNOWN_OPERATORS = [
{ id:KARIN_OPERATOR_ID, nombre:"Karin" },
{ id:OPERATOR2_ID, nombre:"Operador 2" }
];
window.StupendoAgendaLeadsContext={sb:sb,role:function(){return currentRole}};
function friendlyDate(iso){
if (!iso) return "Sin fecha";
var d = new Date(iso + "T12:00:00");
return d.toLocaleDateString("es-CL", { day:"2-digit", month:"2-digit" });
}
function friendlyDateTime(iso){
if (!iso) return "—";
var d = new Date(iso);
if (isNaN(d.getTime())) return "—";
return d.toLocaleString("es-CL", {
day:"2-digit",
month:"2-digit",
hour:"2-digit",
minute:"2-digit"
});
}
function slotToMinutes(slot){
if (!slot || slot.indexOf(":") === -1) return 9999;
var parts = slot.split(":");
return Number(parts[0]) * 60 + Number(parts[1]);
}
function money(n){
return "$" + Math.round(Number(n || 0)).toLocaleString("es-CL");
}
function travelFeeValue(item){
return Number(item && (item.travel_fee || item.transfer_fee || item.traslado_fee || item.recargo_traslado || 0)) || 0;
}
function serviceBaseValue(item){
var explicit = Number(item && (item.total_without_travel_fee || item.base_total || item.service_total || item.limpieza_total || 0)) || 0;
if (explicit) return explicit;
return Math.max(0, reservaCashAmount(item) - travelFeeValue(item));
}
function travelFeeLine(item){
var fee = travelFeeValue(item);
if (!fee) return "";
var zone = item && (item.travel_fee_zone || item.transfer_fee_zone || "");
return "Traslado: " + money(fee) + (zone ? " · Zona " + zone : "");
}
function reservaCashAmount(item){
return Number(item && (item.total || item.reserva_total || item.gross_amount || item.sale_total || item.net_amount || 0)) || 0;
}
function getPaymentPeriodForDate(rawDate){
var base = rawDate ? new Date(String(rawDate).slice(0,10) + "T12:00:00") : new Date();
if (isNaN(base.getTime())) base = new Date();
var y = base.getFullYear();
var m = base.getMonth();
var day = base.getDate();
var start;
var end;
if (day >= 5 && day <= 19) {
start = new Date(y, m, 5, 12, 0, 0);
end = new Date(y, m, 19, 12, 0, 0);
} else if (day >= 20) {
start = new Date(y, m, 20, 12, 0, 0);
end = new Date(y, m + 1, 4, 12, 0, 0);
} else {
start = new Date(y, m - 1, 20, 12, 0, 0);
end = new Date(y, m, 4, 12, 0, 0);
}
return {
start:toIsoDateLocal(start),
end:toIsoDateLocal(end),
label:friendlyDate(toIsoDateLocal(start)) + " al " + friendlyDate(toIsoDateLocal(end))
};
}
function escapeHtml(str){
return String(str || "")
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");
}
function badgeForStatus(status){
var s = String(status || "").toLowerCase();
if (!s) s = "pending";
var labelMap = {
pending:"Pendiente",
confirmed:"Confirmada",
on_the_way:"En camino",
in_service:"En servicio",
finalizada:"Finalizada",
cancelled:"Cancelada"
};
return '<span class="relujo-ag-badge relujo-ag-badge-' + escapeHtml(s) + '">' + escapeHtml(labelMap[s] || s) + '</span>';
}
function badgeForPaymentStatus(status){
var s = String(status || "").toLowerCase();
if (!s) s = "payment_pending";
var labelMap = {
paid:"Pagado",
pending:"Pendiente",
payment_pending:"Pendiente"
};
var cssMap = {
paid:"paid",
pending:"payment_pending",
payment_pending:"payment_pending"
};
return '<span class="relujo-ag-badge relujo-ag-badge-' + escapeHtml(cssMap[s] || "payment_pending") + '">' + escapeHtml(labelMap[s] || s) + '</span>';
}
function badgeForMpStatus(status){
var s = String(status || "").toLowerCase();
if (!s) return '<span class="relujo-ag-badge relujo-ag-badge-no_mp">—</span>';
var labelMap = {
approved:"Aprobado",
pending:"Pendiente",
rejected:"Rechazado",
cancelled:"Cancelado",
in_process:"En proceso"
};
var cssMap = {
approved:"approved",
pending:"payment_pending",
rejected:"rejected",
cancelled:"cancelled_payment",
in_process:"in_process"
};
return '<span class="relujo-ag-badge relujo-ag-badge-' + escapeHtml(cssMap[s] || "no_mp") + '">' + escapeHtml(labelMap[s] || s) + '</span>';
}
function paymentSourceLabel(item){
var mp = String(item.mp_payment_status || "").toLowerCase();
var confirmedBy = String(item.payment_confirmed_by || "").toLowerCase();
if (mp === "approved") return "MP";
if (confirmedBy === "operator_cash_advance") return "Efectivo operador";
if (confirmedBy === "manual_admin") return "Manual";
if (confirmedBy === "system_auto_close") return "Sistema";
return "—";
}
function systemObservationText(item){
var confirmedBy = String(item && item.payment_confirmed_by || "").toLowerCase();
if (confirmedBy === "system_auto_close") return "Finalizada y pagada automáticamente por sistema por cierre de día. No fue realizada por admin u operador.";
return String(item && (item.system_observation || item.admin_observation || item.observacion || item.notes || item.internal_notes) || "");
}
function parseMaybeJson(value){
if (!value) return null;
if (typeof value === "object") return value;
try { return JSON.parse(value); } catch(e) { return null; }
}
function firstOperationalValue(row, keys){
var direct = parseMaybeJson(row && row.operational) || {};
var candidates = [row || {}, direct];
["items","servicios"].forEach(function(field){
var arr = parseMaybeJson(row && row[field]) || row && row[field] || [];
if (!Array.isArray(arr)) return;
arr.forEach(function(item){
candidates.push(item || {});
if (item && item.operational) candidates.push(parseMaybeJson(item.operational) || item.operational || {});
});
});
for (var i=0;i<candidates.length;i++) {
for (var k=0;k<keys.length;k++) {
var value = candidates[i] && candidates[i][keys[k]];
if (value !== undefined && value !== null && String(value).trim() !== "") return value;
}
}
return "";
}
function vehicleOperationalDetails(row){
var categoryText = [row && row.service_category, row && row.services_text, row && row.upsells_text].join(" ").toLowerCase();
var hasVehicle = categoryText.indexOf("vehiculo") >= 0 || categoryText.indexOf("vehiculos") >= 0;
var parking = firstOperationalValue(row, ["parking_location","parking","estacionamiento"]);
var lighting = firstOperationalValue(row, ["lighting","iluminacion"]);
var fee = Number(firstOperationalValue(row, ["lighting_fee","iluminacion_fee"]) || 0);
if (!hasVehicle && !parking && !lighting && !fee) return "";
var parts = [];
if (parking) parts.push("Estac.: " + parking);
if (lighting) parts.push("Luz: " + lighting);
if (fee) parts.push("LED +" + money(fee));
return parts.join(" · ");
}
function normalizedRowText(row){
return String([row && row.service_category, row && row.services_text, row && row.upsells_text].filter(Boolean).join(" ")).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}
function isFullPremiumVehicleRow(row){
var text = normalizedRowText(row);
return (text.indexOf("full premium") >= 0 || text.indexOf("full-premium") >= 0) && (text.indexOf("vehiculo") >= 0 || text.indexOf("auto") >= 0);
}
function sortRows(rows){
return rows.slice().sort(function(a,b){
var dateA = String(a.route_date || "");
var dateB = String(b.route_date || "");
if (dateA < dateB) return -1;
if (dateA > dateB) return 1;
return slotToMinutes(a.slot) - slotToMinutes(b.slot);
});
}
function saveScrollPosition(){
restoreScrollY = window.scrollY || window.pageYOffset || 0;
}
function restoreScrollPositionIfNeeded(){
if (restoreScrollY === null || restoreScrollY === undefined) return;
var y = restoreScrollY;
restoreScrollY = null;
requestAnimationFrame(function(){
window.scrollTo({ top:y, behavior:"auto" });
});
}
function getCurrentPaymentPeriodRange(){var d=new Date(),y=d.getFullYear(),m=d.getMonth(),day=d.getDate(),s,e;if(day>=5&&day<=19){s=new Date(y,m,5,12,0,0);e=new Date(y,m,19,12,0,0)}else if(day>=20){s=new Date(y,m,20,12,0,0);e=new Date(y,m+1,4,12,0,0)}else{s=new Date(y,m-1,20,12,0,0);e=new Date(y,m,4,12,0,0)}return{start:s,end:e,label:friendlyDate(s.toISOString().slice(0,10))+" al "+friendlyDate(e.toISOString().slice(0,10))}}
function getCurrentMonthRange(){var d=new Date();return{start:new Date(d.getFullYear(),d.getMonth(),1,12,0,0),end:new Date(d.getFullYear(),d.getMonth()+1,0,12,0,0)}}
function toIsoDateLocal(date){return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0")}
function addDaysIso(rawDate, days){
var base = rawDate ? new Date(String(rawDate).slice(0,10) + "T12:00:00") : new Date();
if (isNaN(base.getTime())) base = new Date();
base.setDate(base.getDate() + Number(days || 0));
return toIsoDateLocal(base);
}
function routeDateOf(row){return String(row&&row.route_date||"").slice(0,10)}
function filterRowsByRange(rows,scope){return(rows||[]).filter(function(row){var d=routeDateOf(row);if(!d)return false;if(scope.type==="all")return true;if(scope.type==="today")return d===scope.from;if(scope.type==="future")return d>=scope.from;if(scope.type==="range")return d>=scope.from&&d<=scope.to;return true})}
async function fetchAgendaSummary(){var dt=function(r){var raw=r.payment_period_start||r.service_date||r.route_date||r.service_completed_at;if(!raw)return null;var s=String(raw),x=/^\d{4}-\d{2}-\d{2}$/.test(s)?new Date(s+"T12:00:00"):new Date(s);return isNaN(x.getTime())?null:x},sale=function(r){return Number(r.net_amount||r.gross_amount||r.total||r.reserva_total||r.sale_total||0)||0},opamt=function(r){return Number(r.operator_amount||r.pago_operador||0)||0};if(currentRole==="admin"){var mr=getCurrentMonthRange(),ra=await sb.from("v_sales_control").select("*"),paid=0,pending=0;if(ra.error)throw ra.error;(ra.data||[]).forEach(function(r){var d=dt(r),st=String(r.service_status||r.status||r.estado||"").toLowerCase(),v=sale(r),col=String(r.payment_status||"").toLowerCase()==="paid"||r.sale_collected===!0;if(!d||d<mr.start||d>mr.end||st==="cancelled")return;if(col)paid+=v;else pending+=v});return"Mes actual \u00b7 Cobrado: "+money(paid)+" \u00b7 Por cobrar: "+money(pending)+" \u00b7 Total ventas: "+money(paid+pending)}if(currentRole==="operador"&&currentProfile&&currentProfile.operador_id){var pr=getCurrentPaymentPeriodRange(),rr=await Promise.all([sb.from("v_sales_control").select("*").eq("operador_id",currentProfile.operador_id),sb.from("reservas").select("id").eq("operador_id",currentProfile.operador_id).in("status",["confirmed","on_the_way","in_service"]).gte("route_date",pr.start.toISOString().slice(0,10)).lte("route_date",pr.end.toISOString().slice(0,10))]);if(rr[0].error)throw rr[0].error;if(rr[1].error)throw rr[1].error;var done=0,gain=0;(rr[0].data||[]).forEach(function(r){var d=dt(r),st=String(r.service_status||r.status||r.estado||"").toLowerCase();if(!d||d<pr.start||d>pr.end)return;if(st==="finalizada"){done+=1;gain+=opamt(r)}});return"Periodo "+pr.label+" \u00b7 Realizados: "+done+" \u00b7 Por realizar: "+((rr[1].data||[]).length)+" \u00b7 Ganado: "+money(gain)}return""}
function renderAgendaSummary(text){if(agendaSummaryEl)agendaSummaryEl.textContent=text||"Resumen no disponible"}
function isActiveStatus(status){
var s = String(status || "").toLowerCase();
return ["pending", "confirmed", "on_the_way", "in_service", "finalizada"].indexOf(s) !== -1;
}
function isOperatorVisibleStatus(status){
var s = String(status || "").toLowerCase();
return ["confirmed","on_the_way","in_service"].indexOf(s)!==-1;
}
function isImageUrl(url){
var u = String(url || "").toLowerCase().split("")[0];
return /\.(jpg|jpeg|png|webp|gif|bmp|heic)$/i.test(u);
}
function isPdfUrl(url){
var u = String(url || "").toLowerCase().split("")[0];
return /\.pdf$/i.test(u);
}
function openProofModal(url){
var safeUrl = String(url || "").trim();
if (!safeUrl) return;
proofBodyEl.innerHTML = "";
proofOpenNewEl.href = safeUrl;
if (isImageUrl(safeUrl)) {
proofBodyEl.innerHTML = '<img class="relujo-proof-img" src="' + escapeHtml(safeUrl) + '" alt="Comprobante">';
} else if (isPdfUrl(safeUrl)) {
proofBodyEl.innerHTML = '<iframe class="relujo-proof-frame" src="' + escapeHtml(safeUrl) + '"></iframe>';
} else {
proofBodyEl.innerHTML =
'<div class="relujo-proof-fallback">' +
'<p style="margin:0 0 12px;">Este archivo no se puede previsualizar aquí.</p>' +
'<a class="relujo-ag-btn-secondary" target="_blank" rel="noopener noreferrer" href="' + escapeHtml(safeUrl) + '">Abrir comprobante</a>' +
'</div>';
}
proofModalEl.classList.add("is-open");
proofModalEl.setAttribute("aria-hidden", "false");
document.body.style.overflow = "hidden";
}
function closeProofModal(){
proofModalEl.classList.remove("is-open");
proofModalEl.setAttribute("aria-hidden", "true");
proofBodyEl.innerHTML = "";
proofOpenNewEl.href = "#";
document.body.style.overflow = "";
}
function buildDateRange(scopeValue){
var today=new Date(),start=new Date(today.getFullYear(),today.getMonth(),today.getDate(),12,0,0),end=new Date(start);
var day=start.getDay(),offset=day===0?-6:1-day,weekStart=new Date(start),weekEnd=new Date(start);
weekStart.setDate(start.getDate()+offset);
weekEnd.setDate(weekStart.getDate()+6);
if(scopeValue==="today")return{type:"today",from:toIsoDateLocal(start),to:toIsoDateLocal(start)};
if(scopeValue==="week")return{type:"range",from:toIsoDateLocal(weekStart),to:toIsoDateLocal(weekEnd)};
if(scopeValue==="month"){var monthStart=new Date(start.getFullYear(),start.getMonth(),1,12,0,0),monthEnd=new Date(start.getFullYear(),start.getMonth()+1,0,12,0,0);return{type:"range",from:toIsoDateLocal(monthStart),to:toIsoDateLocal(monthEnd)}}
if(scopeValue==="next_7"){end.setDate(start.getDate()+7);return{type:"range",from:toIsoDateLocal(start),to:toIsoDateLocal(end)}}
if(scopeValue==="future")return{type:"future",from:toIsoDateLocal(start),to:null};
return{type:"all",from:null,to:null};
}
function buildOperadorScope(){
return buildDateRange(rangeEl.value);
}
async function getProfile(){
var userRes = await sb.auth.getUser();
if (userRes.error) throw userRes.error;
if (!userRes.data || !userRes.data.user) return null;
var profileRes = await sb
.from("perfiles_app")
.select("user_id,email,rol,operador_id,activo")
.eq("user_id", userRes.data.user.id)
.single();
if (profileRes.error) throw profileRes.error;
return { user:userRes.data.user, profile:profileRes.data };
}
async function getOperadores(){
var res = await sb
.from("operadores")
.select("id,nombre,activo,prioridad")
.eq("activo", true)
.order("prioridad", { ascending:true });
if (res.error) throw res.error;
return ensureKnownOperators(res.data || []);
}
function ensureKnownOperators(list){
var output = (list || []).slice();
KNOWN_OPERATORS.forEach(function(known){
var exists = output.some(function(op){ return String(op && op.id || "") === known.id; });
if (!exists) output.push({ id:known.id, nombre:known.nombre, activo:true, prioridad:999 });
});
return output;
}
function knownOperatorMap(){
var map = {};
KNOWN_OPERATORS.forEach(function(op){
map[op.id] = { nombre:op.nombre, email:"" };
});
return map;
}
async function hydrateReservaOperadores(rows){
rows = rows || [];
var ids = rows.map(function(row){ return row && row.id; }).filter(Boolean);
if (!ids.length) return rows;
try {
var res = await sb
.from("reserva_operadores")
.select("reserva_id,operador_id,rol,porcentaje_pago,monto_pago")
.in("reserva_id", ids);
if (res.error) throw res.error;
var operatorMap = knownOperatorMap();
var operatorIds = [...new Set((res.data || []).map(function(row){ return row && row.operador_id; }).filter(Boolean))];
if (operatorIds.length) {
try {
var opRes = await sb.from("operadores").select("id,nombre,email").in("id", operatorIds);
if (!opRes.error) {
(opRes.data || []).forEach(function(op){
operatorMap[String(op.id)] = { nombre:op.nombre || "", email:op.email || "" };
});
}
} catch(e) {}
}
var byReserva = {};
(res.data || []).forEach(function(row){
row.operador = operatorMap[String(row.operador_id)] || { nombre:row.operador_id, email:"" };
var key = String(row.reserva_id);
if (!byReserva[key]) byReserva[key] = [];
byReserva[key].push(row);
});
rows.forEach(function(row){
row.reserva_operadores = byReserva[String(row.id)] || row.reserva_operadores || [];
});
} catch(e) {
console.warn("reserva_operadores no disponible, usando operador_id como fallback", e);
}
return rows;
}
async function fetchAgendaAdmin(){
var scope=buildDateRange(rangeEl.value),baseScope=scope.type==="future"?"future":"all";
try{
var res=await sb.rpc("get_agenda_admin",{p_scope:baseScope});
if(res.error)throw res.error;
return hydrateReservaOperadores(filterRowsByRange(res.data||[],scope));
}catch(e){
var query=sb.from("reservas").select("*");
if(scope.type==="today")query=query.eq("route_date",scope.from);
else if(scope.type==="future")query=query.gte("route_date",scope.from);
else if(scope.type==="range")query=query.gte("route_date",scope.from).lte("route_date",scope.to);
var fallback=await query.order("route_date",{ ascending:true }).order("slot",{ ascending:true });
if(fallback.error)throw fallback.error;
return hydrateReservaOperadores(fallback.data||[]);
}
}
async function fetchAgendaOperadorFallback(){
if (!currentProfile || !currentProfile.operador_id) {
return [];
}
var scope = buildOperadorScope();
var participantIds = [];
try {
var ro = await sb.from("reserva_operadores")
.select("reserva_id")
.eq("operador_id", currentProfile.operador_id);
if (!ro.error) participantIds = (ro.data || []).map(function(item){ return item.reserva_id; }).filter(Boolean);
} catch(e) {}
var query = sb
.from("reservas")
.select("*");
if (participantIds.length) {
query = query.or("operador_id.eq." + currentProfile.operador_id + ",id.in.(" + participantIds.join(",") + ")");
} else {
query = query.eq("operador_id", currentProfile.operador_id);
}
if (scope.type === "today") {
query = query.eq("route_date", scope.from);
} else if (scope.type === "future") {
query = query.gte("route_date", scope.from);
} else if (scope.type === "range") {
query = query.gte("route_date", scope.from).lte("route_date", scope.to);
}
var res = await query
.order("route_date", { ascending:true })
.order("slot", { ascending:true });
if (res.error) throw res.error;
return hydrateReservaOperadores(res.data || []);
}
async function fetchAgendaOperador(){
var scope=buildOperadorScope(),baseScope=scope.type==="future"?"future":"all";
try{
var res=await sb.rpc("get_agenda_operador",{p_scope:baseScope});
if(res.error)throw res.error;
return hydrateReservaOperadores(filterRowsByRange(res.data||[],scope));
}catch(e){
return await fetchAgendaOperadorFallback();
}
}
async function saveSystemObservation(ids, note){
if(!ids||!ids.length)return;
var fields=["system_observation","admin_observation","observacion","notes","internal_notes"];
for(var i=0;i<fields.length;i++){
var payload={};
payload[fields[i]]=note;
try{await sb.from("reservas").update(payload).in("id",ids)}catch(e){}
}
}
async function autoFinalizeOverdueReservations(){
var today=toIsoDateLocal(new Date()),statuses=["pending","confirmed","on_the_way","in_service","finalizada"];
var query=sb.from("reservas").select("id,status,route_date,payment_status").lt("route_date",today).in("status",statuses);
if(currentRole==="operador"&&currentProfile&&currentProfile.operador_id)query=query.eq("operador_id",currentProfile.operador_id);
var found=await query;
if(found.error)throw found.error;
var rows=(found.data||[]).filter(function(r){return String(r.payment_status||"").toLowerCase()!=="paid"});
if(!rows.length)return 0;
var ids=rows.map(function(r){return r.id}).filter(Boolean);
var now=new Date().toISOString();
var note="Finalizada y pagada automáticamente por sistema por cierre de día. No fue realizada por admin u operador.";
var updateRes=await sb.from("reservas").update({
status:"finalizada",
payment_status:"paid",
payment_confirmed_by:"system_auto_close",
paid_at:now,
service_completed_at:now,
whatsapp_last_flow_step:"system_auto_closed"
}).in("id",ids);
if(updateRes.error)throw updateRes.error;
await saveSystemObservation(ids,note);
return ids.length;
}
async function markCancellationSource(id, role){
var tag=role==="operador"?"cancelled_by_operator":"cancelled_by_admin",now=new Date().toISOString();
try{await sb.from("reservas").update({payment_confirmed_by:tag,whatsapp_last_flow_step:tag}).eq("id",id)}catch(e){}
try{await sb.from("reservas").update({cancelled_by_role:role==="operador"?"operator":"admin",cancelled_at:now}).eq("id",id)}catch(e){}
}
async function cancelReserva(id){
var res = await sb.rpc("cambiar_estado_reserva", {
p_reserva_id:id,
p_nuevo_estado:"cancelled"
});
if (res.error) throw res.error;
await markCancellationSource(id,"admin");
return true;
}
async function markAsPaid(id){
var reserva = allRows.find(function(r){
return Number(r.id) === Number(id);
});
if (!reserva) throw new Error("Reserva no encontrada en agenda");
if (String(reserva.payment_status || "").toLowerCase() === "paid") return true;
var res = await fetch(MARK_PAID_MANUAL_URL, {
method:"POST",
headers:{
"Content-Type":"application/json",
"apikey":SUPABASE_ANON_KEY,
"Authorization":"Bearer " + SUPABASE_ANON_KEY
},
body:JSON.stringify({ reserva_id:id })
});
var data = await res.json().catch(function(){ return null; });
if (!res.ok || !data || !data.ok) {
throw new Error(
data && data.error ? data.error : "No se pudo marcar como pagado"
);
}
return true;
}
async function ensureCashAdvanceDiscount(reserva, amount, period){
if (!currentProfile || !currentProfile.operador_id) throw new Error("No se encontro el operador de la sesion");
var operadorId = String(currentProfile.operador_id);
var marker = "RLJ-" + reserva.id;
var existing = await sb.from("operator_manual_discounts")
.select("id")
.eq("operador_id", operadorId)
.eq("discount_type", "Anticipo")
.ilike("notes", "%" + marker + "%")
.limit(1);
if (!existing.error && existing.data && existing.data.length) return true;
var notes = "Pago en efectivo recibido por operador. " + marker + " queda como anticipo/descuento del periodo.";
var head = await sb.from("operator_manual_discounts").insert({
operador_id:operadorId,
discount_type:"Anticipo",
start_date:period.start,
total_amount:amount,
installments:1,
installment_amount:amount,
notes:notes,
created_by_email:String(currentProfile.email || ""),
active:true
}).select("id").single();
if (head.error) throw head.error;
var detail = await sb.from("operator_manual_discount_installments").insert({
discount_id:head.data.id,
operador_id:operadorId,
period_start:period.start,
period_end:period.end,
period_label:period.label,
installment_number:1,
total_installments:1,
amount:amount,
status:"pending"
});
if (detail.error) throw detail.error;
return true;
}
async function finalizeCashReserva(reserva){
var now = new Date().toISOString();
var payload = {
status:"finalizada",
payment_status:"paid",
payment_confirmed_by:"operator_cash_advance",
paid_at:now,
service_completed_at:now,
whatsapp_completed_sent:true,
whatsapp_last_flow_step:"operator_cash_advance"
};
var direct = await sb.from("reservas").update(payload).eq("id", reserva.id);
if (!direct.error) return true;
var rpc = await sb.rpc("cambiar_estado_reserva", {
p_reserva_id:reserva.id,
p_nuevo_estado:"finalizada"
});
if (rpc.error) throw direct.error;
await markAsPaid(reserva.id);
await sb.from("reservas").update({
payment_confirmed_by:"operator_cash_advance",
paid_at:now,
service_completed_at:now,
whatsapp_completed_sent:true,
whatsapp_last_flow_step:"operator_cash_advance"
}).eq("id", reserva.id);
return true;
}
async function recordCashPayment(id){
if (currentRole !== "operador") throw new Error("El pago en efectivo solo lo registra el operador");
var reserva = allRows.find(function(r){
return Number(r.id) === Number(id);
});
if (!reserva) throw new Error("Reserva no encontrada en agenda");
if (String(reserva.payment_status || "").toLowerCase() === "paid") return true;
var amount = reservaCashAmount(reserva);
if (amount <= 0) throw new Error("La reserva no tiene monto para registrar como efectivo");
var period = getPaymentPeriodForDate(reserva.payment_period_start || reserva.route_date || reserva.service_date || new Date());
await ensureCashAdvanceDiscount(reserva, amount, period);
await finalizeCashReserva(reserva);
return true;
}
async function changeStatus(id, status){
var currentStatus = String(status || "").toLowerCase();
var res = await sb.rpc("cambiar_estado_reserva", {
p_reserva_id:id,
p_nuevo_estado:currentStatus
});
if (res.error) throw res.error;
if (currentStatus === "cancelled") await markCancellationSource(id,currentRole);
try {
var reserva = allRows.find(function(r){
return Number(r.id) === Number(id);
});
if (!reserva) return true;
if (currentStatus === "on_the_way" && reserva.whatsapp_on_the_way_sent) return true;
if (currentStatus === "finalizada" && reserva.whatsapp_completed_sent) return true;
var waRes = await fetch(WHATSAPP_STATUS_UPDATE_URL, {
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
reserva_id:id,
status:currentStatus
})
});
var waData = await waRes.json().catch(function(){ return null; });
if (!waRes.ok) {
throw new Error(
waData && waData.error ? waData.error : "No se pudo enviar el mensaje de WhatsApp"
);
}
if (currentStatus === "on_the_way") {
await sb.from("reservas").update({
whatsapp_on_the_way_sent:true,
operator_departed_at:new Date().toISOString(),
whatsapp_last_flow_step:"on_the_way_sent"
}).eq("id", id);
}
if (currentStatus === "in_service") {
await sb.from("reservas").update({
operator_arrived_at:new Date().toISOString(),
whatsapp_last_flow_step:"in_service"
}).eq("id", id);
}
if (currentStatus === "finalizada") {
await sb.from("reservas").update({
whatsapp_completed_sent:true,
service_completed_at:new Date().toISOString(),
payment_status:"pending",
whatsapp_last_flow_step:"payment_requested"
}).eq("id", id);
}
} catch(err){
throw err;
}
return true;
}
function friendlyOperatorError(error){
var msg = String(error && error.message ? error.message : error || "");
if (/reservas_unique_operator_slot|duplicate key|unique constraint/i.test(msg)) {
return "El operador ya tiene una reserva en ese horario. Elige otro operador u otro bloque.";
}
if (/Ese operador ya participa/i.test(msg)) return "Ese operador ya participa en esta reserva.";
return msg || "No se pudo reasignar.";
}
async function reassignReserva(id, operadorId){
var res = await sb.rpc("set_reserva_operador_principal", {
p_reserva_id:id,
p_operador_id:operadorId || null
});
if (res.error) throw res.error;
return true;
}
async function setSupportOperator(id, operadorId){
var res = await sb.rpc("set_reserva_operador_apoyo", {
p_reserva_id:id,
p_operador_id:operadorId || null,
p_rol:operadorId ? "apoyo" : "apoyo"
});
if (res.error) throw res.error;
return true;
}
async function autoAssignReserva(id){
var res = await sb.rpc("asignar_reserva_por_prioridad", {
p_reserva_id:id
});
if (res.error) throw res.error;
return true;
}
async function syncFullPremiumOperators(id){
var res = await sb.rpc("sync_reserva_operadores", {
p_reserva_id:id
});
if (res.error) throw res.error;
return true;
}
function garantiaAddress(address){
var value = String(address || "").trim();
if (!value) return "garantia";
return value.toLowerCase().indexOf("garantia") === 0 ? value : "garantia " + value;
}
async function createGarantiaReserva(id, nextDate, nextSlot){
if (currentRole !== "admin") throw new Error("Solo admin puede crear garantias");
if (!/^\d{4}-\d{2}-\d{2}$/.test(String(nextDate || ""))) throw new Error("Fecha de garantia invalida");
if (!String(nextSlot || "").trim()) throw new Error("Hora de garantia invalida");
var res = await sb.rpc("crear_reserva_garantia", {
p_reserva_id:id,
p_route_date:nextDate,
p_slot:String(nextSlot || "").trim()
});
if (res.error) throw res.error;
return res.data && res.data[0] ? res.data[0] : null;
}
function ensureGarantiaModalStyle(){
if (document.getElementById("ra-garantia-style")) return;
var style = document.createElement("style");
style.id = "ra-garantia-style";
style.textContent = [
".ra-garantia-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:10000;display:flex;align-items:center;justify-content:center;padding:18px}",
".ra-garantia-card{width:min(420px,100%);background:#071f3e;border:1px solid rgba(205,163,73,.42);border-radius:18px;box-shadow:0 28px 90px rgba(0,0,0,.42);color:#eef4ff;padding:18px}",
".ra-garantia-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:14px}",
".ra-garantia-title{margin:0;font-size:20px;font-weight:900;color:#fff}",
".ra-garantia-note{margin:4px 0 0;color:#b9c9df;font-size:12px;line-height:1.35}",
".ra-garantia-close{border:1px solid rgba(205,163,73,.35);background:#0e2a52;color:#fff;border-radius:10px;padding:6px 9px;font-weight:900;cursor:pointer}",
".ra-garantia-field label{display:block;font-size:12px;font-weight:900;color:#f4c766;margin-bottom:6px}",
".ra-garantia-row{display:flex;gap:8px;align-items:center}",
".ra-garantia-date{flex:1;min-width:0;background:#0b2448;color:#fff;border:1px solid rgba(205,163,73,.32);border-radius:12px;padding:10px 11px;font-size:16px}",
".ra-garantia-btn{border:1px solid rgba(255,255,255,.72);background:#fff;color:#08224b;border-radius:12px;padding:10px 12px;font-weight:900;cursor:pointer}",
".ra-garantia-slots{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}",
".ra-garantia-slot{border:1px solid rgba(205,163,73,.38);background:#0e2a52;color:#fff;border-radius:12px;padding:12px 10px;font-weight:900;cursor:pointer}",
".ra-garantia-slot:hover{border-color:#f4c766}",
".ra-garantia-status{min-height:20px;margin-top:10px;color:#b9c9df;font-size:12px;line-height:1.35}",
".ra-garantia-status.is-ok{color:#86efac}",
".ra-garantia-status.is-error{color:#fecaca}"
].join("");
document.head.appendChild(style);
}
function closeGarantiaModal(){
var modal = document.getElementById("ra-garantia-modal");
if (modal) modal.remove();
document.body.style.overflow = "";
}
function setGarantiaStatus(text, type){
var elStatus = document.getElementById("ra-garantia-status");
if (!elStatus) return;
elStatus.className = "ra-garantia-status" + (type ? " is-" + type : "");
elStatus.textContent = text || "";
}
async function fetchGarantiaTakenSlots(original, nextDate){
var query = sb.from("reservas")
.select("slot,status,operador_id")
.eq("route_date", nextDate)
.in("status", ["pending","confirmed","on_the_way","in_service"]);
if (original && original.operador_id) query = query.eq("operador_id", original.operador_id);
var res = await query;
if (res.error) throw res.error;
var taken = {};
(res.data || []).forEach(function(row){
if (row && row.slot) taken[String(row.slot).trim()] = true;
});
return taken;
}
async function renderGarantiaSlots(original, nextDate){
var slotsEl = document.getElementById("ra-garantia-slots");
if (!slotsEl) return;
slotsEl.innerHTML = "";
setGarantiaStatus("Revisando horarios disponibles...", "");
try {
var taken = await fetchGarantiaTakenSlots(original, nextDate);
var available = GARANTIA_SLOTS.filter(function(slot){ return !taken[slot]; });
if (!available.length) {
setGarantiaStatus("No hay horarios disponibles para ese dia.", "error");
return;
}
setGarantiaStatus("Elige un horario disponible.", "");
slotsEl.innerHTML = available.map(function(slot){
return '<button type="button" class="ra-garantia-slot" data-garantia-slot="' + escapeHtml(slot) + '">' + escapeHtml(slot) + '</button>';
}).join("");
Array.from(slotsEl.querySelectorAll("[data-garantia-slot]")).forEach(function(slotBtn){
slotBtn.addEventListener("click", async function(){
var slot = slotBtn.getAttribute("data-garantia-slot");
Array.from(slotsEl.querySelectorAll("button")).forEach(function(btn){ btn.disabled = true; });
slotBtn.textContent = "Creando...";
setGarantiaStatus("Creando garantia...", "");
try {
var created = await createGarantiaReserva(original.id, nextDate, slot);
await loadAgenda({ preserveScroll:true });
setGarantiaStatus("Garantia creada como RLJ-" + (created && created.id ? created.id : ""), "ok");
setTimeout(closeGarantiaModal, 1200);
} catch (err) {
Array.from(slotsEl.querySelectorAll("button")).forEach(function(btn){ btn.disabled = false; });
slotBtn.textContent = slot;
setGarantiaStatus("No se pudo crear garantia: " + (err && err.message ? err.message : err), "error");
}
});
});
} catch (err) {
setGarantiaStatus("No se pudo revisar disponibilidad: " + (err && err.message ? err.message : err), "error");
}
}
function openGarantiaModal(id){
var original = allRows.find(function(row){ return Number(row.id) === Number(id); });
if (!original) return alert("Reserva no encontrada en agenda");
ensureGarantiaModalStyle();
closeGarantiaModal();
var minDate = addDaysIso(original.route_date || new Date(), 1);
var today = toIsoDateLocal(new Date());
if (minDate < today) minDate = today;
var modal = document.createElement("div");
modal.id = "ra-garantia-modal";
modal.className = "ra-garantia-backdrop";
modal.innerHTML =
'<div class="ra-garantia-card" role="dialog" aria-modal="true" aria-label="Crear garantia">' +
'<div class="ra-garantia-head"><div><h2 class="ra-garantia-title">Crear garantía</h2><p class="ra-garantia-note">RLJ-' + escapeHtml(original.id) + ' · selecciona un día y luego un horario disponible.</p></div><button type="button" class="ra-garantia-close" id="ra-garantia-close">x</button></div>' +
'<div class="ra-garantia-field"><label for="ra-garantia-date">Dia de garantia</label><div class="ra-garantia-row"><input id="ra-garantia-date" class="ra-garantia-date" type="date" min="' + escapeHtml(minDate) + '" value="' + escapeHtml(minDate) + '"><button type="button" class="ra-garantia-btn" id="ra-garantia-check">Revisar</button></div></div>' +
'<div id="ra-garantia-status" class="ra-garantia-status"></div><div id="ra-garantia-slots" class="ra-garantia-slots"></div>' +
'</div>';
document.body.appendChild(modal);
document.body.style.overflow = "hidden";
document.getElementById("ra-garantia-close").addEventListener("click", closeGarantiaModal);
modal.addEventListener("click", function(e){ if (e.target === modal) closeGarantiaModal(); });
var dateEl = document.getElementById("ra-garantia-date");
var checkBtn = document.getElementById("ra-garantia-check");
var check = function(){
var nextDate = String(dateEl.value || "").trim();
if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDate)) return setGarantiaStatus("Selecciona un día válido.", "error");
renderGarantiaSlots(original, nextDate);
};
checkBtn.addEventListener("click", check);
dateEl.addEventListener("change", check);
check();
}
function ensureReservaManageStyle(){
if (document.getElementById("ra-reserva-manage-style")) return;
var style = document.createElement("style");
style.id = "ra-reserva-manage-style";
style.textContent = [
".ra-manage-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:10001;display:flex;align-items:center;justify-content:center;padding:18px}",
".ra-manage-card{width:min(760px,100%);max-height:90vh;overflow:auto;background:#071f3e;border:1px solid rgba(205,163,73,.42);border-radius:18px;box-shadow:0 28px 90px rgba(0,0,0,.42);color:#eef4ff;padding:18px}",
".ra-manage-head{display:flex;justify-content:space-between;gap:10px;margin-bottom:14px}.ra-manage-title{margin:0;font-size:20px;font-weight:900}.ra-manage-close{border:1px solid rgba(205,163,73,.35);background:#0e2a52;color:#fff;border-radius:10px;padding:6px 9px;font-weight:900;cursor:pointer}",
".ra-manage-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.ra-manage-field.is-full{grid-column:1/-1}.ra-manage-field label{display:block;font-size:11px;font-weight:900;color:#f4c766;margin-bottom:5px}.ra-manage-input,.ra-manage-select,.ra-manage-textarea{width:100%;box-sizing:border-box;background:#0b2448;color:#fff;border:1px solid rgba(205,163,73,.32);border-radius:11px;padding:9px 10px;font-size:14px}.ra-manage-textarea{min-height:62px;resize:vertical}",
".ra-manage-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:14px}.ra-manage-btn{border:1px solid rgba(255,255,255,.72);background:#fff;color:#08224b;border-radius:12px;padding:10px 12px;font-weight:900;cursor:pointer}.ra-manage-danger{background:#8f1734;color:#fff;border-color:#8f1734}.ra-manage-status{min-height:18px;color:#b9c9df;font-size:12px;margin-top:10px}.ra-manage-status.is-error{color:#fecaca}.ra-manage-status.is-ok{color:#86efac}.ra-quote-output{margin-top:12px;border:1px solid rgba(205,163,73,.24);border-radius:14px;background:#0b2448;padding:12px}.ra-quote-line,.ra-quote-total{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-bottom:1px solid rgba(205,163,73,.14)}.ra-quote-total{border-bottom:0;font-size:16px;color:#fff}.ra-quote-note,.ra-quote-empty{color:#b9c9df;font-size:12px;margin-top:8px}.ra-quote-warn{margin-top:10px;padding:10px;border-radius:12px;background:#3b2d12;color:#ffe7a3;font-size:12px}@media(max-width:760px){.ra-manage-grid{grid-template-columns:1fr}}"
].join("");
document.head.appendChild(style);
}
function closeReservaManageModal(){
var modal = document.getElementById("ra-manage-modal");
if (modal) modal.remove();
document.body.style.overflow = "";
}
function setReservaManageStatus(text, type){
var elStatus = document.getElementById("ra-manage-status");
if (!elStatus) return;
elStatus.className = "ra-manage-status" + (type ? " is-" + type : "");
elStatus.textContent = text || "";
}
function fieldValue(id){var elField=document.getElementById(id);return elField?String(elField.value||"").trim():""}
function reservaPayloadFromForm(){
return {
route_date:fieldValue("ra-edit-route-date"),
route_date_label:fieldValue("ra-edit-route-date"),
slot:fieldValue("ra-edit-slot"),
name:fieldValue("ra-edit-name"),
phone:fieldValue("ra-edit-phone"),
email:fieldValue("ra-edit-email"),
address:fieldValue("ra-edit-address"),
apto:fieldValue("ra-edit-apto"),
comuna:fieldValue("ra-edit-comuna"),
service_category:fieldValue("ra-edit-category"),
services_text:fieldValue("ra-edit-services"),
upsells_text:fieldValue("ra-edit-upsells"),
total:fieldValue("ra-edit-total"),
minutes_cleaning:fieldValue("ra-edit-minutes"),
operador_id:fieldValue("ra-edit-operador"),
status:fieldValue("ra-edit-status"),
payment_status:fieldValue("ra-edit-payment-status")
};
}
function reservationDetailsFromPayload(payload){
var parts = [];
if (payload.route_date || payload.slot) parts.push("Fecha y hora: " + [payload.route_date, payload.slot].filter(Boolean).join(" "));
if (payload.services_text) parts.push("Servicio: " + payload.services_text);
if (payload.upsells_text) parts.push("Extras: " + payload.upsells_text);
if (payload.apto) parts.push("Depto/detalle: " + payload.apto);
if (Number(payload.total || 0)) parts.push("Total: " + money(payload.total));
return parts.join("\n");
}
function formatReservationServiceText(row){
var text = String(row && (row.services_text || row.service_category) || "Servicio Stupendo").trim();
var extras = String(row && row.upsells_text || "").trim();
if (extras) text += " | " + extras;
return text
.replace(/\s*\|\s*/g, " + ")
.replace(/\/\s*([a-záéíóúñ])/g, function(match, letter){ return "/" + letter.toUpperCase(); });
}
function compactReservationDate(row){
var raw = row && row.route_date ? String(row.route_date).slice(0,10) : "";
var d = raw ? new Date(raw + "T12:00:00") : null;
if (!d || isNaN(d.getTime())) return row && (row.route_date_label || row.route_date) ? String(row.route_date_label || row.route_date) : "día acordado";
return d.toLocaleDateString("es-CL", { weekday:"long", day:"numeric", month:"long" }).replace(",", "").toLowerCase();
}
function compactReservationAddress(row){
var street = String(row && row.address || "").split(",")[0].trim();
var apto = String(row && row.apto || "").trim();
var comuna = String(row && row.comuna || "").trim();
return [street, apto, comuna].filter(Boolean).join(", ") || "Dirección por confirmar";
}
function conciseReservationWhatsappMessage(row){
var name = String(row && row.name || "").trim();
var firstName = name.split(/\s+/)[0] || "";
var slot = String(row && row.slot || "").trim();
return [
(firstName ? "Hola " + firstName : "Hola") + " 😊",
"",
"Tu reserva está confirmada para el " + compactReservationDate(row) + (slot ? " a las " + slot + " hrs." : "."),
"",
"🛋️ " + formatReservationServiceText(row),
"📍 " + compactReservationAddress(row),
"💰 Total: " + money(row && row.total || 0),
"",
"Cualquier cambio o consulta, estamos atentos.",
"",
"¡Gracias por preferir Stupendo!"
].join("\n");
}
function reservationWhatsappMessageFromForm(){
var payload = reservaPayloadFromForm();
return conciseReservationWhatsappMessage(payload);
}
function normalizeWhatsappPhone(raw){
var digits = String(raw || "").replace(/\D+/g, "");
if (!digits) return "";
if (digits.indexOf("56") === 0) return digits;
if (digits.length === 9) return "56" + digits;
if (digits.length === 8) return "569" + digits;
return digits;
}
function whatsappUrl(phone, message){
var normalized = normalizeWhatsappPhone(phone);
if (!normalized) return "";
return "https://wa.me/" + normalized + "?text=" + encodeURIComponent(message || "");
}
function openReservationWhatsapp(){
var phone = normalizeWhatsappPhone(fieldValue("ra-edit-phone"));
if (!phone) return alert("La reserva no tiene teléfono.");
window.open(whatsappUrl(phone, reservationWhatsappMessageFromForm()), "_blank", "noopener,noreferrer");
}
function fullReservationDate(row){
var d = row && row.route_date ? new Date(String(row.route_date).slice(0,10) + "T12:00:00") : null;
if (!d || isNaN(d.getTime())) return row && row.route_date ? String(row.route_date) : "Por confirmar";
var txt = d.toLocaleDateString("es-CL", { weekday:"long", day:"numeric", month:"long" });
return txt.charAt(0).toUpperCase() + txt.slice(1);
}
function reservationWhatsappMessage(row){
return conciseReservationWhatsappMessage(row);
}
function openReservationRowWhatsapp(row){
var phone = normalizeWhatsappPhone(row && row.phone);
if (!phone) return copyTextToClipboard(reservationWhatsappMessage(row), "Mensaje copiado. La reserva no tiene teléfono.");
window.open(whatsappUrl(phone, reservationWhatsappMessage(row)), "_blank", "noopener,noreferrer");
}
async function triggerConversionEvent(reservationId){
if (!reservationId) return null;
try {
var sessionRes = await sb.auth.getSession();
var token = sessionRes && sessionRes.data && sessionRes.data.session && sessionRes.data.session.access_token;
if (!token) return null;
var res = await fetch(SEND_CONVERSION_EVENT_URL, {
method:"POST",
headers:{ "Content-Type":"application/json", "Authorization":"Bearer " + token, "apikey":SUPABASE_ANON_KEY },
body:JSON.stringify({ reservation_id:reservationId })
});
var data = await res.json().catch(function(){ return null; });
console.log("conversion_event_result", { reservation_id:reservationId, status:res.status, data:data });
return data;
} catch(e) {
console.error("conversion_event_error", e);
return null;
}
}
async function saveReservaForm(mode, reserva){
var payload = reservaPayloadFromForm();
if (!payload.route_date || !payload.slot || !payload.name || !payload.phone || !payload.address || !payload.comuna) {
setReservaManageStatus("Completa fecha, hora, cliente, teléfono, dirección y comuna.", "error");
return;
}
setReservaManageStatus("Guardando...", "");
var res = mode === "edit" ? await sb.rpc("admin_editar_reserva", { p_reserva_id:reserva.id, p_data:payload })
: await sb.rpc("admin_crear_reserva_rapida", { p_data:payload });
if (res.error) {
setReservaManageStatus(friendlyOperatorError(res.error), "error");
return;
}
var savedId = mode === "edit" ? reserva.id : (res.data && res.data[0] && res.data[0].id);
if (savedId && String(payload.status || "").toLowerCase() === "confirmed") {
triggerConversionEvent(savedId);
}
await loadAgenda({ preserveScroll:true });
setReservaManageStatus(mode === "edit" ? "Reserva actualizada." : "Reserva creada.", "ok");
setTimeout(closeReservaManageModal, 800);
}
function openReservaManageModal(mode, reserva){
ensureReservaManageStyle();
closeReservaManageModal();
reserva = reserva || {};
var title = mode === "edit" ? "Editar RLJ-" + reserva.id : "Reserva rápida";
var today = toIsoDateLocal(new Date());
var selectedOperator = reserva.operador_id || (activeOperators[0] && activeOperators[0].id) || "";
var modal = document.createElement("div");
modal.id = "ra-manage-modal";
modal.className = "ra-manage-backdrop";
modal.innerHTML =
'<div class="ra-manage-card" role="dialog" aria-modal="true" aria-label="' + escapeHtml(title) + '">' +
'<div class="ra-manage-head"><h2 class="ra-manage-title">' + escapeHtml(title) + '</h2><button type="button" class="ra-manage-close" id="ra-manage-close">x</button></div>' +
'<div class="ra-manage-grid">' +
'<div class="ra-manage-field"><label>Fecha</label><input id="ra-edit-route-date" class="ra-manage-input" type="date" value="' + escapeHtml(reserva.route_date || today) + '"></div>' +
'<div class="ra-manage-field"><label>Hora</label><input id="ra-edit-slot" class="ra-manage-input" type="time" value="' + escapeHtml(reserva.slot || "15:00") + '"></div>' +
'<div class="ra-manage-field"><label>Operador</label><select id="ra-edit-operador" class="ra-manage-select">' + operatorIdOptions(selectedOperator) + '</select></div>' +
'<div class="ra-manage-field"><label>Cliente</label><input id="ra-edit-name" class="ra-manage-input" value="' + escapeHtml(reserva.name || "") + '"></div>' +
'<div class="ra-manage-field"><label>Teléfono</label><input id="ra-edit-phone" class="ra-manage-input" value="' + escapeHtml(reserva.phone || (mode === "edit" ? "" : "+569")) + '"></div>' +
'<div class="ra-manage-field"><label>Email</label><input id="ra-edit-email" class="ra-manage-input" value="' + escapeHtml(reserva.email || "") + '"></div>' +
'<div class="ra-manage-field is-full"><label>Dirección</label><input id="ra-edit-address" class="ra-manage-input" value="' + escapeHtml(reserva.address || "") + '"></div>' +
'<div class="ra-manage-field"><label>Depto / detalle</label><input id="ra-edit-apto" class="ra-manage-input" value="' + escapeHtml(reserva.apto || reserva.department || reserva.oficina || "") + '"></div>' +
'<div class="ra-manage-field"><label>Comuna</label><input id="ra-edit-comuna" class="ra-manage-input" value="' + escapeHtml(reserva.comuna || "") + '"></div>' +
'<div class="ra-manage-field"><label>Categoría</label><select id="ra-edit-category" class="ra-manage-select"><option value="tapices">Tapices</option><option value="vehiculos">Vehículos</option><option value="pets">Pets</option><option value="productos">Productos</option></select></div>' +
'<div class="ra-manage-field is-full"><label>Servicio</label><textarea id="ra-edit-services" class="ra-manage-textarea">' + escapeHtml(reserva.services_text || "") + '</textarea></div>' +
'<div class="ra-manage-field is-full"><label>Upsell / extras</label><textarea id="ra-edit-upsells" class="ra-manage-textarea">' + escapeHtml(reserva.upsells_text || "") + '</textarea></div>' +
'<div class="ra-manage-field"><label>Total</label><input id="ra-edit-total" class="ra-manage-input" inputmode="numeric" value="' + escapeHtml(reserva.total || 0) + '"></div>' +
'<input id="ra-edit-minutes" type="hidden" value="' + escapeHtml(reserva.minutes_cleaning || 0) + '">' +
'<div class="ra-manage-field"><label>Estado</label><select id="ra-edit-status" class="ra-manage-select">' + adminStatusOptions(String(reserva.status || "confirmed").toLowerCase()) + '</select></div>' +
'<div class="ra-manage-field"><label>Pago</label><select id="ra-edit-payment-status" class="ra-manage-select"><option value="pending">Pendiente</option><option value="paid">Pagado</option></select></div>' +
'</div><div id="ra-manage-status" class="ra-manage-status"></div>' +
'<div class="ra-manage-actions"><button type="button" class="ra-manage-btn" id="ra-copy-phone">Copiar número</button><button type="button" class="ra-manage-btn" id="ra-copy-message">Copiar mensaje</button><button type="button" class="ra-manage-btn" id="ra-open-whatsapp">WhatsApp</button><button type="button" class="ra-manage-btn" id="ra-manage-save">Guardar</button></div>' +
'</div>';
document.body.appendChild(modal);
document.body.style.overflow = "hidden";
var cat = document.getElementById("ra-edit-category"); if (cat) cat.value = reserva.service_category || "tapices";
var pay = document.getElementById("ra-edit-payment-status"); if (pay) pay.value = String(reserva.payment_status || "pending").toLowerCase() === "paid" ? "paid" : "pending";
document.getElementById("ra-manage-close").addEventListener("click", closeReservaManageModal);
document.getElementById("ra-manage-save").addEventListener("click", function(){ saveReservaForm(mode, reserva); });
document.getElementById("ra-copy-phone").addEventListener("click", function(){ copyTextToClipboard(fieldValue("ra-edit-phone"), "Numero copiado."); });
document.getElementById("ra-copy-message").addEventListener("click", function(){ copyTextToClipboard(reservationWhatsappMessageFromForm(), "Mensaje copiado."); });
document.getElementById("ra-open-whatsapp").addEventListener("click", openReservationWhatsapp);
}
function closeQuickQuoteModal(){
var modal = document.getElementById("ra-quote-modal");
if (modal) modal.remove();
document.body.style.overflow = "";
}
function quoteText(result){
var items = (result && result.items) || [];
var totals = quoteTotals(items);
var minutes = items.reduce(function(sum, item){ return sum + Number(item.min || 0); }, 0);
var lines = items.map(function(item){
return (item.qty > 1 ? item.qty + " x " : "") + item.name + " - " + money(item.price);
});
var text = "Cotizaci\u00f3n Stupendo\n" + lines.join("\n") + "\nTotal normal: " + money(totals.normal);
if (totals.discount) text += "\nDescuento multiservicio 10%: -" + money(totals.discount);
text += "\nTotal estimado: " + money(totals.total);
if (minutes) text += "\nTiempo estimado: " + minutes + " min";
if (result.questions && result.questions.length) text += "\n\nDatos por confirmar:\n" + result.questions.join("\n");
if (result.warnings && result.warnings.length) text += "\n\nNotas:\n" + result.warnings.join("\n");
return text;
}
function quoteTotals(items){
items = items || [];
var normal = items.reduce(function(sum, item){ return sum + Number(item.price || 0); }, 0);
var serviceCount = items.reduce(function(sum, item){ return sum + Math.max(1, Number(item.qty || 1)); }, 0);
var discount = serviceCount >= 2 ? Math.round(normal * 0.10) : 0;
return { normal:normal, discount:discount, total:normal - discount };
}
function normalizeQuoteInput(text){
return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/,/g," ").replace(/\s+/g," ").trim();
}
function wordQty(value){
var map={un:1,una:1,uno:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10};
if (!value) return 1;
if (/^\d+$/.test(value)) return Number(value);
return map[value] || 1;
}
function sofaQuoteInfo(id, qty){
var map={
sillon_recto_2:["Sof\u00e1 recto 2 cuerpos",30000,30],
sillon_recto_3:["Sof\u00e1 recto 3 cuerpos",35000,35],
sillon_reclinable_3:["Sof\u00e1 reclinable 3 cuerpos",40000,45],
sillon_l_3:["Sof\u00e1 en L 3 cuerpos",40000,45],
sillon_l_4:["Sof\u00e1 en L 4 cuerpos",45000,50],
sillon_l_5:["Sof\u00e1 en L 5 cuerpos",50000,60],
sillon_l_6:["Sof\u00e1 en L 6 cuerpos",60000,70],
sillon_l_7:["Sof\u00e1 en L 7 cuerpos",70000,90]
};
var row = map[id], q = Math.max(1, Number(qty || 1));
return row ? { id:id, name:row[0], category:"Sillones", type:id.indexOf("_l_")>-1 ? "En L":"Rectos", qty:q, price:row[1]*q, normal_price:row[1]*q, min:row[2]*q } : null;
}
function quoteCatalogInfo(id, qty){
var map={
poltrona:["Poltrona/sitial","Sillones","Individuales",8000,10],
puff:["Puff","Sillones","Individuales",8000,10],
berger:["Berger","Sillones","Individuales",15000,15],
colchon_1:["Colch\u00f3n 1 plaza","Colchones","Colchones",15000,20],
colchon_1_5:["Colch\u00f3n 1.5 plazas","Colchones","Colchones",20000,25],
colchon_2:["Colch\u00f3n 2 plazas","Colchones","Colchones",32000,30],
colchon_queen:["Colch\u00f3n Queen","Colchones","Colchones",36000,30],
colchon_king:["Colch\u00f3n King","Colchones","Colchones",36000,30],
colchon_superking:["Colch\u00f3n Super King","Colchones","Colchones",40000,30],
colchon_cuna:["Colch\u00f3n cuna","Colchones","Colchones",10000,20],
respaldo:["Respaldo colch\u00f3n","Colchones","Complementos",20000,20],
bajada_cama:["Bajada de cama hasta 0,80 x 1,50","Colchones","Complementos",6500,5],
silla_base_respaldo:["Silla comedor base+respaldo","Sillas","Sillas",6500,5],
silla_escritorio:["Silla escritorio","Sillas","Sillas",12000,10],
silla_solo_base:["Silla comedor solo base","Sillas","Sillas",5000,5],
alfombra_bajada:["Bajada de cama hasta 0,80 x 1,50","Alfombras","Tamanos",6500,5],
alfombra_2x3:["Alfombra decorativa hasta 2x3","Alfombras","Tamanos",28000,25],
alfombra_3x5:["Alfombra grande 3x5","Alfombras","Tamanos",35000,35],
cama_mascota_s:["Cama de mascota S","Mascotas","Camas de mascota",6500,10],
cama_mascota_m:["Cama de mascota M","Mascotas","Camas de mascota",12000,15],
cama_mascota_l:["Cama de mascota L","Mascotas","Camas de mascota",18000,20],
cama_mascota_xl:["Cama de mascota XL","Mascotas","Camas de mascota",22000,25]
};
var row = map[id], q = Math.max(1, Number(qty || 1));
return row ? { id:id, name:row[0], category:row[1], type:row[2], qty:q, price:row[3]*q, normal_price:row[3]*q, min:row[4]*q } : null;
}
function fallbackQuickQuoteParse(rawText){
var src = normalizeQuoteInput(rawText);
var items = [], questions = [], warnings = [], seen = {};
function add(id, qty){
var item = sofaQuoteInfo(id, qty) || quoteCatalogInfo(id, qty);
if (!item) return;
if (seen[id]) {
var current = items.find(function(x){ return x.id === id; });
if (!current) return;
var oldQty = Math.max(1, Number(current.qty || 1));
var unitPrice = Number(current.price || 0) / oldQty;
var unitMin = Number(current.min || 0) / oldQty;
current.qty += Math.max(1, Number(qty || 1));
current.price = Math.round(unitPrice * current.qty);
current.normal_price = current.price;
current.min = Math.round(unitMin * current.qty);
return;
}
seen[id] = 1;
items.push(item);
}
src.replace(/(?:^|\s)(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+)?(sofas?|sillones?|sillon|seccionales?|seccional|esquinero)(?:\s+(en\s+l|ele|l|seccional|rinconero|esquinero|reclinable|recto))?(?:\s+(?:de\s+)?)?(\d+|dos|tres|cuatro|cinco|seis|siete)\s*(?:cuerpos|c\b|cpos)(?:\s+(en\s+l|ele|l|seccional|rinconero|esquinero|recto|reclinable))?/g,function(_,qty,noun,kindA,n,kindB){
var bodies = wordQty(n);
var kind = noun + " " + (kindA || "") + " " + (kindB || "");
var id = /reclinable/.test(kind) ? "sillon_reclinable_3" : (/\b(en\s+l|ele|l|seccional|rinconero|esquinero)\b/.test(kind) || bodies >= 4 ? "sillon_l_" + bodies : "sillon_recto_" + bodies);
add(id, wordQty(qty));
});
src.replace(/(poltronas?|sitiales?|puffs?|berger)/g,function(match,_group,offset){
var q = wordQty((src.slice(Math.max(0, offset - 18), offset).match(/(?:^|\s|y\s+|\+\s*)(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*$/) || [])[1]);
add(/berger/.test(match) ? "berger" : /puff/.test(match) ? "puff" : "poltrona", q);
});
src.replace(/alfombra(?:\s+(?:de\s+)?)?(\d+(?:[,.]\d+)?)\s*x\s*(\d+(?:[,.]\d+)?)/g,function(_,a,b){
var x = Number(String(a).replace(",",".")), y = Number(String(b).replace(",","."));
var small = Math.min(x,y), large = Math.max(x,y);
add(large <= 3 && small <= 2 ? "alfombra_2x3" : "alfombra_3x5", 1);
if (large > 3 || small > 2) warnings.push("La dejamos como alfombra grande para revisi\u00f3n.");
});
if (/alfombra/.test(src) && !items.some(function(x){ return x.category === "Alfombras"; })) {
if (/bajada/.test(src)) add("alfombra_bajada", 1);
else questions.push("\u00bfQu\u00e9 medida aproximada tiene la alfombra?");
}
src.replace(/(\d+|una|un|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(sillas(?:\s+de\s+comedor)?|silla\s+de\s+comedor|sillas\s+escritorio|silla\s+escritorio)(.{0,28})/g,function(match,q,label,tail){
tail = String(tail || "");
if (/escritorio/.test(label) || /escritorio/.test(tail)) { add("silla_escritorio", wordQty(q)); return; }
if (/solo\s*base|sin\s*respaldo/.test(tail)) { add("silla_solo_base", wordQty(q)); return; }
if (/base\s*(?:\+|y|con)\s*respaldo|con\s*respaldo|respaldo/.test(tail)) { add("silla_base_respaldo", wordQty(q)); return; }
questions.push("Completa si las sillas son solo base o con respaldo.");
});
if (/colchon|matrimonial/.test(src)) {
if (/super\s*king/.test(src)) add("colchon_superking", 1);
else if (/king/.test(src)) add("colchon_king", 1);
else if (/queen/.test(src)) add("colchon_queen", 1);
else if (/cuna/.test(src)) add("colchon_cuna", 1);
else if (/1[,.]\s*5|una\s+y\s+media/.test(src)) add("colchon_1_5", 1);
else if (/matrimonial|2\s*plazas|dos\s*plazas/.test(src)) add("colchon_2", 1);
else if (/1\s*plaza|una\s*plaza/.test(src)) add("colchon_1", 1);
else questions.push("\u00bfDe qu\u00e9 tama\u00f1o es el colch\u00f3n: 1 plaza, 2 plazas, Queen, King o Super King?");
}
if (/respaldo/.test(src) && !/(sillas|silla de comedor).{0,24}respaldo|respaldo.{0,24}(sillas|silla de comedor)/.test(src)) add("respaldo", 1);
if (/bajada/.test(src) && !items.some(function(x){ return x.id === "bajada_cama" || x.id === "alfombra_bajada"; })) add("bajada_cama", 1);
if (/cama.*mascota|mascota/.test(src)) {
if (/\bxl\b|extra grande/.test(src)) add("cama_mascota_xl", 1);
else if (/\bl\b|grande/.test(src)) add("cama_mascota_l", 1);
else if (/\bm\b|mediana/.test(src)) add("cama_mascota_m", 1);
else if (/\bs\b|pequena|chica/.test(src)) add("cama_mascota_s", 1);
else questions.push("\u00bfLa cama de mascota es S, M, L o XL?");
}
if (/\b(sofa|sillon|seccional|esquinero)\b/.test(src) && !items.some(function(x){ return x.category === "Sillones"; })) {
questions.push("Completa de cu\u00e1ntos cuerpos es el sof\u00e1. Si no indicas en L, lo considero recto.");
}
return {items:items,questions:questions,warnings:warnings};
}
function parseQuickQuote(rawText){
var parsed = null;
try {
if (window.StupendoSmartQuote && typeof window.StupendoSmartQuote.parse === "function") {
parsed = window.StupendoSmartQuote.parse(rawText);
}
} catch(e) {
console.error("Error en StupendoSmartQuote.parse", e);
}
if (!parsed || (!((parsed.items || []).length) && !((parsed.questions || []).length))) {
parsed = fallbackQuickQuoteParse(rawText);
}
return applyQuoteQuantityFixes(rawText, parsed);
}
function applyQuoteQuantityFixes(rawText, result){
result = result || { items:[], questions:[], warnings:[] };
var src = normalizeQuoteInput(rawText);
var expected = {};
src.replace(/(?:^|\s)(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+)?(sofas?|sillones?|sillon|seccionales?|seccional|esquinero)(?:\s+(en\s+l|ele|l|seccional|rinconero|esquinero|reclinable|recto))?(?:\s+(?:de\s+)?)?(\d+|dos|tres|cuatro|cinco|seis|siete)\s*(?:cuerpos|c\b|cpos)(?:\s+(en\s+l|ele|l|seccional|rinconero|esquinero|recto|reclinable))?/g,function(_,qty,noun,kindA,n,kindB){
var bodies = wordQty(n);
var kind = noun + " " + (kindA || "") + " " + (kindB || "");
var id = /reclinable/.test(kind) ? "sillon_reclinable_3" : (/\b(en\s+l|ele|l|seccional|rinconero|esquinero)\b/.test(kind) || bodies >= 4 ? "sillon_l_" + bodies : "sillon_recto_" + bodies);
expected[id] = (expected[id] || 0) + wordQty(qty);
});
Object.keys(expected).forEach(function(id){
if ((result.items || []).some(function(item){ return item.id === id; })) return;
var bodies = (id.match(/_(\d)$/) || [])[1];
var old = bodies ? (result.items || []).find(function(item){ return item.id === "sillon_recto_" + bodies || item.id === "sillon_l_" + bodies; }) : null;
var fixed = sofaQuoteInfo(id, expected[id]);
if (old && fixed) Object.assign(old, fixed);
else if (fixed) (result.items = result.items || []).push(fixed);
});
(result.items || []).forEach(function(item){
var want = expected[item.id];
if (!want || Number(item.qty || 1) >= want) return;
var oldQty = Math.max(1, Number(item.qty || 1));
var unitPrice = Number(item.price || 0) / oldQty;
var unitMin = Number(item.min || 0) / oldQty;
item.qty = want;
item.price = Math.round(unitPrice * want);
item.normal_price = item.price;
item.min = Math.round(unitMin * want);
});
return result;
}
function quoteServiceText(items){
items = items || [];
if (!items.length) return "el servicio";
if (items.length === 1) {
var item = items[0];
return (item.qty > 1 ? item.qty + " " : "un ") + String(item.name || "servicio").toLowerCase();
}
return items.map(function(item){
return (item.qty > 1 ? item.qty + " " : "1 ") + String(item.name || "servicio").toLowerCase();
}).join(", ");
}
function quoteClientMessage(result){
var items = (result && result.items) || [];
var totals = quoteTotals(items);
var minutes = Number(result && result.minutes || items.reduce(function(sum, item){ return sum + Number(item.min || 0); }, 0));
var timeText = minutes ? (minutes + " a " + (minutes + 10) + " min") : "seg\u00fan evaluaci\u00f3n";
var serviceLines = items.map(function(item){
return "- Limpieza de " + (item.qty > 1 ? item.qty + " " : "") + String(item.name || "servicio").toLowerCase();
});
var intro = ["Para su caso, el servicio ser\u00eda:", "", serviceLines.join("\n"), ""];
if (totals.discount) {
intro.push("Total normal: " + money(totals.normal), "", "Aplicando descuento multiservicio del 10%, queda en " + money(totals.total) + " a domicilio.");
} else {
intro.push("El valor es de " + money(totals.total) + " a domicilio.");
}
return intro.concat([
"",
"Trabajamos con m\u00e1quina profesional de inyecci\u00f3n-extracci\u00f3n, ideal para una limpieza profunda del tapiz.",
"",
"- Extraemos suciedad desde el interior",
"- Ayudamos a eliminar manchas, olores y \u00e1caros",
"- Baja humedad para un secado m\u00e1s r\u00e1pido",
"- Incluye respaldos, asientos y apoyabrazos cuando corresponde",
"",
"Tiempo aprox: " + timeText,
"",
"Si le acomoda, tambi\u00e9n puedo revisar disponibilidad para agendar."
]).join("\n");
}
async function copyTextToClipboard(text, okMessage){
try {
await navigator.clipboard.writeText(text);
alert(okMessage || "Texto copiado.");
} catch(e) {
alert(text);
}
}
function renderQuoteResult(result){
var out = document.getElementById("ra-quote-output");
var actions = document.getElementById("ra-quote-actions");
if (!out || !actions) return;
var items = (result && result.items) || [];
if (!result || (!items.length && !(result.questions && result.questions.length))) {
out.innerHTML = '<div class="ra-quote-empty">Escribe algo como: sof\u00e1 3 cuerpos + puff, 6 sillas comedor, alfombra 2x3 o colch\u00f3n king.</div>';
actions.style.display = "none";
return;
}
var totals = quoteTotals(items);
var minutes = items.reduce(function(sum, item){ return sum + Number(item.min || 0); }, 0);
var html = "";
if (items.length) {
html += items.map(function(item){
return '<div class="ra-quote-line"><span>' + escapeHtml((item.qty > 1 ? item.qty + " x " : "") + item.name) + '</span><strong>' + money(item.price) + '</strong></div>';
}).join("");
html += '<div class="ra-quote-line"><span>Total normal</span><strong>' + money(totals.normal) + '</strong></div>';
if (totals.discount) html += '<div class="ra-quote-line"><span>Descuento multiservicio 10%</span><strong>-' + money(totals.discount) + '</strong></div>';
html += '<div class="ra-quote-total"><span>Total estimado</span><strong>' + money(totals.total) + '</strong></div>';
if (minutes) html += '<div class="ra-quote-note">Tiempo estimado: ' + minutes + ' min</div>';
}
if (result.questions && result.questions.length) html += '<div class="ra-quote-warn"><strong>Falta confirmar:</strong><br>' + result.questions.map(escapeHtml).join("<br>") + '</div>';
if (result.warnings && result.warnings.length) html += '<div class="ra-quote-warn"><strong>Nota:</strong><br>' + result.warnings.map(escapeHtml).join("<br>") + '</div>';
out.innerHTML = html;
actions.style.display = items.length ? "flex" : "none";
out.dataset.quote = JSON.stringify({items:items,questions:result.questions||[],warnings:result.warnings||[],normal:totals.normal,discount:totals.discount,total:totals.total,minutes:minutes});
}
function openQuickQuoteModal(){
ensureReservaManageStyle();
closeQuickQuoteModal();
var modal = document.createElement("div");
modal.id = "ra-quote-modal";
modal.className = "ra-manage-backdrop";
modal.innerHTML =
'<div class="ra-manage-card" role="dialog" aria-modal="true" aria-label="Cotizador rapido">' +
'<div class="ra-manage-head"><h2 class="ra-manage-title">Cotizador tapices</h2><button type="button" class="ra-manage-close" id="ra-quote-close">x</button></div>' +
'<div class="ra-manage-field is-full"><label>Escribe como WhatsApp</label><textarea id="ra-quote-input" class="ra-manage-textarea" style="min-height:96px" placeholder="Ej: sof\u00e1 3 cuerpos + puff + alfombra 2x3"></textarea></div>' +
'<div class="ra-manage-actions" style="justify-content:flex-start"><button type="button" class="ra-manage-btn" id="ra-quote-run">Cotizar</button></div>' +
'<div id="ra-quote-output" class="ra-quote-output"></div>' +
'<div id="ra-quote-actions" class="ra-manage-actions" style="display:none"><button type="button" class="ra-manage-btn" id="ra-quote-copy">Copiar cotizaci\u00f3n</button><button type="button" class="ra-manage-btn" id="ra-quote-message">Mensaje</button><button type="button" class="ra-manage-btn" id="ra-quote-reserva">Continuar a reserva r\u00e1pida</button></div>' +
'</div>';
document.body.appendChild(modal);
document.body.style.overflow = "hidden";
var input = document.getElementById("ra-quote-input");
var run = function(){
var raw = input.value || "";
renderQuoteResult(parseQuickQuote(raw));
};
document.getElementById("ra-quote-close").addEventListener("click", closeQuickQuoteModal);
document.getElementById("ra-quote-run").addEventListener("click", run);
input.addEventListener("keydown", function(ev){ if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)) run(); });
input.addEventListener("input", function(){
clearTimeout(input._quoteTimer);
input._quoteTimer = setTimeout(run, 250);
});
document.getElementById("ra-quote-copy").addEventListener("click", async function(){
var data = JSON.parse(document.getElementById("ra-quote-output").dataset.quote || "{}");
copyTextToClipboard(quoteText(data), "Cotizaci\u00f3n copiada.");
});
document.getElementById("ra-quote-message").addEventListener("click", function(){
var data = JSON.parse(document.getElementById("ra-quote-output").dataset.quote || "{}");
copyTextToClipboard(quoteClientMessage(data), "Mensaje copiado.");
});
document.getElementById("ra-quote-reserva").addEventListener("click", function(){
var data = JSON.parse(document.getElementById("ra-quote-output").dataset.quote || "{}");
var items = data.items || [];
closeQuickQuoteModal();
openReservaManageModal("create", {
route_date:toIsoDateLocal(new Date()),
slot:"10:00",
status:"confirmed",
payment_status:"pending",
service_category:"tapices",
services_text:items.map(function(item){ return (item.qty > 1 ? item.qty + " x " : "") + item.name; }).join(" + "),
total:data.total || 0,
minutes_cleaning:data.minutes || 0
});
});
setTimeout(function(){ input.focus(); }, 50);
renderQuoteResult(null);
}
async function deleteReservaAdmin(id){
var res = await sb.rpc("admin_eliminar_reserva", { p_reserva_id:id });
if (res.error) throw res.error;
return true;
}
function applyFilters(rows){
var filtered = rows.slice();
if (currentRole === "admin") {
if (activeFilter === "active") filtered = filtered.filter(function(r){ return isActiveStatus(r.status); });
else if (activeFilter === "pending") filtered = filtered.filter(function(r){ return String(r.status || "").toLowerCase() === "pending"; });
else if (activeFilter === "confirmed") filtered = filtered.filter(function(r){ return String(r.status || "").toLowerCase() === "confirmed"; });
else if (activeFilter === "on_the_way") filtered = filtered.filter(function(r){ return String(r.status || "").toLowerCase() === "on_the_way"; });
else if (activeFilter === "in_service") filtered = filtered.filter(function(r){ return String(r.status || "").toLowerCase() === "in_service"; });
else if (activeFilter === "finalizada") filtered = filtered.filter(function(r){ return String(r.status || "").toLowerCase() === "finalizada"; });
else if (activeFilter === "cancelled") filtered = filtered.filter(function(r){ return String(r.status || "").toLowerCase() === "cancelled"; });
else if (activeFilter === "unassigned") filtered = filtered.filter(function(r){ return !principalOperatorId(r); });
else if (activeFilter === "paid") filtered = filtered.filter(function(r){ return String(r.payment_status || "").toLowerCase() === "paid"; });
else if (activeFilter === "payment_pending") filtered = filtered.filter(function(r){ return String(r.payment_status || "").toLowerCase() !== "paid"; });
else if (activeFilter === "proof") filtered = filtered.filter(function(r){ return !!r.payment_proof_url || !!r.payment_proof_media_id; });
else if (activeFilter === "mp_approved") filtered = filtered.filter(function(r){ return String(r.mp_payment_status || "").toLowerCase() === "approved"; });
}
if (currentRole !== "admin") filtered = filtered.filter(function(r){ return isOperatorVisibleStatus(r.status); });
return sortRows(filtered);
}
function reservaOperatorAssignments(row){
return (row && Array.isArray(row.reserva_operadores) ? row.reserva_operadores : []).slice();
}
function assignmentName(assignment){
return assignment && assignment.operador ? (assignment.operador.nombre || assignment.operador.email || assignment.operador_id) : (assignment && assignment.operador_id || "");
}
function principalAssignment(row){
var list = reservaOperatorAssignments(row);
return list.find(function(item){ return String(item.rol || "").toLowerCase().indexOf("principal") >= 0; }) || list[0] || null;
}
function supportAssignment(row){
var list = reservaOperatorAssignments(row);
return list.find(function(item){ return String(item.rol || "").toLowerCase().indexOf("principal") < 0; }) || null;
}
function principalOperatorId(row){
var principal = principalAssignment(row);
return principal && principal.operador_id ? String(principal.operador_id) : String(row && row.operador_id || "");
}
function supportOperatorId(row){
var support = supportAssignment(row);
return support && support.operador_id ? String(support.operador_id) : "";
}
function operatorDisplay(row){
var list = reservaOperatorAssignments(row);
if (list.length) return list.map(assignmentName).filter(Boolean).join(" / ");
return row && (row.operador || row.operador_nombre) ? (row.operador || row.operador_nombre) : "Sin operador";
}
function operatorRolesHtml(row){
var list = reservaOperatorAssignments(row);
if (!list.length) return '<div class="relujo-ag-subline">Rol: principal</div>';
return list.map(function(item){
return '<div class="relujo-ag-subline">' + escapeHtml(assignmentName(item)) + ': ' + escapeHtml(item.rol || "apoyo") + '</div>';
}).join("");
}
function operatorOptions(selected){
var html = '<option value="">Sin operador</option>';
activeOperators.forEach(function(op){
var id = String(op.id || "");
html += '<option value="' + escapeHtml(id) + '"' + (String(selected || "") === id ? " selected" : "") + '>' + escapeHtml(op.nombre || id) + '</option>';
});
return html;
}
function operatorIdOptions(selected){
var html = '<option value="">Sin operador</option>';
activeOperators.forEach(function(op){
var id = String(op.id || "");
html += '<option value="' + escapeHtml(id) + '"' + (String(selected || "") === id ? " selected" : "") + '>' + escapeHtml(op.nombre || id) + '</option>';
});
return html;
}
function adminStatusOptions(selected){
var list = [
{ value:"pending", label:"Pendiente" },
{ value:"confirmed", label:"Confirmada" },
{ value:"on_the_way", label:"En camino" },
{ value:"in_service", label:"En servicio" },
{ value:"finalizada", label:"Finalizada" },
{ value:"cancelled", label:"Cancelada" }
];
return list.map(function(item){
return '<option value="' + item.value + '"' + (item.value === selected ? " selected" : "") + '>' + item.label + '</option>';
}).join("");
}
function operadorStatusOptions(selected){
var list = [
{ value:"confirmed", label:"Confirmada" },
{ value:"on_the_way", label:"En camino" },
{ value:"in_service", label:"En servicio" },
{ value:"finalizada", label:"Finalizada" },
{ value:"cancelled", label:"Cancelada" }
];
return list.map(function(item){
return '<option value="' + item.value + '"' + (item.value === selected ? " selected" : "") + '>' + item.label + '</option>';
}).join("");
}
function trackingValue(item, keys){
for (var i = 0; i < keys.length; i += 1) {
var key = keys[i];
if (item && item[key]) return item[key];
if (item && item.tracking_data && item.tracking_data[key]) return item.tracking_data[key];
}
return "";
}
function trackingSourceLabel(item){
var source = String(trackingValue(item, ["source","utm_source","attributed_source"]) || "").toLowerCase();
var medium = String(trackingValue(item, ["medium","utm_medium","attributed_medium"]) || "").toLowerCase();
var from = String(trackingValue(item, ["created_from"]) || "").toLowerCase();
if (trackingValue(item, ["fbclid","attributed_fbclid"])) return "Meta Ads";
if (source.indexOf("instagram") > -1 || medium.indexOf("instagram") > -1) return "Instagram";
if (source.indexOf("facebook") > -1 || source.indexOf("meta") > -1 || medium.indexOf("paid") > -1) return "Meta Ads";
if (trackingValue(item, ["gclid","attributed_gclid"]) || source.indexOf("google") > -1) return "Google Ads";
if (source.indexOf("whatsapp") > -1 || from.indexOf("whatsapp") > -1) return "WhatsApp";
if (from.indexOf("admin") > -1 || from.indexOf("manual") > -1) return "Manual/Admin";
return "Sin tracking";
}
function trackingDetailHtml(item){
var campaign = trackingValue(item, ["campaign","utm_campaign","attributed_campaign","campaign_id"]) || "";
var adset = trackingValue(item, ["adset","attributed_adset","adset_id"]) || "";
var ad = trackingValue(item, ["ad","attributed_ad","ad_id","utm_content"]) || "";
var parts = [];
if (campaign) parts.push("Campaña: " + campaign);
if (adset) parts.push("Conjunto: " + adset);
if (ad) parts.push("Anuncio: " + ad);
if (!parts.length && trackingValue(item, ["fbclid","gclid","igclid"])) parts.push("Click ID capturado");
return parts.length ? parts.map(escapeHtml).join("<br>") : "Sin campaña";
}
function conversionStatusHtml(item){
var eventId = item && item.meta_capi_event_id ? item.meta_capi_event_id : (item && item.id ? "reservation_" + item.id : "");
var sent = item && item.meta_capi_purchase_sent;
var error = item && item.meta_capi_last_error;
var response = item && item.meta_capi_last_response;
var label = sent ? "Meta enviado: sí" : (error ? "Meta enviado: error" : "Meta enviado: no");
var html = '<span class="relujo-ag-subline">' + escapeHtml(label) + '</span>';
if (eventId) html += '<span class="relujo-ag-subline">Event ID: ' + escapeHtml(eventId) + '</span>';
if (error) html += '<span class="relujo-ag-subline">Error: ' + escapeHtml(String(error).slice(0,120)) + '</span>';
if (response) html += '<span class="relujo-ag-subline">Última respuesta: ' + escapeHtml(JSON.stringify(response).slice(0,120)) + '</span>';
return html;
}
function renderAdminRows(rows){
return rows.map(function(item){
var address = item.address || "—";
var apto = item.apto || item.department || item.oficina || "";
var comuna = item.comuna || "—";
var isCancelled = String(item.status || "").toLowerCase() === "cancelled";
var isPaid = String(item.payment_status || "").toLowerCase() === "paid";
var observation = systemObservationText(item);
var operational = vehicleOperationalDetails(item);
var travelLine = travelFeeLine(item);
var canCall = item.phone ? ("tel:" + escapeHtml(item.phone)) : "#";
var mapsLink = "https://www.google.com/maps/search/api=1&query=" + encodeURIComponent((item.address || "") + ", " + (item.comuna || ""));
var proofHtml = item.payment_proof_url
 ? '<button type="button" class="relujo-ag-btn-secondary" data-proof-url="' + escapeHtml(item.payment_proof_url) + '">Ver</button>'
: (item.payment_proof_media_id
 ? '<span class="relujo-ag-proof" title="Comprobante recibido">Foto</span>'
: '<span class="relujo-ag-muted">&mdash;</span>');
return `
<tr class="${isCancelled ? "relujo-ag-row-cancelled" : ""}">
<td class="relujo-ag-cell-actions">
<div class="relujo-ag-action-group" style="margin-bottom:4px;">
<button type="button" class="relujo-ag-btn-secondary" data-priority-id="${item.id}">Prioridad</button>
${isFullPremiumVehicleRow(item) ? '<button type="button" class="relujo-ag-btn-secondary" data-sync-full-premium-id="' + item.id + '">Full+</button>' : ''}
<button type="button" class="relujo-ag-btn-secondary" data-edit-id="${item.id}">Editar</button>
<button type="button" class="relujo-ag-btn-secondary relujo-ag-btn-danger" data-delete-id="${item.id}">x</button>
${isCancelled ? '' : '<button type="button" class="relujo-ag-btn-secondary relujo-ag-btn-danger" data-cancel-id="' + item.id + '">Cancelar</button>'}
${isPaid ? '<button type="button" class="relujo-ag-btn-secondary relujo-ag-btn-success" disabled>Pagado</button>' : '<button type="button" class="relujo-ag-btn-secondary relujo-ag-btn-success" data-paid-id="' + item.id + '">Marcar pagado</button>'}
<a class="relujo-ag-btn-secondary" href="${canCall}">Llamar</a>
<a class="relujo-ag-btn-secondary" target="_blank" href="${mapsLink}">Ruta</a>
<button type="button" class="relujo-ag-btn-secondary" style="background:#16a34a;color:#fff;border-color:#16a34a" data-wsp-id="${item.id}">Wsp</button>
</div>
<div class="relujo-ag-main" style="margin:4px 0">${escapeHtml(operatorDisplay(item))}</div>
${operatorRolesHtml(item)}
<select class="relujo-ag-inline-select" data-operator-id="${item.id}" title="Operador principal">
${operatorOptions(principalOperatorId(item))}
</select>
<select class="relujo-ag-inline-select" data-support-operator-id="${item.id}" title="Operador de apoyo" style="margin-top:4px">
${operatorOptions(supportOperatorId(item))}
</select>
</td>
<td class="relujo-ag-cell-datetime">
<div class="relujo-ag-stack">
<div class="relujo-ag-main">${escapeHtml(friendlyDate(item.route_date))}</div>
<div class="relujo-ag-subline">${escapeHtml(item.slot || "&mdash;")}</div>
</div>
</td>
<td class="relujo-ag-cell-location relujo-ag-wrapcell">
<div class="relujo-ag-stack">
<div class="relujo-ag-main">${escapeHtml(address)}</div>
<div class="relujo-ag-subline">${escapeHtml(apto || "&mdash;")}</div>
<div class="relujo-ag-subline">${escapeHtml(comuna)}</div>
${travelLine ? '<div class="relujo-ag-subline">' + escapeHtml(travelLine) + '</div>' : ''}
</div>
</td>
<td class="relujo-ag-cell-client">
<div class="relujo-ag-stack">
<div class="relujo-ag-main">${escapeHtml(item.name || "Sin nombre")}</div>
<div class="relujo-ag-subline">${escapeHtml(item.phone || "&mdash;")}</div>
</div>
</td>
<td class="relujo-ag-cell-meta">
<div class="relujo-ag-track">
<span class="relujo-ag-track-source">${escapeHtml(trackingSourceLabel(item))}</span>
<span class="relujo-ag-track-detail">${trackingDetailHtml(item)}</span>
${conversionStatusHtml(item)}
</div>
</td>
<td class="relujo-ag-cell-status">
<div style="margin-bottom:4px;">${badgeForStatus(item.status)}</div>
<select class="relujo-ag-inline-select" data-status-id="${item.id}">
${adminStatusOptions(String(item.status || "").toLowerCase())}
</select>
</td>
<td class="relujo-ag-cell-paymentcompact">
<div class="relujo-ag-payment-box">
<div class="relujo-ag-payment-row">
${badgeForPaymentStatus(item.payment_status)}
${badgeForMpStatus(item.mp_payment_status)}
</div>
<div class="relujo-ag-subline">Origen: ${escapeHtml(paymentSourceLabel(item))}</div>
<div class="relujo-ag-subline">Fecha: ${escapeHtml(friendlyDateTime(item.paid_at))}</div>
<div class="relujo-ag-payment-row">
<span class="relujo-ag-subline" style="opacity:1;">Comp:</span>
${proofHtml}
</div>
${observation ? '<div class="relujo-ag-subline">Obs: ' + escapeHtml(observation) + '</div>' : ''}
</div>
</td>
<td class="relujo-ag-cell-servicecompact relujo-ag-wrapcell">
<div class="relujo-ag-stack">
<div class="relujo-ag-main">${escapeHtml(item.services_text || "&mdash;")}</div>
<div class="relujo-ag-subline">Upsell: ${escapeHtml(item.upsells_text || "&mdash;")}</div>
${operational ? '<div class="relujo-ag-subline">Operación: ' + escapeHtml(operational) + '</div>' : ''}
</div>
</td>
<td class="relujo-ag-cell-meta">
<div class="relujo-ag-stack">
<div class="relujo-ag-main">${escapeHtml(String(item.minutes_cleaning || 0) + " min")}</div>
<div class="relujo-ag-subline">RLJ-${escapeHtml(item.id)}</div>
<div class="relujo-ag-subline">${escapeHtml(money(item.total || 0))}</div>
${travelFeeValue(item) ? '<div class="relujo-ag-subline">Base: ' + escapeHtml(money(serviceBaseValue(item))) + ' / Traslado: ' + escapeHtml(money(travelFeeValue(item))) + '</div>' : ''}
<div class="relujo-ag-action-group" style="margin-top:6px;"><button type="button" class="relujo-ag-btn-secondary" data-garantia-id="${item.id}">Garantia</button></div>
</div>
</td>
</tr>
`;
}).join("");
}
function renderOperadorRows(rows){
return rows.map(function(item){
var address = item.address || "—";
var apto = item.apto || item.department || item.oficina || "";
var comuna = item.comuna || "—";
var isCancelled = String(item.status || "").toLowerCase() === "cancelled";
var isPaid = String(item.payment_status || "").toLowerCase() === "paid";
var operational = vehicleOperationalDetails(item);
var travelLine = travelFeeLine(item);
var canCall = item.phone ? ("tel:" + escapeHtml(item.phone)) : "#";
var mapsLink = "https://www.google.com/maps/search/api=1&query=" + encodeURIComponent((item.address || "") + ", " + (item.comuna || ""));
var cashButton = !isCancelled && !isPaid
 ? '<button type="button" class="relujo-ag-btn-secondary relujo-ag-btn-success" data-cash-id="' + item.id + '">Efectivo</button>'
: (isPaid ? '<button type="button" class="relujo-ag-btn-secondary relujo-ag-btn-success" disabled>Pagado</button>' : '');
return `
<tr class="${isCancelled ? "relujo-ag-row-cancelled" : ""}">
<td class="relujo-ag-cell-actions">
<div class="relujo-ag-action-group">
<a class="relujo-ag-btn-secondary" href="${canCall}">Llamar</a>
<a class="relujo-ag-btn-secondary" target="_blank" href="${mapsLink}">Ruta</a>
</div>
</td>
<td class="relujo-ag-cell-datetime">
<div class="relujo-ag-stack">
<div class="relujo-ag-main">${escapeHtml(friendlyDate(item.route_date))}</div>
<div class="relujo-ag-subline">${escapeHtml(item.slot || "&mdash;")}</div>
</div>
</td>
<td class="relujo-ag-cell-location relujo-ag-wrapcell">
<div class="relujo-ag-stack">
<div class="relujo-ag-main">${escapeHtml(address)}</div>
<div class="relujo-ag-subline">${escapeHtml(apto || "&mdash;")}</div>
<div class="relujo-ag-subline">${escapeHtml(comuna)}</div>
${travelLine ? '<div class="relujo-ag-subline">' + escapeHtml(travelLine) + '</div>' : ''}
</div>
</td>
<td class="relujo-ag-cell-client">
<div class="relujo-ag-stack">
<div class="relujo-ag-main">${escapeHtml(item.name || "Sin nombre")}</div>
<div class="relujo-ag-subline">${escapeHtml(item.phone || "&mdash;")}</div>
</div>
</td>
<td class="relujo-ag-cell-servicecompact relujo-ag-wrapcell">
<div class="relujo-ag-stack">
<div class="relujo-ag-main">${escapeHtml(item.services_text || "&mdash;")}</div>
<div class="relujo-ag-subline">Upsell: ${escapeHtml(item.upsells_text || "&mdash;")}</div>
${operational ? '<div class="relujo-ag-subline">Operación: ' + escapeHtml(operational) + '</div>' : ''}
</div>
</td>
<td class="relujo-ag-cell-status">
<div style="margin-bottom:4px;">${badgeForStatus(item.status)}</div>
${String(item.status || "").toLowerCase() === "cancelled"
 ? '<span class="relujo-ag-muted">Sin cambios</span>'
: `<select class="relujo-ag-inline-select" data-status-id="${item.id}">
${operadorStatusOptions(String(item.status || "").toLowerCase())}
</select>`
}
</td>
<td class="relujo-ag-cell-meta">
<div class="relujo-ag-stack">
<div class="relujo-ag-main">${escapeHtml(String(item.minutes_cleaning || 0) + " min")}</div>
<div class="relujo-ag-subline">RLJ-${escapeHtml(item.id)}</div>
${travelFeeValue(item) ? '<div class="relujo-ag-subline">Traslado operador: ' + escapeHtml(money(travelFeeValue(item))) + '</div>' : ''}
<div class="relujo-ag-action-group" style="margin-top:6px;">${cashButton}</div>
</div>
</td>
</tr>
`;
}).join("");
}
function render(rows){
listEl.innerHTML = "";
if (!rows.length) {
listEl.innerHTML = '<div class="relujo-ag-empty">No encontramos reservas con los filtros actuales.</div>';
statusEl.textContent = "0 reservas";
} else {
statusEl.textContent = rows.length + " reserva" + (rows.length === 1 ? "" : "s");
if (currentRole === "admin") {
listEl.innerHTML = `
<div class="relujo-ag-table-wrap">
<table class="relujo-ag-table">
<thead>
<tr>
<th>Acción</th>
<th>Fecha / Hora</th>
<th>Dirección / Comuna</th>
<th>Cliente / Teléfono</th>
<th>Origen campa\u00f1a</th>
<th>Estado</th>
<th>Pago</th>
<th>Servicios / Upsell</th>
<th>Tiempo / ID / Total</th>
</tr>
</thead>
<tbody>
${renderAdminRows(rows)}
</tbody>
</table>
</div>
`;
} else {
listEl.innerHTML = `
<div class="relujo-ag-table-wrap">
<table class="relujo-ag-table">
<thead>
<tr>
<th>Acción</th>
<th>Fecha / Hora</th>
<th>Dirección / Comuna</th>
<th>Cliente / Teléfono</th>
<th>Servicios / Upsell</th>
<th>Estado</th>
<th>Tiempo / ID</th>
</tr>
</thead>
<tbody>
${renderOperadorRows(rows)}
</tbody>
</table>
</div>
`;
}
}
if (currentRole === "admin") {
Array.from(listEl.querySelectorAll("[data-cancel-id]")).forEach(function(btn){
btn.addEventListener("click", async function(){
var id = Number(btn.getAttribute("data-cancel-id"));
if (!id) return;
if (!window.confirm("¿Cancelar esta reserva?")) return;
var oldText = btn.textContent;
btn.disabled = true;
btn.textContent = "Cancelando...";
try {
await cancelReserva(id);
await loadAgenda({ preserveScroll:true });
} catch (err) {
alert("No se pudo cancelar: " + (err && err.message ? err.message : err));
btn.disabled = false;
btn.textContent = oldText;
}
});
});
Array.from(listEl.querySelectorAll("[data-paid-id]")).forEach(function(btn){
btn.addEventListener("click", async function(){
var id = Number(btn.getAttribute("data-paid-id"));
if (!id) return;
if (!window.confirm("¿Marcar esta reserva como pagada?")) return;
var oldText = btn.textContent;
btn.disabled = true;
btn.textContent = "Guardando...";
try {
await markAsPaid(id);
await loadAgenda({ preserveScroll:true });
} catch (err) {
alert("No se pudo marcar como pagado: " + (err && err.message ? err.message : err));
btn.disabled = false;
btn.textContent = oldText;
}
});
});
Array.from(listEl.querySelectorAll("[data-priority-id]")).forEach(function(btn){
btn.addEventListener("click", async function(){
var id = Number(btn.getAttribute("data-priority-id"));
if (!id) return;
var oldText = btn.textContent;
btn.disabled = true;
btn.textContent = "Asignando...";
try {
await autoAssignReserva(id);
await loadAgenda({ preserveScroll:true });
} catch (err) {
alert("No se pudo asignar por prioridad: " + (err && err.message ? err.message : err));
btn.disabled = false;
btn.textContent = oldText;
}
});
});
Array.from(listEl.querySelectorAll("[data-sync-full-premium-id]")).forEach(function(btn){
btn.addEventListener("click", async function(){
var id = Number(btn.getAttribute("data-sync-full-premium-id"));
if (!id) return;
if (!window.confirm("Sincronizar esta Full Premium con Operador 2 como principal y Karin como apoyo/interior?")) return;
var oldText = btn.textContent;
btn.disabled = true;
btn.textContent = "Sync...";
try {
await syncFullPremiumOperators(id);
await loadAgenda({ preserveScroll:true });
} catch (err) {
alert("No se pudo sincronizar Full Premium: " + friendlyOperatorError(err));
btn.disabled = false;
btn.textContent = oldText;
}
});
});
Array.from(listEl.querySelectorAll("[data-edit-id]")).forEach(function(btn){
btn.addEventListener("click", function(){
var id = Number(btn.getAttribute("data-edit-id"));
var reserva = allRows.find(function(row){ return Number(row.id) === id; });
if (!reserva) return alert("Reserva no encontrada en agenda");
openReservaManageModal("edit", reserva);
});
});
Array.from(listEl.querySelectorAll("[data-delete-id]")).forEach(function(btn){
btn.addEventListener("click", async function(){
var id = Number(btn.getAttribute("data-delete-id"));
if (!id) return;
if (!window.confirm("Eliminar definitivamente RLJ-" + id + "")) return;
var oldText = btn.textContent;
btn.disabled = true;
btn.textContent = "...";
try {
await deleteReservaAdmin(id);
await loadAgenda({ preserveScroll:true });
} catch (err) {
alert("No se pudo eliminar: " + (err && err.message ? err.message : err));
btn.disabled = false;
btn.textContent = oldText;
}
});
});
Array.from(listEl.querySelectorAll("[data-garantia-id]")).forEach(function(btn){
btn.addEventListener("click", function(){
var id = Number(btn.getAttribute("data-garantia-id"));
if (!id) return;
openGarantiaModal(id);
});
});
Array.from(listEl.querySelectorAll("[data-operator-id]")).forEach(function(select){
select.addEventListener("change", async function(){
var id = Number(select.getAttribute("data-operator-id"));
var value = select.value;
select.disabled = true;
try {
await reassignReserva(id, value);
await loadAgenda({ preserveScroll:true });
} catch (err) {
alert("No se pudo reasignar: " + friendlyOperatorError(err));
select.disabled = false;
}
});
});
Array.from(listEl.querySelectorAll("[data-support-operator-id]")).forEach(function(select){
select.addEventListener("change", async function(){
var id = Number(select.getAttribute("data-support-operator-id"));
var value = select.value;
select.disabled = true;
try {
await setSupportOperator(id, value);
await loadAgenda({ preserveScroll:true });
} catch (err) {
alert("No se pudo actualizar apoyo: " + friendlyOperatorError(err));
select.disabled = false;
}
});
});
Array.from(listEl.querySelectorAll("[data-proof-url]")).forEach(function(btn){
btn.addEventListener("click", function(){
var url = btn.getAttribute("data-proof-url");
if (!url) return;
openProofModal(url);
});
});
}
Array.from(listEl.querySelectorAll("[data-cash-id]")).forEach(function(btn){
btn.addEventListener("click", async function(){
var id = Number(btn.getAttribute("data-cash-id"));
if (!id) return;
var reserva = allRows.find(function(row){ return Number(row.id) === id; });
var amount = reservaCashAmount(reserva);
if (!window.confirm("Registrar pago en efectivo por " + money(amount) + " La reserva quedara finalizada y pagada, y el monto se descontara como anticipo del operador.")) return;
var oldText = btn.textContent;
btn.disabled = true;
btn.textContent = "Guardando...";
try {
await recordCashPayment(id);
await loadAgenda({ preserveScroll:true });
} catch (err) {
alert("No se pudo registrar efectivo: " + (err && err.message ? err.message : err));
btn.disabled = false;
btn.textContent = oldText;
}
});
});
Array.from(listEl.querySelectorAll("[data-wsp-id]")).forEach(function(btn){
btn.addEventListener("click", function(){
var id = Number(btn.getAttribute("data-wsp-id"));
var reserva = allRows.find(function(row){ return Number(row.id) === id; });
if (!reserva) return alert("Reserva no encontrada en agenda");
openReservationRowWhatsapp(reserva);
});
});
Array.from(listEl.querySelectorAll("[data-status-id]")).forEach(function(select){
select.addEventListener("change", async function(){
var id = Number(select.getAttribute("data-status-id"));
var value = select.value;
select.disabled = true;
try {
await changeStatus(id, value);
if (String(value || "").toLowerCase() === "confirmed") triggerConversionEvent(id);
await loadAgenda({ preserveScroll:true });
} catch (err) {
alert("No se pudo cambiar estado: " + (err && err.message ? err.message : err));
select.disabled = false;
}
});
});
}
async function loadAgenda(options){
options = options || {};
statusEl.textContent = "Cargando agenda...";
listEl.innerHTML = "";
if (agendaSummaryEl) agendaSummaryEl.textContent = "";
if (options.preserveScroll) {
saveScrollPosition();
}
try {
var autoClosedCount = await autoFinalizeOverdueReservations();
if (currentRole === "admin") {
var adminRes = await Promise.allSettled([getOperadores(), fetchAgendaAdmin(), fetchAgendaSummary()]);
activeOperators = adminRes[0].status === "fulfilled" ? ensureKnownOperators(adminRes[0].value) : ensureKnownOperators([]);
if (adminRes[1].status !== "fulfilled") throw adminRes[1].reason;
allRows = adminRes[1].value;
renderAgendaSummary(adminRes[2].status === "fulfilled" ? adminRes[2].value : "Resumen no disponible");
} else {
activeOperators = [];
var operatorRes = await Promise.allSettled([fetchAgendaOperador(), fetchAgendaSummary()]);
if (operatorRes[0].status !== "fulfilled") throw operatorRes[0].reason;
allRows = operatorRes[0].value;
renderAgendaSummary(operatorRes[1].status === "fulfilled" ? operatorRes[1].value : "Resumen no disponible");
}
render(applyFilters(allRows || []));
if(autoClosedCount){statusEl.textContent += " · " + autoClosedCount + " cerrada" + (autoClosedCount===1?"":"s") + " por sistema";}
restoreScrollPositionIfNeeded();
} catch (err) {
console.error("Error cargando agenda:", err);
statusEl.textContent = "Error cargando agenda";
renderAgendaSummary("Resumen no disponible");
listEl.innerHTML = '<div class="relujo-ag-empty">No se pudo cargar la agenda desde Supabase.</div>';
restoreScrollPositionIfNeeded();
}
}
async function boot(){
var sessionRes = await sb.auth.getSession();
if (!sessionRes.data || !sessionRes.data.session) {
loginCard.style.display = "";
appEl.style.display = "none";
userEl.textContent = "";
if (agendaSummaryEl) agendaSummaryEl.textContent = "";
currentRole = null;
currentProfile = null;
return;
}
try {
var info = await getProfile();
if (!info || !info.profile || !info.profile.activo) {
await sb.auth.signOut();
alert("Tu usuario no tiene acceso activo.");
loginCard.style.display = "";
appEl.style.display = "none";
if (agendaSummaryEl) agendaSummaryEl.textContent = "";
currentProfile = null;
return;
}
currentRole = info.profile.rol;
currentProfile = info.profile;
if(window.StupendoAgendaLeads)window.StupendoAgendaLeads.init(window.StupendoAgendaLeadsContext);
if (currentRole !== "admin" && currentRole !== "operador") {
await sb.auth.signOut();
alert("Rol no válido.");
loginCard.style.display = "";
appEl.style.display = "none";
if (agendaSummaryEl) agendaSummaryEl.textContent = "";
currentProfile = null;
return;
}
userEl.textContent =
"Sesión: " + (info.profile.email || "");
loginCard.style.display = "none";
appEl.style.display = "";
if (currentRole === "admin") {
adminFiltersEl.style.display = "flex";
if (finanzasLinkEl) finanzasLinkEl.style.display = "";
if (autoCloseOverdueEl) autoCloseOverdueEl.style.display = "";
if (quickReservaEl) quickReservaEl.style.display = "";
if (quickQuoteEl) quickQuoteEl.style.display = "";
} else {
adminFiltersEl.style.display = "none";
if (finanzasLinkEl) finanzasLinkEl.style.display = "";
if (autoCloseOverdueEl) autoCloseOverdueEl.style.display = "none";
if (quickReservaEl) quickReservaEl.style.display = "none";
if (quickQuoteEl) quickQuoteEl.style.display = "none";
activeFilter = "active";
}
await loadAgenda();
} catch (err) {
console.error("Error validando usuario:", err);
alert("Error validando usuario.");
loginCard.style.display = "";
appEl.style.display = "none";
if (agendaSummaryEl) agendaSummaryEl.textContent = "";
currentProfile = null;
}
}
loginBtn.addEventListener("click", async function(){
loginStatusEl.textContent = "Ingresando...";
var res = await sb.auth.signInWithPassword({
email:String(emailEl.value || "").trim(),
password:String(passwordEl.value || "")
});
if (res.error) {
loginStatusEl.textContent = res.error.message || "No se pudo iniciar sesión";
return;
}
loginStatusEl.textContent = "";
await boot();
});
logoutEl.addEventListener("click", async function(){
await sb.auth.signOut();
location.reload();
});
rangeEl.addEventListener("change", function(){
loadAgenda();
});
if (filterActiveEl) {
filterActiveEl.addEventListener("click", function(){
activeFilter = "active";
render(applyFilters(allRows || []));
});
}
if (filterPendingEl) {
filterPendingEl.addEventListener("click", function(){
activeFilter = "pending";
render(applyFilters(allRows || []));
});
}
if (filterConfirmedEl) {
filterConfirmedEl.addEventListener("click", function(){
activeFilter = "confirmed";
render(applyFilters(allRows || []));
});
}
if (filterOnTheWayEl) {
filterOnTheWayEl.addEventListener("click", function(){
activeFilter = "on_the_way";
render(applyFilters(allRows || []));
});
}
if (filterInServiceEl) {
filterInServiceEl.addEventListener("click", function(){
activeFilter = "in_service";
render(applyFilters(allRows || []));
});
}
if (filterFinalizadaEl) {
filterFinalizadaEl.addEventListener("click", function(){
activeFilter = "finalizada";
render(applyFilters(allRows || []));
});
}
if (filterCancelledEl) {
filterCancelledEl.addEventListener("click", function(){
activeFilter = "cancelled";
render(applyFilters(allRows || []));
});
}
if (filterUnassignedEl) {
filterUnassignedEl.addEventListener("click", function(){
activeFilter = "unassigned";
render(applyFilters(allRows || []));
});
}
if (filterPaidEl) {
filterPaidEl.addEventListener("click", function(){
activeFilter = "paid";
render(applyFilters(allRows || []));
});
}
if (filterPaymentPendingEl) {
filterPaymentPendingEl.addEventListener("click", function(){
activeFilter = "payment_pending";
render(applyFilters(allRows || []));
});
}
if (filterProofEl) {
filterProofEl.addEventListener("click", function(){
activeFilter = "proof";
render(applyFilters(allRows || []));
});
}
if (filterMpApprovedEl) {
filterMpApprovedEl.addEventListener("click", function(){
activeFilter = "mp_approved";
render(applyFilters(allRows || []));
});
}
if (autoCloseOverdueEl) {
autoCloseOverdueEl.addEventListener("click", async function(){
if (currentRole !== "admin") return;
if (!window.confirm("¿Cerrar ahora todas las reservas atrasadas que siguen activas?")) return;
var oldText = autoCloseOverdueEl.textContent;
autoCloseOverdueEl.disabled = true;
autoCloseOverdueEl.textContent = "Cerrando...";
statusEl.textContent = "Cerrando reservas atrasadas...";
try {
var count = await autoFinalizeOverdueReservations();
await loadAgenda({ preserveScroll:true });
alert(count ? (count + " reserva" + (count === 1 ? "" : "s") + " cerrada" + (count === 1 ? "" : "s") + " por sistema.") : "No hay reservas atrasadas activas para cerrar.");
} catch (err) {
alert("No se pudieron cerrar las atrasadas: " + (err && err.message ? err.message : err));
} finally {
autoCloseOverdueEl.disabled = false;
autoCloseOverdueEl.textContent = oldText;
}
});
}
if (quickReservaEl) {
quickReservaEl.addEventListener("click", function(){
if (currentRole !== "admin") return;
openReservaManageModal("create", {
route_date:toIsoDateLocal(new Date()),
slot:"10:00",
status:"confirmed",
payment_status:"pending",
service_category:"tapices",
total:0,
minutes_cleaning:0
});
});
}
if (quickQuoteEl) {
quickQuoteEl.addEventListener("click", function(){
if (currentRole !== "admin") return;
openQuickQuoteModal();
});
}
proofCloseEl.addEventListener("click", closeProofModal);
proofModalEl.addEventListener("click", function(e){
if (e.target === proofModalEl) closeProofModal();
});
document.addEventListener("keydown", function(e){
if (e.key === "Escape" && proofModalEl.classList.contains("is-open")) {
closeProofModal();
}
});
boot();
})();
