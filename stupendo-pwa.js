(function(){
  var deferredPrompt=null;
  var installed=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true;

  function assetUrl(name){
    var scripts=document.getElementsByTagName("script");
    for(var i=scripts.length-1;i>=0;i--){
      var src=scripts[i].src||"";
      if(src.indexOf("stupendo-pwa.js")>-1)return src.replace(/stupendo-pwa\.js(?:\?.*)?$/,name);
    }
    return "/"+name;
  }

  function addMeta(){
    if(!document.querySelector('link[rel="manifest"]')){
      var m=document.createElement("link");
      m.rel="manifest";
      m.href=assetUrl("manifest.webmanifest");
      document.head.appendChild(m);
    }
    if(!document.querySelector('meta[name="theme-color"]')){
      var t=document.createElement("meta");
      t.name="theme-color";
      t.content="#061a33";
      document.head.appendChild(t);
    }
    document.documentElement.classList.toggle("stupendo-standalone",installed);
  }

  function style(){
    if(document.getElementById("stupendo-pwa-style"))return;
    var css=".stupendo-install-btn{border:1px solid rgba(255,255,255,.72);border-radius:12px;padding:10px 13px;font-weight:800;background:#fff;color:#08224b;box-shadow:0 10px 30px rgba(0,0,0,.18);cursor:pointer}.stupendo-install-btn[hidden]{display:none!important}@media(max-width:900px){.relujo-ag-head,.relujo-fi-head{position:sticky;top:0;z-index:20;border-radius:0 0 16px 16px;padding-top:calc(12px + env(safe-area-inset-top));}.relujo-ag-wrap,.relujo-fi-wrap{padding-bottom:calc(18px + env(safe-area-inset-bottom));}.relujo-ag-btn,.relujo-ag-btn-secondary,.relujo-fi-btn,.relujo-fi-btn-secondary{min-height:42px}.relujo-ag-input,.relujo-ag-select,.relujo-fi-input,.relujo-fi-select{font-size:16px}}";
    var tag=document.createElement("style");
    tag.id="stupendo-pwa-style";
    tag.textContent=css;
    document.head.appendChild(tag);
  }

  function findHeader(){
    return document.querySelector(".relujo-ag-topline > div:last-child")||
      document.querySelector(".relujo-fi-head [style*='justify-content:space-between']")||
      document.querySelector(".relujo-ag-head")||
      document.querySelector(".relujo-fi-head")||
      document.body;
  }

  function ensureButton(){
    if(installed||document.getElementById("stupendo-install-app"))return;
    var btn=document.createElement("button");
    btn.id="stupendo-install-app";
    btn.type="button";
    btn.className="stupendo-install-btn";
    btn.hidden=true;
    btn.textContent="Instalar app";
    btn.onclick=function(){
      if(!deferredPrompt)return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function(){deferredPrompt=null;btn.hidden=true});
    };
    findHeader().appendChild(btn);
  }

  function showButton(){
    var btn=document.getElementById("stupendo-install-app");
    if(btn&&!installed)btn.hidden=false;
  }

  function registerSw(){
    if(!("serviceWorker" in navigator))return;
    var candidates=["/stupendo-sw.js","/sw.js",assetUrl("stupendo-sw.js")];
    function tryOne(i){
      if(i>=candidates.length)return;
      var url=candidates[i];
      try{
        if(new URL(url,location.href).origin!==location.origin && i<candidates.length-1){tryOne(i+1);return}
        navigator.serviceWorker.register(url,{scope:"/"}).catch(function(){tryOne(i+1)});
      }catch(e){tryOne(i+1)}
    }
    window.addEventListener("load",function(){tryOne(0)});
  }

  function clearOnLogout(){
    document.addEventListener("click",function(e){
      var id=e.target&&e.target.id;
      if((id==="ra-logout"||id==="rf-logout")&&navigator.serviceWorker&&navigator.serviceWorker.controller){
        navigator.serviceWorker.controller.postMessage({type:"STUPENDO_CLEAR_CACHE"});
      }
    },true);
  }

  window.addEventListener("beforeinstallprompt",function(e){
    e.preventDefault();
    deferredPrompt=e;
    ensureButton();
    showButton();
  });
  window.addEventListener("appinstalled",function(){
    installed=true;
    var btn=document.getElementById("stupendo-install-app");
    if(btn)btn.hidden=true;
    document.documentElement.classList.add("stupendo-standalone");
  });

  addMeta();
  style();
  ensureButton();
  registerSw();
  clearOnLogout();
})();
