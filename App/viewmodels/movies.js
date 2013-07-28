define(
['config','durandal/app','services/xbmcdatacontext','services/xbmcplayercontext'],
function(config,app,xbmc,player)
{
    var movies = ko.observableArray(),
    	loaded = ko.observable(false),
    	vm = {
        	displayName: 'MoX - Movies',
			description: 'Stuff',
			movies: movies,
			loaded: loaded,
			play: playMovie,
			imageUrl: config.url.forImage,
			imdbUrl: config.url.forImdb,
			showMovieInfo: function(movie) { 
				app.showMessage(movie.plotoutline, movie.label); 
			}
			//viewAttached: viewAttached,
		};
	
	init();

	return vm;

	function viewAttached (view) {
	};
	
	function init() {
		xbmc.movies.getAll(function(moviesResult) {
			loaded(true);
			movies(moviesResult);
		});
	}
	
	function playMovie(movie) {
		player.playMovie(movie.movieid);
	}
});