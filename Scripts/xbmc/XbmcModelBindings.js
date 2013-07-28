function XbmcModelBindings(xbmcController, model) {
	var self = this;
	
	var _xbmc = xbmcController;
	var _model = model;

	/**
	 * Constructor
	 */
	function _init() {
		self.startMonitoring();
		_bind();
		_refresh();
	}
	function _bind() {
		/** Redirects to the home page when playing is stopped */
        _model.player.isActive.subscribe(function(newValue) {
            if (newValue === false) {
                _model.ui.setPage('home');
            }
        });
        /** Limit music results to the search term */
        _model.music.searchTerm.subscribe(function(newValue) {
            var searchFor = newValue.toLowerCase();
            $.each(_model.music.visibleArtists(), function(index, value) {
                value.visible(value.label.toLowerCase().indexOf(searchFor) !== -1);
            });
            // var newArray = jlinq.from(self.artists)
            //   .contains('label', newValue)
            //   .select();
            //self.visibleArtists.removeAll();
            //self.visibleArtists.pushAll(newArray);
        });
        /** Limit movies results to the search term */
        _model.movies.searchTerm.subscribe(function(newValue) {
            var searchFor = newValue.toLowerCase();
            $.each(_model.movies.titles(), function(index, value) {
                value.visible(value.label.toLowerCase().indexOf(searchFor) !== -1);
            });
        });
        /** Limit tv results to the search term */
        _model.tv.searchTerm.subscribe(function(newValue) {
            var searchFor = newValue.toLowerCase();
            $.each(_model.tv.shows(), function(index, value) {
                value.visible(value.label.toLowerCase().indexOf(searchFor) !== -1);
            });
        });


	};
	function _refresh() {
		_xbmc.getVolume(_volumeEvent);
		_xbmc.players.audio.playlist.getItems( function(items) { _updatePlaylist(0,items); } );
		_xbmc.players.video.playlist.getItems( function(items) { _updatePlaylist(1,items); } );
		_xbmc.players.pictures.playlist.getItems( function(items) { _updatePlaylist(2,items); } );
		//_xbmc.getWeather(_weatherEvent);
	}
	function _debug(obj) {
		console.log(JSON.stringify(obj));
	}
	function _updatePlaylist(playlistid, items) {
		var p = _model.player[playlistid].playlist;
		p.removeAll();
		if (items)
			p.pushAll(items);
	}
	function _playerEvent(response) {
		_debug(response);
		var event = response.event;
		var data = response.data;
		var itemId = data.item.id;
		var itemType = data.item.type; // eg 'episode'
		switch (event) {
			case 'play':
				var playerid = data.player.playerid; // eg 0
				var playerspeed = data.player.speed; // eg 1
				var player = _model.player[playerid];
				player.active(true);
				player.paused(false);
				player.title(itemId);
				break;
			case 'pause':
				var playerid = data.player.playerid; // eg 0
				var playerspeed = data.player.speed; // eg 1
				var player = _model.player[playerid];
				player.paused(true);
				break;
			case 'stop':
				var end = data.end;
				_model.player['audio'].active(false);
				_model.player['audio'].paused(false);
				_model.player['video'].active(false);
				_model.player['video'].paused(false);
				_model.player['pictures'].active(false);
				_model.player['pictures'].paused(false);
				break;
			case 'seek':
				break;
			case 'property':
				break;
			case 'speed':
				break;
		}
	}
	function _playlistEvent(response) {
		_debug(data);
		var event = response.event;
		var data = response.data;
		var playlistid = data.playlistid; // eg 0
		var player = _model.player.players[playlistid];
		switch (event) {
			case 'clear':
				player.playlist.removeAll();
				break;
			case 'add':
				var position = data.position;
				var itemId = data.item.id;
				var itemType = data.item.type;
				break;
			case 'remove':
				break;
		}
	}
	function _systemEvent(data) {
		_debug(data);
	}
	function _volumeEvent(data) {
		model.player.bindings.volume(data.volume);
		model.player.bindings.muted(data.muted);
	}
	function _weatherEvent(weather) {
		model.weather.temperature(weather.temperature);
        model.weather.conditions(weather.conditions);
	}
	
	/**
	 * Start monitoring for notification events
	 */
	this.startMonitoring = function() {
        _xbmc.monitorWeather(_weatherEvent);
        _xbmc.onVolumeChanged(_volumeEvent);
        _xbmc.onPlayerEvent(_playerEvent);
        _xbmc.onPlaylistEvent(_playlistEvent);
        _xbmc.onSystemEvent(_systemEvent);        
	};
	
	/*
this.stopMonitoring = function() {
		
	};
*/
/*

		var startAutoRefresh = function() {
            // refreshTimer = setInterval(function(){refresh()},2000);
            // refresh();
            var onActivePlayerChanged = function(player) {
                console.log('Active player changed');
                model.players[player.type].active(player.active);
            };
            var onPlayerDetailsUpdated = function(player) {
                //console.log('Player details updated');

                model.player.current.title(player.title);
                model.player.current.time(player.time);
                model.player.current.duration(player.duration);
                model.player.current.year(player.year);
                model.player.current.paused(player.paused);

                if (player.type == 'audio') {
                    model.player.current.artist(player.artist);
                    model.player.current.album(player.album);
                    modelme.player.current.genre(player.genre);
                } else if (player.type == 'video') {
                    model.player.current.artist(player.studio);
                    model.player.current.album(player.resolution);
                    model.player.current.genre(player.rating);
                }
            };
            var onPlayerItemChanged = function(player) {
                console.log('Player item changed');
            };
            var onPlaylistChanged = function(player) {
                console.log('Playlist changed');
                self.players[player.type].playlist.replaceAll(player.playlist.items);
            };
            var onVolumeChanged = function(volume, mute) {
                console.log('Volume changed');
                self.volume(volume);
                self.mute(mute);
            };
            xbmc.players.monitorActivePlayers(onActivePlayerChanged, onPlayerDetailsUpdated, onPlayerItemChanged, onPlaylistChanged, onVolumeChanged);
        };

        var stopAutoRefresh = function() {
            refreshTimer = clearInterval(refreshTimer);
            xbmc.players.stopMonitorPlayers();
        }
*/

	
	//construct
	_init();
	_debug('Model bindings applied')
}