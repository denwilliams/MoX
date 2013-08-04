define(
[
	'services/xbmcdatacontext',
	'services/xbmcplayercontext',
	'services/xbmceventcontext',
	'services/notifier'
],
function(xbmcData, xbmcPlayer, xbmcEvents, notify) {
	var systemVolume = 0,
		/** Estimates the player time to reduce API calls */
		clock,
		systemMute = false,
		playerInUse = ko.observable(-1),
		playerSpeed = ko.observable(0),
		isActive = ko.computed(function() { return playerInUse() !== -1; }),
		isPaused = ko.computed(function() { return isActive() && playerSpeed() === 0; }),
		volume = ko.observable(0),
		muted = ko.observable(false),
		playerTime = ko.observable(0),
		playerDuration = ko.observable(0),
		playerTitle = ko.observable(''),
		vm = {
			playerInUse: playerInUse,
			playerSpeed: playerSpeed,
			isActive: isActive,
			isPaused: isPaused,
			volume: volume,
			showVolume: function() {},
			muted: muted,
			time: playerTime,
			duration: playerDuration,
			title: playerTitle,
			skipBack: function() { xbmcPlayer.skipBack(playerInUse()); },
			skipForward: function() { xbmcPlayer.skipForward(playerInUse()); },
			rewind: function() { xbmcPlayer.rewind(playerInUse()); },
			fastForward: function() { xbmcPlayer.fastForward(playerInUse()); },
			playPause: function() { xbmcPlayer.playPause(playerInUse()); },
			stop: function() { xbmcPlayer.stop(playerInUse()); },
			activate: activate,
			viewAttached: viewAttached,
		};

	init();
	return vm;

	function init() {
		bindObservables();
		bindEvents();
		checkIfAnyPlayerActive();
	}

	function bindEvents() {
		xbmcEvents.onSystemEvent(systemEvent);
		xbmcEvents.onPlayerEvent(playerEvent);
		xbmcEvents.onPlaylistEvent(playlistEvent);
		//xbmcEvents.onWeatherChanged(weatherEvent);
		xbmcEvents.onVolumeChanged(volumeEvent);
	}

	function systemEvent(eventData) {
		switch (eventData.event) {
			case "battery": // low battery
				notify.error('Battery low');
				break;
			case "quit": // xbmc quit
				notify.error('XBMC Quit. Please restart XBMC and refresh the page.');
				break;
			case "restart": // xbmc restarted
				notify.error('XBMC Restarted. Please refresh the page.');
				break;
			case "sleep": // system sleep
				notify.error('XBMC system went to sleep. Please wake system and refresh the page.');
				break;
			case "wake": // wake from sleep
				notify.error('XBMC system wake. Please refresh the page.');
				break;
		}
	}
	function playerEvent(eventData) {
		switch (eventData.event) {
			case "play":
				playerInUse(eventData.data.player.playerid);
				playerSpeed(1);
				getActivePlayerDetails();
				// eventData.data.item.id = 12345
				// eventData.data.item.type = 'song'
				// eventData.data.player.playerid = 0
				// eventData.data.player.speed = 1
				//notify.alert('play' + JSON.stringify(eventData.data));
				break;
			case "pause":
				playerInUse(eventData.data.player.playerid);
				playerSpeed(0);
				stopClock();
				// eventData.data.item.id = 12345
				// eventData.data.item.type = 'song'
				// eventData.data.player.playerid = 0
				// eventData.data.player.speed = 0
				break;
			case "stop":
				playerInUse(-1);
				playerSpeed(0);
				stopClock();
				// eventData.data.item.id = 12345
				// eventData.data.item.type = 'song'
				// eventData.data.end = true/false
				if (eventData.data.end === false) {
					// stop button pressed
				} else {
					// song played to end
				}
				//notify.alert('stop' + JSON.stringify(eventData.data));
				break;
			case "seek":
				getActivePlayerDetails();
				//notify.alert('seek' + JSON.stringify(eventData.data));
				break;
			case "property": // property changed
				notify.alert('property' + JSON.stringify(eventData.data));
				break;
			case "speed": // speed changed
				playerInUse(eventData.data.player.playerid);
				playerSpeed(eventData.data.player.speed);
				// eventData.data.item.id = 12345
				// eventData.data.item.type = 'song'
				// eventData.data.player.playerid = 0
				// eventData.data.player.speed = 1/2/3/4/-2/-4
				break;
		}
	}
	function playlistEvent(eventData) {
		switch (eventData.event) {
			case "add":
				notify.alert('item added' + JSON.stringify(eventData.data));
				break;
			case "remove":
				notify.alert('item removed' + JSON.stringify(eventData.data));
				break;
			case "clear":
				notify.alert('playlist cleared' + JSON.stringify(eventData.data));
				break;
		}
	}
	// function weatherEvent(eventData) {

	// }
	function volumeEvent(data) {
		systemVolume = data.volume;
		systemMute = data.muted;
		volume(data.volume);
		muted(data.muted);
	}

	function bindObservables() {
		volume.subscribe(function(newValue) {
			if (newValue != systemVolume) {
				xbmcPlayer.setVolume(newValue);
				systemVolume = newValue;
			}
		});
		muted.subscribe(function(newValue) {
			if (newValue != systemMute) {
				xbmcPlayer.setMute(newValue);
				systemMute = newValue;
			}
		});
	}

	function checkIfAnyPlayerActive() {
		xbmcPlayer.getActivePlayerId(function(playerid) { 
			playerInUse(playerid); 
			getActivePlayerDetails();
		});
	}

	function getActivePlayerDetails() {
		var playerid = playerInUse();
		if (playerid < 0) {
			playerTime(0);
			playerDuration(0);
			playerTitle('');
		} else {
			xbmcPlayer.getPlayerDetails(playerid, function(props) {
				playerTime(xbmcTimeToSeconds(props.time));
				playerDuration(xbmcTimeToSeconds(props.totaltime));
				playerSpeed(props.speed);
				startClock();
			});
			xbmcPlayer.getCurrentItemName(playerid, function(name) {
				playerTitle(name);
			});
		}
	}

	function startClock() {
		stopClock();
		clock = setInterval(function(){
			playerTime(playerTime() + playerSpeed());
		},1000);
	}

	function stopClock() {
		clearInterval(clock);
	}
	
	function viewAttached(view) {
		xbmcPlayer.getVolume(volumeEvent);
	}

	function activate() {
	}

	function xbmcTimeToSeconds(time) {
		var seconds = 
			time.seconds + 
			(60*time.minutes) +
			(3600*time.hours)
			;
		return seconds;
	}
});
