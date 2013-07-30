require.config({
	paths: {
		'xbmccachedquerycontroller': '../Scripts/xbmc/XbmcCachedQueryController',
        'xbmcproperties': '../Scripts/xbmc/XbmcProperties',
        'xbmccontroller': '../Scripts/xbmc/XbmcController',
		'xbmchttpapi': '../Scripts/xbmc/XbmcHttpApi',
		'xbmcmodelbindings': '../Scripts/xbmc/XbmcModelBindings',
		'xbmcwebsocketsapi': '../Scripts/xbmc/XbmcWebSocketsApi',
		'jlinq': '../Scripts/jlinq',
		'koextras': '../Scripts/extensions/ko.extras',
		'text': 'durandal/amd/text'
	},
	shim: {
		//'xbmcwebsocketsapi' : { deps: [] },
		'xbmccachedquerycontroller': { deps: ['xbmccontroller'], exports: 'Xbmc' },
		'xbmccontroller': { deps: ['xbmcwebsocketsapi', 'xbmcproperties'] },
	}
});

/*
requirejs.config({
    paths: {
        'text': 'durandal/amd/text'
    }
});
*/

define(
[
    'durandal/app',
    'durandal/viewLocator',
    'durandal/system',
    'durandal/plugins/router',
    'services/logger',
    'config'
],
function(app, viewLocator, system, router, logger, config) {
    //>>excludeStart("build", true);
    system.debug(true);
    //>>excludeEnd("build");

    app.title = config.appTitle;
    app.start().then(function() {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        //configure routing
        router.useConvention();
        router.map(config.routes);
        router.mapAuto();

        app.adaptToDevice();

        //Show the app by setting the root view model for our application with a transition.
        app.setRoot(config.rootModule, config.transition);

        //override bad route behaviour
        //router.handleInvalidRoute = function(route, params) {
        //	alert('Invalid link - ' + route);
        //};
    });
});
