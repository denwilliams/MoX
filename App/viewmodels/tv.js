define(
[
	'config',
	'services/xbmcdatacontext',
	'services/notifier',
	'jlinq'
],
function(config, xbmc, notify) {
	var shows = ko.observableArray([]),
		visibleShows = ko.observableArray([]),
    	listVisible = ko.observable(false),
		sortBy = ko.observable('label'),
		showsLoaded = ko.observable(false),
    	keepLoading = ko.computed(function() {
    		return listVisible() && searchResults().length > visibleShows().length;
    	}),
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
			displayName: 'TV Shows',
			description: 'Stuff',
			shows: visibleShows,
			searchTerm: searchTerm,
			loaded: showsLoaded,
			loadMore: loadMoreShows,
			infiniteScrollEnabled: keepLoading,
			showUrl: config.url.forTvShow,
			imageUrl: config.url.forImage,
			tvdbUrl: config.url.forTvDb,
			sortBy: {
				name: function() { sortBy('label'); },
				year: function() { sortBy('year'); },
				studio: function() { sortBy('studio'); },
				rating: function() { sortBy('rating'); },
			},
			activate: activate,
			deactivate: deactivate,
		};

	init();

	return vm;
	
	function init() {
		xbmc.tvShows.getAll(function(showResults) {
			shows(showResults);
			showsLoaded(true);
			notify.success('TV shows have been loaded.')	
		});
	}
	function activate () {
		listVisible(true);
	};
	function deactivate () {
		listVisible(false);
	};
	function loadMoreShows() {
		console.log('loading more shows');
		visibleShows.pushAll(jlinq.from(searchResults())
	    			.skipTake(visibleShows().length, 25));
	}

});