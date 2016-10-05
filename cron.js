/*
 * cron.js
 * by Alex Curtis 2016-08-22
 * Calculates soonest time that matches a cron expression.
 * crontab day-of-month and month are both 1-based.
 * my data structs day-of-month and month are both 0-based.
 * Javascript Date day-of-month is 1-based and month is 0-based.
 * crontab format is min hour day month weekday year.
 * cron parts can be like "*", "1234", "1,2,3,4", "1-4"
 */

/* test.js */
  function equal(a,b) {
    // Recursively compare tree-like data structures
    if( a === b ) { return true; }
    if( typeof(a) !== typeof(b) ) { return false; }
    if( a && b ) {
      // check for type object, otherwise we could redundantly compare two mismatching string instances.
      if( typeof(a) === 'object' ) {
        for( var x in a) {
          if( !equal(a[x],b[x]) ) {
            return false;
          }
        }
        for( var x in b) {
          if( !equal(a[x],b[x]) ) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  function isnot(msg,a,b) {
    if( equal(a,b) ) {
      console.log("💩 %cnot " + msg + " Failed. Both the same:", 'color: red;',a);
      return false;
    }
    console.log("🍺 %cnot " + msg + " passed.", 'color: green;');
    return true;
  }

 function is(msg,a,b) {
   if( !equal(a,b) ) {
     console.log("💩 %c" + msg + " Failed. Expected:", 'color: red;',a,"Actual:",b);
     return false;
   }
   console.log("🍺 %c" + msg + " passed.", 'color: green;');
   return true;
 }

isnot( "1,2", 1, 2 );
is( "1,1", 1, 1 );
isnot( "foo,bar", "foo", "bar" );
isnot( "foo,foos", "foo", "foos" );
is( "foo,foo", "foo", "foo" );
isnot( "[1,2,3],[1,2]", [1,2,3], [1,2] );
isnot( "[1,2],[1,2,3]", [1,2], [1,2,3] );
is( "[1,2,3],[1,2,3]", [1,2,3], [1,2,3] );
is( "[],[]", [], [] );
isnot( "[1],[]", [1], [] );
isnot( "[],[1]", [], [1] );
isnot( "null,0", null, 0 );
isnot( "0,null", 0, null );
is( "null,null", null, null );
isnot( "{a:1,b:2},{a:1,b:2,c:3}",{a:1,b:2},{a:1,b:2,c:3} );
is( "{a:1,b:2,c:3},{a:1,b:2,c:3}",{a:1,b:2,c:3},{a:1,b:2,c:3} );
isnot( "{a:1,b:2,c:3},{b:2,c:3}",{a:1,b:2,c:3},{b:2,c:3} );
is( "{a:[100,200],b:2,c:{A:10,B:20}},{a:[100,200],b:2,c:{A:10,B:20}}",{a:[100,200],b:2,c:{A:10,B:20}},{a:[100,200],b:2,c:{A:10,B:20}} );
isnot( "{a:[100],b:2,c:{A:10,B:20}},{a:[100,200],b:2,c:{A:10,B:20}}",{a:[200],b:2,c:{A:10,B:20}},{a:[100,200],b:2,c:{A:10,B:20}} );
isnot( "{a:[100,200],b:2,c:{A:10,B:20}},{a:[100,200],b:2,c:{A:30,B:20}}",{a:[100,200],b:2,c:{A:10,B:20}},{a:[100,200],b:2,c:{A:10,B:30}} );

console.log("--------------------");


function parseCronPart( cronPart, rebase ) {
  if( !rebase ) rebase = 0;
  if( cronPart.indexOf( "*" ) >= 0 ) { return  {type: "*"} };
  if( cronPart.indexOf( "-" ) >= 0 ) {
    var parts = cronPart.split("-");
    return  {
      type: "-",
      start: parseInt(parts[0]) + rebase,
      end: parseInt(parts[1]) + rebase
    };
  }
  if( cronPart.indexOf( "," ) >= 0 ) {
    var parts = cronPart.split(",");
    return {
      type: ",",
      values: parts.map( function(x) { return parseInt(x) + rebase; } )
    }; // Assumption that parts are in ascending numerical order.
  }
  return {
    type: "#",
    value: parseInt( cronPart ) + rebase
  };
}


is( "parseCronPart(*)",
  {type: "*"},
  parseCronPart("*")
)
is( "parseCronPart(4-8)",
  {type: "-", start: 4, end: 8},
  parseCronPart("4-8")
)
is( "parseCronPart(1,3,5)",
  {type: ",", values: [1,3,5]},
  parseCronPart("1,3,5")
)
is( "parseCronPart(55)",
  {type: "#", value: 55},
  parseCronPart("55")
)
is( "parseCronPart(*,-1)",
  {type: "*"},
  parseCronPart("*",-1)
)
is( "parseCronPart(4-8,-1)",
  {type: "-", start: 3, end: 7},
  parseCronPart("4-8",-1)
)
is( "parseCronPart(\"1,3,5\",-1)",
  {type: ",", values: [0,2,4]},
  parseCronPart("1,3,5",-1)
)
is( "parseCronPart(55,-1)",
  {type: "#", value: 54},
  parseCronPart("55",-1)
)


function parseCrontab( crontab ) {
  var cronParts = crontab.split(" ");
  if( cronParts.length !== 6 ) { return null; } // Exception
  return {
    year: parseCronPart( cronParts[5] ),
    month: parseCronPart( cronParts[3], -1 ),
    weekday: parseCronPart( cronParts[4] ),
    day: parseCronPart( cronParts[2], -1 ),
    hour: parseCronPart( cronParts[1] ),
    minute: parseCronPart( cronParts[0] )
  };
}


is( "parseCron(0,10,20,30,40,50 9-17 1 * * *)",
  {
    year: {type: "*"},
    month: {type: "*"},
    weekday: {type: "*"},
    day: {type: "#", value: 0},
    hour: {type: "-", start: 9, end: 17},
    minute: {type: ",", values: [0,10,20,30,40,50]}
  },
  parseCrontab("0,10,20,30,40,50 9-17 1 * * *")
);

function dateToStruct( date ) {
  return {
    minute: date.getMinutes(),
    hour: date.getHours(),
    day: date.getDate()-1,
    month: date.getMonth(),
    year: date.getFullYear()
  };
}

function datestruct( year, month, day, hour, minute ) {
  // Day and Month are human readable (1-based)
  return {
    minute: minute,
    hour: hour,
    day: day-1,
    month: month-1,
    year: year
  };
}

function structToDate( date ) {
  return new Date( date.year, date.month, date.day+1, date.hour, date.minute, 0 );
}

function isInPast( now, date ) {
  if( !date ) { return false; }
  if( date.year < now.year ) { return true; }
  if( date.year > now.year ) { return false; }
  if( date.month < now.month ) { return true; }
  if( date.month > now.month ) { return false; }
  if( date.day < now.day ) { return true; }
  if( date.day > now.day ) { return false; }
  if( date.hour < now.hour ) { return true; }
  if( date.hour > now.hour ) { return false; }
  if( date.minute < now.minute ) { return true; }
  if( date.minute > now.minute ) { return false; }
  return false;
}

is( "isInPast( 2016-08-20 14:19, 2016-08-20 14:19 )",
  false,
  isInPast( datestruct(2016,8,20,14,19), datestruct(2016,8,20,14,19) )
);

is( "isInPast( 2016-08-20 14:19, 2016-08-20 14:18 )",
  true,
  isInPast( datestruct(2016,8,20,14,19), datestruct(2016,8,20,14,18) )
);

is( "isInPast( 2016-08-20 14:19, 2016-08-20 14:21 )",
  false,
  isInPast( datestruct(2016,8,20,14,19), datestruct(2016,8,20,14,21) )
);

is( "isInPast( 2016-08-20 14:19, 2015-08-20 14:19 )",
  true,
  isInPast( datestruct(2016,8,20,14,19), datestruct(2015,8,20,14,19) )
);

is( "isInPast( 2016-08-20 14:19, 2017-08-20 14:19 )",
  false,
  isInPast( datestruct(2016,8,20,14,19), datestruct(2017,8,20,14,19) )
);



 /*
Set t = now
Advance t to first time where year matches. Then advance month. Repeat while not null.
Advance t to first time where month matches. If this is not possible (without changing year), return null.
Advance t to first time where day and weekday combo matches
Advance t to first time where hour matches
Advance t to first time where minute matches
*/

function numberMatches( cronpart, n, limit ) {
  var result = null;
  if( n < limit ) {
    switch( cronpart.type ) {
      case "#":
        if( cronpart.value >= n && cronpart.value < limit ) {
          result = cronpart.value;
        }
        break;
      case "-":
        if( n < limit && cronpart.start < limit ) {
          if( n <= cronpart.start ) {
            return cronpart.start;
          } else if( n <= cronpart.end ) {
            return n;
          }
        }
        break;
      case ",":
        for( var i in cronpart.values ) {
          var y = cronpart.values[i];
          if( y >= limit ) {
            break;
          }
          if( n <= y ) {
            result = y;
            break;
          }
        }
        break;
      case "*":
        if( n < limit ) {
          result = n;
        }
        break;
      default:
        break;
    }
  }
  return result;
}

is( "numberMatches( *, 7, 99 )",
  7,
  numberMatches( parseCronPart("*"), 7, 99 )
);

is( "numberMatches( 7, 7, 99 )",
  7,
  numberMatches( parseCronPart("7"), 7, 99 )
);

is( "numberMatches( 6, 7 ), 99",
  null,
  numberMatches( parseCronPart("6"), 7, 99 )
);

is( "numberMatches( 8, 7 ), 99",
  8,
  numberMatches( parseCronPart("8"), 7, 99 )
);

is( "numberMatches( 4-8, 7 ), 99",
  7,
  numberMatches( parseCronPart("4-8"), 7, 99 )
);

is( "numberMatches( 1-4, 7 ), 99",
  null,
  numberMatches( parseCronPart("1-4"), 7, 99 )
);

is( "numberMatches( 10-20, 7, 99 )",
  10,
  numberMatches( parseCronPart("10-20"), 7, 99 )
);

is( "numberMatches( 5,6,7,8, 7, 99 )",
  7,
  numberMatches( parseCronPart("5,6,7,8"), 7, 99 )
);

is( "numberMatches( 2,3,4, 7, 99 )",
  null,
  numberMatches( parseCronPart("2,3,4"), 7, 99 )
);

is( "numberMatches( 9,11,15, 7, 99 )",
  9,
  numberMatches( parseCronPart("9,11,15"), 7, 99 )
);


is( "numberMatches( 9, 7, 8 )",
  null,
  numberMatches( parseCronPart("9"), 7, 8 )
);

is( "numberMatches( 9, 7, 9 )",
  null,
  numberMatches( parseCronPart("9"), 7, 9 )
);

is( "numberMatches( *, 7, 8 )",
  7,
  numberMatches( parseCronPart("*"), 7, 8 )
);

is( "numberMatches( *, 7, 7 )",
  null,
  numberMatches( parseCronPart("*"), 7, 7 )
);

is( "numberMatches( *, 7, 6 )",
  null,
  numberMatches( parseCronPart("*"), 7, 6 )
);

is( "numberMatches( 5,7,9, 7, 6 )",
  null,
  numberMatches( parseCronPart("5,7,9"), 7, 6 )
);

is( "numberMatches( 5,7,9, 7, 8 )",
  7,
  numberMatches( parseCronPart("5,7,9"), 7, 8 )
);

//            n<l&s<l  n<=s e<l
// l n s e = -x          x

is( "numberMatches( 5-9, 4, 3 )",
  null,
  numberMatches( parseCronPart("5-9"), 4, 3 )
);

// l s n e = -x          x

is( "numberMatches( 5-9, 6, 3 )",
  null,
  numberMatches( parseCronPart("5-9"), 4, 3 )
);

// l s e n = -x          x

is( "numberMatches( 5-9, 10, 3 )",
  null,
  numberMatches( parseCronPart("5-9"), 10, 3 )
);

// n l s e = -x          x

is( "numberMatches( 5-9, 3, 4 )",
  null,
  numberMatches( parseCronPart("5-9"), 3, 4 )
);


// s l n e = -x           x


is( "numberMatches( 5-9, 10, 3 )",
  null,
  numberMatches( parseCronPart("5-9"), 7, 6 )
);


// s l e n = -x           x


is( "numberMatches( 5-9, 10, 7 )",
  null,
  numberMatches( parseCronPart("5-9"), 10, 7 )
);


// n s l e = s x           x

is( "numberMatches( 5-9, 3, 7 )",
  5,
  numberMatches( parseCronPart("5-9"), 3, 7 )
);

// s n l e = l         x   x


is( "numberMatches( 5-9, 7, 8 )",
  7,
  numberMatches( parseCronPart("5-9"), 7, 8 )
);


// s e l n = -x

is( "numberMatches( 5-9, 11, 10 )",
  null,
  numberMatches( parseCronPart("5-9"), 11, 10 )
);

// n s e l = s x


is( "numberMatches( 5-9, 4, 10 )",
  5,
  numberMatches( parseCronPart("5-9"), 4, 10 )
);

// s n e l = n         x

is( "numberMatches( 5-9, 6, 10 )",
  6,
  numberMatches( parseCronPart("5-9"), 6, 10 )
);

// s e n l = -         x

is( "numberMatches( 5-9, 10, 11 )",
  null,
  numberMatches( parseCronPart("5-9"), 10, 11 )
);



function numberMatchesExactly( cronpart, n ) {
  var result = null;

  switch( cronpart.type ) {
    case "#":
      if( cronpart.value === n ) {
        result = n;
      }
      break;
    case "-":
      if( n >= cronpart.start && n <= cronpart.end ) {
        result = n;
      }
      break;
    case ",":
      for( var i in cronpart.values ) {
        var y = cronpart.values[i];
        if( n === y ) {
          result = n;
          break;
        }
      }
      break;
    case "*":
      result = n;
      break;
    default:
      break;
  }
  return result;
}


is( "numberMatchesExactly( *, 7 )",
  7,
  numberMatchesExactly( parseCronPart("*"), 7 )
);

is( "numberMatchesExactly( 7, 7 )",
  7,
  numberMatchesExactly( parseCronPart("7"), 7 )
);

is( "numberMatchesExactly( 6, 7 )",
  null,
  numberMatchesExactly( parseCronPart("6"), 7 )
);

is( "numberMatchesExactly( 8, 7 )",
  null,
  numberMatchesExactly( parseCronPart("8"), 7 )
);

is( "numberMatchesExactly( 4-8, 7 )",
  7,
  numberMatchesExactly( parseCronPart("4-8"), 7 )
);

is( "numberMatchesExactly( 1-4, 7 )",
  null,
  numberMatchesExactly( parseCronPart("1-4"), 7 )
);

is( "numberMatchesExactly( 10-20, 7 )",
  null,
  numberMatchesExactly( parseCronPart("10-20"), 7 )
);

is( "numberMatchesExactly( 5,6,7,8, 7 )",
  7,
  numberMatchesExactly( parseCronPart("5,6,7,8"), 7 )
);

is( "numberMatchesExactly( 2,3,4, 7 )",
  null,
  numberMatchesExactly( parseCronPart("2,3,4"), 7 )
);

is( "numberMatchesExactly( 9,11,15, 7 )",
  null,
  numberMatchesExactly( parseCronPart("9,11,15"), 7 )
);



// selectNextMatchingDay = function( timeStruct ) {
//   if( timeStruct.d < lastDayInMonth(timeStruct.y,timeStruct.mo) ) { return {y: timeStruct.y, mo: timeStruct.mo, d: timeStruct.d + 1, h: timeStruct.h, mi: timeStruct.mi}; }
//   else { return addOneMonth( {y: timeStruct.y, mo: timeStruct.mo, d: 0, h: timeStruct.h, mi: timeStruct.mi} ); }
// }

function dayOfWeek( t ) {
  return new Date( t.year, t.month, t.day+1 ).getDay();
}

function nextMatch( crontabStr, now ) {
  var crontab = parseCrontab( crontabStr );
  var result = now;
  fixymdhn( crontab, now );
  if( result.year === null
    || result.month === null
    || result.day === null
    || result.hour === null
    || result.minute === null ) {
      return null;
    }
  return result;
}

function fixymdhn( crontab, t ) {
  var x = numberMatches( crontab.year, t.year, Infinity );
  if( x && x > t.year ) {
    t.month = 0;
    t.day = 0;
    t.hour = 0;
    t.minute = 0;
  }
  t.year = x;
  if( t.year !== null ) {
    fixmdhn( crontab, t );
    while( t.month === null ) { // need to loop here to find certain day+day-of-week combos
      t.year = numberMatches( crontab.year, t.year+1, Infinity );
      if( t.year === null ) {
        break;
      }
      t.month = 0;
      t.day = 0;
      t.hour = 0;
      t.minute = 0;
      fixmdhn( crontab, t );
    }
  }
}

function fixmdhn( crontab, t ) {
  var x = numberMatches( crontab.month, t.month, 12 );
  if( x && x > t.month ) {
    t.day = 0;
    t.hour = 0;
    t.minute = 0;
  }
  t.month = x;
  if( t.month !== null ) {
    fixdhn( crontab, t );
    while( t.day === null ) { // need to loop here to find certain day+day-of-week combos
      t.month = numberMatches( crontab.month, t.month+1, 12 );
      if( t.month === null ) {
        break;
      }
      t.day = 0;
      t.hour = 0;
      t.minute = 0;
      fixdhn( crontab, t );
    }
  }
}


function maxDay( t ) {
  return new Date( t.year, t.month+1, 0 ).getDate();
}

is( "maxDay( feb 2016 )",
  29,
  maxDay( {year: 2016, month: 1} )
);

is( "maxDay( feb 2017 )",
  28,
  maxDay( {year: 2017, month: 1} )
);

is( "maxDay( aug 2016 )",
  31,
  maxDay( {year: 2016, month: 7} )
);

is( "maxDay( sep 2016 )",
  30,
  maxDay( {year: 2016, month: 8} )
);


function fixdhn( crontab, t ) {
  var d = t.day;
  var daysInMonth = maxDay( t );

  do {
    t.day = numberMatches( crontab.day, t.day, daysInMonth );
    if( t.day === null || crontab.weekday.type === "*" ) {
      break;
    }
    var candidateWeekday = dayOfWeek( t );
    if( numberMatchesExactly( crontab.weekday, candidateWeekday ) !== null ) {
      break;
    }
    t.day++
  }
  while(1);

  if( t.day && t.day > d ) {
    t.hour = 0;
    t.minute = 0;
  }
  if( t.day !== null ) {
    fixhn( crontab, t );
    if( t.hour === null ) {
      t.day = numberMatches( crontab.day, t.day+1, daysInMonth );
      if( t.day !== null ) {
        t.hour = 0;
        t.minute = 0;
        fixhn( crontab, t );
      }
    }
  }
}

function fixhn( crontab, t ) {
  var x = numberMatches( crontab.hour, t.hour, 24 );
  if( x && x > t.hour ) {
    t.minute = 0;
  }
  t.hour = x;
  if( t.hour !== null ) {
    fixn( crontab, t );
    if( t.minute === null ) {
      t.hour = numberMatches( crontab.hour, t.hour+1, 24 );
      t.minute = 0;
      fixn( crontab, t );
    }
  }
}

function fixn( crontab, t ) {
  t.minute = numberMatches( crontab.minute, t.minute, 60 );
}


is( "nextMatch( \"* * * * * *\", 2016-08-20 14:19 )",
    datestruct(2016,8,20,14,19),
    nextMatch(
      "* * * * * *",
      datestruct(2016,8,20,14,19)
    )
);

is( "nextMatch( \"* * * * * 2016\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,14,19),
  nextMatch(
    "* * * * * 2016",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * * * * 2015\", 2016-08-20 14:19 )",
  null,
  nextMatch(
    "* * * * * 2015",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * * * * 2017\", 2016-08-20 14:19 )",
  datestruct(2017,1,1,0,0),
  nextMatch(
    "* * * * * 2017",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * * * * 2015-2017\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,14,19),
  nextMatch(
    "* * * * * 2015-2017",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * * * * 2013-2015\", 2016-08-20 14:19 )",
  null,
  nextMatch(
    "* * * * * 2013-2015",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * * * * 2018-2020\", 2016-08-20 14:19 )",
  datestruct(2018,1,1,0,0),
  nextMatch(
    "* * * * * 2018-2020",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * * * * 2016,2017,2032\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,14,19),
  nextMatch(
    "* * * * * 2016,2017,2032",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * * * * 2015,2016,2017\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,14,19),
  nextMatch(
    "* * * * * 2015,2016,2017",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * * * * 2010,2012,2015\", 2016-08-20 14:19 )",
  null,
  nextMatch(
    "* * * * * 2010,2012,2015",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * * * * 2018,2020\", 2016-08-20 14:19 )",
  datestruct(2018,1,1,0,0),
  nextMatch(
    "* * * * * 2018,2020",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * * * * 2010,2018,2020\", 2016-08-20 14:19 )",
  datestruct(2018,1,1,0,0),
  nextMatch(
    "* * * * * 2010,2018,2020",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * * 12 * 2016\", 2016-08-20 14:19 )",
  datestruct(2016,12,1,0,0),
  nextMatch(
    "* * * 12 * 2016",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * * 8 * 2016\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,14,19),
  nextMatch(
    "* * * 8 * 2016",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * 21 8 * 2016\", 2016-08-20 14:19 )",
  datestruct(2016,8,21,0,0),
  nextMatch(
    "* * 21 8 * 2016",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * 20 8 * 2016\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,14,19),
  nextMatch(
    "* * 20 8 * 2016",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * 19 8 * 2016\", 2016-08-20 14:19 )",
  null,
  nextMatch(
    "* * 19 8 * 2016",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* 14 20 8 * 2016\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,14,19),
  nextMatch(
    "* 14 20 8 * 2016",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* 15 20 8 * 2016\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,15,0),
  nextMatch(
    "* 15 20 8 * 2016",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* 13 20 8 * 2016\", 2016-08-20 14:19 )",
  null,
  nextMatch(
    "* 13 20 8 * 2016",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"19 14 20 8 * 2016\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,14,19),
  nextMatch(
    "19 14 20 8 * 2016",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"25 14 20 8 * 2016\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,14,25),
  nextMatch(
    "25 14 20 8 * 2016",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"10 14 20 8 * 2016\", 2016-08-20 14:19 )",
  null,
  nextMatch(
    "10 14 20 8 * 2016",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"10 * * * * *\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,15,10),
  nextMatch(
    "10 * * * * *",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"25 * * * * *\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,14,25),
  nextMatch(
    "25 * * * * *",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"10 11 * * * *\", 2016-08-20 14:19 )",
  datestruct(2016,8,21,11,10),
  nextMatch(
    "10 11 * * * *",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* 13 * * * *\", 2016-08-20 14:19 )",
  datestruct(2016,8,21,13,0),
  nextMatch(
    "* 13 * * * *",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* 14 * * * *\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,14,19),
  nextMatch(
    "* 14 * * * *",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* 15 * * * *\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,15,0),
  nextMatch(
    "* 15 * * * *",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"25 * 19 7 * *\", 2016-08-20 14:19 )",
  datestruct(2017,7,19,0,25),
  nextMatch(
    "25 * 19 7 * *",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"25 * 19 7 * 2012,2016,2018\", 2016-08-20 14:19 )",
  datestruct(2018,7,19,0,25),
  nextMatch(
    "25 * 19 7 * 2012,2016,2018",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"21,25,40 * 19 7 * 2012,2016,2018\", 2016-08-20 14:19 )",
  datestruct(2018,7,19,0,25),
  nextMatch(
    "25 * 19 7 * 2012,2016,2018",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"21,25,40 * 15-25 7 * 2012,2016,2018\", 2016-08-20 14:19 )",
  datestruct(2018,7,15,0,25),
  nextMatch(
    "25 * 15-25 7 * 2012,2016,2018",
    datestruct(2016,8,20,14,19)
  )
);


is( "nextMatch( \"18-26 * * * * *\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,14,19),
  nextMatch(
    "18-26 * * * * *",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"18-26 * 23-28 * * *\", 2016-08-20 14:19 )",
  datestruct(2016,8,23,0,18),
  nextMatch(
    "18-26 * 23-28 * * *",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * * * 5 *\", 2016-08-20 14:19 )",
  datestruct(2016,8,26,0,0),
  nextMatch(
    "* * * * 5 *",
    datestruct(2016,8,20,14,19)
  )
);


is( "nextMatch( \"* * * * 6 *\", 2016-08-20 14:19 )",
  datestruct(2016,8,20,14,19),
  nextMatch(
    "* * * * 6 *",
    datestruct(2016,8,20,14,19)
  )
);

is( "nextMatch( \"* * * * 0 *\", 2016-08-20 14:19 )",
  datestruct(2016,8,21,0,0),
  nextMatch(
    "* * * * 0 *",
    datestruct(2016,8,20,14,19)
  )
);

// next monday in august
is( "nextMatch( \"* * * 8 1 *\", 2016-08-20 14:19 )",
  datestruct(2016,8,22,0,0),
  nextMatch(
    "* * * 8 1 *",
    datestruct(2016,8,20,14,19)
  )
);

// first monday in september
is( "nextMatch( \"* * * 9 0 *\", 2016-08-20 14:19 )",
  datestruct(2016,9,4,0,0),
  nextMatch(
    "* * * 9 0 *",
    datestruct(2016,8,20,14,19)
  )
);

// first monday in jan
is( "nextMatch( \"* * * 1 1 *\", 2016-08-20 14:19 )",
  datestruct(2017,1,2,0,0),
  nextMatch(
    "* * * 1 1 *",
    datestruct(2016,8,20,14,19)
  )
);

// first tuesday in 2017
is( "nextMatch( \"* * * * 2 2017\", 2016-08-20 14:19 )",
  datestruct(2017,1,3,0,0),
  nextMatch(
    "* * * * 2 2017",
    datestruct(2016,8,20,14,19)
  )
);

// 10.33am on the first tuesday in 2017
is( "nextMatch( \"33 10 * * 2 2017\", 2016-08-20 14:19 )",
  datestruct(2017,1,3,10,33),
  nextMatch(
    "33 10 * * 2 2017",
    datestruct(2016,8,20,14,19)
  )
);

// next tuesday the 18th of any month
is( "nextMatch( \"* * 18 * 2 *\", 2016-08-20 14:19 )",
  datestruct(2016,10,18,0,0),
  nextMatch(
    "* * 18 * 2 *",
    datestruct(2016,8,20,14,19)
  )
);

// saturday falling on the 31st of any month apart from today
is( "nextMatch( \"0 10 31 * 6 *\", 2016-12-31 14:19 )",
  datestruct(2018,3,31,10,0),
  nextMatch(
    "0 10 31 * 6 *",
    datestruct(2016,12,31,14,19)
  )
);

// first monday in november
is( "nextMatch( \"* * * 11 1 *\", 2016-08-20 14:19 )",
  datestruct(2016,11,7,0,0),
  nextMatch(
    "* * * 11 1 *",
    datestruct(2016,8,20,14,19)
  )
);

// first monday in 2020
is( "nextMatch( \"* * * * 1 2020\", 2016-08-20 14:19 )",
  datestruct(2020,1,6,0,0),
  nextMatch(
    "* * * * 1 2020",
    datestruct(2016,8,20,14,19)
  )
);

// first monday or wednesday in september
is( "nextMatch( \"* * * 9 1,3 *\", 2016-08-20 14:19 )",
  datestruct(2016,9,5,0,0),
  nextMatch(
    "* * * 9 1,3 *",
    datestruct(2016,8,20,14,19)
  )
);

// first wednesday or friday in september
is( "nextMatch( \"* * * 9 3,5 *\", 2016-08-20 14:19 )",
  datestruct(2016,9,2,0,0),
  nextMatch(
    "* * * 9 3,5 *",
    datestruct(2016,8,20,14,19)
  )
);

// first day that isn't a sunday in 2017
is( "nextMatch( \"* * * * 1-6 2017\", 2016-08-20 14:19 )",
  datestruct(2017,1,2,0,0),
  nextMatch(
    "* * * * 1-6 2017",
    datestruct(2016,8,20,14,19)
  )
);

console.log("test ends-----------------------------");
