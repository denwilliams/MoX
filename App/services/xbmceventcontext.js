define(
['services/xbmccontext'],
function(xbmc) 
{
	var events = {
		onSystemEvent: xbmc.controller.onSystemEvent,
		onPlayerEvent: xbmc.controller.onPlayerEvent,
		onPlaylistEvent: xbmc.controller.onPlaylistEvent,
		onWeatherChanged: xbmc.controller.monitorWeather,
		onVolumeChanged: xbmc.controller.onVolumeChanged,
	};

	return events;
	
	// ------------------------------------------------------
	
});