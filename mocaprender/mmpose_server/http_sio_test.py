import urllib
import urllib3
import urllib.request
 
httpClient = None
try:
    headers = {"Content-type": "application/x-www-form-urlencoded", 
               "Accept": "text/plain"}
    data = urllib.parse.urlencode({'post_arg1': 'def', 'post_arg2': 456})
    get_request = urllib.request.Request('http://127.0.0.1:9000/node_get_data/', headers=headers)
    get_response = urllib.request.urlopen(get_request)
    get_plainRes = get_response.read().decode('utf-8')
    print(get_plainRes)
    post_request = urllib.request.Request('http://127.0.0.1:9000/node_post_data/', data, headers)
    post_response = urllib.request.urlopen(post_request)
    post_plainRes = post_response.read().decode('utf-8')
    print(post_plainRes)
except Exception as e:
    print(e)
    
