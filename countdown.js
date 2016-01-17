/*
 * countdown.js
 * by Alex Curtis
 * Calculates number of months, days, hours, minutes and seconds to a given date.
 */
isBefore = function(a,b) {
  return a.getTime() < b.getTime();
}
addCal = function(c,y,m,d,h,n,s) { return new Date(c.getFullYear()+y,c.getMonth()+m,c.getDate()+d,c.getHours()+h,c.getMinutes()+n,c.getSeconds()+s,c.getMilliseconds()); }

countdown = function(targetStart, targetEnd, currentDate) {
  if( currentDate > targetEnd ) {
    return "Hip, Hip, Hooray!"; 
  } 
  else if ( currentDate >= targetStart ) {
    return "Now!";
  }
  else {

    var diff = (function f(c,y,m,d,h,n,s) {
      var cc;
           if(isBefore(cc=addCal(c,1,0,0,0,0,0),targetStart))
        return f(cc,y+1,m,d,h,n,s);
      else if(isBefore(cc=addCal(c,0,1,0,0,0,0),targetStart))
        return f(cc,y,m+1,d,h,n,s);
      else if(isBefore(cc=addCal(c,0,0,1,0,0,0),targetStart))
        return f(cc,y,m,d+1,h,n,s);
      else if(isBefore(cc=addCal(c,0,0,0,1,0,0),targetStart))
        return f(cc,y,m,d,h+1,n,s);
      else if(isBefore(cc=addCal(c,0,0,0,0,1,0),targetStart))
        return f(cc,y,m,d,h,n+1,s);
      else if(isBefore(cc=addCal(c,0,0,0,0,0,1),targetStart))
        return f(cc,y,m,d,h,n,s+1);
      else
        return [y,m,d,h,n,s];})(currentDate,0,0,0,0,0,0);

var yearsToGo = diff[0];
var monthsToGo = diff[1];
var daysToGo = diff[2];
var hoursToGo = diff[3];
var minutesToGo = diff[4];
var secondsToGo = diff[5];

            var yearOrd = yearsToGo == 1 ? " year" : " years";
            var monthOrd = monthsToGo == 1 ? " month" : " months";
            var dayOrd = daysToGo == 1 ? " day" : " days";
            var hourOrd = hoursToGo == 1 ? " hour" : " hours";
            var minuteOrd = minutesToGo == 1 ? " minute" : " minutes";
            var secondOrd = secondsToGo == 1 ? " second" : " seconds";

          var ret =
              ((daysToGo+hoursToGo+minutesToGo+secondsToGo==0)?"Exactly ":"")
            + ((yearsToGo>0) ? (yearsToGo + yearOrd) : "")
            + ((monthsToGo>0) ? (((yearsToGo>0)?", ":"") + monthsToGo + monthOrd) : "")
            + ((daysToGo>0) ? (((monthsToGo>0)?", ":"") + daysToGo + dayOrd) : "")
            + ((hoursToGo>0) ? (((daysToGo+monthsToGo>0)?", ":"") + hoursToGo + hourOrd) : "")
            + ((minutesToGo>0) ? (((hoursToGo+daysToGo+monthsToGo>0)?", ":"") + minutesToGo + minuteOrd) : "")
            + ((secondsToGo>0) ? (((minutesToGo+hoursToGo+daysToGo+monthsToGo>0)?", ":"") + secondsToGo + secondOrd) : "")
            + " to go!";

return ret;
          }
        }

attachCountdown = function(id, sy,sm,sd,sh,sn,ss, ey,em,ed,eh,en,es) {
  var targetStart = new Date(sy,sm,sd,sh,sn,ss);
  var targetEnd = new Date(ey,em,ed,eh,en,es);
  var countdownElem = document.getElementById(id);
  (function update() {
    countdownElem.innerHTML = countdown( targetStart, targetEnd, new Date() );
    window.setTimeout( update, 200 );
  })();
};
