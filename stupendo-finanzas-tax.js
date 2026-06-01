(function(){
var URL="https://kjyjfxmabizlerdouetb.supabase.co";
var KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeWpmeG1hYml6bGVyZG91ZXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODE3MzUsImV4cCI6MjA4ODQ1NzczNX0.qckYFtMdMISZ2sUY_loXZ-jvhoXc7DzaFQFBOiMWksY";
var sb=null,cache=null,timer=null,previewRows=[];

function el(id){return document.getElementById(id)}
function esc(v){return String(v||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
function money(n){return "$"+Math.round(Number(n||0)).toLocaleString("es-CL")}
function num(v){var n=Number(v);return isNaN(n)?0:n}
function pick(o,ks,f){for(var i=0;o&&i<ks.length;i++){var k=ks[i];if(o[k]!==undefined&&o[k]!==null&&o[k]!=="")return o[k]}return f}
function dval(v){if(!v)return null;var s=String(v),d=/^\d{4}-\d{2}-\d{2}$/.test(s)?new Date(s+"T12:00:00"):new Date(s);return isNaN(d.getTime())?null:d}
function ym(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")}
function monthBounds(off){var n=new Date(),s=new Date(n.getFullYear(),n.getMonth()+off,1,12),e=new Date(n.getFullYear(),n.getMonth()+off+1,0,12);return{start:s,end:e,period:ym(s),label:s.toLocaleDateString("es-CL",{month:"long",year:"numeric"})}}
function activeMonthOffset(){var b=document.querySelector("[data-rfx-month].is-active");return b?Number(b.getAttribute("data-rfx-month")||0):0}
function rowDate(r){return dval(pick(r,["fecha_tributaria","route_date","service_date","service_completed_at","completed_at","cancelled_at","created_at"],null))}
function inMonth(r,b){var d=rowDate(r);return d&&d>=b.start&&d<=b.end}
function sale(r){return num(pick(r,["total_bruto","gross_amount","net_amount","total","reserva_total","sale_total","venta_total","total_venta","gross_sales","ventas_asociadas","ventas"],0))}
function paid(r){var p=String(pick(r,["payment_status","customer_payment_status","cliente_payment_status"],"")||"").toLowerCase();return p==="paid"||r.sale_collected===true}
function opPay(r){return num(pick(r,["operator_amount","operator_payment_amount","operator_pay","pago_operador","total_a_pagar","operator_total","payable_amount"],0))}
function status(r){return String(pick(r,["service_status","status","estado"],"")||"").toLowerCase()}
function expDate(r){return dval(pick(r,["fecha_documento","expense_date","created_at"],null))}
function expInMonth(r,b){var d=expDate(r);return d&&d>=b.start&&d<=b.end}
function expenseAmount(r){return num(pick(r,["total_bruto","amount","monto"],0))}
function taxDebit(r){var saved=pick(r,["iva_debito"],null);if(saved!==null)return num(saved);var gross=sale(r);var aff=pick(r,["afecta_iva"],true);return aff===false||String(aff)==="false"?0:gross-Math.round(gross/1.19)}
function taxCredit(r){var saved=pick(r,["iva_credito"],null);if(saved!==null)return num(saved);var gross=expenseAmount(r);var use=pick(r,["usa_credito_fiscal"],false);return use===true||String(use)==="true"?gross-Math.round(gross/1.19):0}
function nextF29Date(period){var p=String(period||"").split("-"),d=new Date(Number(p[0]||0),Number(p[1]||1),20,12);return isNaN(d.getTime())?"-":d.toLocaleDateString("es-CL")}
function safeRows(name){return cache&&Array.isArray(cache[name])?cache[name]:[]}
function sum(rows,fn){return(rows||[]).reduce(function(a,r){return a+fn(r)},0)}
function byPeriod(period){return safeRows("tax").filter(function(r){return String(r.periodo)===String(period)})[0]||{}}
function calc(b){
  var sales=safeRows("sales").filter(function(r){return inMonth(r,b)&&status(r)!=="cancelled"});
  var expenses=safeRows("expenses").filter(function(r){return expInMonth(r,b)});
  var discounts=safeRows("discounts").filter(function(r){return String(r.period_start||"").slice(0,7)===b.period&&String(r.status||"pending")!=="void"});
  var commissions=safeRows("commissions").filter(function(r){return String(pick(r,["period_start","commission_date","created_at"],"")).slice(0,7)===b.period});
  var tax=byPeriod(b.period);
  var ventasBrutas=sum(sales,sale),ventasCobradas=sum(sales.filter(paid),sale),pendientes=ventasBrutas-ventasCobradas;
  var ivaDebito=sum(sales,taxDebit),ivaCredito=sum(expenses,taxCredit),ivaPagar=Math.max(ivaDebito-ivaCredito,0),remanente=Math.max(ivaCredito-ivaDebito,0);
  var gastos=sum(expenses,expenseAmount),operadores=sum(sales,opPay),desc=sum(discounts,function(r){return num(r.amount)}),comm=sum(commissions,function(r){return num(r.amount)});
  var ivaPagado=num(ta?x.iva_pagado:0),otros=num(ta?x.otros_impuestos:0),f29Pagado=num(ta?x.total_f29_pagado:0),estado=ta?(x.estado||"estimado"):"estimado";
  var cajaLibre=ventasCobradas-operadores-gastos-desc-comm-ivaPagar-otros;
  return{b:b,tax:tax,sales:sales,expenses:expenses,ventasBrutas:ventasBrutas,ventasCobradas:ventasCobradas,pendientes:pendientes,ivaDebito:ivaDebito,ivaCredito:ivaCredito,ivaPagar:ivaPagar,remanente:remanente,gastos:gastos,operadores:operadores,descuentos:desc,comisiones:comm,ivaPagado:ivaPagado,otros:otros,f29Pagado:f29Pagado,estado:estado,cajaLibre:cajaLibre};
}
function k(label,value){return'<div class="rfx-kpi"><b>'+esc(value)+'</b><span>'+esc(label)+'</span></div>'}
function table(headers,rows){return'<div style="overflow:auto"><table class="rfx-table"><thead><tr>'+headers.map(function(h){return'<th>'+esc(h)+'</th>'}).join("")+'</tr></thead><tbody>'+rows.map(function(r){return'<tr>'+r.map(function(c){return'<td>'+c+'</td>'}).join("")+'</tr>'}).join("")+'</tbody></table></div>'}
function alertLine(m){var a=[];if(!m.ivaDebito&&!m.ivaCredito)a.push('<div class="rfx-alert rfx-warn"><b>IVA no cargado</b>Estimado incompleto</div>');if(m.cajaLibre<m.ivaPagar)a.push('<div class="rfx-alert rfx-bad"><b>Riesgo SII</b>IVA supera caja libre</div>');if(m.ivaPagar>0&&m.ivaPagado<m.ivaPagar)a.push('<div class="rfx-alert rfx-warn"><b>IVA faltante</b>Falta reservar '+esc(money(m.ivaPagar-m.ivaPagado))+'</div>');if(!a.length)a.push('<div class="rfx-alert rfx-ok"><b>Tributario</b>Sin alertas críticas</div>');return'<div class="rfx-alerts">'+a.join("")+'</div>'}
function render(){
  var host=el("rfx-admin-dashboard");if(!host||!host.innerHTML||!cache)return;
  var old=el("rfx-tax-step1");if(old)old.remove();
  var b=monthBounds(activeMonthOffset()),m=calc(b),months=[monthBounds(0),monthBounds(-1),monthBounds(-2)].map(calc);
  var declared=new Date(b.start.getFullYear(),b.start.getMonth()-1,1,12);
  var html='<div id="rfx-tax-step1" class="rfx-panel"><details class="rfx-section"><summary style="cursor:pointer"><h3 style="display:inline">Caja real estimada: '+money(m.cajaLibre)+'</h3></summary><div class="rfx-grid">'+[
    k("Caja libre estimada",money(m.cajaLibre)),
    k("IVA estimado a pagar",money(m.ivaPagar)),
    k("IVA débito ventas",money(m.ivaDebito)),
    k("IVA crédito compras/gastos",money(m.ivaCredito)),
    k("IVA reservado",money(m.ivaPagado)),
    k("Diferencia IVA faltante",money(Math.max(m.ivaPagar-m.ivaPagado,0))),
    k("Próximo vencimiento F29",nextF29Date(m.b.period)),
    k("Estado tributario del mes",m.estado)
  ].join("")+'</div><p class="rfx-note">Caja libre = ventas cobradas - operadores - gastos pagados/registrados - publicidad - descuentos - comisiones manuales - IVA estimado - otros compromisos. Ventas pendientes se muestran como por cobrar y no inflan caja.</p>'+alertLine(m)+'</details><div class="rfx-section"><h3>Compromisos tributarios</h3>'+table(["Dato","Valor"],[["Periodo actual",esc(m.b.period)],["Mes que se declara",esc(ym(declared))],["IVA proyectado",money(m.ivaPagar)],["IVA pagado",money(m.ivaPagado)],["Remanente IVA",money(m.remanente)],["Diferencia",money(m.ivaPagar-m.ivaPagado)],["F29 pagado",money(m.f29Pagado)],["Ventas por cobrar",money(m.pendientes)]])+'</div><div class="rfx-section"><h3>Comparativa tributaria mensual</h3>'+table(["Mes","Ventas","IVA débito","IVA crédito","IVA a pagar","IVA pagado","Caja libre real"],months.map(function(x){return[esc(x.b.label),money(x.ventasBrutas),money(x.ivaDebito),money(x.ivaCredito),money(x.ivaPagar),money(x.ivaPagado),money(x.cajaLibre)]}))+'</div>'+renderManualForm(m)+renderImportBox()+'</div>';
  host.insertAdjacentHTML("beforeend",html);
  bind();
}
function renderManualForm(m){return'<div class="rfx-section"><h3>Registrar F29 / IVA pagado</h3><div class="relujo-fi-expense-form-grid"><div class="relujo-fi-field"><label>Periodo tributario</label><input id="rfx-tax-period" class="relujo-fi-input" type="month" value="'+esc(m.b.period)+'"></div><div class="relujo-fi-field"><label>IVA pagado</label><input id="rfx-tax-iva-paid" class="relujo-fi-input" inputmode="numeric" value="'+esc(Math.round(m.ivaPagado||0))+'"></div><div class="relujo-fi-field"><label>Fecha de pago</label><input id="rfx-tax-paid-date" class="relujo-fi-input" type="date" value="'+esc(m.ta?(m.ta.fecha_pago||""):"")+'"></div><div class="relujo-fi-field"><label>Total F29 pagado</label><input id="rfx-tax-f29-paid" class="relujo-fi-input" inputmode="numeric" value="'+esc(Math.round(m.f29Pagado||0))+'"></div><div class="relujo-fi-field is-full"><label>Observación</label><input id="rfx-tax-note" class="relujo-fi-input" value="'+esc(m.ta?(m.ta.observacion||""):"")+'"></div></div><button id="rfx-tax-save" class="relujo-fi-btn" type="button" style="margin-top:8px">Guardar F29</button><span id="rfx-tax-status" class="rfx-note" style="margin-left:8px"></span></div>'}
function renderImportBox(){return'<div class="rfx-section"><h3>Importación futura SII</h3><div class="relujo-fi-expense-form-grid"><div class="relujo-fi-field"><label>Tipo</label><select id="rfx-tax-import-type" class="relujo-fi-select"><option>RCV_COMPRAS</option><option>RCV_VENTAS</option><option>F29</option></select></div><div class="relujo-fi-field"><label>Archivo CSV</label><input id="rfx-tax-import-file" class="relujo-fi-input" type="file" accept=".csv,.txt"></div></div><div id="rfx-tax-import-preview" class="rfx-note" style="margin-top:8px">Carga un CSV para validar columnas y ver preview antes de guardar.</div></div>'}
async function load(){
  if(!window.supabase)return;sb=window.supabase.createClient(URL,KEY);
  var u=await sb.auth.getUser();if(u.error||!u.data.user)return;
  var p=await sb.from("perfiles_app").select("rol,activo").eq("user_id",u.data.user.id).single();if(p.error||!p.data||!p.data.activo||p.data.rol!=="admin")return;
  cache={sales:await safe(sb.from("v_sales_control").select("*")),expenses:await safe(sb.from("expenses").select("*")),discounts:await safe(sb.from("operator_manual_discount_installments").select("*")),commissions:await safe(sb.from("operator_manual_commissions").select("*")),tax:await safe(sb.from("tax_monthly_summary").select("*"))};
  render();observe();
}
async function safe(q){try{var r=await q;return r.error?[]:r.data||[]}catch(e){return[]}}
function bind(){
  var save=el("rfx-tax-save"),file=el("rfx-tax-import-file");if(save)save.onclick=saveF29;if(file)file.onchange=previewImport;
}
async function saveF29(){
  var st=el("rfx-tax-status"),period=el("rfx-tax-period").value,iva=num(el("rfx-tax-iva-paid").value),f29=num(el("rfx-tax-f29-paid").value),date=el("rfx-tax-paid-date").value,note=el("rfx-tax-note").value;
  if(!period){st.textContent="Falta periodo.";return}st.textContent="Guardando...";
  var payload={periodo:period,iva_pagado:iva,total_f29_pagado:f29||iva,estado:(f29||iva)?"pagado":"estimado",fecha_pago:date||null,observacion:note||null,fuente:"manual"};
  var r=await sb.from("tax_monthly_summary").upsert(payload,{onConflict:"periodo"}).select("*");
  if(r.error){st.textContent="No se pudo guardar.";return}
  cache.tax=await safe(sb.from("tax_monthly_summary").select("*"));st.textContent="Guardado.";render();
}
function parseCSV(text){var lines=String(text||"").trim().split(/\r\n/),head=(lines.shift()||"").split(/[;,]/).map(function(x){return x.trim().toLowerCase()});return lines.filter(Boolean).map(function(line){var cols=line.split(/[;,]/),o={};head.forEach(function(h,i){o[h]=cols[i]||""});return o})}
function previewImport(e){
  var f=e.target.files&&e.target.files[0],box=el("rfx-tax-import-preview");if(!f)return;var reader=new FileReader();
  reader.onload=function(){previewRows=parseCSV(reader.result);var required=["fecha","folio","monto"],missing=required.filter(function(k){return !previewRows.length||!(k in previewRows[0])});var dup={},dups=0;previewRows.forEach(function(r){var key=[r.tipo_documento||r.documento_tipo||"",r.folio||"",r.rut||r.proveedor||"",r.fecha||"",r.monto||""].join("|");if(dup[key])dups++;dup[key]=1});box.innerHTML=(missing.length?'<div class="rfx-alert rfx-warn"><b>Columnas faltantes</b>'+esc(missing.join(", "))+'</div>':'<div class="rfx-alert rfx-ok"><b>Validación base</b>Columnas mínimas detectadas.</div>')+table(["Preview","Valor"],[["Filas detectadas",String(previewRows.length)],["Posibles duplicados internos",String(dups)],["Clave anti duplicado","tipo_documento + folio + rut/proveedor + fecha + monto"]]);};
  reader.readAsText(f);
}
function observe(){new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(render,180)}).observe(document.body,{childList:true,subtree:true});document.addEventListener("click",function(e){if(e.target&&e.target.matches("[data-rfx-month]"))setTimeout(render,250)})}
setTimeout(load,1200);
})();
