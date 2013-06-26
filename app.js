
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

// create app, server, and io
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// configure socket.io
io.set("polling duration", process.env.POLLING_DURATION || 1);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routes
app.get('/', routes.index);

// setup mqtt
var mqtt = require('mqtt'), url = require('url');
var mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883');
var auth = (mqtt_url.auth || ':').split(':');

// Create a client connection
var mqtt_client = mqtt.createClient(mqtt_url.port, mqtt_url.hostname, {
  username: auth[0],
  password: auth[1]
});

mqtt_client.on('connect', function() { // When connected
  console.log("mqtt client connected");

  // subscribe to a topic
  mqtt_client.subscribe('led', function() {
    // when a message arrives, send it out to the websockets
    mqtt_client.on('message', function(topic, message, packet) {
      console.log("Received '" + message + "' on '" + topic + "'");
      io.sockets.emit('mqtt_message', topic, message, packet);
    });
  });
});

// listen
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

