window.Xbmc = window.Xbmc || {};

Xbmc.Properties = {
	artist: [
		//"instrument", 
		//"style", 
		//"mood", 
		"born", 
		"formed", 
		"description", 
		"genre", 
		"died", 
		"disbanded", 
		"yearsactive", 
		//"musicbrainzartistid", 
		//"fanart", 
		"thumbnail"
	], album: [
		//"title", 
		//"description", 
		"artist", 
		"genre", 
		//"theme", 
		//"mood", 
		//"style", 
		//"type", 
		"albumlabel", // music label
		"rating", 
		"year", 
		//"musicbrainzalbumid", 
		//"musicbrainzalbumartistid", 
		//"fanart", 
		"thumbnail", 
		"playcount", 
		"genreid", //increases response time
		"artistid", //increases response time
		"displayartist"
	], song: [
		//"title", 
		//"artist", 
		//"albumartist", 
		"genre", 
		//"year", 
		"rating", 
		//"album", 
		"track", 
		"duration", 
		//"comment", 
		//"lyrics", 
		//"musicbrainztrackid", 
		//"musicbrainzartistid", 
		//"musicbrainzalbumid", 
		//"musicbrainzalbumartistid", 
		"playcount", 
		//"fanart", 
		//"thumbnail", 
		//"file", 
		//"albumid", 
		"lastplayed", 
		"disc", 
		//"genreid", //increases response time
		//"artistid", //increases response time
		"displayartist"//, 
		//"albumartistid" //increases response time
	], tvshow: [
		//"title", 
		"genre", 
		"year", 
		"rating", 
		"plot", 
		"studio", 
		//"mpaa", 
		//"cast", //increases response time
		"playcount", 
		//"episode", 
		"imdbnumber", 
		"premiered", 
		//"votes", 
		//"lastplayed", 
		//"fanart", 
		"thumbnail", 
		//"file", 
		//"originaltitle", 
		"sorttitle", 
		//"episodeguide", 
		//"season", 
		//"watchedepisodes", 
		//"dateadded", 
		//"tag", 
		//"art"
	], season: [
		"season", 
		//"showtitle", 
		//"playcount", 
		//"episode", 
		//"fanart", 
		"thumbnail", 
		//"tvshowid", 
		"watchedepisodes", 
		//"art"
	], episode: [
		//"title", 
		"plot", 
		//"votes", 
		"rating", 
		"writer", 
		"firstaired", 
		"playcount", 
		"runtime", 
		"director", 
		"productioncode", 
		"season", 
		"episode", 
		//"originaltitle", 
		//"showtitle", 
		//"cast", 
		"streamdetails", 
		//"lastplayed", 
		//"fanart", 
		"thumbnail", 
		//"file", 
		"resume", 
		//"tvshowid", 
		//"dateadded", 
		//"uniqueid", 
		//"art"
	], movie: [
		//"title", 
		"genre", 
		"year", 
		"rating", 
		"director", 
		//"trailer", 
		"tagline", 
		//"plot", 
		"plotoutline", 
		//"originaltitle", 
		//"lastplayed", 
		"playcount", 
		"writer", 
		"studio", 
		//"mpaa", 
		//"cast", // slows down load time
		"country", 
		"imdbnumber", 
		"runtime", 
		//"set", 
		//"showlink", // slows down load time
		"streamdetails", 
		//"top250", 
		//"votes", 
		//"fanart", 
		"thumbnail", 
		//"file", 
		"sorttitle", 
		"resume"//, 
		//"setid", 
		//"dateadded", 
		//"tag", // slows down load time
		//"art"
	], movieset: [
		"title", 
		"playcount", 
		//"fanart", 
		"thumbnail", 
		//"art"
	], genre: [
		"title", 
		"thumbnail"
	]
};

Xbmc.Controller = function(options) {
	var self = this;
	
	var _initialised = false; // not yet initialised
	var _protocol = null; // not yet defined
	
	var _settings = _extend({
		host: 'localhost'
		,port: 8080
		,onInit: function() { _debug('Xbmc Controller Initialised'); }
		,onFail: function() { console.error('Xbmc Controller failed to init'); }
		,onOnline: function() { _debug('Xbmc is online'); }
		,onOffline: function() { _debug('Xbmc is offline'); }
		,protocol: 'auto'
		,defaultCache: 'none'
	},options || {});

	
	var _api = null;
	var _cachedApi = null;
	
	/**
	 * Constructor
	 */
	function _init() {
		if (typeof Xbmc.CachedQueryController !== 'function') {
			console.error('Xbmc.CachedQueryController required');
			return;
		}
		if (Xbmc.WebSocketsApi.isAvailable()) {
			_tryWebSockets(
				function() {
					// SUCCESS
					if (_initialised === true) {
						_settings.onOnline();
					} else {
						_onInit();
					}
				}, function() {
					// FAIL
					if (_initialised === true) { // web sockets WAS working... just a dropout
						_settings.onOffline();
					} else { // web sockets might be disabled... try HTTP
						_tryHttp(
							function() {
								_onInit();
							}, function() {
								console.error('Xbmc.HttpApi failed');
							}
						);
					}
				}
			);
		} else if (Xbmc.HttpApi.isAvailable()) {
			_tryHttp(
				function() {
					_onInit();
				}, function() {
					console.error('Xbmc.HttpApi failed');
				}
			);
		}
	}
	
	/**
	 * Event handler for XBMC initialisation
	 */
	function _onInit() {
		_applyCache();
		_addMethods(function() {
/*
			self.JSONRPC.SetConfiguration({
				notifications: {
					gui:true,other:true,input:true,videolibrary:true,
					audiolibrary:true,playlist:true,system:true,
					player:true,application:true
				}
			});
*/

			_initialised = true;
			_settings.onInit();	
			_settings.onOnline();
		});
	}

	function _tryWebSockets(onSuccess, onError) {
		if (typeof Xbmc.WebSocketsApi !== 'function') {
			onError();
			return;
		}
		_debug('Attempting to use web sockets');
		_api = new Xbmc.WebSocketsApi({
			host:_settings.host
			, onConnected: function() { 
				_protocol = 'ws';
				onSuccess(); 
			}, onDisconnected: function() { 
				onError(); 
			}
		});
	}
	function _tryHttp(onSuccess, onError) {
		if (typeof Xbmc.HttpApi !== 'function') {
			onError();
			return;
		}
		_debug('Attempting to use HTTP');
		_api = new Xbmc.HttpApi({
			host:_settings.host
			, port:_settings.port
			, onConnected: function() { 
				_protocol = 'http';
				onSuccess(); 
			}, onDisconnected: function() { 
				onError(); 
			}
		});		
	}
	function _applyCache() {
		if (typeof Xbmc.CachedQueryController === 'function') {
			_cachedApi = new Xbmc.CachedQueryController(_api);
		}
	}
	
	/** Outputs a message to the console if window.DEBUG === true */
	function _debug(message) {
		if (Xbmc.DEBUG === true)
			console.log(message);
	}
	
	/** 
	 * Overwrites properties in object a with like-named properties in object b. 
	 * Properties that do not exist in a will not be copied. 
	 */
	function _extend(a,b) {
		for(var key in b)
		   if(a.hasOwnProperty(key))
				a[key] = b[key];
		return a;
	}

	
	/**
	 * Creates shortcut methods for all commands
	 */
	function _addMethods(callback) {
		_api.call('JSONRPC.introspect', {}, function(response) {
				if (response.methods) {
					var xbmcMethods = response.methods;

					for ( var methodName in xbmcMethods ) {
						if (methodName) {
							var parts = methodName.split('.');
							_addMethod(methodName);
						}
					}
				} else {
					console.error('Failed to retrieve methods');
				}
				callback();
			}, function (error) {
				console.error('Failed to retrieve methods');
				callback();
			}
		);
	}

	/**
	 * Creates a method shortcut for the specified associated XBMC API method
	 * @param {string} namespace - The namespace for the command
	 * @param {string} commandName - The name of the command
	 */
	function _addMethod(methodName) {
		var parts = methodName.split('.');
		if (2 == parts.length) {
			var namespace = parts[0];
			var commandName = parts[1];
			// create namespace if required
			if (self[namespace] == undefined) self[namespace] = {};
			var objNs = self[namespace];
			var defaultCache = 'none';
			if (namespace == 'AudioLibrary' || namespace == 'VideoLibrary') {
				defaultCache = 'sess';
			}
			
			objNs[commandName] = function(params, onSuccess, onError, useCache, forceRefresh) {
				return _cachedApi.call(methodName, params || {}, onSuccess, onError, useCache || defaultCache, forceRefresh);
			};
		}
	}	
	
	/* #### PUBLIC #### */
	
	this.clearCache = function() {
		_cachedApi.clearCache();	
	};
	
	//*************************************************************************
	//* Public XBMC Helper Methods
	//*************************************************************************


	/* (((( SYSTEM )))) */
	
	/** 
	 * Gets the name of the XBMC instance
	 * usage: getName(function(name) { alert('the name is '+name); });
	 * @param {function} callback
	 */
	this.getName = function(callback) {
		var name = '';
		self.Application.GetProperties({properties: ['name']}
			, function(response) { callback(response.name); }
			, function() { callback('Error'); }
			, 'sess'
		);
	};

	/**
	 * Returns {major:12,minor:2,revision:'',tag:'stable'}
	 * @param {function} callback
	 */
	this.getVersion = function(callback) {
		var version = '';
		self.Application.GetProperties({properties: ['version']}
			, function(response) { callback(response.version); }
			, function() { callback(0); }
			, 'sess'
		);
	};
	
	/**
	 * Sends a notification to be displayed on the XBMC GUI
	 * @param {string} title
	 * @param {string} message
	 * @param {string} [image='info']
	 * @param {number} [displaytime=5000]
	 */
	this.sendNotification = function(title, message, image, displaytime) {
		if (image == undefined) image = 'info';
		if (displaytime == undefined) displaytime = 5000;
		self.GUI.ShowNotification(
			{title:title,message:message,image:image,displaytime:displaytime}
			,null,null,'none'
		);
	};
	
	/**
	 * Given one or more info labels, retrieve and return them
	 * @param labels One or more labels. Accepts string or array
	 */
	this.getLabels = function(labels, callback) {
		var singleLabel = false;

		if (!(labels instanceof Array)) {
			labels = new Array(labels);
			singleLabel = true;
		}

		//	Make the call...
		self.XBMC.GetInfoLabels({labels : labels}, callback);

	};
	
	/* (((( AUDIO )))) */
	
	/**
	 * Gets a list of artists in XBMC. 
	 * Artists who only appear in compilations will not be returned.
	 * Artists will be returned from permanent cache. 
	 * If you wish to retrieve a fresh list, specify the forceRefresh param.
	 * @param {function} callback - Function to call on completion
	 * @param {boolean} [forceRefresh=false] - Refresh the cached set
	 */
	this.getArtists = function(callback, forceRefresh) {
		self.AudioLibrary.GetArtists({
			albumartistsonly: true,
			//limits: {start: 0, end: 5},
			sort: {order: 'ascending', ignorearticle: true, method: 'artist'},
			//filter: {label:'paul'},
			properties: Xbmc.Properties.artist
		}, callback, undefined, 'perm', forceRefresh);
	};
	
	/**
	 * Gets a list of albums available for the specified artist.
	 * @param {number} artistId - The artist to get the albums for
	 * @param {function} callback - The callback function to use when complete
	 * @param {boolean} forceRefresh - Refresh the cached set
	 */
	this.getAlbumsByArtist = function(artistId, callback, forceRefresh) {
		self.AudioLibrary.GetAlbums({
			filter:{artistid: artistId},
			properties: Xbmc.Properties.album
		}, callback, undefined, 'sess', forceRefresh);
	};
	/**
	 * Gets a list of tracks/songs within the specified album.
	 * @param {number} albumId - The album to get the tracks for
	 * @param {function} callback - The callback function to use when complete
	 * @param {boolean} forceRefresh - Refresh the cached set
	 */
	this.getSongsByAlbum = function(albumId, callback, forceRefresh) {
		self.AudioLibrary.GetSongs({
			filter:{albumid: albumId},
			sort:{method: 'track'},
			properties: Xbmc.Properties.song
		}, callback, undefined, 'sess', forceRefresh);
	};
	
	/* (((( MOVIES )))) */
	
	this.getMovies = function(callback, forceRefresh) {
		self.VideoLibrary.GetMovies({
			properties: Xbmc.Properties.movie, 
			sort:{method: 'title', ignorearticle: true}
		}, callback, undefined, 'perm', forceRefresh);
	};
	
	this.getMovie = function(movieid, callback, forceRefresh) {
		self.VideoLibrary.GetMovieDetails(
			{movieid:movieid, properties: Xbmc.Properties.movie}, 
			callback, undefined, 'sess', forceRefresh
		);
	};
	
	this.playMovie = function(movieid) {
		self.playlist.clear();
		self.playlist.addMovie(movieid);
		self.playPlaylist();
	};
		
	/* (((( TV )))) */

	this.getTvShows = function(callback, forceRefresh) {
		self.VideoLibrary.GetTVShows(
			{properties: Xbmc.Properties.tvshow}
			, callback, undefined, 'perm', forceRefresh);
	}
	
	this.getTvSeasons = function(tvshowid, callback, forceRefresh) {
		self.VideoLibrary.GetSeasons({
			tvshowid: tvshowid,
			properties: Xbmc.Properties.season
		}, callback, undefined, 'sess', forceRefresh);
	}
			
	this.getTvEpisodes = function(tvshowid, season, callback, forceRefresh) {
		self.VideoLibrary.GetEpisodes({
			tvshowid:tvshowid,
			season:season,
			properties: Xbmc.Properties.episode
		}, callback, undefined, 'sess', forceRefresh);
	}
			
	/* (((( PLAYLISTS )))) */
	
	this.playlists = {
		0: new Playlist(0, 'audio', self) 
		,1: new Playlist(1, 'video', self)  
		,2: new Playlist(2, 'pictures', self)  
	};
	this.playlists.audio = this.playlists['0'];
	this.playlists.video = this.playlists['1'];
	this.playlists.pictures = this.playlists['2'];
	
	
	/* (((( PLAYERS )))) */
	
	this.players = {
		0: new Player(0, 'audio', self, this.playlists.audio) 
		,1: new Player(1, 'video', self, this.playlists.video)  
		,2: new Player(2, 'pictures', self, this.playlists.pictures)  
	};
	this.players.audio = this.players['0'];
	this.players.video = this.players['1'];
	this.players.pictures = this.players['2'];
	
	/**
	 * Mutes or unmutes XBMC
	 * @param {boolean} mute - whether to mute (true) or unmute (true)
	 * @param {function} callback
	 */
	this.setMute = function(mute, callback) { 
		self.Application.SetMute({mute: mute}, callback);
	};
	
	/**
	 * Changes the volume in XBMC
	 * @param {boolean} mute - whether to mute (true) or unmute (true)
	 * @param {function} callback
	 */
	this.setVolume = function(volume, callback) { 
		self.Application.SetVolume({volume: volume}, callback);
	};
	
	/**
	 *
	 */
	this.getVolume = function(callback) {
		//var currentVol = self.volume;
		//var currentMute = self.muted;
		//self.Application.GetProperties({properties: ['volume', 'muted']}, function(response) {
		//	self.volume = response.volume;
		//	self.muted = response.muted;
		//}, false);
		//if (currentVol != self.volume || currentMute != self.muted) {
		//	notifyVolumeChanged();
		//}
		//return self.volume;
		self.Application.GetProperties({properties: ['volume', 'muted']}, callback, false);
	};
	
	
	/* (((( WEATHER )))) */
	
	var _weatherTimer = null;

	this.getWeather = function(callback) {
		var labels = [
			'Weather.Conditions'
			,'Weather.Temperature'
		];
		self.getLabels(labels, callback);
	};
	
	this.monitorWeather = function(callback) {
		var conditions = '';
		var temperature = 0;
		var checkWeatherChanged = function(result) {
			if (conditions != result['Weather.Conditions'] || temperature != result['Weather.Temperature']) {
				conditions = result['Weather.Conditions'];
				temperature = result['Weather.Temperature'];
				if (typeof callback === 'function') {
					callback({conditions:result['Weather.Conditions'], temperature:result['Weather.Temperature']});
				}
			}
		}
		_weatherTimer = setInterval(function(){
			self.getWeather(checkWeatherChanged);
		},60000);
		self.getWeather(checkWeatherChanged);
	};

	//*************************************************************************
	//* Helper Events
	//*************************************************************************

	/**
	 * Subscribes the callback on the volume changed event. 
	 * The callback will be passed a value like {volume: 100, muted: true}
	 * {function} callback - The function to add as a callback
	 */
	this.onVolumeChanged = function(callback) {
		_api.subscribe('Application.OnVolumeChanged', callback);
	};
	
	/**
	 * Subscribes the callback to a variety of player events. 
	 * The callback will be passed a value containing 2 properties - event and data.
	 * Example: {event: 'pause', data: {player: 1, item: {...}}}
	 * Possible events:
	 *  play - 
	 *  pause - 
	 *  stop - 
	 *  property - 
	 *  seek - 
	 *  speed -
	 * {function} callback - The function to add as a callback
	 */
	this.onPlayerEvent = function(callback) {
		_api.subscribe('Player.OnPlay', function(response) {callback({event: 'play', data: response})});
		_api.subscribe('Player.OnPause', function(response) {callback({event: 'pause', data: response})});
		_api.subscribe('Player.OnStop', function(response) {callback({event: 'stop', data: response})});
		_api.subscribe('Player.OnPropertyChanged', function(response) {callback({event: 'property', data: response})});
		_api.subscribe('Player.OnSeek', function(response) {callback({event: 'seek', data: response})});
		_api.subscribe('Player.OnSpeedChanged', function(response) {callback({event: 'speed', data: response})});
	};
	
	/**
	 * Subscribes the callback to a variety of playlist events. 
	 * The callback will be passed a value containing 2 properties - event and data.
	 * Example: {event: 'add', data: {player: 1, item: {...}}}
	 * Possible events:
	 *  add - 
	 *  remove - 
	 *  clear - 
	 * {function} callback - The function to add as a callback
	 */
	this.onPlaylistEvent = function(callback) {
		_api.subscribe('Player.OnAdd', function(response) {callback({event: 'add', data: response})});
		_api.subscribe('Player.OnRemove', function(response) {callback({event: 'remove', data: response})});	
		_api.subscribe('Player.OnClear', function(response) {callback({event: 'clear', data: response})});
	};
	
	/**
	 * Subscribes the callback to a variety of system events. 
	 * The callback will be passed a value containing 2 properties - event and data.
	 * Example: {event: 'pause', data: {}}
	 * Possible events:
	 *  add - 
	 *  remove - 
	 *  clear - 
	 * {function} callback - The function to add as a callback
	 */
	this.onSystemEvent = function(callback) {
		_api.subscribe('System.OnLowBattery', function(data) {callback({event: 'battery', data: data})});
		_api.subscribe('System.OnQuit', function(data) {callback({event: 'quit', data: data})});
		_api.subscribe('System.OnRestart', function(data) {callback({event: 'restart', data: data})});
		_api.subscribe('System.OnSleep', function(data) {callback({event: 'sleep', data: data})});
		_api.subscribe('System.OnWake', function(data) {callback({event: 'wake', data: data})});
		_api.subscribe('System.OnRestart', function(data) {callback({event: 'restart', data: data})});
		
	}

	//*************************************************************************
	//* XBMC API Interface Methods (passthrough)
	//*************************************************************************

	this.call = function(method, params, onSuccess, onError, useCache) {
		return _cachedApi(method, params, onSuccess, onError, useCache);
	};
	
	this.subscribe = function(notification, handler) {
		return _api.subscribe(notification, handler);
	};
	
	this.unsubscribe = function(notification, handler) {
		return _api.unsubscribe(notification, handler);
	};
	
	/* ## Init ## */
	
	// construct
	_init();
};



function Playlist(id, type, xbmcController) {
	var self = this;
	
	var _xbmc = xbmcController;
	
	this.position = 0;
	this.items = [];

	this.clear = function() {
		_xbmc.Playlist.Clear({
			playlistid: id
		},null,false);
	};
	this.addFile = function(fileName) {
		_xbmc.Playlist.Add({
			playlistid: id,
			item : { file: fileName }
		},null,false);
	};
	this.getItems = function(callback) {
		_xbmc.Playlist.GetItems({playlistid: id}, function(response) {
			self.items = response.items;
			//console.log(JSON.stringify(response));
			if (typeof callback == 'function') {
				callback(self.items);
			}
		}, false);
	};
	
	if (type == 'audio') {
		this.addAlbum = function(almbumid) {
			_xbmc.Playlist.Add({
				playlistid: id,
				item : { albumid: almbumid }
			},null,false);
		}
	} else if (type == 'video') {
		this.addMovie = function(movieid) {
			_xbmc.Playlist.Add({
				playlistid: id,
				item : { movieid: movieid }
			},null,false);
		}
		this.addEpisode = function(episodeid) {
			_xbmc.Playlist.Add({
				playlistid: id,
				item : { episodeid: episodeid }
			},null,false);
		}
	}
}

function Player(id, type, xbmcController, playlist) {
	var self = this;
	
	var _xbmc = xbmcController;
	
	this.id = id;
	this.type = type;

	this.active = false;
	this.paused = false;
	this.time = 0;
	this.duration = 0;
	this.progress = 0; // percent

	this.title = '';
	this.year = '';

	this.playlist = playlist;

	this.playFile = function(fileName) {
		_xbmc.Player.Open({
			item: { file: fileName }
		}, null, false);
	};
	if (type == 'audio') {
		this.artist = '';
		this.album = '';
		this.genre = '';

		this.playAlbum = function(almbumid) {
			self.playlist.clear();
			self.playlist.addAlbum(almbumid);
			self.playPlaylist();
		};
	} else if (type == 'video') {
		this.studio = '';
		this.rating = '';
		this.resolution = '';

		this.playMovie = function(movieid) {
			self.playlist.clear();
			self.playlist.addMovie(movieid);
			self.playPlaylist();
		};
		this.playEpisode = function(episodeid) {
			self.playlist.clear();
			self.playlist.addEpisode(episodeid);
			self.playPlaylist();
		};
	}
	this.playPlaylist = function(position) {
		if (position == undefined) position = 0;
		_xbmc.Player.Open({
			item: { playlistid: id, position: position }
		}, null, false);
	};
	this.stop = function () {
		_xbmc.Player.Stop({playerid : id}, null, false);
	};
	this.pause = function () {
		_xbmc.Player.PlayPause({playerid : id}, null, false);
	};
	this.back = function () {
		_xbmc.Player.GoTo({
			playerid : id
			,to: 'previous'
		}, null, false);
	};
	this.forward = function () {
		_xbmc.Player.GoTo({
			playerid : id
			,to: 'next'
		}, null, false);
	};
}

