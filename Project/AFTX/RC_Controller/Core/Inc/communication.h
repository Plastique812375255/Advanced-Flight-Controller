#ifndef COMMUNICATION_H
#define COMMUNICATION_H

#include "main.h"

// 命令类型定义
typedef enum {
    CMD_NONE = 0,
    CMD_SET_CHANNEL,        // 设置通道值
    CMD_GET_CHANNEL,        // 获取通道值
    CMD_CALIBRATE,          // 校准命令
    CMD_SET_CONFIG,         // 设置配置
    CMD_GET_CONFIG,         // 获取配置
    CMD_SET_OUTPUT_MODE,    // 设置输出模式
    CMD_RESET               // 复位系统
} command_type_t;

// 命令结构体
typedef struct {
    command_type_t type;    // 命令类型
    uint8_t channel;        // 通道号
    uint16_t value;         // 数值
    uint8_t data[32];       // 附加数据
} command_t;

// 初始化通信系统
void Comm_Init(void);
// 处理接收到的命令
void Comm_ProcessRxData(void);
// 发送状态数据到UI
void Comm_SendStatus(void);
// 发送应答到UI
void Comm_SendResponse(command_type_t cmd_type, uint8_t status);

#endif /* COMMUNICATION_H */ 