(function(){
  'use strict';
  var storageKey='lockedInState';
  var viewMap=new Map();
  var actionMap=new Map();
  var store=makeState();
  var toastTimer=null;
  window.LIViews=window.LIViews||{};

  function makeState(){return {profile:{name:'Operator',age:'',dob:'',height:'',weight:'',bodyType:'',diet:'',equipment:'',goals:''},onboardingComplete:false,route:'dashboard',xp:0,streak:0,water:0,logs:[],meals:[],exercises:[],study:[],habits:[],quests:[],creatine:[],feed:[],vault:[],drills:[],exams:[],settings:{haptics:true}};}
  function today(){return new Date().toISOString().slice(0,10);}
  function numberValue(value,fallback){var n=Number(value);return Number.isFinite(n)?n:fallback;}
  function copyList(value){return Array.isArray(value)?value.slice():[];}
  function normalize(value){
    var source=value&&typeof value==='object'?value:{};
    var result=makeState();
    result.profile=Object.assign(result.profile,source.profile||{});
    result.onboardingComplete=Boolean(source.onboardingComplete);
    result.route=typeof source.route==='string'?source.route:'dashboard';
    result.xp=numberValue(source.xp,0); result.streak=numberValue(source.streak,0); result.water=numberValue(source.water,0);
    ['logs','meals','exercises','study','habits','quests','creatine','feed','vault','drills','exams'].forEach(function(k){result[k]=copyList(source[k]);});
    result.settings=Object.assign(result.settings,source.settings||{});
    return result;
  }
  function loadState(){try{var raw=localStorage.getItem(storageKey);return normalize(raw?JSON.parse(raw):{});}catch(e){return makeState();}}
  function saveState(){try{localStorage.setItem(storageKey,JSON.stringify(store));setSaveStatus('Saved locally');}catch(e){setSaveStatus('Local save unavailable');}}
  function setSaveStatus(text){var node=document.getElementById('save-status');if(node)node.textContent=text;}
  function uniqueId(prefix){return (prefix||'id')+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);}
  function escapeHtml(value){return String(value==null?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function toast(message){var node=document.getElementById('toast');if(!node){window.alert(message);return;}node.textContent=message;node.hidden=false;window.clearTimeout(toastTimer);toastTimer=window.setTimeout(function(){node.hidden=true;},2400);}
  function haptic(kind){if(!store.settings||store.settings.haptics||kind==='force'){if(navigator.vibrate){navigator.vibrate(kind==='success'?[18,28,18]:12);}}}
  function awardXp(amount,reason){var points=numberValue(amount,0);store.xp=Math.max(0,store.xp+points);if(points>0)addFeed('+'+points+' XP',reason||'Progress recorded');}
  function addFeed(label,detail){store.feed.unshift({id:uniqueId('feed'),label:label,detail:detail||'',date:today()});store.feed=store.feed.slice(0,30);}
  function recordEvent(type,details){var entry=Object.assign({id:uniqueId(type),type:type,date:today(),timestamp:new Date().toISOString()},details||{});store.logs.unshift(entry);store.logs=store.logs.slice(0,200);return entry;}
  function record(type,details){var entry=recordEvent(type,details);awardXp(10,entry.label||type+' logged');haptic('success');completeQuest(type);saveState();render();return entry;}
  function completeQuest(type){var quest=store.quests.find(function(item){return item.type===type&&!item.done;});if(quest){quest.done=true;awardXp(15,quest.name);}}
  function metric(label,value,note){return '<div class="metric"><small>'+escapeHtml(label)+'</small><strong>'+escapeHtml(value)+'</strong><small>'+escapeHtml(note||'')+'</small></div>';}
  function card(title,body){return '<section class="card"><h2>'+escapeHtml(title)+'</h2>'+body+'</section>';}
  function hero(kicker,title,text){return '<div class="hero"><div><div class="eyebrow">'+escapeHtml(kicker)+'</div><h1>'+escapeHtml(title)+'</h1><p class="muted">'+escapeHtml(text)+'</p></div></div>';}

  function datesFor(kind){
    var found={};
    store.logs.forEach(function(item){
      var type=String(item.type||'');
      var matches=kind==='workout'?(type==='workout'||type==='exercise'):kind==='study'?type==='study':kind==='water'?type==='water':false;
      if(matches&&item.date)found[item.date]=true;
    });
    return Object.keys(found).sort();
  }
  function streakStats(kind){
    var dates=datesFor(kind), set={};dates.forEach(function(d){set[d]=true;});
    var current=0, cursor=new Date();
    while(set[cursor.toISOString().slice(0,10)]){current++;cursor.setUTCDate(cursor.getUTCDate()-1);}
    var best=0,run=0,previous=null;
    dates.forEach(function(d){var date=new Date(d+'T00:00:00Z');if(previous){var gap=Math.round((date-previous)/86400000);run=gap===1?run+1:1;}else run=1;best=Math.max(best,run);previous=date;});
    return {current:current,best:best,dates:set};
  }
  function dayStrip(){
    var kinds=['workout','study','water'];var labels=['W','S','H'];var html='<div class="streak-strip" aria-label="Last seven days">';
    for(var i=6;i>=0;i--){var date=new Date();date.setUTCDate(date.getUTCDate()-i);var key=date.toISOString().slice(0,10);var active=kinds.some(function(kind){return streakStats(kind).dates[key];});html+='<div class="strip-day '+(active?'is-active':'')+'"><span>'+escapeHtml(labels.map(function(label){return label;}).join(''))+'</span><i>'+date.getUTCDate()+'</i><b>'+(active?'🔥':'·')+'</b></div>';}
    return html+'</div><div class="strip-legend"><span>W workout</span><span>S study</span><span>H hydration</span></div>';
  }
  function streakCard(kind,label,emoji){var stats=streakStats(kind);return '<article class="streak-card"><div class="streak-icon">'+emoji+'</div><div><strong>'+escapeHtml(label)+'</strong><p><b>'+stats.current+'</b> day current · <b>'+stats.best+'</b> best</p></div></article>';}

  function listMarkup(items){if(!items.length)return '<p class="empty">Nothing logged yet. Choose one small action.</p>';return '<div class="activity-list">'+items.slice(0,8).map(function(item){return '<div class="activity-row"><strong>'+escapeHtml(item.label||item.name||item.type||'Entry')+'</strong><small>'+escapeHtml(item.detail||item.date||'')+'</small></div>';}).join('')+'</div>';}
  function quickMarkup(){return '<div class="action-grid"><button class="btn primary" data-action="water">Log water</button><button class="btn" data-action="workout">Log workout</button><button class="btn" data-action="meal">Log meal</button><button class="btn" data-action="study">Log study</button></div>';}
  function dashboard(){
    var name=store.profile.name||'Operator';var feed=store.feed.length?store.feed:store.logs;
    return hero("TODAY'S OPERATING SYSTEM","Stay locked in, "+name+'.',"Small actions compound. Every form writes real data to this device.")+
      '<div class="metrics">'+metric('XP',store.xp,'local progress')+metric('Water',store.water+'/8','glasses')+metric('Logs',store.logs.length,'total')+'</div>'+card('Streak engine','<div class="streak-grid">'+streakCard('workout','Workout','🔥')+streakCard('study','Study','📚')+streakCard('water','Water','💧')+'</div>'+dayStrip())+card('Quick actions',quickMarkup())+card('Today stack',listMarkup(feed))+card('Checklist',habitMarkup());
  }
  function habitMarkup(){var names=['Train or walk','2L water','Read 20 minutes','Morning skincare','No phone in bed'];return '<div class="check-list">'+names.map(function(name){var item=store.habits.find(function(x){return x.name===name;});var done=item&&item.done;return '<button class="check-row '+(done?'done':'')+' btn" data-action="habit" data-habit="'+escapeHtml(name)+'"><strong>'+(done?'Done':'Open')+'</strong><span>'+escapeHtml(name)+'</span></button>';}).join('')+'</div>';}

  function fallback(route,title,text){return hero(String(route).toUpperCase(),title,text)+card('Module ready','<p>Use the dashboard actions or choose another module.</p><button class="btn" data-route="dashboard">Back to dashboard</button>');}

  function statsView(){return fallback('stats','Stats hub','A clear read on volume, records, and recent consistency.');}
  function timetableView(){return fallback('timetable','Exam timetable','Your persisted timetable will live here.');}
  function settingsView(){return fallback('settings','Settings','Control local preferences and privacy tools.');}

  function registerView(name,view){if(typeof view!=='function')return;viewMap.set(name,view);Object.defineProperty(window.LIViews,name,{value:view,writable:true,configurable:true,enumerable:true});}
  function registerAction(name,handler){if(typeof handler==='function')actionMap.set(name,handler);}
  function routeTo(route){window.location.hash=route||'dashboard';}
  function render(){var root=document.getElementById('app');if(!root)return;var requested=(window.location.hash||'#dashboard').slice(1)||'dashboard';var view=viewMap.get(requested)||viewMap.get('dashboard');store.route=viewMap.has(requested)?requested:'dashboard';root.innerHTML=view(store);document.querySelectorAll('[data-route]').forEach(function(node){node.classList.toggle('active',node.getAttribute('data-route')===store.route);});showOnboarding();drawCharts();}
  function showOnboarding(){var node=document.getElementById('onboarding');if(node)node.hidden=Boolean(store.onboardingComplete);}
  function logWater(){store.water=Math.min(8,store.water+1);record('water',{label:'Water glass',detail:store.water+'/8 glasses',value:store.water});toast('Hydration logged');}
  function logQuick(type,label,detail){record(type,{label:label,detail:detail});toast(label+' logged');}
  function logWeight(){var value=window.prompt('Weight in kg',store.profile.weight||'');if(value===null)return;store.profile.weight=value;record('weight',{label:'Weight',detail:value+' kg',value:numberValue(value,0)});toast('Weight logged');}
  function logMood(){var value=window.prompt('Mood from 1 to 10','7');if(value===null)return;record('mood',{label:'Mood',detail:value+'/10',value:numberValue(value,0)});}
  function toggleHabit(node){var name=node.getAttribute('data-habit');var item=store.habits.find(function(entry){return entry.name===name;});if(!item){item={name:name,done:false};store.habits.push(item);}item.done=!item.done;record('habit',{label:name,detail:item.done?'complete today':'unchecked'});}
  function exportState(){var blob=new Blob([JSON.stringify(store,null,2)],{type:'application/json'});var link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='locked-in-backup-'+today()+'.json';link.click();URL.revokeObjectURL(link.href);toast('Export ready');}
  function importState(){var input=document.getElementById('import-file');if(input)input.click();}
  function resetState(){if(!window.confirm('Reset all local progress? This cannot be undone.'))return;if(!window.confirm('Final confirmation: permanently delete this device data?'))return;try{localStorage.removeItem(storageKey);}catch(e){}store=makeState();saveState();render();toast('Local progress reset');}
  function handleAction(node){var handler=actionMap.get(node.getAttribute('data-action'));if(handler)handler(node);}
  function submitOnboarding(form){var data=new FormData(form);store.profile.name=String(data.get('name')||'Operator').trim()||'Operator';store.onboardingComplete=true;saveState();render();toast('Setup complete');}
  function bindEvents(){
    document.addEventListener('click',function(event){var routeNode=event.target.closest?event.target.closest('[data-route]'):null;if(routeNode){event.preventDefault();routeTo(routeNode.getAttribute('data-route'));return;}var actionNode=event.target.closest?event.target.closest('[data-action]'):null;if(actionNode){event.preventDefault();handleAction(actionNode);}});
    document.addEventListener('submit',function(event){if(event.target.id==='onboarding-form'){event.preventDefault();submitOnboarding(event.target);}});
    window.addEventListener('hashchange',render);
  }
  function valuesFor(kind){var values=[];store.logs.slice().reverse().forEach(function(item){if(kind==='streaks'&&item.type==='workout')values.push({value:1,label:item.date});else if(kind==='water'&&item.type==='water')values.push({value:numberValue(item.value,1),label:item.date});else if(kind==='study'&&item.type==='study')values.push({value:1,label:item.date});else if(kind==='weight'&&item.type==='weight')values.push({value:numberValue(item.value,0),label:item.date});});return values.slice(-12);}
  function drawChart(canvas,kind){var context=canvas.getContext('2d');if(!context)return;var values=valuesFor(kind);var width=canvas.clientWidth||320,height=160,max=Math.max.apply(null,values.map(function(x){return x.value;}).concat([1]));canvas.width=width*2;canvas.height=height*2;context.scale(2,2);context.strokeStyle='#8eff70';context.lineWidth=3;context.beginPath();values.forEach(function(item,index){var x=28+(width-50)*index/Math.max(1,values.length-1),y=height-28-(height-45)*item.value/max;if(index===0)context.moveTo(x,y);else context.lineTo(x,y);});context.stroke();}
  function drawCharts(){document.querySelectorAll('canvas[data-chart]').forEach(function(canvas){drawChart(canvas,canvas.getAttribute('data-chart'));});}

  registerView('dashboard',dashboard);registerView('stats',statsView);registerView('timetable',timetableView);registerView('settings',settingsView);
  registerAction('water',logWater);registerAction('workout',function(){logQuick('workout','Workout','Quick session logged');});registerAction('meal',function(){logQuick('meal','Meal','Quick meal logged');});registerAction('study',function(){record('study',{label:'Study block',detail:'Focus block logged',value:1});toast('Study logged');});registerAction('weight',logWeight);registerAction('mood',logMood);registerAction('habit',toggleHabit);registerAction('export',exportState);registerAction('import',importState);registerAction('reset',resetState);
  var api={state:function(){return store;},load:loadState,save:saveState,toast:toast,escape:escapeHtml,esc:escapeHtml,num:numberValue,record:record,render:render,registerView:registerView,registerAction:registerAction,awardXp:awardXp,route:routeTo,actions:actionMap,views:viewMap,source:window.LOCKED_DATA||{},streaks:streakStats,haptic:haptic};
  window.app=api;window.LockedIn=api;window.esc=escapeHtml;window.num=numberValue;window.save=saveState;window.toast=toast;window.awardXp=awardXp;window.state=function(){return store;};
  function start(){store=loadState();if(!store.quests.length)store.quests=[{id:'questWorkout',name:'Log a workout',type:'workout',done:false,date:today()},{id:'questMeal',name:'Log a meal',type:'meal',done:false,date:today()},{id:'questStudy',name:'Complete a focus block',type:'study',done:false,date:today()}];if(!document.getElementById('import-file')){var input=document.createElement('input');input.type='file';input.id='import-file';input.accept='application/json,.json';input.hidden=true;input.addEventListener('change',function(){var file=input.files&&input.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(){try{var imported=JSON.parse(reader.result);if(!imported||typeof imported!=='object')throw new Error('invalid');store=normalize(imported);saveState();render();toast('Backup imported');}catch(e){toast('Import failed: invalid backup');}input.value='';};reader.readAsText(file);});document.body.appendChild(input);}bindEvents();saveState();render();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
