function XbmcModelBindings(xbmcController, model) {
	var self = this;
	
	var xbmc = xbmcController;

	/**
	 * Constructor
	 */
	function _init() {
		self.startMonitoring();
	}
	function _debug(obj) {
		console.log(JSON.stringify(obj));
	}
	function _playerEvent(data) {
		_debug(data);
	}
	function _playlistEvent(data) {
		_debug(data);
	}
	function _systemEvent(data) {
		_debug(data);
	}
	function _volumeEvent(data) {
		model.player.volume(data.volume);
		model.player.mute(data.muted);
	}
	function _weatherEvent(weather) {
		model.weather.temperature(weather.temperature);
        model.weather.conditions(weather.conditions);
	}
	
	/**
	 * Start monitoring for notification events
	 */
	this.startMonitoring = function() {
        xbmc.monitorWeather(_weatherEvent);
        xbmc.onVolumeChanged(_volumeEvent);
        xbmc.onPlayerEvent(_playerEvent);
        xbmc.onPlaylistEvent(_playlistEvent);
        xbmc.onSystemEvent(_systemEvent);        
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
}