﻿define(
[
    'durandal/plugins/router', 
    'durandal/app',
    'services/logger',
    'services/xbmccontext',
    'config',
    'koextras',
], 
function (router, app, logger, xbmcContext, config) {

    return {
        router: router,
        search: search,
        activate: activate
    };

    function search() {
        //It's really easy to show a message box.
        //You can add custom options too. Also, it returns a promise for the user's response.
        app.showMessage('Search not yet implemented...');
    }

    function activate() {
    	return xbmcContext.init()
    		.then(boot)
    		.fail(failedInit);
    }
    
    function failedInit() {
	    alert('Failed to initialize');
    }
    
    function boot() {
        return router.activate(config.startModule);	    
    }
});