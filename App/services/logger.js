define(
[],
function() {
	var logger = {
		logInfo: logInfo,
		logError: logError
	};

	return logger;

	function logInfo(message, data, source, showInUi) {
		console.log(message);
	}
	function logError(message, data, source, showInUi) {
		console.error(message);
	}
});