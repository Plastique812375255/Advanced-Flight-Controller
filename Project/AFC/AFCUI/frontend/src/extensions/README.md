# AFCUI 扩展目录

此目录包含 AFCUI 的各种扩展组件，包括机型、插件、小组件和主题。

## 目录结构

- `models/` - 飞行器机型定义
- `plugins/` - 功能插件
- `widgets/` - 控制界面小组件
- `themes/` - 界面主题
- `features/` - 其他功能扩展

## 扩展类型

### 机型 (models)

定义不同类型飞行器的配置和参数预设。每个机型有自己独立的文件夹，包含：

- `index.ts` - 机型定义入口
- `assets/` - 图标、机架图示等资源
- `components/` - 机型特有的组件

例如：`models/quadcopter/`

### 插件 (plugins)

扩展应用功能的独立模块。每个插件有自己独立的文件夹，包含：

- `index.ts` - 插件定义入口
- `assets/` - 图标等资源
- `components/` - 插件界面组件

例如：`plugins/battery-monitor/`

### 小组件 (widgets)

在控制界面上显示信息或提供控制功能的UI组件。每个小组件有自己独立的文件夹，包含：

- `index.ts` - 小组件定义入口
- `assets/` - 图标等资源
- `components/` - 小组件界面组件

例如：`widgets/attitude/`

### 主题 (themes)

自定义应用界面外观的主题包。每个主题有自己独立的文件夹，包含：

- `index.ts` - 主题定义入口
- `assets/` - 背景图、图标等资源
- `styles/` - CSS样式定义

例如：`themes/dark/`

## 扩展开发指南

每个扩展应遵循扩展类型的标准接口定义，详见 `src/typings/modelTypes.d.ts`。

- 所有资源文件应放在扩展目录的 `assets/` 子目录下
- 所有组件应放在扩展目录的 `components/` 子目录下
- 每个扩展必须有一个 `index.ts` 作为入口文件
- 扩展命名应使用小写字母和连字符 (kebab-case) 