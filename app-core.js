(function(){
'use strict';
var storageKey='locked-in-v3-state';
var state={name:'',goal:'',route:'dashboard',xp:0,level:1,streak:0,lastDay:'',water:0,workouts:0,meals:0,study:0,weight:'',mood:'',habit:'',history:{}};
var actions={water:null,workout:null,meal:null,study:null,weight:null,mood:null,habit:null,export:null,importState:null,reset:null};
var app=window.app||{};
function el(tag,text,className){
 var node=document.createElement(tag);
 if(className){node.setAttribute('class',className);}
 if(text!==undefined&&text!==null){node.textContent=String(text);}
 return node;
}
function clearNode(node){
 if(!node){return null;}
 while(node.firstChild){node.removeChild(node.firstChild);}
 return node;
}
function mainNode(){return document.getElementById('app');}
function today(){return new Date().toISOString().slice(0,10);}
function save(){
 try{localStorage.setItem(storageKey,JSON.stringify(state));}
 catch(error){}
 var status=document.getElementById('save-status');
 if(status){status.textContent='Saved locally';}
}
function load(){
 try{
  var saved=localStorage.getItem(storageKey);
  if(saved){
   var data=JSON.parse(saved);
   if(data.name!==undefined){state.name=data.name;}
   if(data.goal!==undefined){state.goal=data.goal;}
   if(data.route!==undefined){state.route=data.route;}
   if(data.xp!==undefined){state.xp=data.xp;}
   if(data.level!==undefined){state.level=data.level;}
   if(data.streak!==undefined){state.streak=data.streak;}
   if(data.lastDay!==undefined){state.lastDay=data.lastDay;}
   if(data.water!==undefined){state.water=data.water;}
   if(data.workouts!==undefined){state.workouts=data.workouts;}
   if(data.meals!==undefined){state.meals=data.meals;}
   if(data.study!==undefined){state.study=data.study;}
   if(data.weight!==undefined){state.weight=data.weight;}
   if(data.mood!==undefined){state.mood=data.mood;}
   if(data.habit!==undefined){state.habit=data.habit;}
   if(data.history!==undefined){state.history=data.history;}
  }
 }catch(error){}
 return state;
}
function toast(message){
 var box=document.getElementById('toast');
 if(!box){return;}
 box.textContent=message;
 box.hidden=false;
 clearTimeout(app.toastTimer);
 app.toastTimer=setTimeout(function(){box.hidden=true;},2600);
}
function awardXp(amount){
 var value=Number(amount)||0;
 state.xp=Number(state.xp)||0;
 state.xp=state.xp+value;
 state.level=Math.max(1,Math.floor(state.xp/100)+1);
 save();
 return state.xp;
}
function updateStreak(){
 var day=today();
 if(state.lastDay!==day){
  if(state.lastDay){
   var old=new Date(state.lastDay);
   var now=new Date(day);
   var gap=Math.round((now-old)/86400000);
   if(gap===1){state.streak=Number(state.streak)||0;state.streak=state.streak+1;}
   else{state.streak=1;}
  }else{state.streak=1;}
  state.lastDay=day;
 }
}
function metric(label,value,note){
 var card=el('article',undefined,'metric');
 card.appendChild(el('span',label,'muted'));
 card.appendChild(el('strong',value));
 card.appendChild(el('small',note,'muted'));
 return card;
}
function button(label,action,kind){
 var node=el('button',label,'btn '+(kind||''));
 node.setAttribute('type','button');
 node.setAttribute('data-action',action);
 return node;
}
function quickMarkup(label,action){return button(label,action,'primary');}
function heading(title,copy){
 var wrap=el('div',undefined,'panel-heading');
 wrap.appendChild(el('h2',title));
 if(copy){wrap.appendChild(el('p',copy,'muted'));}
 return wrap;
}
function title(main,eyebrow,headingText,copy){
 var hero=el('section',undefined,'hero');
 hero.appendChild(el('div',eyebrow,'eyebrow'));
 hero.appendChild(el('h1',headingText));
 hero.appendChild(el('p',copy,'muted'));
 main.appendChild(hero);
}
function dashboard(){
 var main=clearNode(mainNode());
 if(!main){return;}
 title(main,'OPERATING SYSTEM','Build a day you can repeat','Small actions, tracked locally, compound into a stronger week.');
 var metrics=el('section',undefined,'metric-grid');
 metrics.appendChild(metric('Level',state.level,'XP '+state.xp));
 metrics.appendChild(metric('Streak',state.streak+' days','Keep the chain alive'));
 metrics.appendChild(metric('Water',state.water,'glasses logged'));
 metrics.appendChild(metric('Sessions',state.workouts,'workouts logged'));
 main.appendChild(metrics);
 var actionsPanel=el('section',undefined,'card');
 actionsPanel.appendChild(heading('Quick actions','Log the useful thing now.'));
 var grid=el('div',undefined,'action-grid');
 grid.appendChild(quickMarkup('Add water','water'));
 grid.appendChild(quickMarkup('Log workout','workout'));
 grid.appendChild(quickMarkup('Log meal','meal'));
 grid.appendChild(quickMarkup('Study block','study'));
 grid.appendChild(quickMarkup('Log weight','weight'));
 grid.appendChild(quickMarkup('Mood check','mood'));
 grid.appendChild(quickMarkup('Habit done','habit'));
 actionsPanel.appendChild(grid);
 main.appendChild(actionsPanel);
 var log=el('section',undefined,'card');
 log.appendChild(heading('Today','A plain record beats a perfect plan.'));
 log.appendChild(el('p','Water '+state.water+'  Workouts '+state.workouts+'  Meals '+state.meals+'  Study '+state.study,'muted'));
 if(state.goal){log.appendChild(el('p','Current focus: '+state.goal,'muted'));}
 main.appendChild(log);
}
function routeTitle(name){
 if(name==='train'){return 'Train';}
 if(name==='nutrition'){return 'Nutrition';}
 if(name==='mind'){return 'Mind';}
 if(name==='life'){return 'Life';}
 if(name==='squad'){return 'Squad';}
 if(name==='advanced'){return 'Control room';}
 return 'Dashboard';
}
function page(name){
 var main=clearNode(mainNode());
 if(!main){return;}
 var headingText=routeTitle(name);
 title(main,'LOCKED IN',headingText,'Choose one useful move and mark it complete.');
 var card=el('section',undefined,'card');
 card.appendChild(heading('Next useful move','Focus on a small action you can finish.'));
 var list=el('div',undefined,'check-list');
 if(name==='train'){list.appendChild(quickMarkup('Log workout','workout'));}
 else if(name==='nutrition'){list.appendChild(quickMarkup('Add water','water'));list.appendChild(quickMarkup('Log meal','meal'));}
 else if(name==='mind'){list.appendChild(quickMarkup('Study block','study'));list.appendChild(quickMarkup('Mood check','mood'));}
 else if(name==='life'){list.appendChild(quickMarkup('Habit done','habit'));list.appendChild(quickMarkup('Log weight','weight'));}
 else if(name==='advanced'){list.appendChild(quickMarkup('Export backup','export'));list.appendChild(quickMarkup('Import backup','importState'));list.appendChild(quickMarkup('Reset progress','reset'));}
 else{list.appendChild(quickMarkup('Open dashboard','dashboard'));}
 card.appendChild(list);
 main.appendChild(card);
}
function setRoute(name){
 if(name==='dashboard'||name==='train'||name==='nutrition'||name==='mind'||name==='life'||name==='squad'||name==='advanced'){state.route=name;}
 else{state.route='dashboard';}
 var links=document.getElementById('sidebar');
 if(links){
  var child=links.firstChild;
  while(child){
   if(child.hasAttribute&&child.hasAttribute('data-route')){
    if(child.getAttribute('data-route')===state.route){child.setAttribute('class','active');}
    else{child.setAttribute('class','');}
   }
   child=child.nextSibling;
  }
 }
 if(state.route==='dashboard'){dashboard();}
 else{page(state.route);}
 save();
}
function showOnboarding(){
 var layer=document.getElementById('onboarding');
 if(!layer){return;}
 clearNode(layer);
 layer.hidden=false;
 layer.setAttribute('role','dialog');
 var box=el('section',undefined,'card modal-card');
 box.appendChild(el('div','WELCOME','eyebrow'));
 box.appendChild(el('h2','Make it yours'));
 box.appendChild(el('p','Your data stays on this device. Set a name and one focus.','muted'));
 var nameLabel=el('label','What should we call you?');
 var nameInput=el('input');
 nameInput.setAttribute('id','operator-name');
 nameInput.setAttribute('name','name');
 nameInput.setAttribute('placeholder','Your name');
 nameLabel.appendChild(nameInput);
 box.appendChild(nameLabel);
 var goalLabel=el('label','What matters this season?');
 var goalInput=el('input');
 goalInput.setAttribute('id','operator-goal');
 goalInput.setAttribute('name','goal');
 goalInput.setAttribute('placeholder','Strength, study, balance');
 goalLabel.appendChild(goalInput);
 box.appendChild(goalLabel);
 box.appendChild(quickMarkup('Start my system','finish-onboarding'));
 layer.appendChild(box);
}
function finishOnboarding(){
 var nameInput=document.getElementById('operator-name');
 var goalInput=document.getElementById('operator-goal');
 state.name=nameInput&&nameInput.value.trim()||'Operator';
 state.goal=goalInput&&goalInput.value.trim()||'Consistency';
 var layer=document.getElementById('onboarding');
 if(layer){layer.hidden=true;}
 updateStreak();
 save();
 toast('System online');
 setRoute('dashboard');
}
function action(name){
 updateStreak();
 if(name==='water'){state.water=Number(state.water)||0;state.water=state.water+1;awardXp(5);toast('Water logged');}
 else if(name==='workout'){state.workouts=Number(state.workouts)||0;state.workouts=state.workouts+1;awardXp(25);toast('Workout logged');}
 else if(name==='meal'){state.meals=Number(state.meals)||0;state.meals=state.meals+1;awardXp(10);toast('Meal logged');}
 else if(name==='study'){state.study=Number(state.study)||0;state.study=state.study+1;awardXp(15);toast('Study block logged');}
 else if(name==='weight'){var weight=window.prompt('Current weight');if(weight){state.weight=weight;awardXp(5);toast('Weight saved');}}
 else if(name==='mood'){var mood=window.prompt('Mood in one word');if(mood){state.mood=mood;awardXp(5);toast('Mood saved');}}
 else if(name==='habit'){var habit=window.prompt('Habit completed');if(habit){state.habit=habit;awardXp(10);toast('Habit marked');}}
 else if(name==='export'){exportState();}
 else if(name==='importState'){importState();}
 else if(name==='reset'){resetState();return;}
 else if(name==='finish-onboarding'){finishOnboarding();return;}
 else if(name==='dashboard'){setRoute('dashboard');return;}
 state.history.lastAction=name;
 save();
 if(state.route==='dashboard'){dashboard();}else{page(state.route);}
}
function exportState(){
 var text=JSON.stringify(state,null,2);
 var file=new Blob([text],{type:'application/json'});
 var link=document.createElement('a');
 link.href=URL.createObjectURL(file);
 link.download='locked-in-v3-state.json';
 link.click();
 setTimeout(function(){URL.revokeObjectURL(link.href);},1000);
 toast('Backup exported');
}
function importState(){
 var input=document.createElement('input');
 input.setAttribute('type','file');
 input.setAttribute('accept','application/json');
 input.addEventListener('change',function(){
  var file=input.files.item(0);
  if(!file){return;}
  var reader=new FileReader();
  reader.addEventListener('load',function(){
   try{
    var data=JSON.parse(reader.result);
    if(data.name!==undefined){state.name=data.name;}
    if(data.goal!==undefined){state.goal=data.goal;}
    if(data.route!==undefined){state.route=data.route;}
    if(data.xp!==undefined){state.xp=data.xp;}
    if(data.level!==undefined){state.level=data.level;}
    if(data.streak!==undefined){state.streak=data.streak;}
    if(data.water!==undefined){state.water=data.water;}
    if(data.workouts!==undefined){state.workouts=data.workouts;}
    if(data.meals!==undefined){state.meals=data.meals;}
    if(data.study!==undefined){state.study=data.study;}
    if(data.weight!==undefined){state.weight=data.weight;}
    if(data.mood!==undefined){state.mood=data.mood;}
    if(data.habit!==undefined){state.habit=data.habit;}
    save();
    render();
    toast('Backup imported');
   }catch(error){toast('Import failed');}
  });
  reader.readAsText(file);
 });
 input.click();
}
function resetState(){
 if(!window.confirm('Reset all local progress?')){return;}
 localStorage.removeItem(storageKey);
 state={name:'',goal:'',route:'dashboard',xp:0,level:1,streak:0,lastDay:'',water:0,workouts:0,meals:0,study:0,weight:'',mood:'',habit:'',history:{}};
 showOnboarding();
}
function findTarget(node){
 var current=node;
 while(current&&current!==document.body){
  if(current.hasAttribute&&current.hasAttribute('data-action')){return current;}
  if(current.hasAttribute&&current.hasAttribute('data-route')){return current;}
  current=current.parentNode;
 }
 return null;
}
function delegate(event){
 var node=findTarget(event.target);
 if(!node){return;}
 var actionName=node.getAttribute('data-action');
 var routeName=node.getAttribute('data-route');
 if(actionName){event.preventDefault();runAction(actionName);}
 else if(routeName){event.preventDefault();setRoute(routeName);}
}
function runAction(name){
 if(name==='water'){action('water');}
 else if(name==='workout'){action('workout');}
 else if(name==='meal'){action('meal');}
 else if(name==='study'){action('study');}
 else if(name==='weight'){action('weight');}
 else if(name==='mood'){action('mood');}
 else if(name==='habit'){action('habit');}
 else if(name==='export'){action('export');}
 else if(name==='importState'){action('importState');}
 else if(name==='reset'){action('reset');}
 else if(name==='finish-onboarding'){action('finish-onboarding');}
 else if(name==='dashboard'){action('dashboard');}
}
function registerAction(name,handler){
 if(name==='water'){actions.water=handler;}
 else if(name==='workout'){actions.workout=handler;}
 else if(name==='meal'){actions.meal=handler;}
 else if(name==='study'){actions.study=handler;}
 else if(name==='weight'){actions.weight=handler;}
 else if(name==='mood'){actions.mood=handler;}
 else if(name==='habit'){actions.habit=handler;}
 else if(name==='export'){actions.export=handler;}
 else if(name==='importState'){actions.importState=handler;}
 else if(name==='reset'){actions.reset=handler;}
}
function render(){
 if(!state.name){showOnboarding();return;}
 setRoute(state.route||'dashboard');
}
function start(){
 if(app.booted){return;}
 app.booted=true;
 app.state=state;
 app.start=start;
 app.render=render;
 app.registerAction=registerAction;
 app.record=action;
 app.toast=toast;
 app.awardXp=awardXp;
 app.quickMarkup=quickMarkup;
 registerAction('water',function(){action('water');});
 registerAction('workout',function(){action('workout');});
 registerAction('meal',function(){action('meal');});
 registerAction('study',function(){action('study');});
 registerAction('weight',function(){action('weight');});
 registerAction('mood',function(){action('mood');});
 registerAction('habit',function(){action('habit');});
 registerAction('export',exportState);
 registerAction('importState',importState);
 registerAction('reset',resetState);
 load();
 document.addEventListener('click',delegate);
 render();
}
app.start=start;
app.render=render;
app.registerAction=registerAction;
app.record=action;
app.toast=toast;
app.awardXp=awardXp;
app.quickMarkup=quickMarkup;
window.app=app;
window.LockedIn=app;
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',start);}else{start();}
}());
