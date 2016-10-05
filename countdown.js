/*
 * countdown.js
 * by Alex Curtis
 * Calculates number of months, days, hours, minutes and seconds to a given date.
 * crontab day-of-month and month are both 1-based.
 * my data structs day-of-month and month are both 0-based.
 * Javascript Date day-of-month is 1-based and month is 0-based.
 */

isBefore = function(a,b) {
  return a.getTime() < b.getTime();
}
addCal = function(c,y,m,d,h,n,s) { return new Date(c.getFullYear()+y,c.getMonth()+m,c.getDate()+d,c.getHours()+h,c.getMinutes()+n,c.getSeconds()+s,c.getMilliseconds()); }

  timeStructToDate = function( queryTimeStruct ) {
    return new Date(queryTimeStruct.y,queryTimeStruct.mo,queryTimeStruct.d+1,queryTimeStruct.h,queryTimeStruct.mi,0);
  }

  isInPast = function( queryTimeStruct, currentDate ) {
    return isBefore( timeStructToDate( queryTimeStruct ),
                     currentDate );
  }

  selectNextMatchingMinute = function( timeStruct ) {
    if( timeStruct.mi < 59 ) { return {y: timeStruct.y, mo: timeStruct.mo, d: timeStruct.d, h: timeStruct.h, mi: timeStruct.mi + 1}; }
    else { return addOneHour( {y: timeStruct.y, mo: timeStruct.mo, d: timeStruct.d, h: timeStruct.h, mi: 0} ); }
  }

  selectNextMatchingHour = function( timeStruct ) {
    if( timeStruct.h < 23 ) { return {y: timeStruct.y, mo: timeStruct.mo, d: timeStruct.d, h: timeStruct.h + 1, mi: timeStruct.mi}; }
    else { return addOneDay( {y: timeStruct.y, mo: timeStruct.mo, d: timeStruct.d, h: 0, mi: timeStruct.mi} ); }
  }

  selectNextMatchingDay = function( timeStruct ) {
    if( timeStruct.d < lastDayInMonth(timeStruct.y,timeStruct.mo) ) { return {y: timeStruct.y, mo: timeStruct.mo, d: timeStruct.d + 1, h: timeStruct.h, mi: timeStruct.mi}; }
    else { return addOneMonth( {y: timeStruct.y, mo: timeStruct.mo, d: 0, h: timeStruct.h, mi: timeStruct.mi} ); }
  }

  selectNextMatchingMonth = function( timeStruct ) {
    if( timeStruct.mo < 11 ) { return {y: timeStruct.y, mo: timeStruct.mo + 1, d: timeStruct.d, h: timeStruct.h, mi: timeStruct.mi}; }
    else { return addOneYear( {y: timeStruct.y, mo: 0, d: timeStruct.d, h: timeStruct.h, mi: timeStruct.mi} ); }
  }

  selectNextMatchingYear = function( timeStruct ) {
    return {y: timeStruct.y + 1, mo: timeStruct.mo, d: timeStruct.d, h: timeStruct.h, mi: timeStruct.mi};
  }

  lastDayInMonth = function( y, mo ) {
    if( mo == 1 && isLeapYear(y) ) {
      return 28;
    } else {
     return [30,27,30,29,30,29,30,30,29,30,29,30][mo];
    }
  }

  isLeapYear = function(y) {
    if( y % 4 != 0 ) { return false; }
    if( y % 100 != 0 ) { return true; }
    if( y % 400 != 0 ) { return false; }
    return true;
  }


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

attachCountdownCron = function(id, cronSpec, durationMins) {
  var now = new Date();
  var startSpecNewStyle = nextMatch( cronSpec, dateToStruct(now) );
  var startSpec = {y: startSpecNewStyle.year, mo: startSpecNewStyle.month, d: startSpecNewStyle.day, h: startSpecNewStyle.hour, mi: startSpecNewStyle.minute};
  var targetStart = timeStructToDate( startSpec );
  var targetEnd = new Date( targetStart + durationMins * 60 * 1000 );
  var countdownElem = document.getElementById(id);
  (function update() {
    countdownElem.innerHTML = countdown( targetStart, targetEnd, new Date() );
    window.setTimeout( update, 200 );
  })();
};
