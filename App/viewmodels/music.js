define(
['config','services/xbmcdatacontext', 'services/notifier'],
function(config,xbmcDataContext, notify) {
	var artists = ko.observableArray([]),
		loaded = ko.observable(false),
		searchTerm = ko.observable(''),
		filteredArtists = ko.filteredArray(artists, searchTerm, 'label').extend({ throttle: 300 });
		vm = {
	        displayName: 'MoX - Music',
	        description: 'Stuff',
	        artists: filteredArtists,
	        artistCount: ko.computed(function() { return filteredArtists().length; }),
	        searchTerm: searchTerm,
	        loaded: loaded,
	        artistUrl: config.url.forArtist,
	        imageUrl: config.url.forImage,
	        activate: activate,
	        viewAttached: viewAttached,
	    };
    
    xbmcDataContext.artists.getAll(function(results) {
    	artists(results);
    	loaded(true);
		notify.success('Music artists have been loaded.')
    });

    function activate() {
    	
    }
    function viewAttached (view) {
        //you can get the view after it's bound and connected to it's parent dom node if you want
    }
    
    return vm;
});