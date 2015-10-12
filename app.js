var util = require('util');
var _ = require('underscore');


var http = require('http');
var url = require("url");
var io = require('socket.io');
var static = require('node-static');
var file = new static.Server('./public');


var http = require('http');
var querystring = require('querystring');

function processPost(request, response, callback) {

    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
        	// console.log(JSON.parse(queryData))
            // request.post = querystring.parse(queryData);
            request.post = JSON.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}


var server = http.createServer(function (request, response) {
	console.log(request.method+':'+request.url)
	if(request.method === 'POST')
	{
		
		processPost(request, response, function() {
            // console.log(request.post);
            _.each(request.post, function(tag) {
            	// console.log(tag)
		      	var url = 'https://api.instagram.com/v1/tags/' + tag.object_id + '/media/recent?client_id=479edbf0004c42758987cf0244afd3ef';
		      // sendMessage(url);
		      	console.log(url);
		      	sockets.emit('new:insts', {show: url});
		    });
            // request.post.forEach();
            // Use request.post here
            // var url = 'https://api.instagram.com/v1/tags/' + tag.object_id + '/media/recent?client_id=479edbf0004c42758987cf0244afd3ef';
      		// sendMessage(url);

            response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
            response.end();
        });

		/*
		var body = '';
        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            if (body.length > 1e6)
                request.connection.destroy();
        });
        request.on('end', function () {
            var post = qs.parse(body);

            // use post['blah'], etc.
        });
        console.log(body)
        */

        /*
		// var data = request.body;
		// console.log(data)
		if(data)
		{
		    data.forEach(function(tag) {
		      	var url = 'https://api.instagram.com/v1/tags/' + tag.object_id + '/media/recent?client_id=afb0a69b168047b69ac2e588833f436b';
		      	// sendMessage(url);
		      	console.log(url);
		    });
		}
	    response.end();
		*/
	}
	else
	{
		// console.log(request)
	    request.addListener('end', function () {

	        if(request.url == '/')
	        {
	            file.serveFile('/index.html', 200, {}, request, response);
	        }
	        else if (request.url === '/getip') { // getip - вернуть IP-адрес и порт
	      		response.writeHead(200, {'Content-Type': 'text/html'});
	      		response.end(request.headers.host);
	      		return;
	    	} 
	    	else if( url.parse(request.url).pathname === '/callback' )
	    	{
	    		if(request.method === 'GET')
	    		{
	    			Instagram.subscriptions.handshake(request, response); 
	    		}
	    	}
	        else
	        {
	            file.serve(request, response, function (e, res) {
	                if (e && (e.status === 404)) {
	                    file.serveFile('/not-found.html', 404, {}, request, response);
	                }
	            });
	        }
    	}).resume();
	}


}).on('error', function (error) {
    console.log(error);
}).listen(3000);

var sockets = io.listen(server);


Instagram = require('instagram-node-lib');

Instagram.set('client_id', 'afb0a69b168047b69ac2e588833f436b');
Instagram.set('client_secret', 'e6c52cec4e7b488e8095cfd52bff4b85');
Instagram.set('callback_url', 'http://213.88.60.167:3000/callback');
Instagram.set('redirect_uri', 'http://213.88.60.167:3000');

// app.get('/callback', function(req, res){
//     var handshake =  Instagram.subscriptions.handshake(req, res);
// });
Instagram.subscriptions.subscribe({
  object: 'tag',
  object_id: 'car',
  aspect: 'media',
  callback_url: 'http://213.88.60.167:3000/callback',
  type: 'subscription',
  id: '#'
});

// setTimeout(function () {
Instagram.subscriptions.unsubscribe({id:'7924610'});
console.log(Instagram.subscriptions.list())
// 	console.log('unsub')
// 	console.log(Instagram.subscriptions.list())
// }, 1000)