define(
['services/xbmccontext'],
function(xbmc) 
{
	var player = {
		playMovie: playMovie,
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
});