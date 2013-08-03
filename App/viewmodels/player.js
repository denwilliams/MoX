define(
[
	'services/xbmcdatacontext',
	'services/xbmceventcontext',
],
function(xbmcDataContext, xbmcEventContext) {
	var isActive = ko.observable(true),
		isPaused = ko.observable(false),
		volume = ko.observable(0),
		muted = ko.observable(false),
		vm = {
			isActive: isActive,
			isPaused: isPaused,
			volume: volume,
			showVolume: function() {},
			muted: muted,
			time: '0:00:00',
			duration: '0:00:00',
			title: 'Title',
			subtitle: 'Subtitle',
			activate: activate,
			viewAttached: viewAttached,
		};
		
	return vm;
	
	function viewAttached(view) {
		volume(60);
	}
	
	function activate() {
	}
});
