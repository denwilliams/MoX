define(
[
	'config',
	'services/xbmcdatacontext',
	'jlinq'
],
function(config, xbmc) {
    var shows = ko.observableArray([]),
    	visibleShows = ko.observableArray([]),
    	sortBy = ko.observable('label'),
    	showsLoaded = ko.observable(false),
    	searchTerm = ko.observable(''),
    	searchResults = ko.computed(function() {
    		var term = searchTerm();
    		var list = shows();
    		var results = [];
    		if (term === '') {
    			results = jlinq.from(list)
	    			.sort(sortBy())
	    			.select();
    		} else {
    			results = jlinq.from(list)
	    			.contains('label',term)
	    			.sort(sortBy())
	    			.select();
    		}
			visibleShows(jlinq.from(results).take(25));
			return results;
    	}),
    	vm = {
	        displayName: 'MoX - TV',
	        description: 'Stuff',
	        shows: visibleShows,
	        searchTerm: searchTerm,
	        loaded: showsLoaded,
			showUrl: config.url.forTvShow,
			imageUrl: config.url.forImage,
			tvdbUrl: config.url.forTvDb,
			sortBy: {
				name: function() { sortBy('label'); },
				year: function() { sortBy('year'); },
				studio: function() { sortBy('studio'); },
				rating: function() { sortBy('rating'); },
			}
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