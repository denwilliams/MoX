function Notifications() {
	this.error = function(message) {
		var n = noty({text: message, type: 'error', timeout: 10000});
	}
	this.alert = function(message) {
		var n = noty({text: message, type: 'alert', timeout: 5000});
	}
}

//$.noty.defaults = {
  //layout: 'top',
  //theme: 'defaultTheme',
  //type: 'alert',
  //text: '',
  //dismissQueue: true, // If you want to use queue feature set this true
  //template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
  //animation: {
  //   open: {height: 'toggle'},
  //   close: {height: 'toggle'},
  //   easing: 'swing',
  //   speed: 500 // opening & closing animation speed
  // },
  //timeout: 5000, // delay for closing event. Set false for sticky notifications
  //force: false, // adds notification to the beginning of queue when set to true
  //modal: false,
  //closeWith: ['click'], // ['click', 'button', 'hover']
  // callback: {
  //   onShow: function() {},
  //   afterShow: function() {},
  //   onClose: function() {},
  //   afterClose: function() {}
  // },
  // buttons: false // an array of buttons
//};

ko.observableArray.fn.pushAll = function(valuesToPush) {
    var underlyingArray = this();
    this.valueWillMutate();
    ko.utils.arrayPushAll(underlyingArray, valuesToPush);
    this.valueHasMutated();
    return this;
};

ko.observableArray.fn.replaceAll = function(valuesToPush) {
    this.removeAll();
    this.pushAll(valuesToPush);
    return this;
};

// to use - var myValue = ko.observable(1.223123).extend({numeric: 1});
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

//({ type: "numeric", precision: 2 }).
ko.bindingHandlers.numericText = {
    update: function(element, valueAccessor, allBindingsAccessor) {
       var value = ko.utils.unwrapObservable(valueAccessor()),
           precision = ko.utils.unwrapObservable(allBindingsAccessor().precision) || ko.bindingHandlers.numericText.defaultPrecision,
           formattedValue = value.toFixed(precision);

        ko.bindingHandlers.text.update(element, function() { return formattedValue; });
    },
    defaultPrecision: 1  
};

ko.bindingHandlers.slider = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        //initialize datepicker with some optional options
        //var options = allBindingsAccessor().datepickerOptions || {};
        $(element).slider().on("slideStop", function (ev) {
            var observable = valueAccessor();
            //console.log(JSON.stringify(ev));
            observable(ev.value);
        });
    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element).slider('setValue', value);
        //.datepicker("setValue", value);
    }
};

ko.bindingHandlers.modal = {
    init: function (element, valueAccessor, allBindingsAccessor) { 
    	//console.log('--Binding modal--');
    },
    update: function (element, valueAccessor) {
        var observable = valueAccessor();
        var value = ko.utils.unwrapObservable(observable);
        function onClose() {
        	console.log('hiding modal');
        	$(element).off('hidden', onClose);
        	if (value) {
        		observable(false);
        	}
        };
        if (value) {
        	console.log('showing modal');
            $(element).modal('show').on('hidden', onClose);
            // this is to focus input field inside dialog
            $("input", element).focus();
        }
        else {
        	console.log('hiding modal');
            $(element).modal('hide');
        }
    }
};



(function ($) {
    "use strict";
    function enableInputClearOption() {
	// add private event handler to avoid conflict
        $("input[type=text]").not(".no-clear").unbind("clear-focus").bind("clear-focus", (function () {
            if ($(this).data("clear-button")) return;
            var x = $("<a class='clear-text' style='cursor:pointer;color:#888;'><i class='icon-remove'></i></a>");
            $(x).data("text-box", this);
            $(x).mouseover(function () { $(this).addClass("over"); }).mouseleave(function () { $(this).removeClass("over"); });
            $(this).data("clear-button", x);
            $(x).css({ "position": "absolute", "left": ($(this).position().right), "top": $(this).position().top, "margin": "3px 0px 0px -20px" });
            $(this).after(x);
            //$(this));
        })).unbind("clear-blur").bind("clear-blur", (function (e) {
            var x = $(this).data("clear-button");
            if (x) {
                if ($(x).hasClass("over")) {
                    $(x).removeClass("over");
                    $(x).hide().remove();
                    $(this).val("");
                    $(this).removeData("clear-button");
                    var txt = this;
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    setTimeout($.proxy(function () { $(this).trigger("focus"); }, txt), 50);
                    return false;

                }
            }
            if (x && !$(x).hasClass("over")) {
                $(this).removeData("clear-button");
                $(x).remove();
            }
        }));
	// add private event to the focus/unfocus events as branches
        $("input[type=text]").on("focus", function () {
            $(this).trigger("clear-focus");
        }).on("blur", function () {
            $(this).trigger("clear-blur");
        });
    }
    window.enableInputClearOption = enableInputClearOption;
    enableInputClearOption();
})(jQuery);
