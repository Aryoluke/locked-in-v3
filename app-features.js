(function(){
  'use strict';
  var app=window.app||window.LockedIn;
  if(!app){return;}
  function value(item){
    if(item===null||item===undefined){return '';}
    return String(item);
  }
  function state(){return app.state||{};}
  function save(){if(typeof app.save==='function'){app.save();}}
  function notify(message){if(typeof app.toast==='function'){app.toast(message);}}
  function main(){return document.getElementById('app');}
  function node(tag,content,className){
    var item=document.createElement(tag);
    if(className){item.setAttribute('class',className);}
    if(content!==undefined&&content!==null){item.textContent=value(content);}
    return item;
  }
  function button(label,action,className){
    var item=node('button',label,className||'btn');
    item.setAttribute('type','button');
    if(action){item.setAttribute('data-feature-action',action);}
    return item;
  }
  function walk(item,visit){
    var child;
    if(!item){return;}
    visit(item);
    child=item.firstChild;
    while(child){walk(child,visit);child=child.nextSibling;}
  }
  function findRoute(route){
    var found=null;
    walk(document.body,function(item){
      if(found||!item.hasAttribute||!item.hasAttribute('data-route')){return;}
      if(item.getAttribute('data-route')===route){found=item;}
    });
    return found;
  }
  function setActive(route){
    walk(document.body,function(item){
      if(item.hasAttribute&&item.hasAttribute('data-route')){
        if(item.getAttribute('data-route')===route){item.setAttribute('class','active');}
        else{item.setAttribute('class','');}
      }
    });
  }
  function exams(){
    var current=state();
    if(!Array.isArray(current.exams)){current.exams=[];}
    return current.exams;
  }
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
  function examRow(item){
    var days=daysUntil(item.date);
    var row=node('article',undefined,'examRow '+(days!==null&&days<0?'examPast':'examUpcoming'));
    var detail=node('div');
    detail.appendChild(node('strong',item.subject||'Untitled subject'));
    detail.appendChild(node('small',value(item.date)+' | '+examLabel(days),'muted'));
    detail.appendChild(node('p',item.notes||'No notes','muted'));
    var actions=node('div',undefined,'rowActions');
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
    var hero=node('section',undefined,'hero');
    hero.appendChild(node('div','CALENDAR CONTROL','eyebrow'));
    hero.appendChild(node('h1','Exam timetable'));
    hero.appendChild(node('p','Keep every subject, date and note in one persisted view.','muted'));
    root.appendChild(hero);
    var formCard=node('section',undefined,'card');
    formCard.appendChild(node('h2','Add or edit an exam'));
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
    var listCard=node('section',undefined,'card');
    listCard.appendChild(node('h2','Upcoming exams'));
    var list=node('div',undefined,'examList');
    var items=exams().slice().sort(function(first,second){return value(first.date).localeCompare(value(second.date));});
    if(!items.length){list.appendChild(node('p','Add your first exam to see the countdown.','empty'));}
    items.forEach(function(item){list.appendChild(examRow(item));});
    listCard.appendChild(list);
    root.appendChild(listCard);
    setActive('timetable');
  }
  function renderStats(){
    var root=main();
    var current=state();
    if(!root){return;}
    root.replaceChildren();
    var hero=node('section',undefined,'hero');
    hero.appendChild(node('div','CONTROL ROOM','eyebrow'));
    hero.appendChild(node('h1','Stats hub'));
    hero.appendChild(node('p','A clear read on your saved activity, progress and upcoming commitments.','muted'));
    root.appendChild(hero);
    var grid=node('section',undefined,'metricGrid');
    grid.appendChild(metric('Level',value(current.level||1),'current level'));
    grid.appendChild(metric('XP',value(current.xp||0),'total earned'));
    grid.appendChild(metric('Streak',value(current.streak||0),'days in motion'));
    grid.appendChild(metric('Exams',value(exams().length),'saved timetable items'));
    var history=current.history||{};
    grid.appendChild(metric('Stored logs',value((history.logs||[]).length),'local activity records'));
    root.appendChild(grid);
    var summary=node('section',undefined,'card');
    summary.appendChild(node('h2','Saved activity'));
    summary.appendChild(node('p','Your data stays on this device. Use the dashboard actions to add activity, then return here for the latest totals.','muted'));
    root.appendChild(summary);
    setActive('stats');
  }
  function metric(label,valueText,note){
    var card=node('article',undefined,'metric');
    card.appendChild(node('span',label,'muted'));
    card.appendChild(node('strong',valueText));
    card.appendChild(node('small',note,'muted'));
    return card;
  }
  function showRoute(route){
    if(route==='timetable'){renderTimetable();}
    else if(route==='stats'){renderStats();}
  }
  function addNav(route,label){
    if(findRoute(route)){return;}
    var nav=document.getElementsByClassName('sidebar').item(0);
    if(!nav){return;}
    var item=node('button',label);
    item.setAttribute('type','button');
    item.setAttribute('data-route',route);
    nav.appendChild(item);
  }
  function examId(){return 'exam-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);}
  function saveExam(form){
    var data=new FormData(form);
    var subject=value(data.get('subject')).trim();
    var date=value(data.get('date')).trim();
    if(!subject||!date){notify('Subject and date are required');return;}
    var id=value(data.get('examId')).trim()||examId();
    var item={id:id,subject:subject,date:date,notes:value(data.get('notes')).trim()};
    var found=false;
    exams().forEach(function(existing){if(value(existing.id)===id){Object.assign(existing,item);found=true;}});
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
    var current=state();
    current.exams=exams().filter(function(item){return value(item.id)!==value(id);});
    save();
    renderTimetable();
    notify('Exam removed');
  }
  function capture(event){
    var current=event.target;
    while(current&&current!==document.body){
      if(current.hasAttribute&&current.hasAttribute('data-route')){
        var route=current.getAttribute('data-route');
        if(route==='timetable'||route==='stats'){
          event.preventDefault();
          event.stopPropagation();
          if(location.hash!=='#'+route){location.hash=route;}
          showRoute(route);
          return;
        }
      }
      if(current.hasAttribute&&current.hasAttribute('data-feature-action')){
        var action=current.getAttribute('data-feature-action');
        if(action==='editExam'){event.preventDefault();event.stopPropagation();editExam(current.getAttribute('data-exam-id'));return;}
        if(action==='removeExam'){event.preventDefault();event.stopPropagation();removeExam(current.getAttribute('data-exam-id'));return;}
      }
      current=current.parentNode;
    }
  }
  function submit(event){
    if(event.target&&event.target.id==='examForm'){
      event.preventDefault();
      event.stopPropagation();
      saveExam(event.target);
    }
  }
  function coachCard(title,body){
    var card=node('article',undefined,'coachCard');
    card.appendChild(node('h3',title));
    card.appendChild(node('p',body,'muted'));
    return card;
  }
  function nextExam(){
    var result=null;
    exams().forEach(function(item){
      var days=daysUntil(item.date);
      if(days!==null&&days>=0&&days<=7){
        if(!result||value(item.date)<value(result.date)){result=item;}
      }
    });
    return result;
  }
  function coachSignature(){
    var current=state();
    var exam=nextExam();
    return value(current.xp)+'|'+value(current.streak)+'|'+value(current.water)+'|'+value(current.mood)+'|'+(exam?value(exam.date):'none');
  }
  function addRules(section){
    var current=state();
    var today=new Date().toISOString().slice(0,10);
    var streak=Number(current.streak)||0;
    var water=Number(current.water)||0;
    var mood=value(current.mood).toLowerCase();
    var exam=nextExam();
    if(streak>0&&value(current.lastDay)!==today){section.appendChild(coachCard('Streak at risk','Log one useful action today to keep your '+value(streak)+' day streak moving.'));}
    if(water<8){section.appendChild(coachCard('Water deficit','You have logged '+value(water)+' glasses. Add one now, then build the next small win.'));}
    if(mood&&(mood.indexOf('sad')>=0||mood.indexOf('low')>=0||mood.indexOf('down')>=0||mood.indexOf('stress')>=0||mood.indexOf('tired')>=0)){section.appendChild(coachCard('Mood dip','Your mood check suggests a gentler pace. Pick a tiny task and protect your next break.'));}
    if(exam){section.appendChild(coachCard('Exam within 7 days',value(exam.subject||'Your exam')+' is '+examLabel(daysUntil(exam.date))+'. Schedule one focused study block today.'));}
    var history=current.history||{};
    if(current.prBeaten===true||history.prBeaten===true||value(history.lastAction)==='pr'){section.appendChild(coachCard('PR beaten','You raised the standard. Record what worked and carry that lesson into the next session.'));}
    var level=Number(current.level)||1;
    var xp=Number(current.xp)||0;
    var target=level*100;
    if(xp>=target){section.appendChild(coachCard('Level progress','Level '+value(level)+' is ready to advance. Use your next action to keep the momentum visible.'));}
    else{section.appendChild(coachCard('Level progress',value(target-xp)+' XP until level '+value(level+1)+'. One focused action is enough to move the bar.'));}
  }
  function cleanResponse(textValue){
    var valueText=value(textValue).replace(/</g,'less than').replace(/>/g,'more than');
    var parts=valueText.split('.');
    var result='';
    var count=0;
    parts.forEach(function(part){
      var piece=part.trim();
      if(piece&&count<3){result+=(result?' ':'')+piece+'.';count+=1;}
    });
    return result||'Keep your next action small, clear and repeatable.';
  }
  function promptText(){
    var current=state();
    var exam=nextExam();
    var examText=exam?value(exam.subject)+' on '+value(exam.date):'none scheduled within seven days';
    return 'You are an encouraging AI coach. Real user data: XP '+value(current.xp||0)+', streak '+value(current.streak||0)+' days, water '+value(current.water||0)+' glasses, next exam '+examText+'. Give exactly two or three short motivational sentences with one practical next step.';
  }
  function offlineText(){return 'Offline notice: live coaching is unavailable, so these rule based insights are shown instead.';}
  function showCoach(){
    var root=main();
    if(!root||state().route!=='dashboard'){return;}
    var section=node('section',undefined,'card coach');
    section.setAttribute('id','aiCoach');
    section.appendChild(node('h2','AI Coach'));
    section.appendChild(node('p','Rule based insights from your saved progress.','muted'));
    var cards=node('div',undefined,'coachGrid');
    addRules(cards);
    section.appendChild(cards);
    var response=node('p',app.coachText||'Refresh for a live two or three sentence coaching note.','coachResponse');
    response.setAttribute('aria-live','polite');
    section.appendChild(response);
    var refresh=button(app.coachLoading?'Loading coach...':'Refresh coach','coachRefresh','btn primary');
    if(app.coachLoading){refresh.setAttribute('disabled','disabled');}
    section.appendChild(refresh);
    root.appendChild(section);
  }
  function requestCoach(){
    if(app.coachLoading){return;}
    app.coachLoading=true;
    app.coachText='Loading a live coaching note.';
    app.render();
    if(typeof navigator!=='undefined'&&navigator.onLine===false){
      app.coachLoading=false;
      app.coachText=offlineText();
      app.render();
      return;
    }
    if(typeof fetch!=='function'){
      app.coachLoading=false;
      app.coachText=offlineText();
      app.render();
      return;
    }
    var controller=typeof AbortController==='function'?new AbortController():null;
    var timer=setTimeout(function(){if(controller){controller.abort();}},8000);
    var url='https://text.pollinations.ai/'+encodeURIComponent(promptText());
    try{
      fetch(url,controller?{signal:controller.signal}:undefined).then(function(response){
        if(!response.ok){throw new Error('coach request failed');}
        return response.text();
      }).then(function(body){
        app.coachText=cleanResponse(body);
      }).catch(function(){app.coachText=offlineText();}).then(function(){
        clearTimeout(timer);
        app.coachLoading=false;
        app.render();
      });
    }catch(error){
      clearTimeout(timer);
      app.coachLoading=false;
      app.coachText=offlineText();
      app.render();
    }
  }
  function coachClick(event){
    var current=event.target;
    while(current&&current!==document.body){
      if(current.hasAttribute&&current.hasAttribute('data-feature-action')&&current.getAttribute('data-feature-action')==='coachRefresh'){
        event.preventDefault();
        requestCoach();
        return;
      }
      current=current.parentNode;
    }
  }
  function install(){
    if(app.featureReady){return;}
    app.featureReady=true;
    addNav('timetable','Exams');
    addNav('stats','Stats');
    app.registerView('timetable',renderTimetable);
    app.registerView('stats',renderStats);
    document.addEventListener('click',capture,true);
    document.addEventListener('click',coachClick);
    document.addEventListener('submit',submit,true);
    var base=app.render;
    app.render=function(){base();showCoach();};
    app.coachText='';
    app.coachLoading=false;
    app.coachSignature=coachSignature();
    app.render();
    setInterval(function(){
      if(state().route==='dashboard'&&coachSignature()!==app.coachSignature){
        app.coachSignature=coachSignature();
        app.render();
      }
    },700);
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install,{once:true});}
  else{install();}
}());
