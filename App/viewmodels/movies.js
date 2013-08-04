define(
[
	'config',
	'durandal/app',
	'services/xbmcdatacontext',
	'services/xbmcplayercontext',
	'services/notifier',
	'jlinq'
],
function(config,app,xbmc,player,notify)
{
    var movies = ko.observableArray([]),
    	loaded = ko.observable(false),
    	searchTerm = ko.observable(''),
    	listVisible = ko.observable(false),
    	visibleMovies = ko.observableArray([]),
    	searchResults = ko.computed(function() {
    		var term = searchTerm();
    		var list = movies();
    		var results = [];
    		if (term === '') {
    			results = list;
    		} else {
    			results = jlinq.from(list)
	    			.contains('label',term)
	    			.select();
    		}
			visibleMovies(jlinq.from(results)
	    			.take(25));
			return results;
    	}),
    	keepLoading = ko.computed(function() {
    		return listVisible() && searchResults().length > visibleMovies().length;
    	}),
    	vm = {
        	displayName: 'MoX - Movies',
			description: 'Stuff',
			movies: visibleMovies,
			searchResultsCount: ko.computed(function() {return searchResults().length;}),
			loaded: loaded,
			infiniteScrollEnabled: keepLoading,
			loadMore: loadMoreMovies,
			searchTerm: searchTerm,
			play: playMovie,
			imageUrl: config.url.forImage,
			imdbUrl: config.url.forImdb,
			showMovieInfo: function(movie) { 
				app.showMessage(movie.plotoutline, movie.label); 
			},
			activate: activate,
			deactivate: deactivate,
			viewAttached: viewAttached,
		};
	
	init();

	return vm;

	function viewAttached (view) {
	};
	
	function activate () {
		listVisible(true);
	};
	
	function deactivate () {
		listVisible(false);
	};
	
	function init() {
		// delay the start of this, else it might cause durandal to timeout
		setTimeout(function() {
			xbmc.movies.getAll(function(moviesResult) {
				loaded(true);
				movies(moviesResult);
				notify.success('Movie titles have been loaded.');
			});
		}, 1000);
	}
	function loadMoreMovies() {
		console.log('loading more movies');
		visibleMovies.pushAll(jlinq.from(searchResults())
	    			.skipTake(visibleMovies().length, 25));
	}

	function playMovie(movie) {
		player.playMovie(movie.movieid);
	}
});
