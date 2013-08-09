define(
[
    'durandal/plugins/router',
    'services/xbmcplayercontext'
],
function(router, player) {
	var enabled = true,
		keyboard = {
			enable: function() { enabled = true; },
			disable: function() { enabled = true; },
		};

	init();

	function init() {
        $(document).keyup(function (e){
            switch (e.keyCode) {
                case 27: // esc
                    // clear & focus on doc
                    $('input.list-filter, input.global-search').val('').change().blur();
                    break;
            }
        });

		$(document).keypress(function (e){
            // cancel if in an input field
            if( enabled === false ) return;

            if ( $(e.target).is(":input") ) return;

            // see http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
            switch (e.keyCode) {
                case 45: // -
                    // volume down
                    player.getVolume(function(vol) {
                        var newVol = vol.volume - 5;
                        if (newVol < 0) newVol = 0;
                        player.setVolume(newVol);
                    });
                    break;
                case 61: // -
                    // volume up
                    player.getVolume(function(vol) {
                        var newVol = vol.volume + 5;
                        if (newVol > 100) newVol = 100;
                        player.setVolume(newVol);
                    });
                    break;
                case 116: // T
                    // TV
                    router.navigateTo('#/tv');
                    break;
                case 109: // M
                    // Movies
                    router.navigateTo('#/movies');
                    break;
                case 97: // A
                    // Music artists
                    router.navigateTo('#/music');
                    break;
                case 100: // D
                    // Dashboard
                    router.navigateTo('#/');
                    break;
                case 102: // F
                    // Jump to the list filter field
                    e.preventDefault();
                    $('input.list-filter').focus();
                    break;
                case 115: // S
                    // Jump to the global search field
                    e.preventDefault();
                    $('input.global-search').focus();
                    break;
                case 90: // Z
                    // Back
                    break;
                case 88: // X
                    // Stop
                    break;
                case 67: // C
                    // Play/pause
                    break;
                case 86: // V
                    // Next
                    break;
                case 66: // B
                    // ??
                    break;
                case 40: // down arrow
                    break;
                case 39: // right arrow
                    break;
                case 38: // up arrow
                    break;
                case 37: // left arrow
                    break;
                default:
                    console.log(e.keyCode);
            }
        }); 
	}
});