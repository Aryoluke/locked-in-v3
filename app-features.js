(function(){
  'use strict';
  var app=window.app||window.LockedIn;
  if(!app){return;}
  function value(item){
    if(item===null||item===undefined){return '';}
    return String(item);
  }
  function data(){return app.state||{};}
  function main(){return document.getElementById('app');}
  function make(tag,text,className){
    var item=document.createElement(tag);
    if(className){item.setAttribute('class',className);}
    if(text!==undefined&&text!==null){item.textContent=value(text);}
    return item;
  }
  function button(label,action,className){
    var item=make('button',label,className||'btn');
    item.setAttribute('type','button');
    item.setAttribute('data-feature-action',action);
    return item;
  }
  function exams(){
    var state=data();
    if(!state.exams||typeof state.exams.forEach!=='function'){state.exams=new Array();}
    return state.exams;
  }
  function save(){if(typeof app.save==='function'){app.save();}}
  function notify(text){if(typeof app.toast==='function'){app.toast(text);}}
  function daysUntil(date){
    var target=new Date(value(date)+'T23:59:59');
    if(isNaN(target.getTime())){return null;}
    return Math.ceil((target.getTime()-Date.now())/86400000);
  }
  function examLabel(days){
    if(days===null){return 'Date to be confirmed';}
    if(days<0){return 'Past';}
    if(days===0){return 'Today';}
    if(days===1){return 'Tomorrow';}
    return value(days)+' days';
  }
  function findRoute(route){
    var item=document.body;
    var found=null;
    while(item){
      if(item.hasAttribute&&item.hasAttribute('data-route')&&item.getAttribute('data-route')===route){found=item;}
      item=item.firstChild;
      if(found){return found;}
    }
    return null;
  }
  function walk(item,visit){
    var child;
    if(!item){return;}
    visit(item);
    child=item.firstChild;
    while(child){walk(child,visit);child=child.nextSibling;}
  }
  function active(route){
    walk(document.body,function(item){
      if(item.hasAttribute&&item.hasAttribute('data-route')){
        item.setAttribute('class',item.getAttribute('data-route')===route?'active':'');
      }
    });
  }
  function addNav(route,label){
    if(findRoute(route)){return;}
    var nav=document.getElementsByClassName('sidebar').item(0);
    if(!nav){return;}
    var item=make('button',label,'navFeature');
    item.setAttribute('type','button');
    item.setAttribute('data-route',route);
    nav.appendChild(item);
  }
  function examRow(item){
    var row=make('article',undefined,'examRow');
    var detail=make('div');
    detail.appendChild(make('strong',item.subject||'Untitled subject'));
    detail.appendChild(make('small',value(item.date)+' | '+examLabel(daysUntil(item.date)),'muted'));
    detail.appendChild(make('p',item.notes||'No notes','muted'));
    var actions=make('div',undefined,'rowActions');
    var edit=button('Edit','editExam','btn');
    edit.setAttribute('data-exam-id',value(item.id));
    var remove=button('Remove','removeExam','btn');
    remove.setAttribute('data-exam-id',value(item.id));
    actions.appendChild(edit);
    actions.appendChild(remove);
    row.appendChild(detail);
    row.appendChild(actions);
    return row;
  }
  function renderTimetable(){
    var root=main();
    if(!root){return;}
    root.replaceChildren();
    var hero=make('section',undefined,'hero');
    hero.appendChild(make('div','CALENDAR CONTROL','eyebrow'));
    hero.appendChild(make('h1','Exam timetable'));
    hero.appendChild(make('p','Keep every subject, date and note in one persisted view.','muted'));
    root.appendChild(hero);
    var formCard=make('section',undefined,'card');
    formCard.appendChild(make('h2','Add or edit an exam'));
    var form=document.createElement('form');
    form.setAttribute('id','examForm');
    form.setAttribute('class','formGrid');
    var subject=document.createElement('input');
    subject.setAttribute('name','subject');
    subject.setAttribute('type','text');
    subject.setAttribute('placeholder','Subject');
    subject.setAttribute('required','required');
    var date=document.createElement('input');
    date.setAttribute('name','date');
    date.setAttribute('type','date');
    date.setAttribute('required','required');
    var notes=document.createElement('textarea');
    notes.setAttribute('name','notes');
    notes.setAttribute('rows','3');
    notes.setAttribute('placeholder','Notes');
    var hidden=document.createElement('input');
    hidden.setAttribute('name','examId');
    hidden.setAttribute('type','hidden');
    form.appendChild(subject);
    form.appendChild(date);
    form.appendChild(notes);
    form.appendChild(hidden);
    form.appendChild(button('Save exam','saveExam','btn primary wide'));
    formCard.appendChild(form);
    root.appendChild(formCard);
    var listCard=make('section',undefined,'card');
    listCard.appendChild(make('h2','Upcoming exams'));
    var list=make('div',undefined,'examList');
    var items=exams().slice().sort(function(first,second){return value(first.date).localeCompare(value(second.date));});
    if(!items.length){list.appendChild(make('p','Add your first exam to see the countdown.','empty'));}
    items.forEach(function(item){list.appendChild(examRow(item));});
    listCard.appendChild(list);
    root.appendChild(listCard);
    active('timetable');
  }
  function saveExam(form){
    var formData=new FormData(form);
    var subject=value(formData.get('subject')).trim();
    var date=value(formData.get('date')).trim();
    if(!subject||!date){notify('Subject and date are required');return;}
    var id=value(formData.get('examId')).trim()||'exam'+Date.now();
    var item={id:id,subject:subject,date:date,notes:value(formData.get('notes')).trim()};
    var found=false;
    exams().forEach(function(existing){
      if(value(existing.id)===id){Object.assign(existing,item);found=true;}
    });
    if(!found){exams().push(item);}
    save();
    renderTimetable();
    notify('Exam saved');
  }
  function editExam(id){
    var form=document.getElementById('examForm');
    if(!form){return;}
    exams().forEach(function(item){
      if(value(item.id)===value(id)){
        form.elements.examId.value=value(item.id);
        form.elements.subject.value=value(item.subject);
        form.elements.date.value=value(item.date);
        form.elements.notes.value=value(item.notes);
        form.elements.subject.focus();
      }
    });
  }
  function removeExam(id){
    var state=data();
    state.exams=exams().filter(function(item){return value(item.id)!==value(id);});
    save();
    renderTimetable();
    notify('Exam removed');
  }
  function stats(){
    var root=main();
    var state=data();
    if(!root){return;}
    root.replaceChildren();
    var hero=make('section',undefined,'hero');
    hero.appendChild(make('div','CONTROL ROOM','eyebrow'));
    hero.appendChild(make('h1','Stats hub'));
    hero.appendChild(make('p','A clear read on your saved activity, progress and upcoming commitments.','muted'));
    root.appendChild(hero);
    var grid=make('section',undefined,'metricGrid');
    grid.appendChild(metric('Level',value(state.level||1),'current level'));
    grid.appendChild(metric('XP',value(state.xp||0),'total earned'));
    grid.appendChild(metric('Streak',value(state.streak||0),'days in motion'));
    grid.appendChild(metric('Exams',value(exams().length),'saved timetable items'));
    var history=state.history||{};
    grid.appendChild(metric('Stored logs',value((history.logs||new Array()).length),'local activity records'));
    root.appendChild(grid);
    var summary=make('section',undefined,'card');
    summary.appendChild(make('h2','Saved activity'));
    summary.appendChild(make('p','Your data stays on this device. Use the dashboard actions to add activity, then return here for the latest totals.','muted'));
    root.appendChild(summary);
    active('stats');
  }
  function metric(label,number,note){
    var item=make('article',undefined,'metric');
    item.appendChild(make('span',label,'muted'));
    item.appendChild(make('strong',number));
    item.appendChild(make('small',note,'muted'));
    return item;
  }
  function brief(){
    var root=main();
    var state=data();
    if(!root||state.route!=='dashboard'){return;}
    var section=make('section',undefined,'card dailyBrief');
    section.setAttribute('id','dailyAiBrief');
    section.appendChild(make('h2','Dashboard Daily AI Brief'));
    var date=new Date().toISOString().slice(0,10);
    var name=value(state.name||'Operator');
    var streak=value(state.streak||0);
    section.appendChild(make('p','Hello, '+name+'. Today is '+date+'. Your streak is '+streak+' days.','briefGreeting'));
    section.appendChild(make('p','Instant offline brief: choose one useful action, keep it small and let the next win follow.','muted'));
    if(!app.jarvisSeen){
      app.jarvisSeen=true;
      section.appendChild(make('h3','Jarvis protocol engaged.'));
    }
    root.appendChild(section);
  }
  function coach(){
    var root=main();
    var state=data();
    if(!root||state.route!=='dashboard'){return;}
    var section=make('section',undefined,'card coach');
    section.setAttribute('id','aiCoach');
    section.appendChild(make('h2','AI Coach'));
    section.appendChild(make('p','Rule based coaching from your saved progress, available instantly offline.','muted'));
    var grid=make('div',undefined,'coachGrid');
    grid.appendChild(make('article',undefined,'coachCard'));
    var first=grid.lastChild;
    first.appendChild(make('h3','Streak check'));
    first.appendChild(make('p',Number(state.streak)||0>0?'Protect the chain with one focused action today.':'Start with one small action and make it repeatable.','muted'));
    var second=make('article',undefined,'coachCard');
    second.appendChild(make('h3','Water check'));
    second.appendChild(make('p','Log one glass of water before your next task.','muted'));
    grid.appendChild(second);
    var third=make('article',undefined,'coachCard');
    third.appendChild(make('h3','Next move'));
    third.appendChild(make('p','Your next useful move is more important than a perfect plan.','muted'));
    grid.appendChild(third);
    section.appendChild(grid);
    root.appendChild(section);
  }
  function dashboardFeatures(){brief();coach();}
  function show(route){
    if(route==='timetable'){renderTimetable();return;}
    if(route==='stats'){stats();return;}
    if(typeof app.render==='function'){app.render();}
  }
  function delegate(event){
    var item=event.target;
    while(item&&item!==document.body){
      if(item.hasAttribute&&item.hasAttribute('data-route')){
        var route=item.getAttribute('data-route');
        if(route==='timetable'||route==='stats'||route==='dashboard'){
          event.preventDefault();
          data().route=route;
          save();
          show(route);
          return;
        }
      }
      if(item.hasAttribute&&item.hasAttribute('data-feature-action')){
        var action=item.getAttribute('data-feature-action');
        if(action==='editExam'){event.preventDefault();editExam(item.getAttribute('data-exam-id'));return;}
        if(action==='removeExam'){event.preventDefault();removeExam(item.getAttribute('data-exam-id'));return;}
      }
      item=item.parentNode;
    }
  }
  function submit(event){
    if(event.target&&event.target.id==='examForm'){
      event.preventDefault();
      saveExam(event.target);
    }
  }
  function install(){
    if(app.featuresReady){return;}
    app.featuresReady=true;
    addNav('timetable','Exams');
    addNav('stats','Stats');
    document.addEventListener('click',delegate,true);
    document.addEventListener('submit',submit,true);
    if(typeof app.render==='function'){
      var base=app.render;
      app.render=function(){base();dashboardFeatures();};
      app.render();
    }
    var signature=value(data().streak)+'|'+value(data().water)+'|'+value(data().name);
    window.setInterval(function(){
      if(data().route==='dashboard'&&!document.getElementById('dailyAiBrief')){
        app.render();
      }
      var next=value(data().streak)+'|'+value(data().water)+'|'+value(data().name);
      if(next!==signature&&data().route==='dashboard'){
        signature=next;
        app.render();
      }
    },700);
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install,{once:true});}
  else{install();}
}());
