# MMM-metoffice-datapoint
Magic Mirror Module to pull 3 hourly data from the UK Met Office Datapoint API
This an extension for [MagicMirror](https://github.com/MichMich/MagicMirror) that adds localized weather using the [UK MetOffice Datapoint API](https://www.metoffice.gov.uk/datapoint).

<table>
  <thead><tr><td>default</td><td>compact</td><td>all columns</td></tr></thead>
  <tbody>
    <tr>
      <td><img src="screenshots/metoffice-defaults.png" /></td>
      <td><img src="screenshots/metoffice-defaults-compact.png" /></td>
      <td><img src="screenshots/metoffice-allOn-compact.png" /></td>
    </tr>
  </tbody>
  </table>

This is a heavily modified version of [MMM-darksky-hourly]https://github.com/jacquesCedric/MMM-darksky-hourly) which is itself a hjeavily modded version of another module!
Standing on the Shoulders of Giants

## Using the module

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
      <td><code>compact</code></td>
      <td>a more compact view, adds the compact style to each row, for customization<br>
        e.g. <code>.MMM-metoffice-datapoint .compact {
             line-height: 1.1em;
        }</code>
        <br><b>Default value:</b> <code>false</code>
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
    <tr>
      <td><code>showHighWinds</code></td>
      <td>Show a 'windy' icon if the wind speed or wind gust is over the limits windGustOver OR windSpeedOver<br>
        <br><b>Default value:</b>  <code>true</code>
      </td>
    </tr>    
    <tr>
      <td><code>windGustOver</code></td>
      <td>Used to decide if the winds are 'High'<br>
        <br><b>Default value:</b>  <code>40</code>
      </td>
    </tr>    
    <tr>
      <td><code>windSpeedOver</code></td>
      <td>Used to decide if the winds are 'High'<br>
        <br><b>Default value:</b>  <code>20</code>
      </td>
    </tr>    
    <tr>
      <td><code>showWindSpeed</code></td>
      <td>Show the wind speed column<br>
        <br><b>Default value:</b>  <code>true</code>
      </td>
    </tr>    
    <tr>
      <td><code>showWindGust</code></td>
      <td>Show the wind gust column<br>
        <br><b>Default value:</b>  <code>false</code>
      </td>
    </tr>    
    <tr>
      <td><code>showWindUnits</code></td>
      <td>Show the wind units<br>
        <br><b>Default value:</b>  <code>false</code>
      </td>
    </tr>    
    <tr>
      <td><code>showWindDirection</code></td>
      <td>Show the wind direction arrow<br>
        <br><b>Default value:</b>  <code>true</code>
      </td>
    </tr>    
 </tbody>
</table>
