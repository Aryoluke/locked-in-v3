(function(){
  'use strict';
  var app=window.app||window.LockedIn;
  if(!app){return;}
  app._views=app._views||{};
  if(typeof app.registerView!=='function'){
    app.registerView=function(name,view){app._views[name]=view;};
  }
  function text(value){return value===null||value===undefined?'':String(value);}
  function node(tag,content,className){
    var item=document.createElement(tag);
    if(className){item.className=className;}
    if(content!==undefined&&content!==null){item.textContent=text(content);}
    return item;
  }
  function button(label,action,className){
    var item=node('button',label,className||'btn');
    item.type='button';
    if(action){item.setAttribute('data-feature-action',action);}
    return item;
  }
  function state(){return typeof app.state==='function'?app.state():{};}
  function save(){if(typeof app.save==='function'){app.save();}}
  function notify(message){if(typeof app.toast==='function'){app.toast(message);}}
  function main(){return document.getElementById('app');}
  function setActive(route){
    var nav=document.querySelector('.sidebar');
    if(!nav){return;}
    var links=nav.querySelectorAll('[data-route]');
    for(var i=0;i<links.length;i++){
      links[i].classList.toggle('active',links[i].getAttribute('data-route')===route);
    }
  }
  function card(title,body){
    var section=node('section',undefined,'card');
    section.appendChild(node('h2',title));
    if(body){section.appendChild(body);}
    return section;
  }
  function hero(kicker,title,copy){
    var section=node('section',undefined,'hero');
    var wrap=node('div');
    wrap.appendChild(node('div',kicker,'eyebrow'));
    wrap.appendChild(node('h1',title));
    wrap.appendChild(node('p',copy,'muted'));
    section.appendChild(wrap);
    return section;
  }
  function addField(form,label,name,type,value,required){
    var labelNode=node('label',undefined,'field');
    labelNode.appendChild(node('span',label));
    var input=document.createElement(type==='textarea'?'textarea':'input');
    input.name=name;
    input.type=type==='textarea'?'text':type;
    if(value!==undefined){input.value=text(value);}
    if(required){input.required=true;}
    if(type==='textarea'){input.rows=3;}
    labelNode.appendChild(input);
    form.appendChild(labelNode);
    return input;
  }
  function examList(){
    var value=state().exams;
    if(!Array.isArray(value)){value=[];state().exams=value;}
    return value;
  }
  function examDays(date){
    var target=new Date(text(date)+'T23:59:59');
    if(isNaN(target.getTime())){return null;}
    return Math.ceil((target.getTime()-Date.now())/86400000);
  }
  function examLabel(days){
    if(days===null){return 'Date to be confirmed';}
    if(days<0){return 'Past';}
    if(days===0){return 'Today';}
    if(days===1){return 'Tomorrow';}
    return String(days)+' days';
  }
  function renderExamRow(item){
    var days=examDays(item.date);
    var article=node('article',undefined,'examRow '+(days!==null&&days<0?'examPast':'examUpcoming'));
    var detail=node('div');
    detail.appendChild(node('strong',item.subject||'Untitled subject'));
    detail.appendChild(node('small',text(item.date)+' · '+examLabel(days),'muted'));
    detail.appendChild(node('p',item.notes||'No notes','muted'));
    var actions=node('div',undefined,'rowActions');
    var edit=button('Edit','editExam','btn');
    edit.setAttribute('data-exam-id',text(item.id));
    var remove=button('Remove','removeExam','btn');
    remove.setAttribute('data-exam-id',text(item.id));
    actions.appendChild(edit);
    actions.appendChild(remove);
    article.appendChild(detail);
    article.appendChild(actions);
    return article;
  }
  function renderTimetable(){
    var root=main();
    if(!root){return;}
    root.replaceChildren();
    root.appendChild(hero('CALENDAR CONTROL','Exam timetable','Keep every subject, date and note in one persisted view.'));
    var formCard=card('Add or edit an exam');
    var form=document.createElement('form');
    form.id='examForm';
    form.className='formGrid';
    addField(form,'Subject','subject','text','',true);
    addField(form,'Date','date','date','',true);
    addField(form,'Notes','notes','textarea','',false);
    var hidden=document.createElement('input');
    hidden.type='hidden';
    hidden.name='examId';
    form.appendChild(hidden);
    form.appendChild(button('Save exam','','btn primary wide'));
    formCard.appendChild(form);
    root.appendChild(formCard);
    var listCard=card('Upcoming exams');
    var list=node('div',undefined,'examList');
    var items=examList().slice().sort(function(first,second){return text(first.date).localeCompare(text(second.date));});
    if(!items.length){list.appendChild(node('p','Add your first exam to see the countdown.','empty'));}
    for(var i=0;i<items.length;i++){list.appendChild(renderExamRow(items[i]));}
    listCard.appendChild(list);
    root.appendChild(listCard);
    setActive('timetable');
  }
  function examId(){return 'exam-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);}
  function saveExam(form){
    var data=new FormData(form);
    var subject=text(data.get('subject')).trim();
    var date=text(data.get('date')).trim();
    if(!subject||!date){notify('Subject and date are required');return;}
    var item={id:text(data.get('examId'))||examId(),subject:subject,date:date,notes:text(data.get('notes')).trim()};
    var items=examList();
    var found=null;
    for(var i=0;i<items.length;i++){if(items[i].id===item.id){found=items[i];break;}}
    if(found){Object.assign(found,item);}else{items.push(item);}
    save();
    renderTimetable();
    notify('Exam saved');
  }
  function editExam(id){
    var items=examList();
    for(var i=0;i<items.length;i++){
      if(text(items[i].id)===text(id)){
        var form=document.getElementById('examForm');
        if(!form){return;}
        form.elements.examId.value=text(items[i].id);
        form.elements.subject.value=text(items[i].subject);
        form.elements.date.value=text(items[i].date);
        form.elements.notes.value=text(items[i].notes);
        form.elements.subject.focus();
        return;
      }
    }
  }
  function removeExam(id){
    var items=examList();
    state().exams=items.filter(function(item){return text(item.id)!==text(id);});
    save();
    renderTimetable();
    notify('Exam removed');
  }
  function metric(label,value,note){
    var article=node('article',undefined,'metric');
    article.appendChild(node('span',label,'muted'));
    article.appendChild(node('strong',value));
    article.appendChild(node('small',note||'','muted'));
    return article;
  }
  function renderStats(){
    var root=main();
    if(!root){return;}
    var current=state();
    var logs=Array.isArray(current.logs)?current.logs:[];
    var exams=Array.isArray(current.exams)?current.exams:[];
    root.replaceChildren();
    root.appendChild(hero('CONTROL ROOM','Stats hub','A clear read on your saved activity, progress and upcoming commitments.'));
    var grid=node('section',undefined,'metricGrid');
    grid.appendChild(metric('Level',text(current.level||1),'current level'));
    grid.appendChild(metric('XP',text(current.xp||0),'total earned'));
    grid.appendChild(metric('Streak',text(current.streak||0),'days in motion'));
    grid.appendChild(metric('Exams',text(exams.length),'saved timetable items'));
    grid.appendChild(metric('Stored logs',text(logs.length),'local activity records'));
    root.appendChild(grid);
    var summary=card('Saved activity');
    summary.appendChild(node('p','Your data stays on this device. Use the dashboard actions to add activity, then return here for the latest totals.','muted'));
    root.appendChild(summary);
    setActive('stats');
  }
  function showRoute(route){
    if(route==='timetable'){renderTimetable();}
    else if(route==='stats'){renderStats();}
  }
  function addNav(route,label){
    var nav=document.querySelector('.sidebar');
    if(!nav||nav.querySelector('[data-route="'+route+'"]')){return;}
    var item=node('button',label);
    item.type='button';
    item.setAttribute('data-route',route);
    nav.appendChild(item);
  }
  function capture(event){
    var routeNode=event.target.closest?event.target.closest('[data-route]'):null;
    if(routeNode){
      var route=routeNode.getAttribute('data-route');
      if(route==='timetable'||route==='stats'){
        event.preventDefault();
        event.stopPropagation();
        if(location.hash!=='#'+route){location.hash=route;}
        showRoute(route);
        return;
      }
    }
    var actionNode=event.target.closest?event.target.closest('[data-feature-action]'):null;
    if(actionNode){
      var action=actionNode.getAttribute('data-feature-action');
      if(action==='editExam'){event.preventDefault();event.stopPropagation();editExam(actionNode.getAttribute('data-exam-id'));}
      if(action==='removeExam'){event.preventDefault();event.stopPropagation();removeExam(actionNode.getAttribute('data-exam-id'));}
    }
  }
  function submit(event){
    if(event.target&&event.target.id==='examForm'){
      event.preventDefault();
      event.stopPropagation();
      saveExam(event.target);
    }
  }
  function install(){
    if(!app.state||!main()){return;}
    if(!Array.isArray(state().exams)){state().exams=[];}
    app.registerView('timetable',renderTimetable);
    app.registerView('stats',renderStats);
    addNav('timetable','Exams');
    addNav('stats','Stats');
    document.addEventListener('click',capture,true);
    document.addEventListener('submit',submit,true);
    window.addEventListener('hashchange',function(){showRoute(location.hash.slice(1));});
    if(location.hash==='#timetable'||state().route==='timetable'){showRoute('timetable');}
    if(location.hash==='#stats'){showRoute('stats');}
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install,{once:true});}else{install();}
}());
