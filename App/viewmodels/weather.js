define(
[
	'services/xbmcdatacontext'
],
function(xbmcDataContext) {
	var conditions = ko.observable('0deg'),
		temperature = ko.observable('Loading...'),
		vm = {
			conditions: conditions,
			temperature: temperature
		};
		
	xbmcDataContext.weather.get(function(weather) {
		conditions(weather['Weather.Conditions']);
		temperature(weather['Weather.Temperature']);
	});
		
	return vm;
});
