#About
This is a Factual-unsupported [Parse](http://parse.com) driver for [Factual's public API](http://developer.factual.com/).
It's intended to be used within [Parse CloudCode](https://www.parse.com/docs/cloud_code_guide#cloud_code).

#Installation
Just download and copy the `/lib` folder into the `cloud` folder of your CloudCode project.

#Get Started
Include the driver in your main.js file:
```
var Factual = require('cloud/lib/factual');
var factual = new Factual('FACTUAL_API_KEY', 'FACTUAL_API_SECRET');
```
#Example of a GET request to the Factual API
```
Parse.Cloud.define("factualTest", function(request, response) {
    factual.get('/t/places',{q:"starbucks", "include_count":"true"}, function (error, res) {
        if(!error) {
            response.success(res.data);
        } else {
            response.error("");
        }
    });
});
```
#Further documentation
I will write more extensive documentation as soon as I get the time to do it. Sorry for the inconvinience!

For more info please look at:
* [Factual’s supported node.js driver](https://github.com/Factual/factual-nodejs-driver)

#Known Bugs
*HTTP-POST support is still in development, thus no support for submitting places to the Factual API.