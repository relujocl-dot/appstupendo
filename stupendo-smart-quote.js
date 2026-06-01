(function(){
  "use strict";

  var ROOT_ID="stupendo-smart-quote";
  var READY_EVENT="StupendoSmartQuoteReady";
  var MONEY=function(n){return "$"+Math.round(Number(n||0)).toLocaleString("es-CL")};
  var LOCAL_CATALOG={
    sillon_recto_2:{id:"sillon_recto_2",name:"Sof\u00e1 recto 2 cuerpos",category:"Sillones",type:"Rectos",price:30000,min:30},
    sillon_recto_3:{id:"sillon_recto_3",name:"Sof\u00e1 recto 3 cuerpos",category:"Sillones",type:"Rectos",price:35000,min:35},
    sillon_reclinable_3:{id:"sillon_reclinable_3",name:"Sof\u00e1 reclinable 3 cuerpos",category:"Sillones",type:"Rectos",price:40000,min:45},
    sillon_l_3:{id:"sillon_l_3",name:"Sof\u00e1 en L 3 cuerpos",category:"Sillones",type:"En L",price:40000,min:45},
    sillon_l_4:{id:"sillon_l_4",name:"Sof\u00e1 en L 4 cuerpos",category:"Sillones",type:"En L",price:45000,min:50},
    sillon_l_5:{id:"sillon_l_5",name:"Sof\u00e1 en L 5 cuerpos",category:"Sillones",type:"En L",price:50000,min:60},
    sillon_l_6:{id:"sillon_l_6",name:"Sof\u00e1 en L 6 cuerpos",category:"Sillones",type:"En L",price:60000,min:70},
    sillon_l_7:{id:"sillon_l_7",name:"Sof\u00e1 en L 7 cuerpos",category:"Sillones",type:"En L",price:70000,min:90},
    poltrona:{id:"poltrona",name:"Poltrona/sitial",category:"Sillones",type:"Individuales",price:8000,min:10},
    puff:{id:"puff",name:"Puff",category:"Sillones",type:"Individuales",price:8000,min:10},
    berger:{id:"berger",name:"Berger",category:"Sillones",type:"Individuales",price:15000,min:15},
    colchon_1:{id:"colchon_1",name:"Colch\u00f3n 1 plaza",category:"Colchones",type:"Colchones",price:15000,min:20},
    colchon_1_5:{id:"colchon_1_5",name:"Colch\u00f3n 1.5 plazas",category:"Colchones",type:"Colchones",price:20000,min:25},
    colchon_2:{id:"colchon_2",name:"Colch\u00f3n 2 plazas",category:"Colchones",type:"Colchones",price:32000,min:30},
    colchon_queen:{id:"colchon_queen",name:"Colch\u00f3n Queen",category:"Colchones",type:"Colchones",price:36000,min:30},
    colchon_king:{id:"colchon_king",name:"Colch\u00f3n King",category:"Colchones",type:"Colchones",price:36000,min:30},
    colchon_superking:{id:"colchon_superking",name:"Colch\u00f3n Super King",category:"Colchones",type:"Colchones",price:40000,min:30},
    colchon_cuna:{id:"colchon_cuna",name:"Colch\u00f3n cuna",category:"Colchones",type:"Colchones",price:10000,min:20},
    respaldo:{id:"respaldo",name:"Respaldo colch\u00f3n",category:"Colchones",type:"Complementos",price:20000,min:20},
    bajada_cama:{id:"bajada_cama",name:"Bajada de cama hasta 0,80 x 1,50",category:"Colchones",type:"Complementos",price:6500,min:5},
    silla_base_respaldo:{id:"silla_base_respaldo",name:"Silla comedor base+respaldo",category:"Sillas",type:"Sillas",price:6500,min:5},
    silla_escritorio:{id:"silla_escritorio",name:"Silla escritorio",category:"Sillas",type:"Sillas",price:12000,min:10},
    silla_solo_base:{id:"silla_solo_base",name:"Silla comedor solo base",category:"Sillas",type:"Sillas",price:5000,min:5},
    sitial_up:{id:"sitial_up",name:"Sitial",category:"Sillas",type:"Sillas",price:10000,min:10},
    alfombra_bajada:{id:"alfombra_bajada",name:"Bajada de cama hasta 0,80 x 1,50",category:"Alfombras",type:"Tamanos",price:6500,min:5},
    alfombra_2x3:{id:"alfombra_2x3",name:"Alfombra decorativa hasta 2x3",category:"Alfombras",type:"Tamanos",price:28000,min:25},
    alfombra_3x5:{id:"alfombra_3x5",name:"Alfombra grande 3x5",category:"Alfombras",type:"Tamanos",price:35000,min:35},
    cama_mascota_s:{id:"cama_mascota_s",name:"Cama de mascota S",category:"Mascotas",type:"Camas de mascota",price:6500,min:10},
    cama_mascota_m:{id:"cama_mascota_m",name:"Cama de mascota M",category:"Mascotas",type:"Camas de mascota",price:12000,min:15},
    cama_mascota_l:{id:"cama_mascota_l",name:"Cama de mascota L",category:"Mascotas",type:"Camas de mascota",price:18000,min:20},
    cama_mascota_xl:{id:"cama_mascota_xl",name:"Cama de mascota XL",category:"Mascotas",type:"Camas de mascota",price:22000,min:25}
  };

  function bridge(){return window.StupendoTapicesQuoteBridge||window.StupendoTapices||null}
  function catalog(){return (bridge()&&bridge().catalog)||LOCAL_CATALOG}
  function normalize(text){
    return String(text||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/,/g," ").replace(/\s+/g," ").trim();
  }
  function wordNumber(value){
    var map={un:1,una:1,uno:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10};
    if(value==null)return 1;
    if(/^\d+$/.test(value))return Number(value);
    return map[value]||1;
  }
  function qtyNear(text,index,fallback){
    var beforeText=text.slice(Math.max(0,index-24),index);
    var before=beforeText.match(/(?:^|\s|y\s+)(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*$/);
    if(before)return wordNumber(before[1]);
    var start=Math.max(0,index-18),end=Math.min(text.length,index+32),chunk=text.slice(start,end);
    var after=chunk.match(/^.{0,16}(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)(?:\s|$)/);
    return after ? wordNumber(after[1]) : (fallback||1);
  }
  function qtyBeforeOnly(text,index,fallback){
    var beforeText=text.slice(Math.max(0,index-18),index);
    var before=beforeText.match(/(?:^|\s|y\s+|\+\s*)(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*$/);
    return before ? wordNumber(before[1]) : (fallback||1);
  }
  function addItem(list,id,qty){
    var base=catalog()[id];
    if(!base)return false;
    qty=Math.max(1,Number(qty||1));
    list.push(Object.assign({},base,{qty:qty,price:Number(base.price||0)*qty,min:Number(base.min||0)*qty,normal_price:Number(base.price||0)*qty}));
    return true;
  }
  function signalIntent(){
    window.StupendoSmartQuoteActive=true;
    try{window.dispatchEvent(new CustomEvent("StupendoSmartQuoteIntent"))}catch(e){}
  }
  function parse(text){
    var src=normalize(text),items=[],questions=[],warnings=[],seen={};
    function once(id,qty){
      qty=Math.max(1,Number(qty||1));
      if(seen[id]){
        var current=items.find(function(item){return item.id===id});
        var base=catalog()[id];
        if(!current||!base)return false;
        current.qty=Number(current.qty||1)+qty;
        current.price=Number(base.price||0)*current.qty;
        current.min=Number(base.min||0)*current.qty;
        current.normal_price=current.price;
        return true;
      }
      seen[id]=1;
      return addItem(items,id,qty);
    }

    if(/\bfutones?\b/.test(src)){
      once("sillon_recto_3",1);
    }

    src.replace(/(?:^|\s)(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+)?(sofas?|sillones?|sillon|seccionales?|seccional|esquinero)(?:\s+(en\s+l|ele|l|seccional|rinconero|esquinero|reclinable|recto))?(?:\s+(?:de\s+)?)?(\d+|dos|tres|cuatro|cinco|seis|siete)\s*(?:cuerpos|c\b|cpos)(?:\s+(en\s+l|ele|l|seccional|rinconero|esquinero|recto|reclinable))?/g,function(_,qty,noun,kindA,n,kindB){
      var q=wordNumber(n),kind=(noun+" "+(kindA||"")+" "+(kindB||"")),isL=/\b(en\s+l|ele|l|seccional|rinconero|esquinero)\b/.test(kind),id=q===1?"poltrona":(/reclinable/.test(kind))?"sillon_reclinable_3":isL ? "sillon_l_"+q : "sillon_recto_"+q;
      if(!catalog()[id]&&q>=4)id="sillon_l_"+q;
      once(id,wordNumber(qty));
    });
    if(/\b(sofa|sillon|seccional|esquinero)\b/.test(src)&&!items.some(function(x){return x.category==="Sillones"})){
      questions.push("Completa de cu\u00e1ntos cuerpos es el sof\u00e1. Si no indicas en L, lo considero recto.");
    }
    if(/\b(sofa|sillon)\s+(individual|un\s+cuerpo|uno\s+cuerpo|1\s*cuerpo|1\s*c)\b/.test(src)&&!items.some(function(x){return x.id==="poltrona"})){
      once("poltrona",1);
    }

    src.replace(/alfombra(?:\s+(?:de\s+)?)?(\d+(?:[,.]\d+)?)\s*x\s*(\d+(?:[,.]\d+)?)/g,function(_,a,b){
      var x=Number(String(a).replace(",",".")),y=Number(String(b).replace(",",".")),small=Math.min(x,y),large=Math.max(x,y);
      if(large<=3&&small<=2)once("alfombra_2x3",1);
      else{once("alfombra_3x5",1);warnings.push("La dejamos como alfombra grande para revisión.")}
    });
    if(/alfombra/.test(src)&&!items.some(function(x){return x.category==="Alfombras"})){
      if(/bajada/.test(src))once("alfombra_bajada",1);else questions.push("¿Qué medida aproximada tiene la alfombra?");
    }

    src.replace(/(\d+|una|un|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(sillas(?:\s+de\s+comedor)?|silla\s+de\s+comedor|sillas\s+escritorio|silla\s+escritorio)(.{0,28})/g,function(match,q,label,tail){
      tail=String(tail||"");
      if(/escritorio/.test(label)||/escritorio/.test(tail)){once("silla_escritorio",wordNumber(q));return}
      if(/solo\s*base|sin\s*respaldo/.test(tail)){once("silla_solo_base",wordNumber(q));return}
      if(/base\s*(?:\+|y|con)\s*respaldo|con\s*respaldo|respaldo/.test(tail)){once("silla_base_respaldo",wordNumber(q));return}
      questions.push("Completa si las sillas son solo base o con respaldo.");
    });

    src.replace(/(poltronas?|sitiales?|puffs?|berger)/g,function(match,_group,offset){
      once(/berger/.test(match)?"berger":/puff/.test(match)?"puff":"poltrona",qtyBeforeOnly(src,offset,1));
    });

    if(/colchon|matrimonial/.test(src)){
      if(/super\s*king/.test(src))once("colchon_superking",1);
      else if(/king/.test(src))once("colchon_king",1);
      else if(/queen/.test(src))once("colchon_queen",1);
      else if(/cuna/.test(src))once("colchon_cuna",1);
      else if(/1[,.]\s*5|una\s+y\s+media/.test(src))once("colchon_1_5",1);
      else if(/matrimonial/.test(src))once("colchon_2",1);
      else if(/2\s*plazas|dos\s*plazas/.test(src))once("colchon_2",1);
      else if(/1\s*plaza|una\s*plaza/.test(src))once("colchon_1",1);
      else questions.push("¿De qué tamaño es el colchón: 1 plaza, 2 plazas, Queen, King o Super King?");
    }
    if(/respaldo/.test(src)&&!/(sillas|silla de comedor).{0,24}respaldo|respaldo.{0,24}(sillas|silla de comedor)/.test(src))once("respaldo",1);
    if(/bajada/.test(src)&&!items.some(function(x){return x.id==="bajada_cama"||x.id==="alfombra_bajada"}))once("bajada_cama",1);

    if(/cama.*mascota|mascota/.test(src)){
      if(/\bxl\b|extra grande/.test(src))once("cama_mascota_xl",1);
      else if(/\bl\b|grande/.test(src))once("cama_mascota_l",1);
      else if(/\bm\b|mediana/.test(src))once("cama_mascota_m",1);
      else if(/\bs\b|pequena|chica/.test(src))once("cama_mascota_s",1);
      else questions.push("¿La cama de mascota es S, M, L o XL?");
    }

    return{items:items,questions:questions,warnings:warnings,confidence:items.length ? Math.max(.55,1-questions.length*.18) : 0};
  }
  function saveFallback(items){
    try{
      localStorage.setItem("relujo_cart",JSON.stringify({items:items,upsells:[]}));
    }catch(e){}
  }
  function addToCart(items){
    var b=bridge();
    if(b&&typeof b.addItems==="function")return b.addItems(items);
    saveFallback(items);
    return false;
  }
  function setPacksVisible(visible){
    var packs=document.getElementById("rj-packs-card");
    if(packs)packs.style.display=visible?"block":"none";
  }
  function hasCartItems(){
    var summary=document.getElementById("rj-flow-summary");
    return !!(summary&&summary.style.display!=="none");
  }
  function injectStyles(){
    if(document.getElementById("stupendo-smart-quote-style"))return;
    var s=document.createElement("style");
    s.id="stupendo-smart-quote-style";
    s.textContent=".sq-box{border:1px solid rgba(205,163,73,.24);border-radius:20px;background:#fff;box-shadow:0 10px 24px rgba(8,34,75,.08);padding:16px;margin:0 0 14px}.sq-title{margin:0 0 6px;color:#08224b;font-size:clamp(24px,3vw,34px);line-height:1.15;font-weight:900;letter-spacing:-.02em}.sq-sub{margin:0 0 12px;color:#60708a;font-size:13px}.sq-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}.sq-input{width:100%;border:1px solid rgba(8,34,75,.12);border-radius:14px;padding:13px 14px;font:inherit;color:#10264d;min-width:0}.sq-btn{border:0;border-radius:14px;padding:13px 16px;background:linear-gradient(180deg,#08224b,#0d2d61);color:#fff;font-weight:800;cursor:pointer}.sq-out{display:none;margin-top:12px;padding:12px;border-radius:14px;background:#fbfaf7;color:#10264d;font-size:13px;line-height:1.4}.sq-out strong{color:#08224b}.sq-question{color:#8a6419;font-weight:800}@media(max-width:700px){.sq-row{grid-template-columns:1fr}.sq-btn{width:100%}}";
    document.head.appendChild(s);
  }
  function renderResult(root,result,added){
    var out=root.querySelector("[data-sq-output]");
    var html="";
    if(result.items.length){
      var total=result.items.reduce(function(a,b){return a+Number(b.price||0)},0);
      html+="<strong>"+(added?"Listo, agregamos estos servicios a tu cotización.":"Detectado:")+"</strong><br>"+result.items.map(function(i){return (i.qty>1 ? i.qty+" x " : "")+i.name+" · "+MONEY(i.price)}).join("<br>");
      html+="<br><strong>Total estimado: "+MONEY(total)+"</strong>";
    }
    if(result.questions.length){
      html+=(html?"<br><br>":"")+"<span class='sq-question'>Falta un dato:</span><br>"+result.questions.join("<br>");
    }
    if(result.warnings&&result.warnings.length){
      html+=(html?"<br><br>":"")+"<span class='sq-question'>Nota:</span><br>"+result.warnings.join("<br>");
    }
    if(!html)html="No pude detectar el servicio todavía.<br>Prueba escribiendo algo como:<br>&bull; sofá 3 cuerpos<br>&bull; alfombra 2x3<br>&bull; colchón king + respaldo<br>&bull; 6 sillas comedor";
    out.innerHTML=html;
    out.style.display="block";
  }
  function mount(){
    var root=document.getElementById(ROOT_ID);
    if(!root || root.dataset.ready)return;
    root.dataset.ready="1";
    injectStyles();
    root.innerHTML='<div class="sq-box"><h2 class="sq-title">Cuéntanos qué necesitas limpiar</h2><p class="sq-sub">Escribe como si nos hablaras por WhatsApp. Mientras más detalles pongas, mejor armamos tu cotización.</p><div class="sq-row"><input class="sq-input" data-sq-input placeholder="Ej: sofá 3 cuerpos + alfombra 2x3"><button class="sq-btn" data-sq-submit type="button">Cotizar</button></div><p class="sq-sub" style="margin:10px 0 0;font-size:12px">Incluye si aplica: cantidad, tamaño, medidas, si es en L, si tiene respaldo o si son sillas solo base.</p><div class="sq-out" data-sq-output></div></div>';
    var input=root.querySelector("[data-sq-input]"),btn=root.querySelector("[data-sq-submit]");
    input.addEventListener("input",function(){
      var hasText=input.value.trim().length>0;
      if(hasText){
        signalIntent();
        setPacksVisible(false);
      }else{
        signalIntent();
        setPacksVisible(false);
      }
    });
    input.addEventListener("focus",function(){signalIntent();setPacksVisible(false)});
    function run(){
      signalIntent();
      btn.disabled=true;
      setTimeout(function(){
        var result=parse(input.value),added=false;
        if(result.items.length&&!result.questions.length){
          signalIntent();
          setPacksVisible(false);
          added=addToCart(result.items)!==false;
        }
        renderResult(root,result,added);
        btn.disabled=false;
      },80);
    }
    btn.addEventListener("click",run);
    input.addEventListener("keydown",function(ev){
      if(ev.key==="Enter")run();
    });
  }

  window.StupendoSmartQuote={
    parse:parse,
    mount:mount,
    addToCart:addToCart
  };

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",mount);
  }else{
    mount();
  }

  window.dispatchEvent(new CustomEvent(READY_EVENT));
})();
