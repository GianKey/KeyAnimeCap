const djangoBk = path.join("F:/AI/BackEnd/AIBackEnd/mmpose_backend/mmpose_backend","mmpose_server/manage.py")
djangoProcess = spawn('python', [backendPath, 'runserver']);
// 监听子进程的标准输出
djangoProcess.stdout.on('data', (data) => {
    console.log(`Django stdout: ${data}`);
  });
// 监听子进程的标准错误输出
djangoProcess.stderr.on('data', (data) => {
console.error(`Django stderr: ${data}`);
});

  
// 子进程关闭时的处理
childProcess.on('close', (code) => {
    onsole.log(`子进程退出，退出码：${code}`);
});
  
// 向子进程发送数据
childProcess.stdin.write('Hello, child process!');
childProcess.stdin.end();

const http = require('http');

const options = {
  hostname: 'localhost',  // Django服务器的主机名
  port: 8000,             // Django服务器的端口号
  path: '/api/your_endpoint',  // 替换为你的API端点路径
  method: 'GET',           // 请求方法，可以根据需要更改
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`从Django获取的数据：${data}`);
  });
});

req.on('error', (error) => {
  console.error(`HTTP请求错误：${error}`);
});

req.end();
后端进程
