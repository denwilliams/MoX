window.Xbmc = window.Xbmc || {};

Xbmc.WebSocketsApi = function(options) {
	"use strict";
	var self = this;
	
	var SOCKET_CONNECTING = 0;
	var SOCKET_OPEN = 1;
	var SOCKET_CLOSED = 2; 
	//var WEBSOCKET_TIMEOUT = 3000; //3 seconds
	//var MAX_SOCKET_CONNECTION_ATTEMPTS = 3;
	
	var _cmdId = 1; // the next command ID in sequence
	var _pendingCmds = {};
	var _notificationBindings = {};
	
	var _settings = extend({
		host: window.location.host || 'localhost'
		,port: '9090'
		,autoRetry: true
		,retryInterval: 10000 // number of milliseconds to wait before retrying connection
		,onConnected: function() {_debug('XBMC Web Sockets Connected');}
		,onDisconnected: function() {_debug('XBMC Web Sockets Connected');}
	}, options || {});
	
	var _connected = false;
	var _isRetry = false;
	var _available = false;
	var _ws; // the websocket
	var _port = _settings.port;
	var _hostname = _settings.host;
	var _onConnected = _settings.onConnected;
	var _onDisconnected = _settings.onDisconnected;
	var _monitorTimer = null;
	var _monitorCount = 0;
	
	function extend(a,b) {
		for(var key in b)
     	   if(a.hasOwnProperty(key))
	            a[key] = b[key];
	    return a;
	}
	
	function init() {
		// firefox websockets
		if (window.MozWebSocket) {
			window.WebSocket = window.MozWebSocket;
		}
		_available = Xbmc.WebSocketsApi.isAvailable();
		if (_available === true) {
			_connect();
		}
	}
	
	function _connect() {
		if (_connected === false) {
			_ws = new WebSocket('ws://' + _hostname + ':' + _port + '/jsonrpc');
			_ws.onopen = _onWsOpen;
			_ws.onmessage = _onWsMessage; 
			_ws.onclose = _onWsClose;
			_ws.onerror = _onWsError;
			if (self.isConnected()) { // already connected??
				_onWsOpen();
			}
		}
	}
	
	function _debug(msg) {
		if (Xbmc.DEBUG === true)
			console.log(msg);
	}
	
	function _monitor() {
		if (_monitorCount > 0) { // last pint failed!
			_onWsClose();
		} else {
			_monitorCount++;
			self.call('JSONRPC.Ping',{},function(pong) {
				if (pong === 'pong') {
					_monitorCount = 0;
				}
			});
		}
	}
		
	function _onWsOpen() {
		if (!_monitorTimer) {
			_monitorTimer = setInterval(_monitor, 5000);
		}
		_connected = true;
		_isRetry = false;
		_onConnected();
		_debug('web socket is connected');
	}
	
	function _onWsClose() {
		if (_monitorTimer) {
			_monitorTimer = clearInterval(_monitorTimer);
		}
		_connected = false;
		if (_isRetry === false) {
			_onDisconnected();
			_debug('websocket is closed');
		}
		if (_settings.autoRetry === true) {
			_isRetry = true;
			setTimeout(_connect,_settings.retryInterval);
		}
	}
	
	function _onWsMessage(msg) {
		var json = msg.data;
		_debug('message received - ' + json);
		var obj = JSON.parse(json);
		if (typeof obj.id !== 'undefined') { // reply
			_debug('received reply for '+obj.id);
			// try and find the callbacks
			var callbacks = _pendingCmds[obj.id];
			delete _pendingCmds[obj.id];
			// error?
			if (typeof obj.error === 'object') {
				if (typeof callbacks.onError === 'function') {
					callbacks.onError(obj.error);
				}
			} else {
				if (typeof callbacks.onSuccess === 'function') {
					callbacks.onSuccess(obj.result);
				}
			}
			_debug(JSON.stringify(_pendingCmds));
		} else if (typeof obj.method !== 'undefined') { // notification
			parseNotification(obj.method, obj.params.data);
		}	
	}
	
	function _onWsError(err) {
		_debug(JSON.stringify(err));
	}
	
	function getNextId() {
		return _cmdId++;
	}
	
	function buildCommand(method, params) {
		return {
			jsonrpc: "2.0"
			, method: method
			, params: params
			, id: getNextId()
		}
	}
	
	function parseNotification(method, data) {
		if (_notificationBindings[method]) {
			var n = _notificationBindings[method];
			for (var i in n) {
				n[i](data);
			}
		}
	}
	
	this.call = function(method, params, onSuccess, onError) {
		if (self.isConnected()) {
			var cmd = buildCommand(method,params);
			_pendingCmds[cmd.id] = {
				onSuccess: onSuccess
				, onError: onError
			};
			_ws.send(JSON.stringify(cmd));
		}		
	};
	
	this.subscribe = function(notification, handler) {
		if (!_notificationBindings[notification]) {
			_notificationBindings[notification] = [];
		}
		_notificationBindings[notification].push(handler);
	};
	
	this.unsubscribe = function(notification, handler) {
		if (_notificationBindings[notification]) {
			var n = _notificationBindings[notification];
			var i = n.indexOf(handler);
			if (i >= 0) {
				n.splice(i,1);
			}
		}
	};
	
	this.isConnected = function() {
		if (_ws == null) return false;
		return _ws.readyState === SOCKET_OPEN;
	};
	
	init();
}

Xbmc.WebSocketsApi.isAvailable = function() {
	return ("WebSocket" in window);
}
