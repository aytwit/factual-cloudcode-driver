/**
 * Factual CloudCode API
 * Created by mbensch on 17.01.14.
 */
var Requester = require('cloud/lib/factual/requester');

var Factual = function (key, secret) {
    this.requester = new Requester(key, secret);
    this.debug = false;
};

Factual.prototype = {

    startDebug: function () {
        this.debug = true;
    },

    stopDebug: function () {
        this.debug = false;
    },

    setRequestTimeout: function () {
        this.requester.setRequestTimeout(arguments[0]);
    },

    setBaseURI: function () {
        this.requester.setBaseURI(arguments[0]);
    },

    get: function () {
        if(this.debug) console.log("Request arguments: " + JSON.stringify(arguments));
        return this.requester.get.apply(this.requester, arguments);
    },


    //POST REQUESTS NOT YET SUPPORTED
    /**post: function () {
        return this.requester.post.apply(this.requester, arguments);
    },**/

    requestUrl: function () {
        return this.requester.url.apply(this.requester, arguments);
    }

};

module.exports = Factual;
