var django_request = require('./mmposeBk');
var qs = require('querystring');
// django_request.get('/pose/get_prediction_data',function(data){
//     console.log('get_prediction_data 的返回：%j', data);
// }, function(err) {
//     console.log('error get data:' +err);
// });

// socket.io 监听9000端口
var http  = require('http');
var sio = require("socket.io");
var chatroom = require('./chatroom');
const { response } = require('express');

const httpserver = http.createServer();
var io =sio(httpserver, {
    log:true,
    cors: true,
});
//console.log('io object:', io);
chatroom.init(io);
var port = 9000;

httpserver.listen(port, function startapp(){
    console.log('nodejs app listening on' + port);
});

httpserver.on('request', function(request, response){
    console.log('url: %s, method: %s', request.url, request.method);
    switch (request.url) {
        case '/node_get_data/':
            onGetData(request, response);
            break;
        case '/node_post_data/':
            onPostData(request, response);
            break;
        default:
            break;
    };
});

function onGetData(request, reponse){
    if(request.method == 'GET'){
        reponse.writeHead(200, {'Content-Type': 'application/json'});
        jsonobj = {
            'data1':123,
            'data2':'abc'
        }
        reponse.end(JSON.stringify(jsonobj));
    }else{
        reponse.writeHead(403);
        reponse.end();
    }
}

function onPostData(request, reponse){
    if(request.method == 'POST'){
        var body = '';
        request.on('data', function(data){
            body += data;

            if(body.length > 1e6)
                request.connection.destroy();
        });
    
        request.on('end', function(){
           var post = qs.parse(body);
           response.writeHead(200, {'Content-Type': 'application/json'});
           jsonobj = {
               'data1':123,
               'data2':'abc',
                'post_data':post,
           }
           //reponse(jsonobj)
           reponse.end(JSON.stringify(jsonobj));
        });
    }else{
        reponse.writeHead(403);
        reponse.end();
    }
}
    
