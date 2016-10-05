# Countdown JS

This is some javascript I wrote to parse [crontab]() times and do the countdown for a website I was building.

Given a target date, it shows how long from now until that date, e.g. "6 months, 22 days, 18 hours, 6 minutes and 55 seconds".

[See Demo]()

## Example usage

  <head>
    <script type="text/javascript" src="cron.js"></script>
    <script type="text/javascript" src="countdown.js"></script>
  </head>

  <body>
    <p id="weekend"></p>
    <script>
	  var elemId = "weekend";
	  var crontab = "30 17 * * 5 *";
	  var duration = 60*(48+7);
      attachCountdownCron(elemId, crontab, duration);
    </script>
  </body>
  

