# STM32F7航模遥控器项目
================

## 项目说明
这是一个基于STM32F722的航模遥控器单片机部分代码框架。
项目主要实现遥控器核心功能，与安卓UI进行交互。

## 主要功能
- 摇杆输入读取(ADC)
- 开关位置读取(GPIO)
- 与安卓UI的串口通信
- 输出PWM/PPM/SBUS信号
- 配置保存和加载

## 硬件要求
- STM32F722 微控制器 (建议)
- 6-8路ADC输入 (摇杆)
- 12+路GPIO输入 (开关)
- 4路PWM输出
- 2路UART通信

## 开发环境
- STM32CubeIDE
- STM32CubeMX
- ST-Link调试器

## 代码结构
```
RC_Controller/
├── Core/
│   ├── Inc/            - 头文件
│   │   ├── main.h
│   │   ├── rc_input.h  - 输入处理
│   │   ├── rc_output.h - 输出处理
│   │   ├── communication.h - 通信协议
│   │   └── config.h    - 配置管理
│   └── Src/            - 源文件
│       ├── main.c
│       ├── rc_input.c
│       ├── rc_output.c
│       ├── communication.c
│       └── config.c
└── Drivers/            - STM32 HAL 库
```

## 使用方法
1. 使用STM32CubeIDE打开项目
2. 使用STM32CubeMX配置硬件引脚
3. 根据实际硬件调整代码中的引脚定义
4. 编译并烧录到STM32F722开发板

## 通信协议
与安卓UI通信采用简单帧协议：
- 帧起始：0xAA
- 帧结束：0x55
- 第2字节：命令类型
- 第3字节：通道号
- 第4字节：数值
- 更多数据：可选

## 下一步开发
- 完善Flash存储配置功能
- 添加失效保护功能
- 丰富通信协议
- 加入更多输出模式
