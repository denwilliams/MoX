window.Xbmc = window.Xbmc || {};

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
			_onFailedInit();
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
								_onFailedInit();
								//console.error('Xbmc.HttpApi failed');
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
					_onFailedInit();
					//console.error('Xbmc.HttpApi failed');
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

	/**
	 * Event handler for failed XBMC initialisation
	 */
	function _onFailedInit() {
		_settings.onFail();
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
			properties: Xbmc.Properties.artistPartial
		}, callback, undefined, 'perm', forceRefresh);
	};
	
	/**
	 * Gets the specified artist details in XBMC. 
	 * Artists will be returned from session cache. 
	 * If you wish to retrieve a fresh list, specify the forceRefresh param.
	 * @param {number} artistId - The ID of the artist
	 * @param {function} callback - Function to call on completion
	 * @param {boolean} [forceRefresh=false] - Refresh the cached set
	 */
	this.getArtist = function(artistId, callback, forceRefresh) {
		self.AudioLibrary.GetArtistDetails({
			artistid: artistId,
			properties: Xbmc.Properties.artistFull
		}, callback, undefined, 'sess', forceRefresh);
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
			properties: Xbmc.Properties.albumPartial
		}, callback, undefined, 'sess', forceRefresh);
	};


	this.getRecentAlbums = function(callback, limit) {
		self.AudioLibrary.GetRecentlyAddedAlbums({
			properties: Xbmc.Properties.albumPartial, 
			//sort: {method: 'title', ignorearticle: true},
			limits: {start:0, end: limit || 25},
		}, callback, undefined, 'none', false);
	};

	/**
	 * Gets album details for the specified album.
	 * @param {number} albumId - The album to get the details for
	 * @param {function} callback - The callback function to use when complete
	 * @param {boolean} forceRefresh - Refresh the cached set
	 */
	this.getAlbum = function(albumId, callback, forceRefresh) {
		self.AudioLibrary.GetAlbumDetails({
			albumid: albumId,
			properties: Xbmc.Properties.albumFull
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
			properties: Xbmc.Properties.songPartial
		}, callback, undefined, 'sess', forceRefresh);
	};
	
	/* (((( MOVIES )))) */
	
	this.getMovies = function(callback, forceRefresh) {
		self.VideoLibrary.GetMovies({
			properties: Xbmc.Properties.moviePartial, 
			sort:{method: 'title', ignorearticle: true}
		}, callback, undefined, 'perm', forceRefresh);
	};
	
	this.getMovie = function(movieid, callback, forceRefresh) {
		self.VideoLibrary.GetMovieDetails(
			{movieid:movieid, properties: Xbmc.Properties.movieFull}, 
			callback, undefined, 'sess', forceRefresh
		);
	};

	this.getRecentMovies = function(callback, limit) {
		self.VideoLibrary.GetRecentlyAddedMovies({
			properties: Xbmc.Properties.moviePartial, 
			//sort: {method: 'title', ignorearticle: true},
			limits: {start:0, end: limit || 25},
		}, callback, undefined, 'none', false);
	};
	
	this.playMovie = function(movieid) {
		self.playlist.clear();
		self.playlist.addMovie(movieid);
		self.playPlaylist();
	};
		
	/* (((( TV )))) */

	this.getTvShows = function(callback, forceRefresh) {
		self.VideoLibrary.GetTVShows(
			{properties: Xbmc.Properties.tvshowPartial}
			, callback, undefined, 'perm', forceRefresh);
	}

	this.getTvShow = function(tvshowId, callback, forceRefresh) {
		self.VideoLibrary.GetTVShowDetails({
			tvshowid: tvshowId,
			properties: Xbmc.Properties.tvshowFull
		}, callback, undefined, 'sess', forceRefresh);
	}
	
	this.getTvSeasons = function(tvshowid, callback, forceRefresh) {
		self.VideoLibrary.GetSeasons({
			tvshowid: tvshowid,
			properties: Xbmc.Properties.seasonPartial
		}, callback, undefined, 'sess', forceRefresh);
	}
			
	this.getTvEpisodes = function(tvshowid, season, callback, forceRefresh) {
		self.VideoLibrary.GetEpisodes({
			tvshowid:tvshowid,
			season:season,
			properties: Xbmc.Properties.episodePartial
		}, callback, undefined, 'sess', forceRefresh);
	}

	this.getRecentEpisodes = function(callback, limit) {
		self.VideoLibrary.GetRecentlyAddedEpisodes({
			properties: Xbmc.Properties.episodePartial, 
			//sort: {method: 'title', ignorearticle: true},
			limits: {start:0, end: limit || 25},
		}, callback, undefined, 'none', false);
	};
			
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

	function Players(xbmcController, playlists) {
		var self = this;
		var _xbmc = xbmcController;

		this.audio = this['0'] = new Player(0, 'audio', _xbmc, playlists.audio);
		this.video = this['1'] = new Player(1, 'video', _xbmc, playlists.video);
		this.pictures = this['2'] = new Player(2, 'pictures', _xbmc, playlists.pictures);

		this.getActivePlayers = function(callback) {
			_xbmc.Player.GetActivePlayers({}, function(items) {
				var players = [];
				for (var i = 0; i < items.length; i++) {
					players.push(self[items[i].playerid]);
				}
				if (typeof callback == 'function') {
					callback(players);
				}
			}, false);
		};
	}
	
	this.players = new Players(this, this.playlists);
	
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
		//_api.subscribe('System.OnRestart', function(data) {callback({event: 'restart', data: data})});
		
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
	this.addDirectory = function(directory) {
		_xbmc.Playlist.Add({
			playlistid: id,
			item : { directory: directory }
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
		this.addArtist = function(artistid) {
			_xbmc.Playlist.Add({
				playlistid: id,
				item : { artistid: artistid }
			},null,false);
		}
		this.addAlbum = function(almbumid) {
			_xbmc.Playlist.Add({
				playlistid: id,
				item : { albumid: almbumid }
			},null,false);
		}
		this.addSong = function(songid) {
			_xbmc.Playlist.Add({
				playlistid: id,
				item : { songid: songid }
			},null,false);
		}
		this.addGenre = function(genreid) {
			_xbmc.Playlist.Add({
				playlistid: id,
				item : { genreid: genreid }
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

		this.playArtist = function(artistid) {
			self.playlist.clear();
			self.playlist.addArtist(artistid);
			self.playPlaylist();
		};
		this.playAlbum = function(almbumid) {
			self.playlist.clear();
			self.playlist.addAlbum(almbumid);
			self.playPlaylist();
		};
		this.playSong = function(songid) {
			self.playlist.clear();
			self.playlist.addSong(songid);
			self.playPlaylist();
		};
		this.playGenre = function(genreid) {
			self.playlist.clear();
			self.playlist.addGenre(genreid);
			self.playPlaylist();
		};
		/** Gets a string representation of the currently playing item */
		this.getCurrentItemName = function(callback) {
			_xbmc.getLabels(['MusicPlayer.Title', 'MusicPlayer.Artist'], function(response) {
				callback(response['MusicPlayer.Title'] + ' - ' + response['MusicPlayer.Artist']);
			});
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
		/** Gets a string representation of the currently playing item */
		this.getCurrentItemName = function(callback) {
			_xbmc.getLabels(['VideoPlayer.Title'], function(response) {
				callback(response['VideoPlayer.Title']);
			});
		};
	} else { //pictures
		/** Gets a string representation of the currently playing item */
		this.getCurrentItemName = function(callback) {
			_xbmc.getLabels(['Player.Title'], function(response) {
				callback(response['Player.Title']);
			});
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

	this.seek = {
		/**
		 * Seeks to the specified percentage
		 */
		toPercentage: function(percentage) {
			_xbmc.Player.Seek({
				playerid: id, 
				value: percentage,
			}, null, false);
		},
		/**
		 * Seeks to the specified time
		 */
		toTime: function(hours, minutes, seconds) {
			_xbmc.Player.Seek({
				playerid: id, 
				value: {
					hours: hours,
					minutes: minutes,
					seconds: seconds,
					milliseconds: 0
				},
			}, null, false);
		},
		/**
		 * Seeks forward by a predefined amount
		 */
		forward: function(bigJump) {
			if (bigJump) {
				_xbmc.Player.Seek({
					playerid: id, value: 'bigforward',
				}, null, false);
			} else {
				_xbmc.Player.Seek({
					playerid: id, value: 'smallforward',
				}, null, false);
			}
		},
		/**
		 * Seeks backward by a predefined amount
		 */
		backward: function(bigJump) {
			if (bigJump) {
				_xbmc.Player.Seek({
					playerid: id, value: 'bigbackward',
				}, null, false);
			} else {
				_xbmc.Player.Seek({
					playerid: id, value: 'smallbackward',
				}, null, false);
			}
		}
	};

	/**
	 * Sets the repeat mode - 'off', 'one', 'all'
	 */
	this.setRepeat = function(repeat) {
		_xbmc.Player.SetRepeat({playerid: id, repeat: repeat}, null, false);
	}

	/**
	 * Sets the shuffle mode - true/false
	 */
	this.setShuffle = function(shuffle) {
		_xbmc.Player.SetRepeat({playerid: id, shuffle: shuffle}, null, false);
	}

	/**
	 * Toggles the shuffle mode on or off
	 */
	this.toggleShuffle = function() {
		_xbmc.Player.SetRepeat({playerid: id, shuffle: 'toggle'}, null, false);
	}

	/**
	 * Sets the play speed (fastforward/rewind) mode - 1 (normal), 2, 4, 8, -2, -4, -8
	 */
	this.setSpeed = function(speed) {
		_xbmc.Player.SetSpeed({playerid: id, speed: speed}, null, false);
	}

	/**
	 * Gets all properties available for the current player
	 */
	this.getDetails = function(callback) {
		_xbmc.Player.GetProperties({
			playerid: id,
			properties: [
				"type",
				"partymode",
				"speed",
				"time",
				"percentage",
				"totaltime",
				"playlistid",
				"position",
				"repeat",
				"shuffled",
				"canseek",
				"canchangespeed",
				"canmove",
				"canzoom",
				"canrotate",
				"canshuffle",
				"canrepeat",
				"currentaudiostream",
				"audiostreams",
				"subtitleenabled",
				"currentsubtitle",
				"subtitles",
				"live"
		    ]
		}, callback, false);
	};

	/**
	 * Gets the current progress (time) for the currently playing item
	 */
	this.getProgress = function(callback) {
		_xbmc.Player.GetProperties({
			playerid: id,
			properties: [
				"time",
				"percentage",
				"totaltime",
		    ]
		}, callback, false);
	};
}


