// XBMC.GetInfoLabel For a list of commands, see http://wiki.xbmc.org/index.php?title=InfoLabels

//    console.log('Cache usage - ' + (getPermanentCacheUsed() / 1024) + ' kb');
//    console.log('Session Cache usage - ' + (getSessionCacheUsed() / 1024) + ' kb');

function Model(xbmcController) {
	var self = this;
    var me = this;
    
    var _model = this;
	
    var xbmc = xbmcController;
	var notifications =  new Notifications();
	var loadingText = 'Loading...';

    this.loaded = ko.observable(false);

    //DEBUG window.model = this;

    this.clearCache = function() {
    	xbmc.clearCache();
    };

	/**
	 * Constructor
	 */
    function _init() {
        me.loaded(true);
        me.ui.loading(false);
        // delay code that will block the UI for a second
        setTimeout(_delayedInit, 1000);
    }
    
    /**
     * Constructor logic to run after a delay
     */
    function _delayedInit() {
        me.music.loadArtists();
        me.tv.loadShows();
        me.movies.loadTitles();	    
    }

    /**
     * Adds a method to each object in an array. Useful for knockout click bindings.
     */
    function _addMethodToArray(objArray, name, fn) {
        for (var i in objArray) {
            objArray[i][name] = fn;
        }
        return objArray;
    }

    
    
    /* (((( UI )))) */
    
    /**
     * User interface bindings
     */
    this.ui = new function() {
        var self = this;
        this.page = ko.observable('home');
        this.loading = ko.observable(true);
        this.setPage = function(pageName) {
            self.page(pageName);
            self.path.removeAll();
            if (me[pageName] && me[pageName].reset) {
                me[pageName].reset();
            }
        };
        this.pageName = ko.computed(function() {
            switch(self.page()) {
                case 'home':
                    return 'Home';
                case 'music':
                    return 'Music';
                case 'tv':
                    return 'TV';
                case 'movies':
                    return 'Movies';
                case 'nowplaying':
                    return 'Now Playing';
                case 'config':
                    return 'Configuration';
            }
            return self.page();
        }, this);
        /**
         * Sets the navigation path (used for breadcrumbs)
         * @param {array} pathArray - an array of label-fn pairs
         */
        this.setPath = function(pathArray) {
            self.path.removeAll();
            self.path.pushAll(pathArray);
        }
        this.addPath = function(pathObj) {
            self.path.push(pathObj);
        }
        this.path = ko.observableArray([]);
        //this.breadcrumbs = ko.observableArray([{label: self.pageName(), fn: function() { self.setPage(self.page()); } }]);

        // this.page.subscribe(function(newValue) {
        //     self.breadcrumbs()[0].label = self.pageName();
        // });
        // this.path.subscribe(function(newValue) {
        //     var root = self.breadcrumbs()[0];
        //     self.breadcrumbs.removeAll();
        //     self.breadcrumbs.push(root);
        //     self.breadcrumbs.pushAll(self.path());
        // });
    };

    this.home = new function() {
        var self = this;
        this.reset = function() {

        }
    };
    
    /* (((( PLAYER )))) */

    this.player = new function() {
        var self = this;

        var _volume = ko.observable(0);
        var _mute = ko.observable(false);

        // this.playFile = function(fileName) {
        //     xbmc.Player.Open({
        //         item: { file: fileName}
        //     }, function() { refresh(); });
        // };
        // this.playPlaylist = function(playlistId, position) {
        //     if (playlistId == undefined) playlistId = 0;
        //     if (position == undefined) position = 0;
        //     xbmc.Player.Open({
        //         item: { playlistid: playlistId, position: position }
        //     }, function() { refresh(); });
        // };
        this.stop = function () {
            var i = self.activePlayer();
            if (i) {
                xbmc.players[i].stop();
                //refresh();
            }
        };
        this.pause = function () {
            var i = self.activePlayer();
            if (i) {
                xbmc.players[i].pause();
                //refresh();
            }
        };
        this.back = function () {
            var i = self.activePlayer();
            if (i) {
                xbmc.players[i].back();
                //refresh();
            }
        };
        this.forward = function () {
            var i = self.activePlayer();
            if (i) {
                xbmc.players[i].forward();
                //refresh();
            }
        };
        this.playAlbum = function(album) {
            xbmc.players.audio.playAlbum(album.albumid);
            //notifications.alert(album.albumid);
        };
        
        this.players = {
            audio: {
                id: ko.observable(0)
                ,active: ko.observable(false)
                ,playlist: ko.observableArray([])
                ,playlistCurrentItem: ko.observable(0)
            }, 
            video: {
                id: ko.observable(1)
                ,active: ko.observable(false)
                ,playlist: ko.observableArray([])
                ,playlistCurrentItem: ko.observable(0)
            },
            pictures: {
                id: ko.observable(2)
                ,active: ko.observable(false)
                ,playlist: ko.observableArray([])
                ,playlistCurrentItem: ko.observable(0)
            }
        };

        this.volume = ko.computed({
            read: function () {
                return _volume();
            },
            write: function (value) {
                _volume(value);
                xbmc.Application.SetVolume({volume: value});
            },
            owner: this
        });


        //this.volume = ko.observable(0);
        //this.volume.subscribe(function(newValue))
        this.volumeVisible = ko.observable(false);
        // this.volumePosition = {
        //     x: ko.observable(10)
        //     ,y: ko.observable(10)
        // };

        this.toggleVolumeVisible = function(data, event) {
            var v = !self.volumeVisible();
            self.volumeVisible(v);
            // if (v) {
            //     self.volumePosition.x(event.pageX);
            //     self.volumePosition.y(event.pageY - 200);
            //     //alert(JSON.stringify(event));
            // }
        };
        this.mute = ko.computed({
            read: function () {
                return _mute();
            },
            write: function (value) {
                _mute(value);
                xbmc.Application.SetMute({mute: value});
            },
            owner: this
        });
        this.toggleMute = function() {
            self.mute(!self.mute());
        };
        this.activePlayer = ko.computed(function() {
            return (self.players.audio.active() ? 'audio' : (self.players.video.active() ? 'video' : null));
        });
        this.isActive = ko.computed(function() {
            return self.activePlayer() != null;
        });
        this.isActive.subscribe(function(newValue) {
            if (newValue === false) {
                me.ui.setPage('home');
            }
        });
        this.current = {
            title: ko.observable(loadingText)
            ,album: ko.observable(loadingText)
            ,artist: ko.observable(loadingText)
            ,genre: ko.observable(loadingText)
            ,video: ko.observable(loadingText)
            ,year: ko.observable(loadingText)
            ,time: ko.observable(0)
            ,duration: ko.observable(0)
            ,percentage: ko.observable(0)
            ,playlist: ko.observableArray([])
            ,paused: ko.observable(false)
        };

        // var refreshTimer = null;
        // function refresh() {
        //     var id = -1;
        // }
    };


	/* (((( MUSIC )))) */
	
    this.music = new function() {
        var self = this;

        this.reset = function() {
            var sa = self.selectedArtist;
            sa.artistid(0);
            sa.name('');
            sa.bio('');
            sa.thumbnail('');
        };

        this.searchTerm = ko.observable('');
        this.searchTerm.subscribe(function(newValue) {
            var searchFor = newValue.toLowerCase();
            $.each(self.visibleArtists(), function(index, value) {
                value.visible(value.label.toLowerCase().indexOf(searchFor) !== -1);
            });
            // var newArray = jlinq.from(self.artists)
            //   .contains('label', newValue)
            //   .select();
            //self.visibleArtists.removeAll();
            //self.visibleArtists.pushAll(newArray);
        });
        this.artists = [];
        this.visibleArtists = ko.observableArray([]);
        this.selectedArtist = {
            artistid : ko.observable(0),
            name: ko.observable(''),
            bio: ko.observable(''),
            thumbnail: ko.observable(''),
            visibleAlbums: ko.observableArray([]),
            playAlbum: function(album) {
                me.player.playAlbum(album);
            }
        };

        this.loadArtists = function() {
        	xbmc.getArtists(
        		function(result) {
                    var artists = result.artists;
                    for (var i in artists) {
                        artists[i].visible = ko.observable(true);
                    }
                    self.artists = artists; 
                    self.visibleArtists.pushAll(self.artists);
                }
            );
        };
        
/*
                xbmc.AudioLibrary.GetArtists({
                    albumartistsonly: true,
                    //limits: {start: 0, end: 5},
                    sort: {order: 'ascending', ignorearticle: true, method: 'artist'},
                    //filter: {label:'paul'},
                    properties: ['thumbnail', 'genre'],
*/

        this.loadArtist = function(artist) {
            var a = self.selectedArtist;
            a.name(artist.artist);
            a.bio('');
            a.visibleAlbums.removeAll();
            a.artistid(artist.artistid);
            
            me.ui.loading(true);
            xbmc.getAlbumsByArtist(artist.artistid, function(result) {
                //_addFunction(result.albums, 'play', me.player.playAlbum)
                a.visibleAlbums.pushAll(result.albums);
                //notifications.alert(result);
                me.ui.loading(false);
            });
            me.ui.setPath([
                {label: artist.artist, fn: function() { self.loadArtist(artist); } }
            ]);

        };
    };


	/* (((( MOVIES )))) */
	
    this.movies = new function() {
        var self = this;

        this.titles = ko.observableArray([]);
        this.searchTerm = ko.observable('');
        this.searchTerm.subscribe(function(newValue) {
            var searchFor = newValue.toLowerCase();
            $.each(self.titles(), function(index, value) {
                value.visible(value.label.toLowerCase().indexOf(searchFor) !== -1);
            });
        });

        this.loadTitles = function() {
/*
                xbmc.VideoLibrary.GetMovies({
                    properties: ['title', 'year', 'rating', 'tagline', 'playcount', 'studio', 
                    'country', 'runtime', 'showlink', //'set', 'setid', 'resume', 
                    'imdbnumber'] //, 'thumbnail', 'art']
*/
        	xbmc.getMovies(function(result) {
            	movies = result.movies;
				movies.sort(function(a,b){return (a.label.localeCompare(b.label))});
				$.each(movies, function(index, value) {
					value.visible = ko.observable(true);
				});
				self.titles.pushAll(movies);
			});
        };
        this.playMovie = function(movie) {
            if (movie.movieid) {
                xbmc.players.video.playMovie(movie.movieid);
                //console.log(JSON.stringify(movie));
            }
        };
    };
    
    
    /* (((( TV )))) */

    this.tv = new function() {
        var self = this;

        // ## PUBLIC PROPERTIES

        this.searchTerm = ko.observable('');
        this.searchTerm.subscribe(function(newValue) {
            var searchFor = newValue.toLowerCase();
            $.each(self.shows(), function(index, value) {
                value.visible(value.label.toLowerCase().indexOf(searchFor) !== -1);
            });
        });
        this.selectedShow = new function() {
            // reassign self
            var tv = self;
            var selectedShow = this;
            var self = this;

            this.tvshowid = ko.observable(0);
            this.label = ko.observable('');
            this.seasons = ko.observableArray([]);
            this.selectedSeason = new function() {
                var self = this;
                this.season = ko.observable(0);
                this.label = ko.observable('');
                this.episodes = ko.observableArray([]);
                this.playEpisode = function(episode) {
	                if (episode.episodeid) {
	                    xbmc.players.video.playEpisode(episode.episodeid);
	                }
                };
            };
            this.loadSeason = function(season) {
                var ss = self.selectedSeason;
                me.ui.addPath({label: season.label, fn: function() { self.selectedShow.loadSeason(season); } });
                //console.log(JSON.stringify(season));
                ss.season(season.season);
                ss.label(season.label);
                //self.selectedShow.tvshowid(season.tvshowid);
                xbmc.getTvEpisodes(season.tvshowid, season.season, 
                    function(response) {
                        ss.episodes.pushAll(response.episodes);
                    }
                );
            };
        };
        this.shows = ko.observableArray([]);


        // ## PUBLIC METHODS

        this.reset = function() {
            var s = self.selectedShow;
            s.tvshowid(0);
            s.label('');
            s.seasons.removeAll();
            var ss = s.selectedSeason;
            ss.season(0);
            ss.label('');
            ss.episodes.removeAll();
        };
        this.loadShows = function() {
            xbmc.getTvShows(
            	function(result) {
                    tvshows = result.tvshows;
                    for (var i in tvshows) {
                        tvshows[i].visible = ko.observable(true);
                    }
                    self.shows.pushAll(tvshows);
                }
            );
        };
        this.loadShow = function(tvshow) {
            self.reset();
            var s = self.selectedShow;
            s.tvshowid(tvshow.tvshowid);
            s.label(tvshow.label);
            xbmc.VideoLibrary.GetSeasons({
                tvshowid: tvshow.tvshowid
                , properties: ['season','watchedepisodes','tvshowid']
            }, function(response) {
                s.seasons.replaceAll(response.seasons);
            }, true);
            me.ui.setPath([{label: tvshow.label, fn: function() { self.loadShow(tvshow); } }]);
        };
    };


	/* (((( WEATHER )))) */
	
	/**
	 * Weather bindings
	 */
    this.weather = new function() {
        this.temperature = ko.observable('');
        this.conditions = ko.observable(loadingText);
    };


	/* (((( OTHER )))) */
    this.recentAdditions = ko.observableArray([]);
    
    //construct
    _init();
}
