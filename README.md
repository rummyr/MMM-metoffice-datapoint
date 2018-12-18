# MMM-metoffice-datapoint
Magic Mirror Module to pull 3 hourly data from the UK Met Office Datapoint API


## Configuration options
<table width="100%">
  <!-- table suffering... -->
  <thead>
    <tr>
      <th>Option</th>
      <th width="100%">Description</th>
    </tr>
  <thead>
  <tbody>
    <tr>
      <td><code>apiKey</code></td>
      <td>The <a href="https://www.metoffice.gov.uk/datapoint/api" target="_blank">MetOffice Datapoint API Key</a>, which can be obtained by creating an account on the metoffice site.<br>
        <br> This value is <b>REQUIRED</b>
      </td>
    </tr>
    <tr>
      <td><code>units</code></td>
      <td>What units to use. Specified by config.js<br>
        <br><b>Possible values:</b> <code>config.units</code> = Specified by config.js, <code>default</code> = Kelvin, <code>metric</code> = Celsius, <code>imperial</code> =Fahrenheit
        <br><b>Default value:</b> <code>config.units</code>
      </td>
    </tr>
    <tr>
      <td><code>twentyFourHourTime</code></td>
      <td>Whether to use 24-hour format time or not<br>
        <br><b>Possible values:</b> <code>true</code> = Time presented as XX:00, <code>false</code> = Time present as XXam/pm
        <br><b>Default value:</b> <code>true</code>
      </td>
    </tr> 
    <tr>
      <td><code>showPrecipitationPossibilityInRow</code></td>
      <td>Show chance of precipitation at each hour<br>
        <br><b>Possible values:</b> <code>true</code> = Display precipitation possibility, <code>false</code> = Do not display precipitation details
        <br><b>Default value:</b> <code>true</code>
      </td>
    </tr>    
    <tr>
      <td><code>showDayInRow</code></td>
      <td>Show day that hour occurs in<br>
        <br><b>Possible values:</b> <code>true</code> = Display day in row, <code>false</code> = Do not display day in row
        <br><b>Default value:</b> <code>true</code>
      </td>
    </tr>
    <tr>
      <td><code>showIconInRow</code></td>
      <td>Show weather icon in each hourly row<br>
        <br><b>Possible values:</b> <code>true</code> = Display icon in row, <code>false</code> = Do not display icon in row
        <br><b>Default value:</b> <code>true</code>
      </td>
    </tr>
    <tr>
      <td><code>language</code></td>
      <td>The language of the weather text.<br>
        <br><b>Possible values:</b> <code>en</code>, <code>nl</code>, <code>ru</code>, etc ...
        <br><b>Default value:</b> uses value of <i>config.language</i>
      </td>
    </tr>
    <tr>
      <td><code>updateInterval</code></td>
      <td>How often does the content needs to be fetched? (Milliseconds)<br>
        <br>metoffice TODO enforces a TODO request limit, so if you run your mirror constantly, anything below 90,000 (every 1.5 minutes) may require payment information or be blocked.<br>
        <br><b>Possible values:</b> <code>1000</code> - <code>86400000</code>
        <br><b>Default value:</b> <code>600000</code> (10 minutes)
      </td>
    </tr>    
    <tr>
      <td><code>animationSpeed</code></td>
      <td>Speed of the update animation. (Milliseconds)<br>
        <br><b>Possible values:</b><code>0</code> - <code>5000</code>
        <br><b>Default value:</b> <code>2000</code> (2 seconds)
      </td>
    </tr>
    <tr>
      <td><code>initialLoadDelay</code></td>
      <td>The initial delay before loading. If you have multiple modules that use the same API key, you might want to delay one of the requests. (Milliseconds)<br>
        <br><b>Possible values:</b> <code>1000</code> - <code>5000</code>
        <br><b>Default value:</b>  <code>0</code>
      </td>
    </tr>    
    <tr>
      <td><code>retryDelay</code></td>
      <td>The delay before retrying after a request failure. (Milliseconds)<br>
        <br><b>Possible values:</b> <code>1000</code> - <code>60000</code>
        <br><b>Default value:</b>  <code>2500</code>
      </td>
    </tr>    
    <tr>
      <td><code>maxHoursForecast TODO change name</code></td>
      <td>Limit how many ROWS to show in forecast. Data is for 3 hour intervals so 8x3 = 1 full day)<br>
        <br><b>Default value:</b>  <code>8</code>
      </td>
    </tr>    
    showHighWinds: true, // show a windy icon if Speed or gust is over the limits windGustOver OR windSpeedOver
    windGustOver: 40,
    windSpeedOver: 20,
    showWindSpeed: true,
    showWindGust: false,
    showWindUnits: false,
    showWindDirection: true,
    </tbody>

			units: config.units,
			language: config.language,
    	twentyFourHourTime: true,
    showCurrent: false, // for the moment not available in metoffice (no weather warnings neither!
    showSummary: true,
    	showPrecipitationPossibilityInRow: true,
    	showDayInRow: true,
    	showIconInRow: true,
    	updateInterval: 10 * 60 * 1000, // every 10 minutes
    	animationSpeed: 1000,
    	initialLoadDelay: 0, // 0 seconds delay
    	retryDelay: 2500,
    tempDecimalPlaces: 0, // round temperatures to this many decimal places
    geoLocationOptions: {
      enableHighAccuracy: true,
      timeout: 5000
    },
    latitude:  null,
    longitude: null,
    	maxHoursForecast: 8,   // maximum number of rows (3 hour intervals so 8 = 1 full day) to show in forecast
    showHighWinds: true, // show a windy icon if Speed or gust is over the limits windGustOver OR windSpeedOver
    windGustOver: 40,
    windSpeedOver: 20,
    showWindSpeed: true,
    showWindGust: false,
    showWindUnits: false,
    showWindDirection: true,