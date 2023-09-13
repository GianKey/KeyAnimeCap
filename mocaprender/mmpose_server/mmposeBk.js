const { on } = require('events');
var http = require('http');
const QueryString = require('qs');

var default_protocol = 'http://';
var default_hostname = '127.0.0.1';
var default_port = 8000;

exports.get = function get(path,on_data_callback, on_err_callback) {
  var url = default_protocol + default_hostname +':'+ default_port + path;
  var req = http.get(url, function onDjangoResponse(res) {
      res.setEncoding('utf-8');
      res.on('data', function onDjangoRequestGetData(data) {
          on_data_callback(JSON.parse(data));
      });
      res.resume();
    }).on('error', function onDjangoRequestGetError(e){
      if(on_err_callback)
         on_err_callback(e);
      else
         throw "error get" + url + "," + e;
    });
  } 

  var cookie = require('cookie');

  exports.post = function post(user_cookie,path,values,on_data_callback, on_err_callback) {
    var cookies = cookie.parse(user_cookie)
    var values = QueryString.stringify(values);
    var options = {
      hostname : default_hostname,
      port: default_port,
      path: path,
      method: 'POST',
      headers: {
        'Cookie': user_cookie,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': values.length,
        'X-CSRFToken': cookies['csrftoken'],
      }
    };

    var post_req = http.request(options, function onDjangoResponse(res) {
      res.setEncoding('utf-8');
      res.on('data', function onDjangoRequestGetData(data) {
          on_data_callback(JSON.parse(data));
      });
    
    }).on('error', function onDjangoRequestGetError(e){ 
      console.log(e);
      if(on_err_callback)
         on_err_callback(e);
      else
        throw "error get" + url + "," + e;
    });
    post_req.write(JSON.stringify(data));
    post_req.end();
  }