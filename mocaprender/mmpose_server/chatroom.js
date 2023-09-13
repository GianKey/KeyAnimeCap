var cookie_reader = require('cookie');
var mmposeBk = require('./mmposeBk');

function initSocketEvent(socket) {
    socket.on('get', function() {
        console.log('event: get');
        mmposeBk.get('/pose/get_prediction_data', function(res){
            console.log('get_prediction_data 的返回：%j', res);    
        }, function(err) {
            console.log('error get data:' +err);
        });
    });
    socket.on('post', function(data) {
        console.log('event: post');
        mmposeBk.post(socket.handshake.headers.cookie || socket.request.headers.cookie, '/pose/postdata',{'data1':123, 'data2':'abc'},function(res){
            console.log('post_data 的返回：%j', res);    
        }, function(err) {
            console.log('error get data:' +err);s
        });
    
    });
}   

exports.init = function(io) {
    io.on('connection', function onSocketConnection(socket) {
        console.log('new connection');
        initSocketEvent(socket);
    });
};
