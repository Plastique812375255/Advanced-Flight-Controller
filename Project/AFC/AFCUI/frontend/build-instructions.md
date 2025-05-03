# Vue 前端构建说明

## 准备工作

1. 确保已安装Node.js和npm（或yarn）
   ```bash
   # 检查版本
   node -v
   npm -v
   ```

2. 在AFCUI/frontend目录下安装依赖
   ```bash
   cd AFCUI/frontend
   npm install
   # 或者
   yarn
   ```

## 构建步骤

1. 在AFCUI/frontend目录下运行构建命令
   ```bash
   npm run build
   # 或者
   yarn build
   ```

2. 确认构建输出
   - 构建后的文件会自动输出到 `AFCUI/app/src/main/assets/html` 目录
   - 这样Android WebView就能正确加载Vue应用

## 手动复制方案

如果自动构建方案出现问题，可以使用以下手动复制方法：

1. 修改vue.config.js中的outputDir为本地目录
   ```js
   outputDir: 'dist',
   ```

2. 运行构建
   ```bash
   npm run build
   ```

3. 手动将dist目录下的所有文件复制到Android项目中
   ```bash
   cp -r dist/* ../app/src/main/assets/html/
   ```

## 注意事项

- 确保Vue路由模式与WebView兼容（使用hash模式）
- 构建完成后需要重新编译Android项目
- 修改Vue代码后必须重新构建并部署到Android项目 