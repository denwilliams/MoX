define(
[
	'config',
	'durandal/plugins/router',
	'services/xbmcdatacontext',
	'services/xbmcplayercontext',
	'jlinq'
],
function(
	config,
	router, 
	xbmc,
	player
) {
    var albumId = ko.observable(0),
    	albumName = ko.observable(config.loadingText),
    	artists = ko.observableArray([]),
    	songs = ko.observableArray([]),
    	loadedSongs = ko.observable(false),
    	artistUrl = config.url.forArtist,
    	vm = {
	    	albumId: albumId,
		    albumName: albumName,
	    	artists: artists,
		    songs: songs,
		    artistUrl: artistUrl,
		    loadedSongs: loadedSongs,
		    playAlbum: playAlbum,
		    //viewAttached: viewAttached, 
		    goBack: goBack,
		    goToId: goToId,
		    activate: activate,
	    };
    
    function activate(routeData) {
	    var id = parseInt(routeData.id);
	    albumId(id);

/*	    xbmc.albums.get(id,function(result) {
		    albumId(id);
		    albumName(result.label);
	    });
*/

	    xbmc.songs.getByAlbum(id, function(results) {
	    	var a = [];
	    	for (var i = 0; i < results.length; i++) {
	    		a.push({artistid: results[i].artistid, artist: results[i].artist});
	    	}
		    songs(results);
		    artists(jlinq.from(a).distinct());
		    loadedSongs(true);
	    });

    }

    function viewAttached(view) {
    }
    
    function goBack() {
	    router.navigateBack();
    }
    
    function goToId(id) {
	    router.navigateTo('#/artist/'+id);
    }

    function  playAlbum() {
    	player.playAlbum(albumId());
    }

    return vm;
});