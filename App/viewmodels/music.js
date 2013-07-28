define(
['config','services/xbmcdatacontext'],
function(config,xbmcDataContext) {
	var artists = ko.observableArray([]),
		loaded = ko.observable(false),
		vm = {
	        displayName: 'MoX - Music',
	        description: 'Stuff',
	        artists: artists,
	        loaded: loaded,
	        artistUrl: config.url.forArtist,
	        imageUrl: config.url.forImage,
	        activate: activate,
	        viewAttached: viewAttached,
	    };
    
    xbmcDataContext.artists.getAll(function(results) {
    	artists(results);
    	loaded(true);
    });

    function activate() {
    	
    }
    function viewAttached (view) {
        //you can get the view after it's bound and connected to it's parent dom node if you want
    }
    
    return vm;
});