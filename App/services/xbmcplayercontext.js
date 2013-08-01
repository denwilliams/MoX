define(
['services/xbmccontext'],
function(xbmc) 
{
	var player = {
		playMovie: playMovie,
		playEpisode: playEpisode,
		playAlbum: playAlbum,
	};

	return player;
	
	// ------------------------------------------------------
	
	function playMovie(movieId) {
		xbmc.controller.players.video.playMovie(movieId);
	}
	function playAlbum(albumId) {
		xbmc.controller.players.audio.playAlbum(albumId);
	}
	function playEpisode(episodeId) {
		xbmc.controller.players.video.playEpisode(episodeId);
	}
});