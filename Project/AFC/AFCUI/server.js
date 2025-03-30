const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 端口设置
const PORT = process.env.PORT || 8080;

// MIME类型
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
};

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    // 解析URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // 将请求路径转换为本地文件路径
    let filePath = path.join(__dirname, 'app/src/main/assets/html', pathname);
    
    // 默认加载index.html
    if (pathname === '/') {
        filePath = path.join(__dirname, 'app/src/main/assets/html', 'index.html');
    }
    
    // 获取文件扩展名
    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // 读取文件
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 文件不存在
                fs.readFile(path.join(__dirname, 'app/src/main/assets/html', '404.html'), (err, content) => {
                    if (err) {
                        // 404页面也不存在，返回文本错误
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end('<h1>404 Not Found</h1><p>页面不存在</p>');
                    } else {
                        // 返回404页面
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content);
                    }
                });
            } else {
                // 服务器错误
                res.writeHead(500);
                res.end(`服务器错误：${err.code}`);
            }
        } else {
            // 成功响应
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// 启动服务器
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}/`);
    console.log(`在局域网中，您可以通过访问 http://[您的IP地址]:${PORT}/ 测试`);
    console.log(`您可以在Android应用中输入这个地址进行测试`);
}); 