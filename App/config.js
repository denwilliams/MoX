define(
[],
function() {
	var settings = getSettings()
	, xbmcHost = getXbmcHost()
	, xbmcPort = getXbmcPort()
	, routes = [
		{
			url: 'dashboard',
			visible: true
		// },{
		// 	url: 'flickr',
		// 	visible: true
		},{
            url:'tv', //the only required parameter,
            name: 'TV', //if not supplied, router.convertRouteToName derives it
            moduleId: 'viewmodels/tv', //if not supplied, router.convertRouteToModuleId derives it
            //caption: 'Optional Caption', //derived from name if not present
            //settings: {}, //your custom info, set to empty object if not provided
            //hash: '#/flickr', //calculated
            visible: true, //from calling mapNav instead of mapRoute
            //isActive: ko.computed //only present on visible routes to track if they are active in the nav
        },{
            url: 'movies',
            name: 'Movies',
            moduleId: 'viewmodels/movies',
            visible: true,
        },{
            url: 'music',
            name: 'Music',
            moduleId: 'viewmodels/music',
            visible: true,
        },{
        	url: 'weather',
        	name: 'Weather',
        	moduleId: 'viewmodels/weather',
        	visible: false
        },{
	        url: 'artist/:id',
	        name: 'Artist',
	        moduleId: 'viewmodels/artist',
	        visible: false
        },{
	        url: 'album/:id',
	        name: 'Album',
	        moduleId: 'viewmodels/album',
	        visible: false
        },{
	        url: 'show/:id',
	        name: 'TV Show',
	        moduleId: 'viewmodels/show',
	        visible: false
        },{
	        url: 'season/:tvshowid/:season',
	        name: 'TV Season',
	        moduleId: 'viewmodels/season',
	        visible: false
        }
    ], logOptions = {
		
	}, urlGenerator = {
		forArtist: function(artistId) {
			return '#/artist/'+artistId;
		},
		forAlbum: function(albumId) {
			return '#/album/'+albumId;			
		},
		forTvShow: function(tvShowId) {
			return '#/show/'+tvShowId;
		},
		forTvSeason: function(tvSeriesId, season) {
			return '#/season/'+ tvSeriesId + '/' + season;
		},
		forTvEpisode: function(tvEpisodeId) {
			return '#/episode/'+ tvEpisodeId;
		},
		forMovie : function(movieId) {
			return '#/movie/'+movieId;
		},
		forImage : function(image) {
			return 'http://'+xbmcHost+':'+xbmcPort+'/image/'+encodeURIComponent(image);
		},
		forImdb: function(imdbId) {
			return "http://www.imdb.com/title/"+imdbId+"/"
		},
	}, config = {
		appTitle: 'MoX',
		rootModule: 'viewmodels/shell',
		transition: 'entrance',
		startModule: 'dashboard',
		loadingText: 'Loading...',
		routes: routes,
		url: urlGenerator,
		logOptions: logOptions,
		xbmcHost: xbmcHost,
		xbmcHttpPort: xbmcPort,
		
		setHost: setXbmcHost,
		setPort: setXbmcPort,
	};

	return config;
	
	function getXbmcHost() {
		var key = 'xbmc.host',
			host = getSetting(key);
		if (host == undefined) {
			host = window.location.host || '192.168.0.';
			host = prompt('XBMC Hostname or IP',host);
			setSetting(key,host);
		}
		return host;
	}
	
	function getXbmcPort() {
		var key = 'xbmc.port',
			port = getSetting(key);
		if (port == undefined) {
			port = '8080';
			port = prompt('XBMC HTTP Port (typically 8080)',port);
			setSetting(key,port);
		}
		return port;
	}
	
	function setXbmcHost(newHost) {
		setSetting('xbmc.host',newHost);
	}
	
	function setXbmcPort(newPort) {
		setSetting('xbmc.port',newPort);
	}
	
	function getSetting(key) {
		if (settings == undefined) {
			settings = getSettings();
		}
		return settings[key];
	}
	
	function setSetting(key,value) {
		settings[key] = value;
		saveSettings(settings);
	}
	
	function getSettings() {
		var cacheObj = localStorage['settings'];
        if (typeof cacheObj === 'string' && cacheObj !== 'undefined') {
            var obj = JSON.parse(cacheObj);
            return obj;
        } else {
            return {};
        }
	};
	
	function saveSettings(settings) {
		localStorage['settings'] = JSON.stringify(settings);	
	};

});