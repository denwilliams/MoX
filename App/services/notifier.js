$.noty.defaults = {
    layout: 'topRight',
    theme: 'defaultTheme',
    type: 'alert',
    text: '',
    dismissQueue: true, // If you want to use queue feature set this true
    template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
    animation: {
        open: {height: 'toggle'},
        close: {height: 'toggle'},
        easing: 'swing',
        speed: 500 // opening & closing animation speed
    },
    timeout: false, // delay for closing event. Set false for sticky notifications
    force: false, // adds notification to the beginning of queue when set to true
    modal: false,
    maxVisible: 5, // you can set max visible notification for dismissQueue true option
    closeWith: ['click'], // ['click', 'button', 'hover']
    callback: {
        onShow: function() {},
        afterShow: function() {},
        onClose: function() {},
        afterClose: function() {}
    },
    buttons: false // an array of buttons
};

define(function() {
	var notifier = {
		success: notifySuccess,
		error: notifyError,
		info: notifyInfo,
		warn: notifyWarning,
		alert: notifyAlert,
		editText: editNoticeMessage,
		changeType: editNoticeType,
		clear: clearAllNotices,
		prompt: prompt,
	};

	return notifier;

	function editNoticeMessage(notice, newMessage) {
		notice.setText(newMessage);
	}

	function editNoticeType(notice, newType) {
		notice.setType(newMessage);
	}

	function closeNotice(notice) {
		notice.close();
	}

	function clearAllNotices() {
		$.noty.clearQueue();
		$.noty.closeAll();
	}

	function notifySuccess(message, title) {
		return notify(message, title, 'success', 3000);
	}

	function notifyError(message, title) {
		return notify(message, title, 'error', 10000, true);
	}

	function notifyWarning(message, title) {
		return notify(message, title, 'warning', 8000, true);
	}

	function notifyInfo(message, title) {
		return notify(message, title, 'information', 5000);
	}

	function notifyAlert(message, title) {
		return notify(message, title, 'alert', false);
	}

	function notify(message, title, type, timeout, force) {
		return noty({text: buildNoticeText(message, title), type: type, timeout: timeout, force: force || false});
	}

	function prompt(message, title, onOk, onCancel) {
		noty({
			text: buildNoticeText(message, title),
			buttons: [
				{
					addClass: 'btn btn-primary', 
					text: 'Ok', 
					onClick: function($noty) {
						// this = button element
						// $noty = $noty element
						$noty.close();
						if (typeof onOk === 'function')
							onOk();
					}
				}, {
					addClass: 'btn btn-danger', 
					text: 'Cancel', 
					onClick: function($noty) {
						$noty.close();
						if (typeof onCancel === 'function')
							onCancel();
					}
				}
			]
		});
	}

	function buildNoticeText(message, title) {
		if (title) {
			return '<strong>' + title + '</strong> - ' + message;
		}
		return message;
	}
});
