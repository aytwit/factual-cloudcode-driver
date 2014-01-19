var fs = require('fs');
var path = require("path");
var qs    = require('querystring');
var OAuth = require('cloud/lib/oauth').OAuth;

/** Configuration Variables **/
var DRIVER_VERSION = "1.0.1"
var FACTUAL_API_BASE_URI = 'http://api.v3.factual.com';
var DRIVER_HEADER = 'parse-cloud-code-' + DRIVER_VERSION;

var Requester = function (key, secret) {
    var customHeaders = {
        "Accept": "*/*",
        "Connection": "close",
        "User-Agent": "Parse CloudCode",
        "X-Factual-Lib": DRIVER_HEADER
    };
    this.oauth = new OAuth(null, null, key, secret, '1.0', null, 'HMAC-SHA1', null, customHeaders);
    this.debug = false;
    this.baseURI = FACTUAL_API_BASE_URI;
    this.reqTimeout = null;
};

Requester.prototype = {

    startDebug: function () {
        this.debug = true;
    },

    stopDebug: function () {
        this.debug = false;
    },

    setBaseURI: function (baseURI) {
        this.baseURI = baseURI || FACTUAL_API_BASE_URI;
    },

    setRequestTimeout: function (timeout) {
        this.reqTimeout = timeout;
    },

    get: function () {
        var isDebug = this.debug;
        var req = this.parseRequestArgs(arguments);
        this.setFullUrl(req);

        this.oauth.setClientOptions({ requestTokenHttpMethod: 'GET' });

        var orderedParameters= this.oauth._prepareParameters('', '', 'GET', req.url, null);
        var headers= {};
        var authorization = this.oauth._buildAuthorizationHeaders(orderedParameters);
        headers["Authorization"]= authorization;

        if(isDebug) {
            var debugInfo = "Request Information:\n\n";
            debugInfo += "URL: " + req.url + "\n";
            debugInfo += "Headers: " + JSON.stringify(headers) + "\n";
            console.log(debugInfo);
        }

        Parse.Cloud.httpRequest({
            url: req.url,
            headers: headers,
            success: function(httpResponse) {
                if(isDebug) console.log("[FACTUAL DEBUG] HttpRequest succeded with response: " + JSON.stringify(httpResponse));
                return req.callback(null,httpResponse.data.response);
            },
            error: function(httpResponse) {
                if(isDebug) console.log("[FACTUAL DEBUG] HttpRequest failed with response: " + JSON.stringify(httpResponse));
                var error = {
                    "code":httpResponse.status,
                    "message": ""
                }

                if(!httpResponse.data) {
                    error.message = "You sent an invalid request or an unknown error occurred.";
                } else {
                    error.message = httpResponse.data.message;
                }

                return req.callback(error, null);
            }
        });

    },

    url: function () {
        var req = this.parseRequestArgs(arguments);
        this.setFullUrl(req);
        return req.url;
    },

    post: function () {
        //TODO
    },

    setFullUrl: function (req) {
        if (req.data) {
            var connector = req.url.match(/\?/) ? '&' : '?';
            req.url += connector + qs.stringify(req.data);
            req.data = null;
        }
    },

    parseRequestArgs: function (args) {
        var req = {};
        req.raw = {};
        req.raw.path = args[0];
        var path = encodeURI(args[0]);
        req.url = path.match(/^\//) ? this.baseURI + path : path;

        if (args.length == 2) {
            req.data = null;
        } else {
            req.raw.query = args[1];
            req.data = this.getDataString(args[1]);
        }

        var lastArg = args[args.length -1];
        if ((typeof lastArg) == 'function') {
            req.callback = lastArg;
        } else if ((typeof lastArg) == 'object') {
            if (lastArg.customCallback) {
                req.callback = null;
                req.customCallback = lastArg.customCallback;
            }
        }

        return req;
    },

    urlRequest: function (method) {
        return (method == 'get' || method == 'delete');
    },

    multiRequest: function (req) {
        return req.url.match(/\/multi\?/) ? true : false;
    },

    diffsRequest: function (req) {
        return req.url.match(/\/diffs\?/) ? true : false;
    },

    getDataString: function (query) {
        if (query instanceof Object) {
            var stringifiedQuery = {};
            for (var p in query)
            {
                stringifiedQuery[p] = (query[p] instanceof Object) ? JSON.stringify(query[p]) : query[p];
            }
            return qs.stringify(stringifiedQuery);
        }
        return query;
    },

    getCallback: function (req) {
        var isDebug = this.debug;
        var isMulti = this.multiRequest(req);
        var isDiffs = this.diffsRequest(req);
        var cb = req.callback;

        return function (error, data, response) {
            var debugInfo = {};

            if (isDebug) {
                debugInfo.driverVersion = DRIVER_VERSION;
                debugInfo.request = {};
                debugInfo.request.method = req.method;
                debugInfo.request.path = req.raw.path;
                if (req.raw.query) debugInfo.request.query = req.raw.query;
                debugInfo.request.url = req.url;
                if (req.data) debugInfo.request.data = req.data;
            }

            if (error) {
                if (isDebug) {
                    debugInfo.error = error;
                    debugInfo.errorType = 'request';
                    console.log(debugInfo);
                }
                try {
                    var factualError = JSON.parse(error.data);
                    return cb(factualError, null, response);
                } catch (e) {}
                return cb(new Error(error.message || error), null, response);
            }

            if (isDebug) {
                debugInfo.request.header = response.client._httpMessage._header;
                debugInfo.response = {};
                debugInfo.response.statusCode = response.statusCode;
                debugInfo.response.header = response.headers;
                debugInfo.response.data = data;
            }

            if (isDiffs) {
                return cb(null, data);
            };

            try {
                var res = JSON.parse(data);
            } catch (err) {
                if (isDebug) {
                    debugInfo.error = err;
                    debugInfo.errorType = 'response';
                    console.log(debugInfo);
                }
                return cb(new Error(err.message), null, response);
            }

            if (isDebug) debugInfo.response.object = res;
            if (isMulti) {
                cb(null, res);
            } else {
                if (res.status != "ok") {
                    debugInfo.error = res;
                    debugInfo.errorType = 'factual';
                    if (isDebug) console.log(debugInfo);
                    cb(new Error(res.message), null, response);
                } else {
                    if (isDebug) console.log(debugInfo);
                    cb(null, res.response, response);
                }
            }
        };
    }
};

module.exports = Requester;