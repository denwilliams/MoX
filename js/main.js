$(function(){
	$('a[data-toggle=popover]').popover();
	//$('input.slider').slider();
	
	// $(".clear-input").click(function(e){
	//   e.preventDefault();
	//   $(this).prev('input').val('').focus();
	// });
});

(function() {
	var model
	,bindings
	,xbmc = new Xbmc.Controller({
		host: Xbmc.host || window.location.host
		,onInit:function() { 
			_init();
		}
		//,onFail:function() { }	
	});
	
	function _init() {
		// init model
		model = new Model(xbmc);
		// xbmc to model bindings
		bindings = new XbmcModelBindings(xbmc,model);
		// model to DOM bindings
		ko.applyBindings(model);
	}
})();