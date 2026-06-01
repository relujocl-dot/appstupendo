(function(){
var SUPABASE_URL = "https://kjyjfxmabizlerdouetb.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeWpmeG1hYml6bGVyZG91ZXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODE3MzUsImV4cCI6MjA4ODQ1NzczNX0.qckYFtMdMISZ2sUY_loXZ-jvhoXc7DzaFQFBOiMWksY";
var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
var loginCard = document.getElementById("rf-login-card");
var appEl = document.getElementById("rf-app");
var userEl = document.getElementById("rf-user");
var loginBtn = document.getElementById("rf-login-btn");
var loginStatusEl = document.getElementById("rf-login-status");
var emailEl = document.getElementById("rf-email");
var passwordEl = document.getElementById("rf-password");
var refreshEl = document.getElementById("rf-refresh");
var logoutEl = document.getElementById("rf-logout");
var summaryEl = document.getElementById("rf-summary");
var listEl = document.getElementById("rf-list");
var statusEl = document.getElementById("rf-status");
var periodCurrentEl = document.getElementById("rf-period-current");
var periodPreviousEl = document.getElementById("rf-period-previous");
var periodAllEl = document.getElementById("rf-period-all");
var periodActionsEl = document.getElementById("rf-period-actions");
var tabFinanceEl = document.getElementById("rf-tab-finance");
var tabExpensesEl = document.getElementById("rf-tab-expenses");

var currentRole = null;
var currentProfile = null;
var currentUserId = "";
var financeRows = [];
var financeLoadError = "";
var operatorPaymentRows = [];
var operatorPaymentError = "";
var financePeriodFilter = "current";
var adminOperatorFilter = "all";
var activeTab = "finance";
var expensesRows = [];
var expensesLoadError = "";
var expenseFilters = { from:"", to:"", category:"all", area:"all" };
var expenseDraft = { expense_date:isoDate(new Date()), category:"", description:"", amount:"", business_area:"General", notes:"" };
var expenseEditId = "";
var EXPENSE_CATEGORIES = ["Insumos","Herramientas","Publicidad","Traslado","Operadores","Mantención","Software","Arriendo","Otros"];
var EXPENSE_AREAS = ["Tapices","Vehículos","Pets","Productos","General"];
var RELUJO_OPERATOR_EMAIL = "karin@urrea.cl";
var RELUJO_RULE_START = "2026-05-08";
var CANCEL_OPERATOR_PAY_START = "2026-05-22";
var MIN_OPERATOR_SALE = 29000;
var OPERATOR2_ID = "0d1fa964-d8fd-4671-97ba-651d0f3ec65e";
var OPERATOR2_MATCHES = ["operador 2","operador2","vehiculos","vehículos","kiro","juegazo.cl@gmail.com","kiro@uno.cl"];


function money(n){return "$" + Math.round(Number(n || 0)).toLocaleString("es-CL")}
function escapeHtml(str){return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;")}
function pad2(n){return String(Number(n || 0)).padStart(2, "0")}
function isoDate(d){return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate())}
function dateDayMonth(d){return pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1)}
function asNumber(value){var n=Number(value);return isNaN(n)?0:n}
function toDateValue(value){if(!value)return null;if(value instanceof Date&&!isNaN(value.getTime()))return value;var raw=String(value).trim();if(!raw)return null;var d=/^\\d{4}-\\d{2}-\\d{2}$/.test(raw)?new Date(raw+"T12:00:00"):new Date(raw);return isNaN(d.getTime())?null:d}
function pickFirst(obj,keys,fallback){if(!obj)return fallback;for(var i=0;i<keys.length;i++){var key=keys[i];if(obj[key]!==undefined&&obj[key]!==null&&obj[key]!=="")return obj[key]}return fallback}
function friendlyDate(iso){if(!iso)return "—";var d=toDateValue(iso);return d?d.toLocaleDateString("es-CL",{day:"2-digit",month:"2-digit"}):"—"}
function friendlyDateTime(iso){if(!iso)return "—";var d=new Date(iso);if(isNaN(d.getTime()))return "—";return d.toLocaleString("es-CL",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}
function friendlyHour(value){if(!value)return "—";if(/^\\d{2}:\\d{2}$/.test(String(value)))return String(value);var d=new Date(value);if(isNaN(d.getTime()))return "—";return d.toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit",hour12:false})}
function badgeForStatus(status){var s=String(status||"").toLowerCase()||"pending";var labelMap={pending:"Pendiente",confirmed:"Confirmada",on_the_way:"En camino",in_service:"En servicio",finalizada:"Finalizada",cancelled:"Cancelada"};return '<span class="relujo-fi-badge relujo-fi-badge-'+escapeHtml(s)+'">'+escapeHtml(labelMap[s]||s)+'</span>'}
function badgeForPaymentStatus(status){var s=String(status||"").toLowerCase();if(!s)s="payment_pending";if(s==="pending")s="payment_pending";var labelMap={paid:"Pagado",payment_pending:"Pendiente"};return '<span class="relujo-fi-badge relujo-fi-badge-'+escapeHtml(s)+'">'+escapeHtml(labelMap[s]||s)+'</span>'}
function getFinanceAnchorDate(row){return pickFirst(row,["route_date","service_date","service_completed_at","completed_at","cancelled_at","paid_at","created_at"],null)}
function getFinancePeriodMeta(input){var d=toDateValue(input);if(!d)return null;var year=d.getFullYear(),month=d.getMonth(),day=d.getDate(),start,end,payDate;if(day>=5&&day<=19){start=new Date(year,month,5,12,0,0);end=new Date(year,month,19,12,0,0);payDate=new Date(year,month,20,12,0,0)}else if(day>=20){start=new Date(year,month,20,12,0,0);end=new Date(year,month+1,4,12,0,0);payDate=new Date(year,month+1,5,12,0,0)}else{start=new Date(year,month-1,20,12,0,0);end=new Date(year,month,4,12,0,0);payDate=new Date(year,month,5,12,0,0)}return{key:isoDate(start)+"__"+isoDate(end),label:dateDayMonth(start)+" al "+dateDayMonth(end),start:start,end:end,payDate:payDate}}
function getCurrentFinancePeriodMeta(){return getFinancePeriodMeta(new Date())}
function getPreviousFinancePeriodMeta(){var current=getCurrentFinancePeriodMeta();return current?getFinancePeriodMeta(new Date(current.start.getTime()-86400000)):null}
function getFinanceRowPeriodMeta(row){if(!row)return null;var start=toDateValue(pickFirst(row,["payment_period_start","period_start","start_date","period_from"],null));var end=toDateValue(pickFirst(row,["payment_period_end","period_end","end_date","period_to"],null));if(start&&end){var payDate=toDateValue(pickFirst(row,["estimated_payment_date","payment_date","fecha_estimada_pago"],null));return{key:isoDate(start)+"__"+isoDate(end),label:pickFirst(row,["period_label","label","periodo_label"],dateDayMonth(start)+" al "+dateDayMonth(end)),start:start,end:end,payDate:payDate||null}}return getFinancePeriodMeta(getFinanceAnchorDate(row))}
function financeSaleValue(row){return asNumber(pickFirst(row,["gross_amount","net_amount","total","reserva_total","sale_total","venta_total","total_venta","gross_sales","ventas_asociadas","ventas"],0))}
function financeTravelFeeValue(row){return asNumber(pickFirst(row,["travel_fee","transfer_fee","traslado_fee","recargo_traslado"],0))}
function financeServiceSaleValue(row){var explicit=asNumber(pickFirst(row,["total_without_travel_fee","base_total","service_total","limpieza_total"],0));if(explicit)return explicit;return Math.max(0,financeSaleValue(row)-financeTravelFeeValue(row))}
function financeReservationKey(row){return String(pickFirst(row,["reserva_id","id_reserva","reservation_id","id"],"")||"")}
function financeManualParticipantPay(row){return row&&row.participant_manual_payment?asNumber(pickFirst(row,["operator_amount","operator_payment_amount","operator_pay","pago_operador","total_a_pagar","operator_total","payable_amount"],0)):null}
function rowOperatorEmail(row){return String(pickFirst(row,["operator_email","operador_email","email_operador","email"],"")||"").toLowerCase()}
function rowOperatorText(row){return String(pickFirst(row,["operator_name","operador","operador_nombre","operator_email","operador_email","email_operador","email","operador_id","operator_id"],"")||"").toLowerCase()}
function isRelujoOperatorRow(row){var email=rowOperatorEmail(row);if(email)return email===RELUJO_OPERATOR_EMAIL;if(currentProfile&&String(currentProfile.email||"").toLowerCase()===RELUJO_OPERATOR_EMAIL){var op=pickFirst(row,["operador_id","operator_id"],null);return !op||String(op)===String(currentProfile.operador_id||"")}return false}
function isCurrentOperator2(){if(!currentProfile)return false;var t=String([currentProfile.nombre,currentProfile.name,currentProfile.email,currentProfile.operador_id,currentProfile.operator_id,currentProfile.id].filter(Boolean).join(" ")).toLowerCase();return t.indexOf(OPERATOR2_ID)>-1||OPERATOR2_MATCHES.some(function(x){return t.indexOf(x)>-1})}
function isOperator2Row(row){var op=String(pickFirst(row,["operador_id","operator_id"],"")||"").toLowerCase();if(op&&op===OPERATOR2_ID)return true;var t=rowOperatorText(row);if(OPERATOR2_MATCHES.some(function(x){return t.indexOf(x)>-1}))return true;return currentRole==="operador"&&isCurrentOperator2()}
function rowServiceText(row){return String([pickFirst(row,["services_text","service_name","servicios_text","service","categoria","service_category"],""),pickFirst(row,["upsells_text","upsells","extras_text"],"")].filter(Boolean).join(" ")).toLowerCase()}
function vehicleSize(row){var t=rowServiceText(row);if(/peque|city|hatch|sed[aá]n/.test(t))return"small";if(/mediano|suv|camioneta/.test(t))return"medium";if(/grande|van|furg[oó]n|jeep/.test(t))return"large";return""}
function operator2BasePay(row){var t=rowServiceText(row),s=vehicleSize(row),smartFull=/smart\s*full/.test(t),smartExterior=/smart\s*exterior/.test(t),full=/full|int\\.\\s*y\\s*ext|interior.*exterior/.test(t),express=/express|exterior/.test(t);if(smartFull)return s==="small"?9000:s==="medium"?11000:s==="large"?13000:0;if(smartExterior)return s==="small"?6000:s==="medium"?7000:s==="large"?8000:0;if(full)return s==="small"?10000:s==="medium"?12000:s==="large"?14000:0;if(express)return s==="small"?7000:s==="medium"?8000:s==="large"?9000:0;return 0}
function extraSaleValue(row){var direct=asNumber(pickFirst(row,["upsells_total","extras_total","addons_total","complementos_total"],0));if(direct)return direct;var t=rowServiceText(row),sum=0;if(/aroma auto nuevo/.test(t))sum+=3500;if(/vidrios repelentes/.test(t))sum+=3500;if(/spray aroma/.test(t))sum+=8990;return sum}
function operator2PayBreakdown(row){var cancelled=rawFinanceStatus(row)==="cancelled";var base=cancelled&&isOperatorCancelledRow(row)?4500:cancelled?0:operator2BasePay(row);var extras=cancelled||financeStatus(row)!=="finalizada"?0:extraSaleValue(row);var commission=Math.round(extras*0.2);var travel=cancelled||financeStatus(row)!=="finalizada"?0:financeTravelFeeValue(row);if(financeStatus(row)!=="finalizada"&&!cancelled){base=0;extras=0;commission=0;travel=0}return{base:base,extrasSale:extras,commission:commission,travel:travel,total:base+commission+travel}}
function operator2PayValue(row){return operator2PayBreakdown(row).total}
function rowDateIso(row){return String(pickFirst(row,["route_date","service_date","service_completed_at","completed_at","cancelled_at","created_at"],"")||"").slice(0,10)}
function isRelujoRuleRow(row){return isRelujoOperatorRow(row)&&financeStatus(row)==="finalizada"&&rowDateIso(row)>RELUJO_RULE_START}
function isRelujo18Row(row){return isRelujoRuleRow(row)&&financeSaleValue(row)>=50000}
function cancellationSource(row){return String(pickFirst(row,["cancelled_by_role","cancellation_source","cancelled_by","payment_confirmed_by","status_changed_by"],"")||"").toLowerCase()}
function isOperatorCancelledRow(row){var src=cancellationSource(row);return src==="operator"||src==="operador"||src==="cancelled_by_operator"}
function isPayableOperatorCancel(row){var d=String(pickFirst(row,["cancelled_at","updated_at","created_at"],"")||"").slice(0,10);return isRelujoOperatorRow(row)&&rawFinanceStatus(row)==="cancelled"&&isOperatorCancelledRow(row)&&d&&d>=CANCEL_OPERATOR_PAY_START}
function financeOperatorPayValue(row){var manual=financeManualParticipantPay(row);if(manual!==null)return manual;if(isOperator2Row(row))return operator2PayValue(row);if(rawFinanceStatus(row)==="cancelled")return isPayableOperatorCancel(row)?4500:0;var sale=financeServiceSaleValue(row),travel=financeTravelFeeValue(row);if(sale<MIN_OPERATOR_SALE)return travel;var base=isRelujoRuleRow(row)?(sale>=50000?Math.round(sale*0.18):9000):asNumber(pickFirst(row,["operator_amount","operator_payment_amount","operator_pay","pago_operador","total_a_pagar","operator_total","payable_amount"],0));return base+travel}
function financeRuleCode(row){if(financeManualParticipantPay(row)!==null)return"manual_participant_payment";if(isOperator2Row(row)){if(rawFinanceStatus(row)==="cancelled")return isOperatorCancelledRow(row)?"operator2_cancel_visit_4500":"not_payable";return financeStatus(row)==="finalizada"?"operator2_vehicle_rule":"not_payable"}if(isPayableOperatorCancel(row))return"cancelled_operator_4500";if(rawFinanceStatus(row)==="cancelled")return"not_payable";var sale=financeServiceSaleValue(row);if(sale<MIN_OPERATOR_SALE)return financeTravelFeeValue(row)?"travel_fee_only":"not_payable";if(isRelujoRuleRow(row))return sale>=50000?"finalizada_18_percent_over_50k":"finalizada_base_9000_under_50k";return String(pickFirst(row,["operator_rule","payment_rule","regla_aplicada","rule_applied"],"")||"")}
function financeRuleLabel(code){var labels={manual_participant_payment:"Pago manual participante",operator2_vehicle_rule:"Operador 2 vehículos",operator2_cancel_visit_4500:"Cancelada con visita: $4.500",cancelled_operator_4500:"Cancelada operador: $4.500",cancelled_base_4500:"Cancelada: no pagable",finalizada_base_9000_under_50k:"Base: $9.000",finalizada_18_percent_over_50k:"18%",travel_fee_only:"Solo traslado",not_payable:"No pagable"};return labels[code]||"Pendiente"}
function operatorRuleShortLabel(code){var labels={manual_participant_payment:"Manual",operator2_vehicle_rule:"Vehículos",operator2_cancel_visit_4500:"Cancelada visita",cancelled_operator_4500:"Cancelada op.",finalizada_18_percent_over_50k:"18%",finalizada_base_9000_under_50k:"Base",cancelled_base_4500:"No pagable",travel_fee_only:"Traslado",not_payable:"No pagable"};return labels[code]||"Pendiente"}
function isPastServiceRow(row){var raw=pickFirst(row,["route_date","service_date","service_completed_at","completed_at"],null),d=toDateValue(raw),today=toDateValue(isoDate(new Date()));return !!(d&&today&&d<today)}
function rawFinanceStatus(row){return String(pickFirst(row,["service_status","status","estado"],"")||"").toLowerCase()}
function financeStatus(row){var status=rawFinanceStatus(row);if(status!=="cancelled"&&isPastServiceRow(row))return "finalizada";return status}
function financeCustomerPaymentStatus(row){var status=String(pickFirst(row,["payment_status","customer_payment_status","cliente_payment_status"],"")||"").toLowerCase();if(financeStatus(row)==="finalizada"&&isPastServiceRow(row))return "paid";if(!status)return "payment_pending";if(status==="pending")return "payment_pending";return status}
function isCountableFinalized(row){return financeStatus(row)==="finalizada"&&financeSaleValue(row)>0}
function operatorPayableRowsAll(){return (financeRows||[]).filter(isCountableFinalized)}
function isSameMonth(date,base){return !!(date&&base&&date.getFullYear()===base.getFullYear()&&date.getMonth()===base.getMonth())}
function getMonthPeriodStarts(baseDate){var y=baseDate.getFullYear(),m=baseDate.getMonth();return{one:new Date(y,m,5,12,0,0),two:new Date(y,m,20,12,0,0)}}
function getRowsForMonth(baseDate){return operatorPayableRowsAll().filter(function(row){return isSameMonth(toDateValue(pickFirst(row,["service_date","service_completed_at","completed_at","cancelled_at","route_date"],null)),baseDate)})}
function getRowsForExactPeriod(startDate){var key=isoDate(startDate);return operatorPayableRowsAll().filter(function(row){var meta=getFinanceRowPeriodMeta(row);return meta&&isoDate(meta.start)===key})}
function getSelectedFinancePeriodMeta(){if(financePeriodFilter==="all")return null;return financePeriodFilter==="previous"?getPreviousFinancePeriodMeta():getCurrentFinancePeriodMeta()}
function getOperatorSelectedRows(){if(financePeriodFilter==="all")return operatorPayableRowsAll();var selectedMeta=getSelectedFinancePeriodMeta();return operatorPayableRowsAll().filter(function(row){var meta=getFinanceRowPeriodMeta(row);return !!(meta&&selectedMeta&&meta.key===selectedMeta.key)})}
function getCancelledRowsForSelectedPeriod(){var currentMeta=getCurrentFinancePeriodMeta(),previousMeta=getPreviousFinancePeriodMeta(),selectedMeta=financePeriodFilter==="previous"?previousMeta:financePeriodFilter==="all"?null:currentMeta;return (financeRows||[]).filter(function(row){if(financeStatus(row)!=="cancelled")return false;if(financePeriodFilter==="all")return true;var meta=getFinanceRowPeriodMeta(row);return !!(meta&&selectedMeta&&meta.key===selectedMeta.key)})}
function sumOperatorAmount(rows){return (rows||[]).reduce(function(sum,row){return sum+financeOperatorPayValue(row)},0)}
function sumOperator2Base(rows){return (rows||[]).reduce(function(sum,row){return sum+(isOperator2Row(row)?operator2PayBreakdown(row).base:0)},0)}
function sumOperator2Commission(rows){return (rows||[]).reduce(function(sum,row){return sum+(isOperator2Row(row)?operator2PayBreakdown(row).commission:0)},0)}
function sumTravelFees(rows){return (rows||[]).reduce(function(sum,row){return sum+financeTravelFeeValue(row)},0)}
function countOperator2Commission(rows){return (rows||[]).filter(function(row){return isOperator2Row(row)&&operator2PayBreakdown(row).commission>0}).length}
function countRule(rows,rule){return (rows||[]).filter(function(row){return financeRuleCode(row)===rule}).length}
function countStatus(rows,status){return (rows||[]).filter(function(row){return status==="finalizada"?isCountableFinalized(row):financeStatus(row)===status}).length}
function sumByStatus(rows,status){return (rows||[]).filter(function(row){return status==="finalizada"?isCountableFinalized(row):financeStatus(row)===status}).reduce(function(sum,row){return sum+financeOperatorPayValue(row)},0)}
function hasOperatorCalculatedAmounts(rows){return (rows||[]).some(function(row){return financeOperatorPayValue(row)>0})}
function uniqueFinanceRows(rows){
  var seen={},out=[];
  (rows||[]).forEach(function(row){
    var key=financeReservationKey(row)||String(out.length);
    if(seen[key])return;
    seen[key]=true;
    out.push(row);
  });
  return out;
}
function renderOperatorSummaryCard(title,lines){return '<div class="relujo-fi-card relujo-fi-card-wide"><div class="relujo-fi-card-value">'+escapeHtml(title)+'</div><div class="relujo-fi-card-lines">'+lines.map(function(line){return '<div class="relujo-fi-card-line"><span class="relujo-fi-card-label">'+escapeHtml(line.label)+'</span><strong>'+escapeHtml(line.value)+'</strong></div>'}).join("")+'</div></div>'}
function digitsOnly(value){return String(value||"").replace(/\D/g,"")}
function formatMoneyInput(value){var digits=digitsOnly(value);return digits?money(Number(digits)):""}
function expenseDateValue(row){return String(pickFirst(row,["expense_date","created_at"],"")||"").slice(0,10)}
function expenseAmountValue(row){return asNumber(pickFirst(row,["amount"],0))}
function expenseOptions(values,selected,placeholder){var html=placeholder?'<option value="">'+escapeHtml(placeholder)+'</option>':'';return html+values.map(function(value){return '<option value="'+escapeHtml(value)+'"'+(selected===value?' selected':'')+'>'+escapeHtml(value)+'</option>'}).join("")}
function expenseMatchesDate(dateValue,from,to){if(!dateValue)return false;if(from&&dateValue<from)return false;if(to&&dateValue>to)return false;return true}
function getFilteredExpenses(){return (expensesRows||[]).filter(function(row){var dateValue=expenseDateValue(row),category=String(row.category||""),area=String(row.business_area||"");if(!expenseMatchesDate(dateValue,expenseFilters.from,expenseFilters.to))return false;if(expenseFilters.category!=="all"&&category!==expenseFilters.category)return false;if(expenseFilters.area!=="all"&&area!==expenseFilters.area)return false;return true})}
function sumExpenseRows(rows){return (rows||[]).reduce(function(sum,row){return sum+expenseAmountValue(row)},0)}
function getTodayIso(){return isoDate(new Date())}
function getCurrentWeekBounds(){var now=new Date(),base=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12,0,0),day=base.getDay(),offset=day===0?-6:1-day,start=new Date(base),end=new Date(base);start.setDate(base.getDate()+offset);end.setDate(start.getDate()+6);return{from:isoDate(start),to:isoDate(end)}}
function getCurrentMonthBounds(){var now=new Date(),start=new Date(now.getFullYear(),now.getMonth(),1,12,0,0),end=new Date(now.getFullYear(),now.getMonth()+1,0,12,0,0);return{from:isoDate(start),to:isoDate(end)}}
function getPaidFinanceRowsWithinRange(from,to){return uniqueFinanceRows((financeRows||[]).filter(function(row){var payment=financeCustomerPaymentStatus(row),dateValue=String(getFinanceAnchorDate(row)||"").slice(0,10),collected=row.sale_collected===true;if(!(payment==="paid"||collected))return false;return expenseMatchesDate(dateValue,from,to)}))}
function expenseSummaryCard(label,value,warm){return '<div class="relujo-fi-card'+(warm?' relujo-fi-card-warm':'')+'"><div class="relujo-fi-card-value">'+escapeHtml(value)+'</div><div class="relujo-fi-card-label">'+escapeHtml(label)+'</div></div>'}
function renderExpensesSummary(){var filtered=getFilteredExpenses(),from=expenseFilters.from,to=expenseFilters.to,income=sumExpenseRows(getPaidFinanceRowsWithinRange(from,to).map(function(row){return { amount:financeSaleValue(row) }})),expensesTotal=sumExpenseRows(filtered),today=getTodayIso(),week=getCurrentWeekBounds(),month=getCurrentMonthBounds(),daySpend=sumExpenseRows((expensesRows||[]).filter(function(row){return expenseDateValue(row)===today})),weekSpend=sumExpenseRows((expensesRows||[]).filter(function(row){return expenseMatchesDate(expenseDateValue(row),week.from,week.to)})),monthSpend=sumExpenseRows((expensesRows||[]).filter(function(row){return expenseMatchesDate(expenseDateValue(row),month.from,month.to)}));return '<div class="relujo-fi-panel"><div class="relujo-fi-dashboard-head"><div><h2 class="relujo-fi-dashboard-title">Gastos</h2><p class="relujo-fi-dashboard-note">Registra egresos operativos y revisa la utilidad real.</p></div></div><div class="relujo-fi-expense-summary">'+expenseSummaryCard("Total ingresos",money(income))+expenseSummaryCard("Total gastos",money(expensesTotal))+expenseSummaryCard("Utilidad final",money(income-expensesTotal),true)+expenseSummaryCard("Gasto del día",money(daySpend))+expenseSummaryCard("Gasto semanal",money(weekSpend))+expenseSummaryCard("Gasto mensual",money(monthSpend))+'</div>'+(expensesLoadError?'<div class="relujo-fi-error">No se pudo cargar gastos</div>':'')+'</div>'}
function renderExpensesForm(){return '<div class="relujo-fi-card"><div class="relujo-fi-dashboard-head"><div><h3 class="relujo-fi-dashboard-title" style="font-size:16px">'+(expenseEditId?"Editar gasto":"Registrar gasto")+'</h3><p class="relujo-fi-dashboard-note">Ingreso rápido pensado para operación diaria.</p></div></div><form id="rf-expense-form" class="relujo-fi-expense-form"><div class="relujo-fi-expense-form-grid"><div class="relujo-fi-field"><label for="rf-expense-date">Fecha</label><input id="rf-expense-date" class="relujo-fi-input" type="date" value="'+escapeHtml(expenseDraft.expense_date||isoDate(new Date()))+'" required></div><div class="relujo-fi-field"><label for="rf-expense-category">Categoría</label><select id="rf-expense-category" class="relujo-fi-select" required>'+expenseOptions(EXPENSE_CATEGORIES,expenseDraft.category,"Selecciona")+'</select></div><div class="relujo-fi-field is-full"><label for="rf-expense-description">Descripción</label><input id="rf-expense-description" class="relujo-fi-input" type="text" value="'+escapeHtml(expenseDraft.description)+'" placeholder="Ej: Shampoo tapices, traslado Las Condes" required></div><div class="relujo-fi-field"><label for="rf-expense-amount">Monto</label><input id="rf-expense-amount" class="relujo-fi-input" type="text" inputmode="numeric" value="'+escapeHtml(expenseDraft.amount)+'" placeholder="$0" required><div class="relujo-fi-inline-note">Se guarda como monto entero en CLP.</div></div><div class="relujo-fi-field"><label for="rf-expense-area">Área de negocio</label><select id="rf-expense-area" class="relujo-fi-select" required>'+expenseOptions(EXPENSE_AREAS,expenseDraft.business_area||"General","Selecciona")+'</select></div><div class="relujo-fi-field is-full"><label for="rf-expense-notes">Notas</label><textarea id="rf-expense-notes" class="relujo-fi-input" rows="2" placeholder="Opcional">'+escapeHtml(expenseDraft.notes)+'</textarea></div></div><div class="relujo-fi-expense-actions">'+(expenseEditId?'<button id="rf-expense-cancel-edit" class="relujo-fi-btn-secondary" type="button">Cancelar edición</button>':'')+'<button id="rf-expense-submit" class="relujo-fi-btn" type="submit">'+(expenseEditId?"Actualizar gasto":"Guardar gasto")+'</button></div></form></div>'}
function renderExpensesFilters(){return '<div class="relujo-fi-card"><div class="relujo-fi-dashboard-head"><div><h3 class="relujo-fi-dashboard-title" style="font-size:16px">Filtrar gastos</h3><p class="relujo-fi-dashboard-note">Rango de fechas, categoría y área.</p></div></div><div class="relujo-fi-filter-grid"><div class="relujo-fi-field"><label for="rf-expense-filter-from">Desde</label><input id="rf-expense-filter-from" class="relujo-fi-input" type="date" value="'+escapeHtml(expenseFilters.from)+'"></div><div class="relujo-fi-field"><label for="rf-expense-filter-to">Hasta</label><input id="rf-expense-filter-to" class="relujo-fi-input" type="date" value="'+escapeHtml(expenseFilters.to)+'"></div><div class="relujo-fi-field"><label for="rf-expense-filter-category">Categoría</label><select id="rf-expense-filter-category" class="relujo-fi-select"><option value="all">Todas</option>'+expenseOptions(EXPENSE_CATEGORIES,expenseFilters.category==="all"?"":expenseFilters.category,"").replace('<option value=""></option>','')+'</select></div><div class="relujo-fi-field"><label for="rf-expense-filter-area">Área</label><select id="rf-expense-filter-area" class="relujo-fi-select"><option value="all">Todas</option>'+expenseOptions(EXPENSE_AREAS,expenseFilters.area==="all"?"":expenseFilters.area,"").replace('<option value=""></option>','')+'</select></div></div></div>'}
function renderExpensesList(){var rows=getFilteredExpenses();if(!rows.length)return '<div class="relujo-fi-empty">No hay gastos registrados con estos filtros.</div>';return '<div class="relujo-fi-expense-list">'+rows.map(function(row){return '<article class="relujo-fi-expense-item"><div class="relujo-fi-expense-date"><div class="relujo-fi-main">'+escapeHtml(friendlyDate(expenseDateValue(row)))+'</div><div class="relujo-fi-subline">'+escapeHtml(friendlyHour(row.created_at))+'</div></div><div class="relujo-fi-stack"><div class="relujo-fi-main">'+escapeHtml(row.description||"Sin descripción")+'</div><div class="relujo-fi-chip-row"><span class="relujo-fi-chip">'+escapeHtml(row.category||"Otros")+'</span><span class="relujo-fi-chip relujo-fi-chip-gold">'+escapeHtml(row.business_area||"General")+'</span></div>'+(row.notes?'<div class="relujo-fi-subline">'+escapeHtml(row.notes)+'</div>':'')+'<div class="relujo-fi-chip-row"><button class="relujo-fi-btn-secondary" type="button" data-expense-edit="'+escapeHtml(row.id)+'">Editar</button><button class="relujo-fi-btn-secondary" type="button" data-expense-delete="'+escapeHtml(row.id)+'">Eliminar</button></div></div><div class="relujo-fi-expense-amount">'+escapeHtml(money(expenseAmountValue(row)))+'</div></article>'}).join("")+'</div>'}
function renderExpensesModule(){return renderExpensesSummary()+'<div class="relujo-fi-expense-grid"><div class="relujo-fi-panel">'+renderExpensesForm()+'</div><div class="relujo-fi-panel">'+renderExpensesFilters()+'</div></div>'+renderExpensesList()}

async function getProfile(){
  var userRes = await sb.auth.getUser();
  if (userRes.error) throw userRes.error;
  if (!userRes.data || !userRes.data.user) return null;
  var profileRes = await sb.from("perfiles_app").select("user_id,email,rol,operador_id,activo").eq("user_id", userRes.data.user.id).single();
  if (profileRes.error) throw profileRes.error;
  return { user:userRes.data.user, profile:profileRes.data };
}
async function fetchSalesControl(options){
  options = options || {};
  var query = sb.from("v_sales_control").select("*");
  if (options.operadorId) query = query.eq("operador_id", options.operadorId);
  var res = await query;
  if (res.error) throw res.error;
  return mergeParticipantFinanceRows(res.data || [], options);
}
async function fetchOperatorPaymentSummary(){
  if (!currentProfile || !currentProfile.operador_id) return [];
  var res = await sb.from("v_operator_period_summary").select("*").eq("operador_id", currentProfile.operador_id);
  if (res.error) throw res.error;
  return res.data || [];
}
function baseRowOperatorId(row){return String(pickFirst(row,["operador_id","operator_id"],"")||"")}
function hasFinanceOperatorRow(rows,reservaId,operadorId){
  reservaId=String(reservaId||"");operadorId=String(operadorId||"");
  return (rows||[]).some(function(row){return financeReservationKey(row)===reservaId&&baseRowOperatorId(row)===operadorId});
}
function participantPaymentAmount(row,total){
  var fixed=asNumber(row&&row.monto_pago);
  if(fixed>0)return fixed;
  var pct=asNumber(row&&row.porcentaje_pago);
  if(pct>0)return Math.round(asNumber(total)*pct/100);
  return null;
}
function participantFinanceRow(row){
  var reserva=row.reserva||{},operador=row.operador||{},manual=participantPaymentAmount(row,reserva.total),out=Object.assign({},reserva);
  out.id=reserva.id;
  out.reserva_id=reserva.id;
  out.operador_id=row.operador_id;
  out.operator_id=row.operador_id;
  out.operador=operador.nombre||operador.email||row.operador_id;
  out.operador_nombre=operador.nombre||"";
  out.operator_name=operador.nombre||"";
  out.operator_email=operador.email||"";
  out.operador_email=operador.email||"";
  out.operator_role=row.rol||"apoyo";
  out.participant_operator=true;
  out.participant_manual_payment=manual!==null;
  if(manual!==null){
    out.operator_amount=manual;
    out.operator_payment_amount=manual;
    out.pago_operador=manual;
    out.operator_rule="manual_participant_payment";
  }
  return out;
}
async function fetchReservaOperatorFinanceRows(options){
  options=options||{};
  var query=sb.from("reserva_operadores").select("reserva_id,operador_id,rol,porcentaje_pago,monto_pago,reserva:reservas(*),operador:operadores(id,nombre,email)");
  if(options.operadorId)query=query.eq("operador_id",options.operadorId);
  var res=await query;
  if(res.error)throw res.error;
  return res.data||[];
}
async function mergeParticipantFinanceRows(baseRows,options){
  var rows=(baseRows||[]).slice();
  try{
    var participants=await fetchReservaOperatorFinanceRows(options||{});
    participants.forEach(function(item){
      if(!item||!item.reserva||!item.reserva.id||!item.operador_id)return;
      if(hasFinanceOperatorRow(rows,item.reserva.id,item.operador_id))return;
      rows.push(participantFinanceRow(item));
    });
  }catch(e){
    console.warn("No se pudieron integrar operadores participantes a finanzas",e);
  }
  return rows;
}
async function fetchExpenses(){
  var res = await sb.from("expenses").select("*").order("expense_date",{ascending:false}).order("created_at",{ascending:false});
  if (res.error) throw res.error;
  return res.data || [];
}
async function enrichFinanceRows(rows){
  rows=rows||[];
  var ids=[...new Set(rows.map(function(r){return Number(pickFirst(r,["reserva_id","id_reserva","reservation_id","id"],0))}).filter(Boolean))];
  if(!ids.length)return rows;
  var map={};
  function add(list){(list||[]).forEach(function(r){var id=Number(pickFirst(r,["reserva_id","id_reserva","reservation_id","id"],0));if(id)map[id]=Object.assign(map[id]||{},r)})}
  try{var res=await sb.from("reservas").select("id,route_date,slot,name,phone,address,apto,comuna,services_text,upsells_text,total,total_without_travel_fee,travel_fee,travel_fee_label,travel_fee_zone,minutes_cleaning,status").in("id",ids);if(!res.error)add(res.data)}catch(e){}
  try{var rpc=currentRole==="admin"?await sb.rpc("get_agenda_admin",{p_scope:"all"}):await sb.rpc("get_agenda_operador",{p_scope:"all"});if(!rpc.error)add(rpc.data)}catch(e){}
  return rows.map(function(row){var id=Number(pickFirst(row,["reserva_id","id_reserva","reservation_id","id"],0)),base=map[id]||{},out=Object.assign({},base,row);if(!out.reserva_id)out.reserva_id=id;return out});
}
async function createExpense(payload){
  var res = await sb.from("expenses").insert(payload).select("*").single();
  if (res.error) throw res.error;
  return res.data;
}
async function updateExpense(id,payload){
  var res = await sb.from("expenses").update(payload).eq("id",id).select("*").single();
  if (res.error) throw res.error;
  return res.data;
}
async function deleteExpense(id){
  var res = await sb.from("expenses").delete().eq("id",id);
  if (res.error) throw res.error;
  return true;
}
function mergeFinanceIntoRows(rows, financeRowsInput){
  var map={};
  (financeRowsInput||[]).forEach(function(item){
    var id=Number(pickFirst(item,["reserva_id","id_reserva","reservation_id","id"],0));
    if(id) map[id]=item;
  });
  return (rows||[]).map(function(row){
    var next=Object.assign({},row);
    next.finance=map[Number(pickFirst(row,["reserva_id","id"],0))]||null;
    return next;
  });
}
async function saveSystemObservation(ids,note){
  if(!ids||!ids.length)return;
  var fields=["system_observation","admin_observation","observacion","notes","internal_notes"];
  for(var i=0;i<fields.length;i++){
    var payload={};
    payload[fields[i]]=note;
    try{await sb.from("reservas").update(payload).in("id",ids)}catch(e){}
  }
}
async function autoFinalizeOverdueReservations(){
  var today=isoDate(new Date()),statuses=["pending","confirmed","on_the_way","in_service","finalizada"];
  try{
    var rpc=await sb.rpc("auto_close_overdue_reservations");
    if(!rpc.error)return Number(rpc.data||0)||0;
  }catch(rpcErr){}
  var query=sb.from("reservas").select("id,status,route_date,payment_status").lt("route_date",today).in("status",statuses);
  if(currentRole==="operador"&&currentProfile&&currentProfile.operador_id)query=query.eq("operador_id",currentProfile.operador_id);
  var found=await query;
  if(found.error)throw found.error;
  var rows=(found.data||[]).filter(function(r){return String(r.payment_status||"").toLowerCase()!=="paid"});
  if(!rows.length)return 0;
  var ids=rows.map(function(r){return r.id}).filter(Boolean),now=new Date().toISOString();
  var note="Finalizada y pagada automáticamente por sistema por cierre de día. No fue realizada por admin u operador.";
  var updateRes=await sb.from("reservas").update({status:"finalizada",payment_status:"paid",payment_confirmed_by:"system_auto_close",paid_at:now,service_completed_at:now,whatsapp_last_flow_step:"system_auto_closed"}).in("id",ids);
  if(updateRes.error)throw updateRes.error;
  await saveSystemObservation(ids,note);
  return ids.length;
}

function renderFinanceDashboard(){
  var now=new Date(),monthStart=new Date(now.getFullYear(),now.getMonth(),1,12),monthEnd=new Date(now.getFullYear(),now.getMonth()+1,0,23,59,59),days=monthEnd.getDate();
  function inMonth(row){var d=new Date(getFinanceAnchorDate(row)||pickFirst(row,["route_date","service_date","created_at"],null));return !isNaN(d.getTime())&&d>=monthStart&&d<=monthEnd}
  function card(label,value,warm){return '<div class="relujo-fi-card'+(warm?' relujo-fi-card-warm':'')+'"><div class="relujo-fi-card-value">'+escapeHtml(value)+'</div><div class="relujo-fi-card-label">'+escapeHtml(label)+'</div></div>'}
  function pct(v){return (Math.round((Number(v)||0)*10)/10)+'%'}
  function miniBars(obj){var keys=Object.keys(obj||{}),max=Math.max(1,...keys.map(function(k){return obj[k]}));if(!keys.length)return '<div class="relujo-fi-empty">Sin datos todavia.</div>';return '<div class="rfx-bars">'+keys.sort(function(a,b){return obj[b]-obj[a]}).slice(0,12).map(function(k){return '<div class="rfx-bar"><span>'+escapeHtml(k)+'</span><div class="rfx-track"><div class="rfx-fill" style="width:'+Math.max(3,obj[k]/max*100)+'%"></div></div><b>'+escapeHtml(obj[k]>999?money(obj[k]):String(obj[k]))+'</b></div>'}).join('')+'</div>'}
  var monthRows=(financeRows||[]).filter(inMonth),uniqueMonthRows=uniqueFinanceRows(monthRows),paidSales=0,pendingSales=0,finalizedCount=0,cancelledCount=0,operatorTotal=0,dayMap={},statusMap={},salesTotal=0;
  uniqueMonthRows.forEach(function(row){var sale=financeSaleValue(row),payment=financeCustomerPaymentStatus(row),st=financeStatus(row),d=new Date(getFinanceAnchorDate(row)||pickFirst(row,["route_date","service_date","created_at"],null)),day=!isNaN(d.getTime())?String(d.getDate()).padStart(2,"0"):"Sin fecha";salesTotal+=sale;dayMap[day]=(dayMap[day]||0)+sale;statusMap[st||"sin estado"]=(statusMap[st||"sin estado"]||0)+1;if(st==="cancelled"){cancelledCount+=1;return}if(payment==="paid")paidSales+=sale;else pendingSales+=sale;if(isCountableFinalized(row))finalizedCount+=1;});
  monthRows.forEach(function(row){if(isCountableFinalized(row))operatorTotal+=financeOperatorPayValue(row)});
  var expensesMonth=(expensesRows||[]).filter(function(r){var d=new Date(expenseDateValue(r)||r.created_at);return !isNaN(d.getTime())&&d>=monthStart&&d<=monthEnd}),marketing=0,general=0;expensesMonth.forEach(function(r){var a=expenseAmountValue(r),txt=String((r.category||"")+" "+(r.description||"")).toLowerCase();if(/publicidad|marketing|ads|meta|google/.test(txt))marketing+=a;else general+=a});
  var discounts=0,util=paidSales-general-marketing-operatorTotal-discounts,margin=paidSales?util/paidSales*100:0,ticket=uniqueMonthRows.length?salesTotal/uniqueMonthRows.length:0,cancelRate=uniqueMonthRows.length?cancelledCount/uniqueMonthRows.length*100:0,daily=salesTotal/days;
  var currentLabel=String(monthStart.toLocaleDateString('es-CL',{month:'long',year:'numeric'}));
  var cards=[card('Ventas totales del mes',money(salesTotal)),card('Ventas cobradas',money(paidSales)),card('Ventas pendientes',money(pendingSales)),card('Gastos generales',money(general)),card('Publicidad del mes',money(marketing)),card('Descuentos aplicados',money(discounts)),card('Total pagado a operadores',money(operatorTotal)),card('Utilidad estimada',money(util),true),card('Margen estimado',pct(margin)),card('Ticket promedio',money(ticket)),card('Servicios finalizados',String(finalizedCount)),card('Servicios cancelados',String(cancelledCount)),card('Tasa cancelacion',pct(cancelRate)),card('Cantidad de reservas',String(uniqueMonthRows.length)),card('Promedio diario ventas',money(daily)),card('IVA debito SII','-'),card('IVA credito SII','-'),card('IVA determinado','-'),card('PPM','-'),card('Recargos netos','-'),card('Total F29','-'),card('Caja libre real despues de IVA/F29',money(paidSales-general-marketing-operatorTotal))];
  var alerts='<div class="rfx-alerts"><div class="rfx-alert '+(margin>=25?'rfx-ok':margin>=15?'rfx-warn':'rfx-bad')+'"><b>Margen</b>'+escapeHtml(margin>=25?'Bien':margin>=15?'Cuidado':'Critico')+'</div><div class="rfx-alert '+(!(paidSales&&marketing/paidSales*100>25)?'rfx-ok':'rfx-bad')+'"><b>Marketing</b>'+escapeHtml(!(paidSales&&marketing/paidSales*100>25)?'Bien':'Alto')+'</div><div class="rfx-alert '+(cancelRate<=15?'rfx-ok':cancelRate<=25?'rfx-warn':'rfx-bad')+'"><b>Cancelaciones</b>'+escapeHtml(cancelRate<=15?'Bien':cancelRate<=25?'Cuidado':'Altas')+'</div><div class="rfx-alert rfx-ok"><b>Ventas</b>Vista mensual</div><div class="rfx-alert '+(!(paidSales&&(general+marketing)/paidSales*100>40)?'rfx-ok':'rfx-bad')+'"><b>Gastos</b>'+escapeHtml(!(paidSales&&(general+marketing)/paidSales*100>40)?'Bien':'Altos')+'</div></div>';
  var comparisonRows=[0,-1,-2].map(function(off){var a=new Date(now.getFullYear(),now.getMonth()+off,1,12),z=new Date(now.getFullYear(),now.getMonth()+off+1,0,23,59,59),rows=(financeRows||[]).filter(function(row){var d=new Date(getFinanceAnchorDate(row)||pickFirst(row,["route_date","service_date","created_at"],null));return !isNaN(d.getTime())&&d>=a&&d<=z}),uniqueRows=uniqueFinanceRows(rows),ex=(expensesRows||[]).filter(function(r){var d=new Date(expenseDateValue(r)||r.created_at);return !isNaN(d.getTime())&&d>=a&&d<=z}),v=0,pay=0,g=0,op=0;uniqueRows.forEach(function(r){v+=financeSaleValue(r);if(financeCustomerPaymentStatus(r)==="paid")pay+=financeSaleValue(r)});rows.forEach(function(r){op+=financeOperatorPayValue(r)});ex.forEach(function(r){g+=expenseAmountValue(r)});var u=pay-g-op,ma=pay?u/pay*100:0;return '<tr><td>'+escapeHtml(a.toLocaleDateString('es-CL',{month:'long',year:'numeric'}))+'</td><td>'+money(v)+'</td><td>'+money(g)+'</td><td>'+money(op)+'</td><td>'+money(u)+'</td><td>'+pct(ma)+'</td><td>'+uniqueRows.length+'</td><td>'+money(uniqueRows.length?v/uniqueRows.length:0)+'</td></tr>'}).join('');
  var comparison='<div class="rfx-section"><h3>Comparativa mensual</h3><div style="overflow:auto"><table class="rfx-table"><thead><tr><th>Mes</th><th>Ventas</th><th>Gastos</th><th>Pago operadores</th><th>Utilidad</th><th>Margen</th><th>Reservas</th><th>Ticket</th></tr></thead><tbody>'+comparisonRows+'</tbody></table></div></div>';
  return '<div class="rfx-panel"><div class="rfx-head"><div><h2 class="rfx-title">Centro de control financiero</h2><p class="rfx-note">Vista mensual calendario: '+escapeHtml(currentLabel)+'</p></div><div class="rfx-months"><button class="relujo-fi-btn-secondary is-active" type="button">Mes actual</button><button class="relujo-fi-btn-secondary" type="button">Mes anterior</button><button class="relujo-fi-btn-secondary" type="button">Dos meses atras</button></div></div><div class="rfx-grid">'+cards.join('')+'</div><div class="rfx-section"><h3>Indicadores de decision</h3>'+alerts+'</div>'+comparison+'<div class="rfx-two"><div class="rfx-section"><h3>Ventas por dia del mes</h3>'+miniBars(dayMap)+'</div><div class="rfx-section"><h3>Utilidad ultimos 3 meses</h3>'+miniBars((function(){var o={};o[currentLabel]=util;return o})())+'</div></div>'+(financeLoadError?'<div class="relujo-fi-error">No se pudo cargar resumen financiero</div>':'')+'</div>';
}
function renderOperatorPaymentDashboard(){
  var selectedMeta=getSelectedFinancePeriodMeta(),summaryRows=operatorPaymentRows||[],selectedRows=getOperatorSelectedRows(),cancelledRows=getCancelledRowsForSelectedPeriod(),allPayableRows=operatorPayableRowsAll();
  if(!summaryRows.length && !selectedRows.length){
    var emptyNote=(financeRows||[]).length>0 && !hasOperatorCalculatedAmounts(allPayableRows)?'Hay servicios asociados, pero aún no tienen monto pagable calculado.':'No tienes servicios finalizados pagables todavía.';
    return '<div class="relujo-fi-dashboard"><div class="relujo-fi-dashboard-head"><div><h2 class="relujo-fi-dashboard-title">Mis pagos</h2><p class="relujo-fi-dashboard-note">'+escapeHtml(emptyNote)+'</p></div></div>'+(operatorPaymentError?'<div class="relujo-fi-error">No se pudo cargar resumen financiero</div>':'')+'</div>';
  }
  var periodLabel=selectedMeta?selectedMeta.label:"Todos los periodos";
  var payNote=selectedMeta&&selectedMeta.payDate?'Pago programado: '+friendlyDate(selectedMeta.payDate):'Vista completa';
  var monthBase=selectedMeta&&selectedMeta.start?new Date(selectedMeta.start.getFullYear(),selectedMeta.start.getMonth(),1,12,0,0):new Date(new Date().getFullYear(),new Date().getMonth(),1,12,0,0);
  var monthStarts=getMonthPeriodStarts(monthBase),periodOneRows=getRowsForExactPeriod(monthStarts.one),periodTwoRows=getRowsForExactPeriod(monthStarts.two);
  var currentMonthTotal=sumOperatorAmount(periodOneRows)+sumOperatorAmount(periodTwoRows);
  var operator2Context=isCurrentOperator2()||selectedRows.some(isOperator2Row);
  function periodDetailCard(title,rows){var lines=[
    {label:"Finalizados",value:String(countStatus(rows,"finalizada"))},
    {label:"Cancelados",value:String(countStatus(rows,"cancelled"))},
    {label:operator2Context?"Extras 20%":"Regla 18%",value:String(operator2Context?countOperator2Commission(rows):countRule(rows,"finalizada_18_percent_over_50k"))},
    {label:operator2Context?"Base servicios":"Completados",value:money(operator2Context?sumOperator2Base(rows):sumByStatus(rows,"finalizada"))}
  ];if(operator2Context)lines.push({label:"Comision extras",value:money(sumOperator2Commission(rows))});if(sumTravelFees(rows))lines.push({label:"Traslados",value:money(sumTravelFees(rows))});lines.push({label:"Cancelaciones",value:money(sumByStatus(rows,"cancelled"))},{label:"Total",value:money(sumOperatorAmount(rows))});return renderOperatorSummaryCard(title,lines)}
  var servicesCard=renderOperatorSummaryCard("Servicios",[
    {label:"Finalizados",value:String(countStatus(selectedRows,"finalizada"))},
    {label:"Cancelados",value:String(cancelledRows.length)},
    {label:operator2Context?"Extras 20%":"Regla 18%",value:String(operator2Context?countOperator2Commission(selectedRows):countRule(selectedRows,"finalizada_18_percent_over_50k"))}
  ]);
  var earningsLines=operator2Context?[
    {label:"Base servicios",value:money(sumOperator2Base(selectedRows))},
    {label:"Comision extras",value:money(sumOperator2Commission(selectedRows))},
    {label:"Traslados",value:money(sumTravelFees(selectedRows))},
    {label:"Cancelaciones",value:money(sumByStatus(cancelledRows,"cancelled"))},
    {label:"Total periodo",value:money(sumOperatorAmount(selectedRows))}
  ]:[
    {label:"Completados",value:money(sumByStatus(selectedRows,"finalizada"))},
    {label:"Traslados",value:money(sumTravelFees(selectedRows))},
    {label:"Cancelaciones",value:money(sumByStatus(cancelledRows,"cancelled"))},
    {label:"Total periodo",value:money(sumOperatorAmount(selectedRows))}
  ];
  var earningsCard=renderOperatorSummaryCard("Ganancias del periodo",earningsLines);
  var summaryTitle=financePeriodFilter==="all"?"Resumen general":"Resumen mensual";
  var periodOneMeta=getFinancePeriodMeta(monthStarts.one),periodTwoMeta=getFinancePeriodMeta(monthStarts.two);
  var periodOneLabel=periodOneMeta?periodOneMeta.label:'05 al 19';
  var periodTwoLabel=periodTwoMeta?periodTwoMeta.label:'20 al 04';
  var summaryCard=renderOperatorSummaryCard(summaryTitle,[
    {label:periodOneLabel,value:money(sumOperatorAmount(periodOneRows))},
    {label:periodTwoLabel,value:money(sumOperatorAmount(periodTwoRows))},
    {label:"Total mes",value:money(currentMonthTotal)}
  ]);
  var detailCards=financePeriodFilter==="all"?'':periodDetailCard("Periodo "+periodLabel,selectedRows);
  return '<div class="relujo-fi-dashboard"><div class="relujo-fi-dashboard-head"><div><h2 class="relujo-fi-dashboard-title">Mis pagos</h2><p class="relujo-fi-dashboard-note">Periodo '+escapeHtml(periodLabel)+' - '+escapeHtml(payNote)+'</p></div></div><div class="relujo-fi-dashboard-grid">'+servicesCard+earningsCard+summaryCard+detailCards+'</div>'+(operatorPaymentError?'<div class="relujo-fi-error">No se pudo cargar resumen financiero</div>':'')+'</div>';
}
function renderAdminFinanceCell(item){
  var sale=financeSaleValue(item),serviceSale=financeServiceSaleValue(item),travel=financeTravelFeeValue(item),operatorPay=financeOperatorPayValue(item),rule=financeRuleLabel(financeRuleCode(item)),customerPayment=financeCustomerPaymentStatus(item);
  if(financeStatus(item)==="cancelled") return '<div class="relujo-fi-inline"><div class="relujo-fi-main">Venta: '+escapeHtml(money(0))+'</div><div>'+badgeForPaymentStatus(customerPayment)+'</div><div class="relujo-fi-subline">Pago operador: No pagable</div><div class="relujo-fi-subline">Regla: '+escapeHtml(rule)+'</div></div>';
  return '<div class="relujo-fi-inline"><div class="relujo-fi-main">Venta: '+escapeHtml(money(sale))+'</div><div>'+badgeForPaymentStatus(customerPayment)+'</div>'+(travel?'<div class="relujo-fi-subline">Limpieza: '+escapeHtml(money(serviceSale))+' / Traslado: '+escapeHtml(money(travel))+'</div>':'')+'<div class="relujo-fi-subline">Pago operador: '+escapeHtml(operatorPay?money(operatorPay):"Pendiente")+'</div><div class="relujo-fi-subline">Regla: '+escapeHtml(rule)+'</div></div>';
}
function renderOperatorFinanceCell(item){
  var amount=financeOperatorPayValue(item),rule=operatorRuleShortLabel(financeRuleCode(item));
  return '<div class="relujo-fi-inline"><div class="relujo-fi-main">'+escapeHtml(amount?money(amount):"Pendiente")+'</div><div class="relujo-fi-subline">'+escapeHtml(rule)+'</div></div>';
}
function renderAdminTable(rows){
  if(!rows.length) return '<div class="relujo-fi-empty">No hay reservas con datos financieros para este periodo.</div>';
  return '<div class="relujo-fi-table-wrap"><table class="relujo-fi-table"><thead><tr><th>Reserva</th><th>Fecha</th><th>Cliente</th><th>Estado</th><th>Finanzas</th></tr></thead><tbody>'+rows.map(function(item){return '<tr><td><div class="relujo-fi-stack"><div class="relujo-fi-main">RLJ-'+escapeHtml(pickFirst(item,["reserva_id","id"],"—"))+'</div><div class="relujo-fi-subline">'+escapeHtml(friendlyDateTime(getFinanceAnchorDate(item)))+'</div></div></td><td><div class="relujo-fi-stack"><div class="relujo-fi-main">'+escapeHtml(friendlyDate(pickFirst(item,["route_date","service_completed_at","cancelled_at"],null)))+'</div><div class="relujo-fi-subline">'+escapeHtml(pickFirst(item,["slot","period_label"],"—"))+'</div></div></td><td><div class="relujo-fi-stack"><div class="relujo-fi-main">'+escapeHtml(pickFirst(item,["name","cliente_nombre","customer_name"],"Sin nombre"))+'</div><div class="relujo-fi-subline">'+escapeHtml(pickFirst(item,["comuna","address","client_reference"],"—"))+'</div></div></td><td>'+badgeForStatus(financeStatus(item))+'</td><td>'+renderAdminFinanceCell(item)+'</td></tr>'}).join("")+'</tbody></table></div>';
}
function reservationId(item){return pickFirst(item,["reserva_id","id_reserva","reservation_id","id"],"-")}
function reservationClient(item){return pickFirst(item,["name","cliente_nombre","customer_name","client_name"],"Sin nombre")}
function reservationPhone(item){return pickFirst(item,["phone","telefono","customer_phone"],"")}
function reservationAddress(item){return [pickFirst(item,["address","direccion","client_address"],""),pickFirst(item,["apto","department","oficina"],""),pickFirst(item,["comuna","city","client_reference"],"")].filter(Boolean).join(" - ")||"-"}
function reservationServices(item){return [pickFirst(item,["services_text","service_name","servicios_text","service"],""),pickFirst(item,["upsells_text","upsells"],"")?"Upsell: "+pickFirst(item,["upsells_text","upsells"],""):""].filter(Boolean).join(" | ")||"-"}
function renderOperatorRows(rows){return rows.map(function(item){var earned=financeOperatorPayValue(item),rule=operatorRuleShortLabel(financeRuleCode(item)),date=friendlyDate(pickFirst(item,["route_date","service_date","service_completed_at","cancelled_at"],null)),slot=pickFirst(item,["slot","hora","reservation_slot"],"-"),travel=financeTravelFeeValue(item),amountSub;if(isOperator2Row(item)){var b=operator2PayBreakdown(item);amountSub='Fijo '+money(b.base)+' / Comision '+money(b.commission);if(b.extrasSale)amountSub+=' (20% de '+money(b.extrasSale)+')';if(b.travel)amountSub+=' / Traslado '+money(b.travel);amountSub+=' / Venta '+money(financeSaleValue(item))}else{amountSub=rule+' / Serv. '+money(financeServiceSaleValue(item));if(travel)amountSub+=' / Traslado '+money(travel)}return '<tr><td><b>'+escapeHtml(earned?money(earned):"Pend.")+'</b><span class="relujo-fi-subline"> '+escapeHtml(amountSub)+'</span></td><td><b>'+escapeHtml(date)+'</b><span class="relujo-fi-subline"> '+escapeHtml(slot)+'</span></td><td><b>'+escapeHtml(reservationClient(item))+'</b><span class="relujo-fi-subline"> '+escapeHtml(reservationPhone(item)||"-")+' / '+escapeHtml(reservationAddress(item))+'</span></td><td><b>RLJ-'+escapeHtml(reservationId(item))+'</b><span class="relujo-fi-subline"> '+escapeHtml(reservationServices(item))+'</span></td><td>'+badgeForStatus(financeStatus(item))+'</td></tr>'}).join("")}
function renderOperatorPeriodTable(title,rows){if(!rows.length)return '<div class="relujo-fi-empty">'+escapeHtml(title)+': sin reservas en este periodo.</div>';return '<div class="relujo-fi-table-wrap"><div class="relujo-fi-dashboard-head" style="padding:6px 8px 0"><div><h3 class="relujo-fi-dashboard-title" style="font-size:15px">'+escapeHtml(title)+' <span class="relujo-fi-dashboard-note">'+escapeHtml(rows.length+' res. / '+money(sumOperatorAmount(rows)))+'</span></h3></div></div><table class="relujo-fi-table" style="min-width:760px;border-spacing:0 2px;font-size:11px"><thead><tr><th>Monto</th><th>Fecha / Hora</th><th>Cliente / Direccion</th><th>Reserva / Servicio</th><th>Estado</th></tr></thead><tbody>'+renderOperatorRows(rows)+'</tbody></table></div>'}
function renderOperatorTable(rows){
  if(!rows.length){var hasAssociated=operatorPayableRowsAll().length>0;return '<div class="relujo-fi-empty">'+(hasAssociated?'Hay servicios asociados, pero no en este periodo. Revisa "Todos" para ver el historial completo.':'No tienes servicios finalizados pagables todavia.')+'</div>'}
  if(financePeriodFilter==="all")return renderOperatorPeriodTable("Todas las reservas",rows);
  var selectedMeta=getSelectedFinancePeriodMeta();
  var title=selectedMeta?"Periodo "+selectedMeta.label:"Periodo actual";
  return renderOperatorPeriodTable(title,rows);
}
function getOperatorPayableRows(){return getOperatorSelectedRows()}
function buildOperatorSummaryFromSales(rows){
  var currentMeta=getCurrentFinancePeriodMeta();
  var payableRows=(rows||[]).filter(function(row){
    var status=financeStatus(row);
    return status==="finalizada";
  });
  var finalized=0,cancelled=0,sales=0,payable=0,payStatus="pending";
  payableRows.forEach(function(row){
    var status=financeStatus(row);
    if(status==="finalizada") finalized+=1;
    sales+=financeSaleValue(row);
    payable+=financeOperatorPayValue(row);
    if(String(pickFirst(row,["operator_payment_status","payment_status","estado_pago"],"pending")).toLowerCase()==="paid"){payStatus="paid"}
  });
  return [{
    period_label: currentMeta ? currentMeta.label : "Actual",
    services_finalized: finalized,
    services_cancelled: cancelled,
    total_acumulado_a_pagar: payable,
    estimated_payment_date: currentMeta && currentMeta.payDate ? isoDate(currentMeta.payDate) : null,
    operator_payment_status: payStatus
  }];
}

function getFilteredFinanceRows(){
  var currentMeta=getCurrentFinancePeriodMeta(),previousMeta=getPreviousFinancePeriodMeta(),selectedMeta=financePeriodFilter==="previous"?previousMeta:financePeriodFilter==="all"?null:currentMeta;
  return (financeRows||[]).filter(function(row){if(adminOperatorFilter==="karin"&&!isRelujoOperatorRow(row))return false;if(adminOperatorFilter==="operator2"&&!isOperator2Row(row))return false;if(financePeriodFilter==="all")return true;var meta=getFinanceRowPeriodMeta(row);return !!(meta&&selectedMeta&&meta.key===selectedMeta.key)});
}
function renderOperatorFilterButtons(){if(currentRole!=="admin")return"";var buttons=[["all","Todos"],["karin","Karin"],["operator2","Operador 2"]];return '<div class="relujo-fi-actions" style="margin:0 0 8px">'+buttons.map(function(b){return '<button class="relujo-fi-btn-secondary'+(adminOperatorFilter===b[0]?' is-active':'')+'" type="button" data-admin-operator="'+b[0]+'">'+b[1]+'</button>'}).join("")+'</div>'}
function syncPeriodButtons(){
  [periodCurrentEl,periodPreviousEl,periodAllEl].forEach(function(el){if(el)el.classList.remove("is-active")});
  if(financePeriodFilter==="current"&&periodCurrentEl)periodCurrentEl.classList.add("is-active");
  if(financePeriodFilter==="previous"&&periodPreviousEl)periodPreviousEl.classList.add("is-active");
  if(financePeriodFilter==="all"&&periodAllEl)periodAllEl.classList.add("is-active");
}
function syncTabs(){
  if(tabFinanceEl)tabFinanceEl.classList.toggle("is-active",activeTab==="finance");
  if(tabExpensesEl){tabExpensesEl.classList.toggle("is-active",activeTab==="expenses");tabExpensesEl.style.display=currentRole==="admin"?"":"none";}
  if(periodActionsEl)periodActionsEl.style.display=activeTab==="finance"?"flex":"none";
}
function bindExpenseEvents(){
  if(activeTab!=="expenses"||currentRole!=="admin")return;
  var dateEl=document.getElementById("rf-expense-date"),categoryEl=document.getElementById("rf-expense-category"),descriptionEl=document.getElementById("rf-expense-description"),amountEl=document.getElementById("rf-expense-amount"),areaEl=document.getElementById("rf-expense-area"),notesEl=document.getElementById("rf-expense-notes"),formEl=document.getElementById("rf-expense-form"),fromEl=document.getElementById("rf-expense-filter-from"),toEl=document.getElementById("rf-expense-filter-to"),filterCategoryEl=document.getElementById("rf-expense-filter-category"),filterAreaEl=document.getElementById("rf-expense-filter-area");
  if(dateEl)dateEl.addEventListener("input",function(){expenseDraft.expense_date=dateEl.value});
  if(categoryEl)categoryEl.addEventListener("change",function(){expenseDraft.category=categoryEl.value});
  if(descriptionEl)descriptionEl.addEventListener("input",function(){expenseDraft.description=descriptionEl.value});
  if(amountEl)amountEl.addEventListener("input",function(){expenseDraft.amount=formatMoneyInput(amountEl.value);amountEl.value=expenseDraft.amount});
  
  if(areaEl)areaEl.addEventListener("change",function(){expenseDraft.business_area=areaEl.value});
  if(notesEl)notesEl.addEventListener("input",function(){expenseDraft.notes=notesEl.value});
  var cancelEditEl=document.getElementById("rf-expense-cancel-edit");
  if(cancelEditEl)cancelEditEl.addEventListener("click",function(){expenseEditId="";expenseDraft={expense_date:isoDate(new Date()),category:"",description:"",amount:"",business_area:"General",notes:""};renderPage()});
  if(fromEl)fromEl.addEventListener("change",function(){expenseFilters.from=fromEl.value;renderPage()});
  if(toEl)toEl.addEventListener("change",function(){expenseFilters.to=toEl.value;renderPage()});
  if(filterCategoryEl)filterCategoryEl.addEventListener("change",function(){expenseFilters.category=filterCategoryEl.value||"all";renderPage()});
  if(filterAreaEl)filterAreaEl.addEventListener("change",function(){expenseFilters.area=filterAreaEl.value||"all";renderPage()});
  if(formEl)formEl.addEventListener("submit",async function(e){e.preventDefault();var amountValue=Number(digitsOnly(expenseDraft.amount||amountEl&&amountEl.value||"")||0);if(!expenseDraft.expense_date||!(expenseDraft.category||categoryEl&&categoryEl.value)||!(expenseDraft.description||descriptionEl&&descriptionEl.value)||!amountValue||!(expenseDraft.business_area||areaEl&&areaEl.value)){statusEl.textContent="Completa fecha, categoría, descripción, monto y área.";return}var submitEl=document.getElementById("rf-expense-submit");if(submitEl)submitEl.disabled=true;var wasEdit=!!expenseEditId;statusEl.textContent=wasEdit?"Actualizando gasto...":"Guardando gasto...";try{var payload={expense_date:expenseDraft.expense_date,category:expenseDraft.category||categoryEl.value,description:expenseDraft.description||descriptionEl.value,amount:amountValue,payment_method:null,business_area:expenseDraft.business_area||areaEl.value,notes:expenseDraft.notes||notesEl&&notesEl.value||"",created_by:currentUserId||null};if(wasEdit)await updateExpense(expenseEditId,payload);else await createExpense(payload);expensesRows=await fetchExpenses();expenseEditId="";expenseDraft={expense_date:isoDate(new Date()),category:"",description:"",amount:"",business_area:"General",notes:""};statusEl.textContent=wasEdit?"Gasto actualizado.":"Gasto registrado.";renderPage()}catch(err){console.error("Error guardando gasto:",err);statusEl.textContent="No se pudo guardar el gasto."}finally{if(submitEl)submitEl.disabled=false}});
  [].slice.call(document.querySelectorAll("[data-expense-edit]")).forEach(function(btn){btn.addEventListener("click",function(){var row=(expensesRows||[]).filter(function(x){return String(x.id)===String(btn.dataset.expenseEdit)})[0];if(!row)return;expenseEditId=String(row.id);expenseDraft={expense_date:expenseDateValue(row),category:row.category||"",description:row.description||"",amount:money(expenseAmountValue(row)),business_area:row.business_area||"General",notes:row.notes||""};renderPage()})});
  [].slice.call(document.querySelectorAll("[data-expense-delete]")).forEach(function(btn){btn.addEventListener("click",async function(){if(!confirm("¿Eliminar este gasto"))return;statusEl.textContent="Eliminando gasto...";try{await deleteExpense(btn.dataset.expenseDelete);expensesRows=await fetchExpenses();statusEl.textContent="Gasto eliminado.";renderPage()}catch(err){console.error("Error eliminando gasto:",err);statusEl.textContent="No se pudo eliminar el gasto."}})});
}
function renderPage(){
  syncPeriodButtons();
  syncTabs();
  if(activeTab==="expenses"&&currentRole==="admin"){
    summaryEl.innerHTML="";
    listEl.innerHTML=renderExpensesModule();
    statusEl.textContent=getFilteredExpenses().length+" gasto"+(getFilteredExpenses().length===1?"":"s");
    bindExpenseEvents();
  } else if(currentRole==="admin"){
    summaryEl.innerHTML=renderOperatorFilterButtons()+renderFinanceDashboard();
    listEl.innerHTML=renderAdminTable(getFilteredFinanceRows());
    [].slice.call(document.querySelectorAll("[data-admin-operator]")).forEach(function(btn){btn.addEventListener("click",function(){adminOperatorFilter=btn.dataset.adminOperator;renderPage()})});
  } else if(currentRole==="operador"){
    summaryEl.innerHTML=renderOperatorPaymentDashboard();
    listEl.innerHTML=renderOperatorTable(getOperatorPayableRows());
  } else {
    summaryEl.innerHTML="";
    listEl.innerHTML='<div class="relujo-fi-empty">No tienes permisos para ver finanzas.</div>';
  }
}
async function loadFinanzas(){
  statusEl.textContent="Cargando finanzas...";
  summaryEl.innerHTML="";
  listEl.innerHTML="";
  financeRows=[];financeLoadError="";operatorPaymentRows=[];operatorPaymentError="";expensesRows=[];expensesLoadError="";
  try{
    var autoClosedCount=0;
    try{autoClosedCount=await autoFinalizeOverdueReservations()}catch(autoErr){console.error("Error cerrando atrasadas:",autoErr)}
    if(currentRole==="admin"){
      var adminResults=await Promise.allSettled([fetchSalesControl(),fetchExpenses()]);
      financeRows=adminResults[0].status==="fulfilled"?await enrichFinanceRows(adminResults[0].value||[]):[];
      financeLoadError=adminResults[0].status==="fulfilled"?"":"No se pudo cargar resumen financiero";
      expensesRows=adminResults[1].status==="fulfilled"?(adminResults[1].value||[]):[];
      expensesLoadError=adminResults[1].status==="fulfilled"?"":"No se pudo cargar gastos";
    }else if(currentRole==="operador"){
      var operatorResults=await Promise.allSettled([fetchSalesControl({operadorId:currentProfile&&currentProfile.operador_id?currentProfile.operador_id:null}),fetchOperatorPaymentSummary()]);
      financeRows=operatorResults[0].status==="fulfilled"?await enrichFinanceRows(operatorResults[0].value||[]):[];
      financeLoadError=operatorResults[0].status==="fulfilled"?"":"No se pudo cargar resumen financiero";
      operatorPaymentRows=operatorResults[1].status==="fulfilled"?(operatorResults[1].value||[]):[];
      operatorPaymentError=operatorResults[1].status==="fulfilled"?"":"No se pudo cargar resumen financiero";
      if(!operatorPaymentRows.length && financeRows.length){
        operatorPaymentRows=buildOperatorSummaryFromSales(getOperatorPayableRows());
      }
    }
    renderPage();
    if(currentRole==="operador"){
      var payableRows=getOperatorPayableRows();
      statusEl.textContent=payableRows.length?payableRows.length+" pago"+(payableRows.length===1?"":"s")+" estimado"+(payableRows.length===1?"":"s"):"No tienes servicios finalizados pagables todavía.";
    }else{
      statusEl.textContent=(financeRows||[]).length+" registro"+((financeRows||[]).length===1?"":"s");
    }
    if(autoClosedCount)statusEl.textContent+=" · "+autoClosedCount+" regularizada"+(autoClosedCount===1?"":"s")+" por sistema";
  }catch(err){
    console.error("Error cargando finanzas:",err);
    statusEl.textContent="Error cargando finanzas";
    listEl.innerHTML='<div class="relujo-fi-empty">No se pudo cargar la información financiera.</div>';
  }
}
async function boot(){
  var sessionRes=await sb.auth.getSession();
  if(!sessionRes.data||!sessionRes.data.session){loginCard.style.display="";appEl.style.display="none";userEl.textContent="";currentRole=null;currentProfile=null;return}
  try{
    var info=await getProfile();
    if(!info||!info.profile||!info.profile.activo){await sb.auth.signOut();alert("Tu usuario no tiene acceso activo.");loginCard.style.display="";appEl.style.display="none";currentProfile=null;return}
    currentRole=info.profile.rol;
    currentProfile=info.profile;
    currentUserId=info.user&&info.user.id?info.user.id:"";
    if(currentRole!=="admin"&&currentRole!=="operador"){await sb.auth.signOut();alert("Rol no válido.");loginCard.style.display="";appEl.style.display="none";currentProfile=null;return}
    userEl.textContent="Sesión: "+(info.profile.email||"");
    loginCard.style.display="none";
    appEl.style.display="";
    await loadFinanzas();
  }catch(err){
    console.error("Error validando usuario:",err);
    alert("Error validando usuario.");
    loginCard.style.display="";
    appEl.style.display="none";
    currentProfile=null;
  }
}

loginBtn.addEventListener("click", async function(){
  loginStatusEl.textContent="Ingresando...";
  var res=await sb.auth.signInWithPassword({email:String(emailEl.value||"").trim(),password:String(passwordEl.value||"")});
  if(res.error){loginStatusEl.textContent=res.error.message||"No se pudo iniciar sesión";return}
  loginStatusEl.textContent="";
  await boot();
});
logoutEl.addEventListener("click", async function(){await sb.auth.signOut();location.reload()});
refreshEl.addEventListener("click", function(){loadFinanzas()});
tabFinanceEl.addEventListener("click", function(){activeTab="finance";renderPage()});
tabExpensesEl.addEventListener("click", function(){if(currentRole==="admin"){activeTab="expenses";renderPage()}});
periodCurrentEl.addEventListener("click", function(){financePeriodFilter="current";renderPage()});
periodPreviousEl.addEventListener("click", function(){financePeriodFilter="previous";renderPage()});
periodAllEl.addEventListener("click", function(){financePeriodFilter="all";renderPage()});
boot();
})();
