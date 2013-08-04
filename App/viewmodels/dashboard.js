define(
[
    'config',
    'services/xbmcdatacontext',
    'services/xbmcplayercontext',
    'jlinq'
],
function(config, xbmc, player) {
    var recentMovies = ko.observableArray([]),
        recentEpisodes = ko.observableArray([]),
        recentAlbums = ko.observableArray([]),
        moviesLoaded = ko.observable(false),
        episodesLoaded = ko.observable(false),
        albumsLoaded = ko.observable(false),
        dashboard = function () {
            this.displayName = 'Welcome to MoX';
            this.description = 'MoX is a JavaScript, WebSockets-based XBMC controller, utilising modern HTML5 capabilities, and a single-page-application design to provide an awesome experience.';
            this.recent = {
                movies: recentMovies,
                episodes: recentEpisodes,
                albums: recentAlbums,
            };
            this.albumsLoaded = albumsLoaded;
            this.episodesLoaded = episodesLoaded;
            this.moviesLoaded = moviesLoaded;
            this.imageUrl = config.url.forImage;
            this.imdbUrl = config.url.forImdb;
            this.albumUrl = config.url.forAlbum;
        };

    dashboard.prototype.viewAttached = function (view) {
        //you can get the view after it's bound and connected to it's parent dom node if you want
    };

    dashboard.prototype.play = function (item) {
        if (item.albumid) {
            player.playAlbum(item.albumid);
        } else if (item.movieid) {
            player.playMovie(item.movieid);
        } else if (item.episodeid) {
            player.playEpisode(item.episodeid);
        }
    };

    init();

    return dashboard;

    function init() {
        // we want to delay this by a second to let other things load
        setTimeout(function() {
            xbmc.movies.getRecent(function(results) {
                recentMovies(results);
                moviesLoaded(true);  
            });
            xbmc.tvEpisodes.getRecent(function(results) {
                recentEpisodes(results);
                episodesLoaded(true);  
            });
            xbmc.albums.getRecent(function(results) {
                recentAlbums(results);
                albumsLoaded(true);  
            });
        }, 1000);
    }
});
