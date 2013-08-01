define(
['config', 'services/xbmccontext', 'jlinq'], 
function(config, xbmc) 
{
	var cache = {},
		artists = {
			getAll: getAllArtists,
			get: getArtistById,
		},
		albums = {
			getByArtist: getAlbumsByArtistId,
			get: getAlbumById,
			getRecent: getRecentAlbums,
		},
		songs = {
			getByAlbum: getSongsByAlbum,
		},
		movies = {
			getAll: getAllMovies,
			getRecent: getRecentMovies,
		},
		tvShows = {
			getAll: getAllTvShows,
		},
		tvSeasons = {
			getByShow: getTvSeasons,
		},
		tvEpisodes = {
			getBySeason: getTvEpisodes,
			getRecent: getRecentEpisodes,
		},
		weather = {
			get: getWeather
		},
		system = {
			
		},
		repos = {
			activate: activate,
			primeData: primeData,
			artists: artists,
			albums: albums,
			songs: songs,
			movies: movies,
			tvShows: tvShows,
			tvSeasons: tvSeasons,
			tvEpisodes: tvEpisodes,
			weather: weather,
			system: system,
			//clearCache = xbmc.controller.clearCache
		};

	init();

	return repos;
	
	function activate() {
		
	}
	
	function primeData() {
		
	}

	function init() {
		Xbmc.DEBUG = true;
		// create some binding handlers for XBMC

		ko.bindingHandlers.xbmcImage = {
		    init: function(element, valueAccessor) {
				var value = ko.utils.unwrapObservable(valueAccessor()),
					formattedValue = config.url.forImage(value);

		        $(element).attr('src',formattedValue);
		    }
		};
	}
	
	// ################# MUSIC #################

	function getAllArtists(callback, forceRefresh) {
		if (cache.artists != undefined && forceRefresh !== true) {
			callback(cache.artists);
		} else {
			xbmc.controller.getArtists(function(result) {
				cache.artists = result.artists;
				callback(result.artists);
			}, forceRefresh);
		}
	}
	
	function getArtistById(id, callback, forceRefresh) {
		// getAllArtists(function(artists) {
		// 	var artist = jlinq.from(artists).equals('artistid',id).select();
		// 	callback(artist[0]);
		// },forceRefresh);
			xbmc.controller.getArtist(id,function(result) {
				callback(result.artistdetails);
			}, forceRefresh);
	}
	
	function getAlbumsByArtistId(artistid, callback, forceRefresh) {
		xbmc.controller.getAlbumsByArtist(artistid, function(result) {
			callback(result.albums);
		}, forceRefresh);
	}

	function getRecentAlbums(callback, forceRefresh) {
		xbmc.controller.getRecentAlbums(function(result) {
			callback(result.albums, 5);
		}, forceRefresh);
	}
	
	function getAlbumById(id, callback, forceRefresh) {
		xbmc.controller.getAlbum(id, function(result) {
			callback(result.albumdetails);
		}, forceRefresh);
	}
	
	function getSongsByAlbum(albumid, callback, forceRefresh) {
		xbmc.controller.getSongsByAlbum(albumid, function(result) {
			callback(result.songs);
		}, forceRefresh);
	}
	
	// ################# MOVIES #################
	
	function getAllMovies(callback, forceRefresh) {
		if (cache.movies != undefined && forceRefresh !== true) {
			callback(cache.movies);
		} else {
			xbmc.controller.getMovies(function(result) {
				cache.movies = result.movies;
				callback(result.movies);
			}, forceRefresh);
		}
	}

	function getRecentMovies(callback, forceRefresh) {
		xbmc.controller.getRecentMovies(function(result) {
			callback(result.movies, 5);
		}, forceRefresh);
	}

	function getMovieById(movieid, callback) {
		// getAllMovies(function(movies) {
		// 	var movie = jlinq.from(movies).equals('movieid',movieid).select();
		// 	callback(movie[0]);
		// });
		xbmc.controller.getMovie(id, function(result) {
			callback(result.moviedetails);
		}, forceRefresh);
	}

	// ################# TV #################
	
	function getAllTvShows(callback, forceRefresh) {
		if (cache.tvshows != undefined && forceRefresh !== true) {
			callback(cache.tvshows);
		} else {
			xbmc.controller.getTvShows(function(result) {
				cache.tvshows = result.tvshows;
				callback(result.tvshows);
			}, forceRefresh);
		}
	}

	function getTvShowById(tvshowid, callback) {
		getAllTvShows(function(shows) {
			var show = jlinq.from(shows).equals('tvshowid',tvshowid).select();
			callback(show[0]);
		});
	}
	
	function getTvSeasons(tvshowid, callback, forceRefresh) {
		xbmc.controller.getTvSeasons(tvshowid, function(result) {
			callback(result.seasons);
		}, forceRefresh);
	}
	
	function getTvEpisodes(tvshowid, season, callback, forceRefresh) {
		xbmc.controller.getTvEpisodes(tvshowid, season, function(result) {
			callback(result.episodes);
		}, forceRefresh);
	}

	function getRecentEpisodes(callback, forceRefresh) {
		xbmc.controller.getRecentEpisodes(function(result) {
			callback(result.episodes, 5);
		}, forceRefresh);
	}

	// ################# WEATHER #################
	
	function getWeather(callback) {
		xbmc.controller.getWeather(callback);
	}
	
});