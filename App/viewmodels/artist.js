define(
[
	'config',
	'durandal/app',
	'durandal/plugins/router',
	'services/xbmcdatacontext',
	'services/xbmcplayercontext',
],
function(
	config,
	app,
	router, 
	xbmc,
	player
) {
    var artistId = ko.observable(0),
    	artistName = ko.observable('Loading'),
    	description = ko.observable('Loading'),
    	artistDetails = ko.observable({}),
    	albums = ko.observableArray([]),
    	loadedAlbums = ko.observable(false),
    	vm = {
	    	artistId: artistId,
		    artistName: artistName,
		    artist: artistDetails,
		    description: description,
		    albums: albums,
		    loadedAlbums: loadedAlbums,
		    viewAttached: viewAttached, 
		    albumUrl: config.url.forAlbum,
		    imageUrl: config.url.forImage,
		    goBack: goBack,
		    goToId: goToId,
		    activate: activate,
		    play: playAlbum,
		    showArtistInfo: showArtistInfo,
	    };
    
    function activate(routeData) {
    	loadedAlbums(false);
	    var id = parseInt(routeData.id);
	    xbmc.artists.get(id,function(artist) {
		    artistId(id);
		    artistName(artist.artist);
		    artistDetails(artist);
		    description('');
	    });
	    xbmc.albums.getByArtist(id, function(albumResults) {
		    albums(albumResults);
		    loadedAlbums(true);
	    });
    }

    function showArtistInfo() {
    	app.showMessage(artistDetails().description, artistDetails().label); 
    }
    function playAlbum(album) {
    	player.playAlbum(album.albumid);
    }

    function viewAttached(view) {
    }
    
    function goBack() {
	    router.navigateBack();
    }
    
    function goToId(id) {
	    router.navigateTo('#/artist/'+id);
    }

    return vm;
});