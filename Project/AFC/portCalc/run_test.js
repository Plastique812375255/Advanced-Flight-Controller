// 运行转换测试脚本
const { spawn } = require('child_process');
const path = require('path');

console.log('AFC 通道计算器 - 二进制转换测试');
console.log('==============================');

// 执行测试脚本
const testProcess = spawn('node', [path.join(__dirname, 'test_conversion.js')]);

// 处理测试脚本的输出
testProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

testProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

testProcess.on('close', (code) => {
  console.log(`测试脚本退出，状态码: ${code}`);
  
  if (code === 0) {
    console.log('测试成功完成!');
    console.log('');
    console.log('接下来，您可以：');
    console.log('1. 在浏览器中打开 mode_test.html 查看映射模式和启用标志的可视化测试');
    console.log('2. 查看 test_modes.bin 和 test_modes_restored.csv 文件比较转换结果');
  } else {
    console.log('测试失败，请检查错误信息');
  }
});

// 提示用户
console.log('正在运行测试脚本...');
console.log(''); 