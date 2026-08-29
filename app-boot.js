(function(){
'use strict';
function callCore(){
  var appCore=window.app||window.LockedIn;
  if(!appCore)return;
  if(typeof appCore.start==='function'){appCore.start();return;}
  if(typeof appCore.render==='function'){appCore.render();return;}
  if(typeof appCore.state==='function')appCore.state();
}
function waitCore(){
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',callCore,{once:true});
    return;
  }
  callCore();
}
waitCore();
}());
