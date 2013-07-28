define(
['config','services/xbmcdatacontext'],
function(config, xbmc){
	var vm = {
		displayName: 'Configuration',
		description: 'Configure MoX',
		host: ko.observable(config.xbmcHost),
		port: ko.observable(config.xbmcHttpPort),
		clearCache: clearCache,
		save: saveSettings,
	}
	return vm;
	
	function clearCache() {
		xbmc.clearCache();
	}
	
	function saveSettings() {
		config.setHost(vm.host());
		config.setPort(vm.port());
	}
});