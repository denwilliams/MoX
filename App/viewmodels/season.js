define(
[
	'config',
	'services/xbmcdatacontext'
],
function(config, xbmc) {
	var episodes = ko.observableArray([]),
		seasons = ko.observableArray([]),
		tvshowid = ko.observable(0),
		season = ko.observable(0),
		episodesLoaded = ko.observable(false),
		seasonsLoaded = ko.observable(false),
		vm = {
			displayName: 'MoX - Season',
			description: 'Episodes',
			episodes: episodes,
			seasons: seasons,
			tvshowid: tvshowid,
			season: season,
			episodesLoaded: episodesLoaded,
			seasonsLoaded: seasonsLoaded,
			seasonUrl: seasonUrl,
			episodeUrl: config.url.forTvEpisode,
			imageUrl: config.url.forImage,
			activate: activate,
		};

	return vm;
	
	function init(id, seasonNum) {
		xbmc.tvSeasons.getByShow(id, function(seasonResults) {
			seasons(seasonResults);
			seasonsLoaded(true);
		});

		xbmc.tvEpisodes.getBySeason(id, seasonNum, function(results) {
			episodes(results);
			episodesLoaded(true);	
		});
	}
	
	function activate(routeData) {
		episodesLoaded(false);
		tvshowid(parseInt(routeData.tvshowid));
		season(parseInt(routeData.season));
		init(tvshowid(),season());
	}

	function seasonUrl(season) {
		return config.url.forTvSeason(tvshowid(),season);
	}
	
});