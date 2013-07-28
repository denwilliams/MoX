define(
[
	'config',
	'services/xbmcdatacontext'
],
function(config, xbmc) {
	var seasons = ko.observableArray([]),
		tvshowid = 0,
    	seasonsLoaded = ko.observable(false),
    	vm = {
	        displayName: 'MoX - TV Show',
	        description: 'Episodes',
	        seasons: seasons,
	        loaded: seasonsLoaded,
			seasonUrl: seasonUrl,
			imageUrl: config.url.forImage,
			imdbUrl: config.url.forImdb,
			activate: activate,
        };

    return vm;
    
    function init(id) {
		tvshowid = id;
	    xbmc.tvSeasons.getByShow(id, function(seasonResults) {
	    	seasons(seasonResults);
	    	seasonsLoaded(true);	
	    });
    }
	
	function activate(routeData) {
    	seasonsLoaded(false);
	    var id = parseInt(routeData.id);
		init(id);
    }
	
	function seasonUrl(season) {
		return config.url.forTvSeason(tvshowid, season);
	}
});
