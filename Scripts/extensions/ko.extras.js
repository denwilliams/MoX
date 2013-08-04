(function(ko, $) {
	if (typeof ko == 'undefined' || typeof $ == 'undefined')
		return;

	// ###################
	// #### COMPUTEDS ####
	// ###################
	
	/**
	 * Returns a computed variant of the array, where propertyName of each item
	 * matches the text from observableFilterInput
	 */
	ko.filteredArray = function(observableArray, observableFilterInput, propertyName) {
        return ko.computed(function() {
            var filter = ko.utils.unwrapObservable(observableFilterInput).toLowerCase();
            if (!filter) {
                return observableArray();
            } else {
                return ko.utils.arrayFilter(observableArray(), function (item) {
                    return ko.utils.unwrapObservable(item[propertyName])
                        .toLowerCase()
                        .indexOf(filter) >= 0;
                });
            }
        });
    };

	
	// ###################
	// #### FUNCTIONS ####
	// ###################
	
	/**
	 * Pushes all values to an array, only firing an event after
	 * all values have been added rather than each item.
	 */
	ko.observableArray.fn.pushAll = function(valuesToPush) {
		var underlyingArray = this();
		this.valueWillMutate();
		ko.utils.arrayPushAll(underlyingArray, valuesToPush);
		this.valueHasMutated();
		return this;
	};
	
	/**
	 * Replaces all the values in a knockout array with a new set
	 */
	ko.observableArray.fn.replaceAll = function(valuesToPush) {
		this(valuesToPush);
		return this;
	};
	
	// ###################
	// #### EXTENDERS ####
	// ###################	
	
	/**
	 * Formats the numeric value to the specified number of decimal places.
	 * to use - var myValue = ko.observable(1.223123).extend({numeric: 1});
	 */
	ko.extenders.numeric = function(target, precision) {
		var result = ko.dependentObservable({
			read: function() {
			   return target().toFixed(precision); 
			},
			write: target 
		});
	
		result.raw = target;
		return result;
	};

	// ##################
	// #### BINDINGS ####
	// ##################

	/**
	 * numericText Knockout binding.
	 * to use - data-bind="numericText: value, precision: 2"
	 */
	ko.bindingHandlers.numericText = {
		update: function(element, valueAccessor, allBindingsAccessor) {
		   var value = ko.utils.unwrapObservable(valueAccessor()),
			   precision = ko.utils.unwrapObservable(allBindingsAccessor().precision) || ko.bindingHandlers.numericText.defaultPrecision,
			   formattedValue = value.toFixed(precision);
	
			ko.bindingHandlers.text.update(element, function() { return formattedValue; });
		},
		defaultPrecision: 1  
	};

	/**
	 * JSON Knockout binding. Useful for debugging.
	 * to use - data-bind="json: value"
	 */
	ko.bindingHandlers.json = {
		update: function(element, valueAccessor, allBindingsAccessor) {
		   var value = ko.utils.unwrapObservable(valueAccessor()),
			   formattedValue = JSON.stringify(value);
	
			ko.bindingHandlers.text.update(element, function() { return formattedValue; });
		}
	};
	
	/**
	 * HH:mm:ss Knockout binding. Displays an integer number of seconds as HH:mm:ss.
	 * to use - data-bind="hhmmss: value"
	 */
	ko.bindingHandlers.hhmmss = {
		update: function(element, valueAccessor, allBindingsAccessor) {
			var time;
			var value = ko.utils.unwrapObservable(valueAccessor());
			
			var sec_num = parseInt(value, 10); // don't forget the second parm
			var hours   = Math.floor(sec_num / 3600);
			var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
			var seconds = sec_num - (hours * 3600) - (minutes * 60);

			if (hours   < 10) {hours   = "0"+hours;}
			if (minutes < 10) {minutes = "0"+minutes;}
			if (seconds < 10) {seconds = "0"+seconds;}
			if (hours === '00') {
				time = minutes+':'+seconds;
			} else {
				time = hours+':'+minutes+':'+seconds;   
			}
			ko.bindingHandlers.text.update(element, function() { return time; });
		}
	};
	
	/**
	 * HH:mm Knockout binding. Displays an integer number of seconds as HH:mm (seconds not displayed).
	 * to use - data-bind="hhmm: value"
	 */
	ko.bindingHandlers.hhmm = {
		update: function(element, valueAccessor, allBindingsAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			
			var sec_num = parseInt(value, 10); // don't forget the second parm
			var hours   = Math.floor(sec_num / 3600);
			var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
			var seconds = sec_num - (hours * 3600) - (minutes * 60);

			if (hours   < 10) {hours   = "0"+hours;}
			if (minutes < 10) {minutes = "0"+minutes;}
			if (seconds < 10) {seconds = "0"+seconds;}
			var time    = hours+':'+minutes;   
	
			ko.bindingHandlers.text.update(element, function() { return time; });
		}
	};

	// see http://figg-blog.tumblr.com/post/32733177516/infinite-scrolling-knocked-out

	// apply this to a div. whenever the div is reached the function will be called
	// eg: scroll: collection().length < 160, scrollOptions: { loadFunc: addSome, offset: 10 }
	ko.bindingHandlers.scroll = {
	 
		updating: true,

		init: function(element, valueAccessor, allBindingsAccessor) {
		var self = this
		self.updating = true;
		ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
			(window).off("scroll.ko.scrollHandler")
			self.updating = false
			});
		},
	 
	  update: function(element, valueAccessor, allBindingsAccessor){
		var props = allBindingsAccessor().scrollOptions
		var offset = props.offset ? props.offset : "0"
		var loadFunc = props.loadFunc
		var load = ko.utils.unwrapObservable(valueAccessor());
		var self = this;
	 
		if(load){
		  element.style.display = "";
		  $(window).on("scroll.ko.scrollHandler", function(){
			if(($(document).height() - offset <= $(window).height() + $(window).scrollTop())){
			  if(self.updating){
				loadFunc()
				self.updating = false;
			  }
			}
			else{
			  self.updating = true;
			}
		  });
		}
		else{
			element.style.display = "none";
			$(window).off("scroll.ko.scrollHandler")
			self.updating = false
		}
	  }
	}

	ko.bindingHandlers.hidden = {
		update: function(element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			ko.bindingHandlers.visible.update(element, function() { return!value; });
		}
	};

	ko.bindingHandlers.carouFredSel = {
		created: false,
		init: function(element, valueAccessor, allBindingsAccessor, fourthParam) {
			ko.bindingHandlers.foreach.init(element, valueAccessor, allBindingsAccessor, fourthParam);
		},
		update: function(element, valueAccessor, allBindingsAccessor, fourthParam, fifthParam) {
			ko.bindingHandlers.foreach.update(element, valueAccessor, allBindingsAccessor, fourthParam, fifthParam);
			var count = ko.utils.unwrapObservable(valueAccessor()).length;
			// generate unique id
			if (count > 0) {
				var id = guid();
				//if (!this.created) {
					var $parent = $(element).parent();

					var $aPrev = $('<a />');
					$aPrev.attr('id', 'prev'+id).addClass('prev').append('<span>prev</span>');
					var $aNext = $('<a />');
					$aNext.attr('id', 'next'+id).addClass('next').append('<span>next</span>');
					var $divPag = $('<div />');
					$divPag.attr('id', 'pag'+id).addClass('pagination');

					$parent.append($aPrev);
					$parent.append($aNext);
					$parent.append($divPag);

					//this.created = true;
				//}
				$(element).carouFredSel({
					width: '100%', 
					//responsive: true,
					//circular: false,
					//infinite: false,
					auto 	: false,
					prev	: {
						button	: "#prev"+id,
						key		: "left"
					},
					next	: { 
						button	: "#next"+id,
						key		: "right"
					},
					pagination	: "#pag"+id
				});
			}
		}
	};
	
	/**
	 * Click Toggle binding to invert boolean values on click event.
	 * to use - data-bind="clickToggle: boolObservable"
	 */
	ko.bindingHandlers.clickToggle = {
		init: function(element, valueAccessor) {
			var value = valueAccessor();
			if (ko.isObservable(value)) {
				$(element).click(function(e) {
					value(!value());
				});
			}
		}
	};

	ko.bindingHandlers.slider = {
		init: function (element, valueAccessor, allBindingsAccessor) {
		    var options = allBindingsAccessor().sliderOptions || {};
		    var value = ko.utils.unwrapObservable(valueAccessor());
		    var $el = $(element);
		    $el.val(value);
		    $el.simpleSlider(options);
		    $el.simpleSlider("setValue", value);
		    $el.bind("slider:changed", function (event, data) {
				// The currently selected value of the slider
				//alert(data.value);
		        var observable = valueAccessor();
		        if (data.value != observable()) {
			        // have data.value & data.ratio available
					//alert(data.value);
			        observable(data.value);
		        }
			}).bind("slider:ready", function (event, data) {
				//alert(data.value);
			    $el.simpleSlider("setValue", value);
			});

		    // ko.utils.registerEventHandler(element, "slider:changed", function (event, data) {
		    //     var observable = valueAccessor();
		    //     // have data.value & data.ratio available
		    //     observable(data.value);
		    // });
		    //ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
		    //    $(element).slider("destroy");
		    //});
		    //ko.utils.registerEventHandler(element, "slide", function (event, ui) {
		    //    var observable = valueAccessor();
		    //    observable(ui.value);
		    //});
		  },
		  update: function (element, valueAccessor) {
		    var value = ko.utils.unwrapObservable(valueAccessor());
		    if (isNaN(value)) value = 0;
		    var $el = $(element);
		    $el.val(value);
		    $el.simpleSlider("setValue", value);
		  }
	};

	// #####################
	// #### TRANSITIONS ####
	// #####################

	/**
	 * Similar to the visible binding, except that it fades the element in and out.
	 * Requires jQuery.
	 * Note: this is taken direct from the Knockout website
	 */
	ko.bindingHandlers.fadeVisible = {
		init: function(element, valueAccessor) {
			// Initially set the element to be instantly visible/hidden depending on the value
			var value = valueAccessor();
			$(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
		},
		update: function(element, valueAccessor) {
			// Whenever the value subsequently changes, slowly fade the element in or out
			var value = valueAccessor();
			ko.utils.unwrapObservable(value) ? $(element).fadeIn() : $(element).fadeOut();
		}
	};

	function s4() {
	  return Math.floor((1 + Math.random()) * 0x10000)
	             .toString(16)
	             .substring(1);
	};

	function guid() {
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	         s4() + '-' + s4() + s4() + s4();
	}
})(ko, $);
