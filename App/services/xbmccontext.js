define(
['config', 'xbmccachedquerycontroller']
,function(config) 
{
	var xbmc = {
		controller: null,
		init: init,
		ready: false,
	}
	
	return xbmc;
	
	// -------------------------------------------------------
	
	function init() {
		var deferred = $.Deferred();
		xbmc.controller = new Xbmc.Controller({
			host: config.xbmcHost,
			onInit:function() {
				console.log('Xbmc Initialised');
				xbmc.ready = true;
				deferred.resolve();
			}
			,onFail:function() { 
				xbmc.ready = false;
				deferred.reject();
			}	
		});
		return deferred;
	}
})