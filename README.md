#About
This is a Factual-unsupported [Parse](http://parse.com) driver for [Factual's public API](http://developer.factual.com/).
It's intended to be used within [Parse CloudCode](https://www.parse.com/docs/cloud_code_guide#cloud_code).

#Installation
Just download and copy the `lib` folder into the `cloud` folder of your CloudCode project.

#Get Started
Include the driver in your main.js file:
```javascript
var Factual = require('cloud/lib/factual');
var factual = new Factual('FACTUAL_API_KEY', 'FACTUAL_API_SECRET');
```
If you don't have a Factual API account yet, [it's free and easy to get one](https://www.factual.com/api-keys/request).

#Example of a GET request to the Factual API
```javascript
Parse.Cloud.define("factualTest", function(request, response) {
    factual.get('/t/places','q=starbucks&limit=5', function (error, res) {
        if(!error) {
            response.success(res.data);
        } else {
            response.error("Error " + error.status + ": " + error.message);
        }
    });
});
```

#Debugging
To print debug information to the CloudCode log use:
```javascript
factual.startDebug();
```

#Further documentation
I will write more extensive documentation as soon as I get the time to do it. Sorry for the inconvinience!

For more info please look at:
* [Factual’s supported node.js driver](https://github.com/Factual/factual-nodejs-driver)

#Known Bugs
* HTTP-POST support is still in development.

#Credits
* Uses [Nico Prananta's Oauth Module for Parse Cloud Code](https://github.com/nicnocquee/Oauth-Module-for-Parse-Cloud-Code)
* Based on the [Factual node.js driver](https://github.com/Factual/factual-nodejs-driver)

#License
* Published under [GNU GPLv2](LICENSE)