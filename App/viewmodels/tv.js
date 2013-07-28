define(
[
	'config',
	'services/xbmcdatacontext'
],
function(config, xbmc) {
    var shows = ko.observableArray([]),
    	showsLoaded = ko.observable(false),
    	vm = {
	        displayName: 'MoX - TV',
	        description: 'Stuff',
	        shows: shows,
	        loaded: showsLoaded,
			showUrl: config.url.forTvShow,
			imageUrl: config.url.forImage,
			imdbUrl: config.url.forImdb,
        };

	init();

    return vm;
    
    function init() {
	    xbmc.tvShows.getAll(function(showResults) {
	    	shows(showResults);
	    	showsLoaded(true);	
	    });
    }
});