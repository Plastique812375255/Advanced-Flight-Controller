# Android WebView 应用

这是一个Android应用示例，展示了如何使用WebView加载并显示网页内容，包括本地HTML页面和远程网站。

## 功能特点

- 使用Android WebView加载网页
- 强制横屏显示并隐藏状态栏
- 支持基本的网页导航（前进、后退、刷新）
- 支持加载本地HTML页面
- 支持加载远程网站
- 支持JavaScript功能
- 包含用于本地开发测试的简易HTTP服务器
- 本地预览网站支持切换不同纵横比（16:9、18:9、20:9和21:9）

## 项目结构

```
AndroidWebViewApp/
├── app/
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/
│           │       └── example/
│           │           └── androidwebviewapp/
│           │               └── MainActivity.java  # 主活动类
│           ├── res/
│           │   ├── layout/
│           │   │   └── activity_main.xml         # 主界面布局
│           │   └── values/
│           │       ├── colors.xml                # 颜色资源
│           │       ├── strings.xml               # 字符串资源
│           │       └── themes.xml                # 主题资源
│           ├── assets/
│           │   └── html/                         # 本地HTML页面
│           │       ├── index.html
│           │       ├── page2.html
│           │       └── 404.html
│           └── AndroidManifest.xml               # 应用清单
├── build.gradle                                  # 项目级构建文件
├── app/build.gradle                              # 应用级构建文件
├── settings.gradle                               # 项目设置
├── gradle.properties                             # Gradle属性
└── server.js                                     # 本地测试服务器
```

## 使用方法

### 1. 构建和运行Android应用

1. 使用Android Studio打开项目
2. 连接Android设备或启动虚拟设备
3. 点击"运行"按钮

### 2. 使用WebView浏览网页

- 在地址栏输入URL并点击"访问"
- 使用导航按钮进行前进、后退和刷新操作
- 点击"本地页面"按钮访问应用内嵌的HTML页面

### 3. 使用本地开发服务器进行测试

1. 确保已安装Node.js
2. 打开命令行终端，进入项目根目录
3. 运行以下命令启动本地服务器：

```bash
node server.js
```

4. 服务器将在8080端口启动，控制台会显示访问地址
5. 在Android应用中输入显示的地址（例如：http://192.168.x.x:8080）

### 4. 本地预览纵横比切换

本地HTML页面提供了纵横比预览功能，支持以下几种常见纵横比：
- 16:9（传统宽屏）
- 18:9（全面屏）
- 20:9（超宽屏）
- 21:9（电影屏）

点击相应的按钮可以切换预览容器的纵横比，模拟不同设备屏幕。

## 开发提示

- 本地HTML文件位于`app/src/main/assets/html/`目录下，您可以根据需要修改或添加新的HTML页面
- 修改`MainActivity.java`中的WebView设置可以启用或禁用特定功能
- 若要在本地开发中测试实时更新，请使用服务器模式，并确保Android设备与开发电脑在同一网络中
- 应用已设置为强制横屏显示，并隐藏状态栏，以提供更好的沉浸感

## 注意事项

- 应用已配置允许使用明文HTTP流量（usesCleartextTraffic="true"）
- WebView已启用JavaScript功能
- 确保Android设备有网络访问权限
- 应用强制横屏模式可能不适合所有类型的内容 