(function(){"use strict";
function getApp(){return window.app;}
function requestNotifications(){if(!("Notification" in window)){getApp().toast("Notifications unavailable; reminders use this tab");return;}Notification.requestPermission().then(function(result){getApp().toast(result==="granted"?"Notifications enabled":"Notification permission not granted");});}
function remind(){var hour=new Date().getHours();if(hour<8||hour>21)return;var key="reminderNoticeDate";try{if(window.localStorage.getItem(key)===new Date().toISOString().slice(0,10))return;window.localStorage.setItem(key,new Date().toISOString().slice(0,10));}catch(error){}if("Notification" in window&&Notification.permission==="granted")new Notification("LOCKED IN",{body:"Open your dashboard and log one small action."});else getApp().toast("Reminder: open your dashboard and log one small action");}
function bind(){if(!getApp())return;getApp().registerAction("requestNotifications",requestNotifications);document.addEventListener("visibilitychange",function(){if(!document.hidden)remind();});window.addEventListener("focus",remind);window.setTimeout(remind,1200);}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
}());
