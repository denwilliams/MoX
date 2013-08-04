define(
['services/xbmccontext'],
function(xbmc) 
{
	var player = {
			playMovie: playMovie,
			playEpisode: playEpisode,
			playAlbum: playAlbum,
			getVolume: getVolume,
			setVolume: setVolume,
			setMute: setMute,
			skipBack: skipBack,
			skipForward: skipForward,
			rewind: rewind,
			fastForward: fastForward,
			playPause: playPause,
			stop: stop,
			getActivePlayerId: getActivePlayerId,
			getPlayerDetails: getPlayerDetails,
			getCurrentItemName: getCurrentItemName,
		};

	return player;
	
	// ------------------------------------------------------

	function getActivePlayerId(callback) {
		xbmc.controller.players.getActivePlayers(function (players) {
			if (players.length == 0) {
				callback(-1);
			} else {
				callback(players[0].id);
			}
		});
	}

	function getCurrentItemName(playerid, callback) {
		xbmc.controller.players[playerid].getCurrentItemName(callback);
	}

	function getPlayerDetails(playerid, callback) {
		xbmc.controller.players[playerid].getDetails(callback);
	}
	
	function playMovie(movieId) {
		xbmc.controller.players.video.playMovie(movieId);
	}
	function playAlbum(albumId) {
		xbmc.controller.players.audio.playAlbum(albumId);
	}
	function playEpisode(episodeId) {
		xbmc.controller.players.video.playEpisode(episodeId);
	}
	function getVolume(callback) {
		xbmc.controller.getVolume(callback);
	}
	function setVolume(volume) {
		xbmc.controller.setVolume(volume);
	}
	function setMute(muted) {
		xbmc.controller.setMute(muted);
	}
	function playPause(playerid) {
		xbmc.controller.players[playerid].pause();
	}
	function stop(playerid) {
		xbmc.controller.players[playerid].stop();
	}
	function skipBack(playerid) {
		xbmc.controller.players[playerid].back();
	}
	function skipForward(playerid) {
		xbmc.controller.players[playerid].forward();
	}
	function setSpeed(playerid, speed) {
		xbmc.controller.players[playerid].setSpeed(speed);
	}
	function rewind(playerid) {
		setSpeed(playerid, -4);
	}
	function fastForward(playerid) {
		setSpeed(playerid, 4);
	}
});