window.Xbmc = window.Xbmc || {};

Xbmc.Properties = {

	/** Artist detals to retrieve when returning a list */
	artistPartial: [
		//"instrument", 
		//"style", 
		//"mood", 
		//"born", 
		//"formed", 
		//"description", 
		"genre", 
		//"died", 
		//"disbanded", 
		//"yearsactive", 
		//"musicbrainzartistid", 
		//"fanart", 
		"thumbnail"
	], 
	/** Artist detals to retrieve when returning a single record */
	artistFull: [
		//"instrument", 
		//"style", 
		//"mood", 
		"born", 
		"formed", 
		"description", 
		"genre", 
		"died", 
		"disbanded", 
		"yearsactive", 
		//"musicbrainzartistid", 
		//"fanart", 
		"thumbnail"
	], 
	/** Album detals to retrieve when returning a list */
	albumPartial: [
		//"title", 
		//"description", 
		"artist", 
		"genre", 
		//"theme", 
		//"mood", 
		//"style", 
		//"type", 
		"albumlabel", // music label
		"rating", 
		"year", 
		//"musicbrainzalbumid", 
		//"musicbrainzalbumartistid", 
		//"fanart", 
		"thumbnail", 
		"playcount", 
		"genreid", //increases response time
		"artistid", //increases response time
		"displayartist"
	], 
	/** Album detals to retrieve when returning a single record */
	albumFull: [
		//"title", 
		//"description", 
		"artist", 
		"genre", 
		//"theme", 
		//"mood", 
		//"style", 
		//"type", 
		"albumlabel", // music label
		"rating", 
		"year", 
		//"musicbrainzalbumid", 
		//"musicbrainzalbumartistid", 
		//"fanart", 
		"thumbnail", 
		"playcount", 
		"genreid", //increases response time
		"artistid", //increases response time
		"displayartist"
	], 
	/** Song detals to retrieve when returning a list */
	songPartial: [
		//"title", 
		//"artist", 
		//"albumartist", 
		"genre", 
		//"year", 
		"rating", 
		//"album", 
		"track", 
		"duration", 
		//"comment", 
		//"lyrics", 
		//"musicbrainztrackid", 
		//"musicbrainzartistid", 
		//"musicbrainzalbumid", 
		//"musicbrainzalbumartistid", 
		"playcount", 
		//"fanart", 
		//"thumbnail", 
		//"file", 
		//"albumid", 
		"lastplayed", 
		"disc", 
		//"genreid", //increases response time
		//"artistid", //increases response time
		"displayartist"//, 
		//"albumartistid" //increases response time
	], 
	/** Song detals to retrieve when returning a single record */
	songFull: [
		//"title", 
		//"artist", 
		//"albumartist", 
		"genre", 
		//"year", 
		"rating", 
		//"album", 
		"track", 
		"duration", 
		//"comment", 
		//"lyrics", 
		//"musicbrainztrackid", 
		//"musicbrainzartistid", 
		//"musicbrainzalbumid", 
		//"musicbrainzalbumartistid", 
		"playcount", 
		//"fanart", 
		//"thumbnail", 
		//"file", 
		//"albumid", 
		"lastplayed", 
		"disc", 
		//"genreid", //increases response time
		//"artistid", //increases response time
		"displayartist"//, 
		//"albumartistid" //increases response time
	],
	/** TV show detals to retrieve when returning a list */
	tvshowPartial: [
		//"title", 
		"genre", 
		"year", 
		"rating", 
		"plot", 
		"studio", 
		//"mpaa", 
		//"cast", //increases response time
		"playcount", 
		//"episode", 
		"imdbnumber", 
		"premiered", 
		//"votes", 
		//"lastplayed", 
		//"fanart", 
		"thumbnail", 
		//"file", 
		//"originaltitle", 
		"sorttitle", 
		//"episodeguide", 
		//"season", 
		//"watchedepisodes", 
		//"dateadded", 
		//"tag", 
		//"art"
	], 
	/** TV show detals to retrieve when returning a single record */
	tvshowFull: [
		//"title", 
		"genre", 
		"year", 
		"rating", 
		"plot", 
		"studio", 
		//"mpaa", 
		//"cast", //increases response time
		"playcount", 
		//"episode", 
		"imdbnumber", 
		"premiered", 
		//"votes", 
		//"lastplayed", 
		//"fanart", 
		"thumbnail", 
		//"file", 
		//"originaltitle", 
		"sorttitle", 
		//"episodeguide", 
		//"season", 
		//"watchedepisodes", 
		//"dateadded", 
		//"tag", 
		//"art"
	], 
	/** Season details to retrieve when returning a list */
	seasonPartial: [
		"season", 
		//"showtitle", 
		//"playcount", 
		//"episode", 
		//"fanart", 
		"thumbnail", 
		//"tvshowid", 
		"watchedepisodes", 
		//"art"
	], 
	/** Season details to retrieve when returning a single record */
	seasonFull: [
		"season", 
		//"showtitle", 
		//"playcount", 
		//"episode", 
		//"fanart", 
		"thumbnail", 
		//"tvshowid", 
		"watchedepisodes", 
		//"art"
	], 
	/** Episode details to retrieve when returning a list */
	episodePartial: [
		//"title", 
		"plot", 
		//"votes", 
		"rating", 
		"writer", 
		"firstaired", 
		"playcount", 
		"runtime", 
		"director", 
		"productioncode", 
		"season", 
		"episode", 
		//"originaltitle", 
		//"showtitle", 
		//"cast", 
		"streamdetails", 
		//"lastplayed", 
		//"fanart", 
		"thumbnail", 
		//"file", 
		"resume", 
		//"tvshowid", 
		//"dateadded", 
		//"uniqueid", 
		//"art"
	], 
	/** Episode details to retrieve when returning a single record */
	episodeFull: [
		//"title", 
		"plot", 
		//"votes", 
		"rating", 
		"writer", 
		"firstaired", 
		"playcount", 
		"runtime", 
		"director", 
		"productioncode", 
		"season", 
		"episode", 
		//"originaltitle", 
		//"showtitle", 
		//"cast", 
		"streamdetails", 
		//"lastplayed", 
		//"fanart", 
		"thumbnail", 
		//"file", 
		"resume", 
		//"tvshowid", 
		//"dateadded", 
		//"uniqueid", 
		//"art"
	], 
	/** Movie detals to retrieve when returning a list */
	moviePartial: [
		//"title", 
		"genre", 
		"year", 
		"rating", 
		"director", 
		//"trailer", 
		"tagline", 
		//"plot", 
		//"plotoutline", 
		//"originaltitle", 
		//"lastplayed", 
		"playcount", 
		//"writer", 
		"studio", 
		//"mpaa", 
		//"cast", // slows down load time
		"country", 
		"imdbnumber", 
		"runtime", 
		//"set", 
		//"showlink", // slows down load time
		"streamdetails", 
		//"top250", 
		//"votes", 
		//"fanart", 
		"thumbnail", 
		//"file", 
		"sorttitle", 
		"resume", 
		//"setid", 
		"dateadded", 
		//"tag", // slows down load time
		//"art"
	], 
	/** Movie detals to retrieve when returning a single record */
	movieFull: [
		//"title", 
		"genre", 
		"year", 
		"rating", 
		"director", 
		//"trailer", 
		"tagline", 
		//"plot", 
		"plotoutline", 
		//"originaltitle", 
		//"lastplayed", 
		"playcount", 
		"writer", 
		"studio", 
		//"mpaa", 
		//"cast", // slows down load time
		"country", 
		"imdbnumber", 
		"runtime", 
		"set", 
		//"showlink", // slows down load time
		"streamdetails", 
		//"top250", 
		//"votes", 
		//"fanart", 
		"thumbnail", 
		//"file", 
		"sorttitle", 
		"resume", 
		//"setid", 
		"dateadded", 
		//"tag", // slows down load time
		//"art"
	], 
	/** Artist detals to retrieve */
	movieset: [
		"title", 
		"playcount", 
		//"fanart", 
		"thumbnail", 
		//"art"
	], 
	/** Genre detals to retrieve */
	genre: [
		"title", 
		"thumbnail"
	]
};