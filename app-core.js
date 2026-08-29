(function(){
  "use strict";
  var storageKey = "locked-in-v3-state";
  var views = new Map();
  var actions = new Map();
  var store = makeState();
  var toastTimer = null;
  var booted = false;

  function makeState(){
    return {profile:{name:"Operator",age:"",dob:"",height:"",weight:"",bodyType:"",diet:"",equipment:"",goals:""},onboardingComplete:false,route:"dashboard",xp:0,streak:0,water:0,logs:new Array(),meals:new Array(),exercises:new Array(),study:new Array(),habits:new Array(),quests:new Array(),creatine:new Array(),feed:new Array(),vault:new Array(),drills:new Array(),exams:new Array(),settings:{haptics:true}};
  }
  function today(){ return new Date().toISOString().slice(0,10); }
  function numberValue(value,fallback){ var result=Number(value); return Number.isFinite(result) ? result : fallback; }
  function copyList(value){ return Array.isArray(value) ? value.slice() : new Array(); }
  function normalize(value){
    var source=value&&typeof value==="object" ? value : new Object();
    var result=makeState();
    result.profile=Object.assign(result.profile,source.profile||new Object());
    result.onboardingComplete=Boolean(source.onboardingComplete);
    result.route=typeof source.route==="string" ? source.route : "dashboard";
    result.xp=numberValue(source.xp,0); result.streak=numberValue(source.streak,0); result.water=numberValue(source.water,0);
    "logs,meals,exercises,study,habits,quests,creatine,feed,vault,drills,exams".split(",").forEach(function(key){ result[key]=copyList(source[key]); });
    result.settings=Object.assign(result.settings,source.settings||new Object());
    return result;
  }
  function load(){ try { var raw=localStorage.getItem(storageKey); return normalize(raw ? JSON.parse(raw) : new Object()); } catch(error){ return makeState(); } }
  function save(){ try { localStorage.setItem(storageKey,JSON.stringify(store)); setSaveStatus("Saved locally"); } catch(error){ setSaveStatus("Local save unavailable"); } }
  function setSaveStatus(value){ var node=document.getElementById("save-status"); if(node){ node.textContent=value; } }
  function uniqueId(prefix){ return (prefix||"id")+"-"+Date.now()+"-"+Math.random().toString(36).slice(2,8); }
  function escapeHtml(value){ return String(value==null ? "" : value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
  function toast(message){ var node=document.getElementById("toast"); if(!node){ window.alert(message); return; } node.textContent=message; node.hidden=false; window.clearTimeout(toastTimer); toastTimer=window.setTimeout(function(){ node.hidden=true; },2400); }
  function haptic(kind){ if(!store.settings||store.settings.haptics||kind==="force"){ if(navigator.vibrate){ navigator.vibrate(kind==="success" ? 18 : 12); } } }
  function awardXp(amount,reason){ var points=numberValue(amount,0); store.xp=Math.max(0,store.xp+points); if(points>0){ addFeed("+"+points+" XP",reason||"Progress recorded"); } }
  function addFeed(label,detail){ store.feed.unshift({id:uniqueId("feed"),label:label,detail:detail||"",date:today()}); store.feed=store.feed.slice(0,30); }
  function record(type,details){
    var entry=Object.assign({id:uniqueId(type),type:type,date:today(),timestamp:new Date().toISOString()},details||new Object());
    store.logs.unshift(entry); store.logs=store.logs.slice(0,200); awardXp(10,entry.label||type+" logged"); completeQuest(type); save(); render(); return entry;
  }
  function completeQuest(type){ var quest=store.quests.find(function(item){ return item.type===type&&!item.done; }); if(quest){ quest.done=true; awardXp(15,quest.name); } }
  function metric(label,value,note){ var box=el("div","metric"); append(box,el("small","",escapeHtml(label))); append(box,el("strong","",escapeHtml(value))); append(box,el("small","",escapeHtml(note||""))); return box; }
  function card(title,body){ var box=el("section","card"); append(box,el("h2","",title)); append(box,body); return box; }
  function hero(kicker,title,copy){ var box=el("div","hero"); var inner=el("div"); append(inner,el("div","eyebrow",kicker)); append(inner,el("h1","",title)); append(inner,el("p","muted",copy)); append(box,inner); return box; }
  function el(tag,className,text){ var node=document.createElement(tag); if(className){ node.className=className; } if(text!=null){ node.textContent=text; } return node; }
  function append(parent){ var args=Array.prototype.slice.call(arguments,1); args.forEach(function(node){ if(node){ parent.appendChild(node); } }); return parent; }
  function button(label,action,className){ var node=el("button",className||"btn",label); node.setAttribute("type","button"); node.setAttribute("data-action",action); return node; }
  function link(label,route,className){ var node=el("button",className||"btn",label); node.setAttribute("type","button"); node.setAttribute("data-route",route); return node; }
  function feedMarkup(items){ var box=el("div","activity-list"); if(!items.length){ append(box,el("p","empty","Nothing logged yet. Choose one small action.")); return box; } items.slice(0,8).forEach(function(item){ var row=el("div","activity-row"); append(row,el("strong","",item.label||item.name||item.type||"Entry"),el("small","",item.detail||item.date||"")); append(box,row); }); return box; }
  function habitMarkup(){ var box=el("div","check-list"); var names="Train or walk,2L water,Read 20 minutes,Morning skincare,No phone in bed".split(","); names.forEach(function(name){ var item=store.habits.find(function(value){ return value.name===name; }); var done=item&&item.done; var row=button((done?"Done ":"Open ")+name,"habit","check-row"+(done?" done":"")); row.setAttribute("data-habit",name); append(box,row); }); return box; }
  function quickMarkup(){ var box=el("div","action-grid"); append(box,button("Log water","water","btn primary"),button("Log workout","workout","btn"),button("Log meal","meal","btn"),button("Log study","study","btn"),button("Log weight","weight","btn"),button("Log mood","mood","btn")); return box; }
  function dashboard(){
    var name=store.profile.name||"Operator"; var root=el("div"); append(root,hero("TODAY'S OPERATING SYSTEM","Stay locked in, "+name+".","Small actions compound. Every form writes real data to this device."));
    var metrics=el("div","metrics"); append(metrics,metric("XP",store.xp,"local progress"),metric("Water",store.water+" / 8","glasses"),metric("Logs",store.logs.length,"total")); append(root,metrics);
    var streak=el("div","streak-grid"); append(streak,streakCard("workout","Workout","💪"),streakCard("study","Study","📚"),streakCard("water","Water","💧")); append(root,card("Streak engine",streak),card("Quick actions",quickMarkup()),card("Today stack",feedMarkup(store.feed)),card("Checklist",habitMarkup()));
    var chart=el("canvas","chart"); chart.setAttribute("data-chart","workout"); chart.setAttribute("aria-label","Recent activity chart"); append(root,card("Recent rhythm",chart)); return root;
  }
  function streakCard(kind,label,emoji){ var stats=streakStats(kind); var box=el("article","streak-card"); append(box,el("div","streak-icon",emoji),el("strong","",label),el("p","",stats.current+" day current · "+stats.best+" best")); return box; }
  function streakStats(kind){ var dates={}; store.logs.forEach(function(item){ var type=String(item.type||""); var match=kind==="workout" ? type==="workout"||type==="exercise" : kind==="study" ? type==="study" : type==="water"; if(match&&item.date){ dates[item.date]=true; } }); var current=0; var cursor=new Date(); while(dates[cursor.toISOString().slice(0,10)]){ current++; cursor.setUTCDate(cursor.getUTCDate()-1); } var best=0; var run=0; Object.keys(dates).sort().forEach(function(date,index,list){ var prior=index?list.at(index-1):null; var gap=prior ? Math.round((new Date(date)-new Date(prior))/86400000) : 0; run=prior&&gap===1?run+1:1; best=Math.max(best,run); }); return {current:current,best:best}; }
  function fallback(route,title,copy){ var root=el("div"); append(root,hero(String(route).toUpperCase(),title,copy),card("Module ready",el("p","", "Use the dashboard actions or choose another module.")),link("Back to dashboard","dashboard")); return root; }
  function settingsView(){ var root=fallback("settings","Settings","Control local preferences and privacy tools."); var toggle=button("Toggle haptics","haptics","btn"); append(root,card("Preferences",toggle)); return root; }
  function render(){
    var root=document.getElementById("app"); if(!root){ return; } var requested=(window.location.hash||"#dashboard").slice(1)||"dashboard"; var view=views.get(requested)||views.get("dashboard"); store.route=views.has(requested)?requested:"dashboard"; root.replaceChildren(view(store)); updateNav(); showOnboarding(); drawCharts();
  }
  function updateNav(){ var nodes=document.querySelectorAll("[data-route]"); nodes.forEach(function(node){ node.classList.toggle("active",node.getAttribute("data-route")===store.route); }); }
  function showOnboarding(){ var node=document.getElementById("onboarding"); if(node){ node.hidden=Boolean(store.onboardingComplete); if(!store.onboardingComplete){ buildOnboarding(node); } } }
  function buildOnboarding(node){ if(node.childElementCount){ return; } var box=el("section","onboarding-card"); append(box,el("div","eyebrow","START HERE"),el("h2","","Build your operating system"),el("p","muted","Your data stays on this device. Set defaults, then use every page as a working log.")); var form=el("form","form-grid"); form.id="onboarding-form"; ["name,age,dob,height,weight,bodyType,diet,equipment,goals"].join(""); "name,age,dob,height,weight,bodyType,diet,equipment,goals".split(",").forEach(function(name){ var label=el("label","",name); var input=el("input"); input.name=name; input.type=name==="dob"?"date":name==="age"||name==="height"||name==="weight"?"number":"text"; label.appendChild(input); form.appendChild(label); }); append(form,button("Complete setup","onboarding","btn primary"),button("Skip for now","skip","btn")); form.addEventListener("submit",function(event){ event.preventDefault(); submitOnboarding(form); }); box.appendChild(form); node.appendChild(box); }
  function submitOnboarding(form){ var data=new FormData(form); store.profile.name=String(data.get("name")||"Operator").trim()||"Operator"; "age,dob,height,weight,bodyType,diet,equipment,goals".split(",").forEach(function(name){ store.profile[name]=String(data.get(name)||"").trim(); }); store.onboardingComplete=true; save(); render(); toast("Setup complete"); }
  function logWater(){ store.water=Math.min(8,store.water+1); record("water",{label:"Water glass",detail:store.water+" / 8 glasses",value:store.water}); toast("Hydration logged"); }
  function logQuick(type,label,detail){ record(type,{label:label,detail:detail||"Quick log"}); toast(label+" logged"); }
  function logWeight(){ var value=window.prompt("Weight in kg",store.profile.weight||""); if(value===null){ return; } store.profile.weight=value; record("weight",{label:"Weight",detail:value+" kg",value:numberValue(value,0)}); toast("Weight logged"); }
  function logMood(){ var value=window.prompt("Mood from 1 to 10","7"); if(value===null){ return; } record("mood",{label:"Mood",detail:value+" / 10",value:numberValue(value,0)}); }
  function toggleHabit(node){ var name=node.getAttribute("data-habit"); var item=store.habits.find(function(value){ return value.name===name; }); if(!item){ item={name:name,done:false}; store.habits.push(item); } item.done=!item.done; record("habit",{label:name,detail:item.done?"complete today":"unchecked"}); }
  function exportState(){ var blob=new Blob([JSON.stringify(store,null,2)],{type:"application/json"}); var linkNode=document.createElement("a"); linkNode.href=URL.createObjectURL(blob); linkNode.download="locked-in-backup-"+today()+".json"; linkNode.click(); URL.revokeObjectURL(linkNode.href); toast("Export ready"); }
  function importState(){ var input=document.getElementById("import-file"); if(input){ input.click(); } }
  function resetState(){ if(!window.confirm("Reset all local progress? This cannot be undone.")){ return; } localStorage.removeItem(storageKey); store=makeState(); save(); render(); toast("Local progress reset"); }
  function addCreatine(){ store.creatine.unshift({id:uniqueId("creatine"),date:today()}); record("creatine",{label:"Creatine",detail:"Dose logged"}); }
  function findNode(target,attribute){ var node=target; while(node&&node!==document){ if(node.hasAttribute&&node.hasAttribute(attribute)){ return node; } node=node.parentNode; } return null; }
  function handleAction(node){ var handler=actions.get(node.getAttribute("data-action")); if(handler){ handler(node); } }
  function bindEvents(){
    document.addEventListener("click",function(event){ var routeNode=findNode(event.target,"data-route"); if(routeNode){ event.preventDefault(); window.location.hash=routeNode.getAttribute("data-route"); return; } var actionNode=findNode(event.target,"data-action"); if(actionNode){ event.preventDefault(); handleAction(actionNode); } });
    window.addEventListener("hashchange",render);
  }
  function valuesFor(kind){ var values=new Array(); store.logs.slice().reverse().forEach(function(item){ if(kind==="workout"&&(item.type==="workout"||item.type==="exercise")){ values.push({value:1,label:item.date}); } else if(kind==="water"&&item.type==="water"){ values.push({value:numberValue(item.value,1),label:item.date}); } else if(kind==="study"&&item.type==="study"){ values.push({value:1,label:item.date}); } }); return values.slice(-12); }
  function drawChart(canvas,kind){ var ctx=canvas.getContext("2d"); if(!ctx){ return; } var values=valuesFor(kind); var width=canvas.clientWidth||320; var height=160; var maximum=values.reduce(function(high,item){ return Math.max(high,item.value); },1); canvas.width=width*2; canvas.height=height*2; ctx.scale(2,2); ctx.strokeStyle="#9cff57"; ctx.lineWidth=3; ctx.beginPath(); values.forEach(function(item,index){ var x=28+(width-50)*index/Math.max(1,values.length-1); var y=height-28-(height-55)*item.value/maximum; if(index===0){ ctx.moveTo(x,y); } else { ctx.lineTo(x,y); } }); ctx.stroke(); }
  function drawCharts(){ document.querySelectorAll("canvas").forEach(function(canvas){ drawChart(canvas,canvas.getAttribute("data-chart")); }); }
  function registerView(name,view){ if(typeof view==="function"){ views.set(name,view); } }
  function registerAction(name,handler){ if(typeof handler==="function"){ actions.set(name,handler); } }
  registerView("dashboard",dashboard); registerView("stats",function(){ return fallback("stats","Stats hub","A clear read on volume, records, and consistency."); }); registerView("timetable",function(){ return fallback("timetable","Exam timetable","Your persisted timetable will live here."); }); registerView("settings",settingsView); registerView("train",function(){ return fallback("train","Training","Log a focused session and build your streak."); }); registerView("nutrition",function(){ return fallback("nutrition","Nutrition","Keep meals, hydration, and supplements visible."); }); registerView("mind",function(){ return fallback("mind","Mind","Make space for focus and reflection."); }); registerView("life",function(){ return fallback("life","Life","Small systems for a calmer week."); }); registerView("squad",function(){ return fallback("squad","Squad","Keep your people and promises close."); });
  registerAction("water",logWater); registerAction("workout",function(){ logQuick("workout","Workout","Quick session logged"); }); registerAction("meal",function(){ logQuick("meal","Meal","Quick meal logged"); }); registerAction("study",function(){ logQuick("study","Study","Focus block logged"); }); registerAction("weight",logWeight); registerAction("mood",logMood); registerAction("habit",toggleHabit); registerAction("export",exportState); registerAction("import",importState); registerAction("reset",resetState); registerAction("haptics",function(){ store.settings.haptics=!store.settings.haptics; save(); toast(store.settings.haptics?"Haptics on":"Haptics off"); }); registerAction("onboarding",function(){ }); registerAction("skip",function(){ store.onboardingComplete=true; save(); render(); });
  var api={state:function(){return store;},escape:escapeHtml,registerView:registerView,registerAction:registerAction,record:record,toast:toast,render:render,start:start,awardXp:awardXp,addCreatine:addCreatine,started:false};
  window.app=api; window.LockedIn=api; window.esc=escapeHtml; window.num=numberValue; window.toast=toast; window.awardXp=awardXp;
  function start(){ if(booted){ return; } booted=true; api.started=true; store=load(); if(!store.quests.length){ store.quests=[{id:"questWorkout",name:"Log a workout",type:"workout",done:false},{id:"questMeal",name:"Log a meal",type:"meal",done:false},{id:"questStudy",name:"Complete a focus block",type:"study",done:false}]; } var input=document.getElementById("import-file"); if(!input){ input=document.createElement("input"); input.type="file"; input.id="import-file"; input.accept="application/json,.json"; input.hidden=true; input.addEventListener("change",function(){ var file=input.files&&input.files.item(0); if(!file){ return; } var reader=new FileReader(); reader.onload=function(){ try{ store=normalize(JSON.parse(reader.result)); save(); render(); toast("Backup imported"); }catch(error){ toast("Import failed: invalid backup"); } input.value=""; }; reader.readAsText(file); }); document.body.appendChild(input); } bindEvents(); save(); render(); }
  if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded",start,{once:true}); } else { start(); }
}());
