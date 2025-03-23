# AFRX航模接收机

AFRX是一款基于STM32F3的高性能航模接收机项目，它特点是将舵机控制计算从发射端（遥控器）转移到接收端，实现更精确的控制和更丰富的功能。

## 主要特点

- 支持多种输入协议：SBUS、PPM、IBUS、CRSF
- 支持多种输出协议：标准PWM、SBUS串行输出、DSHOT数字协议、PPM
- 内置飞控算法，支持自稳、特技、无头等多种飞行模式
- 可调PID参数，支持各种混控配置
- 失控保护机制
- 使用STM32F3主控制器，具有强大的计算能力

## 硬件要求

- STM32F3系列微控制器（推荐STM32F303）
- 5V电源输入
- 通信接口：UART、定时器捕获/比较输出
- 存储器：EEPROM或Flash用于存储配置

## 软件架构

项目采用模块化设计，主要包括以下几个模块：

1. **接收模块（Receiver）**：负责接收并解析遥控器信号
2. **飞行控制模块（FlightControl）**：负责处理控制逻辑和PID控制
3. **输出协议模块（OutputProtocols）**：负责生成舵机/电调控制信号

## 目录结构

```
AFRXReceiver/
├── Core/                      # 核心代码
│   ├── Inc/                   # 头文件
│   │   └── main.h            # 主程序头文件
│   └── Src/                   # 源文件
│       └── main.c            # 主程序
├── Drivers/                   # 驱动程序
│   ├── Receiver/              # 接收机模块
│   │   ├── receiver.h
│   │   └── receiver.c
│   ├── FlightControl/         # 飞行控制模块
│   │   ├── flight_control.h
│   │   └── flight_control.c
│   └── OutputProtocols/       # 输出协议模块
│       ├── output_protocol.h
│       └── output_protocol.c
└── README.md                  # 项目说明文件
```

## 编译与烧录

1. 使用STM32CubeIDE打开本项目
2. 进行编译
3. 使用ST-Link或其他烧录工具将程序烧录到STM32F3芯片

## 连接说明

### 输入接口

- SBUS输入：连接到USART1 RX (PA10)
- PPM输入：连接到TIM2 CH1 (PA0)

### 输出接口

- PWM输出：连接到TIM1 CH1-4 (PA8-PA11)
- SBUS输出：连接到USART2 TX (PA2)

## 配置及使用

项目支持通过修改源代码中的参数来配置各种功能：

- 在`receiver.c`中可以选择使用的输入协议
- 在`flight_control.c`中可以调整PID参数和混控设置
- 在`output_protocol.c`中可以选择使用的输出协议

## 扩展功能

本项目可以扩展多种功能，如：

- 添加传感器（陀螺仪、加速度计、磁力计等）实现更高级的飞行控制
- 增加遥测反馈功能
- 添加OSD（屏幕显示）功能
- 支持WiFi或蓝牙配置

## 许可证

本项目采用MIT许可证开源。

## 贡献

欢迎提交问题报告或功能建议，也欢迎提交代码贡献。 