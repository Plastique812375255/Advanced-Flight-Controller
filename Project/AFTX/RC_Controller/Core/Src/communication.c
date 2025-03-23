#include "communication.h"
#include "rc_input.h"
#include "rc_output.h"
#include "config.h"
#include <string.h>

// 定义通信缓冲区
#define RX_BUFFER_SIZE 128
#define TX_BUFFER_SIZE 128

// 通信状态和缓冲区
static uint8_t rx_buffer[RX_BUFFER_SIZE];
static uint8_t tx_buffer[TX_BUFFER_SIZE];
static uint16_t rx_index = 0;
static uint8_t frame_received = 0;

// 通信协议定义
#define FRAME_START_BYTE 0xAA
#define FRAME_END_BYTE   0x55

// 外部声明
extern UART_HandleTypeDef huart1; // 与安卓通信的UART，根据实际配置修改

// 初始化通信系统
void Comm_Init(void) {
    // 清空接收缓冲区
    memset(rx_buffer, 0, RX_BUFFER_SIZE);
    rx_index = 0;
    
    // 启动UART接收
    HAL_UART_Receive_IT(&huart1, &rx_buffer[rx_index], 1);
}

// 接收回调函数，需要在stm32f7xx_it.c中调用
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart) {
    if (huart == &huart1) {
        // 检查是否是帧起始
        if (rx_index == 0 && rx_buffer[0] == FRAME_START_BYTE) {
            rx_index++;
            HAL_UART_Receive_IT(&huart1, &rx_buffer[rx_index], 1);
        }
        // 检查是否是帧结束
        else if (rx_buffer[rx_index] == FRAME_END_BYTE) {
            frame_received = 1;
            rx_index = 0;
            HAL_UART_Receive_IT(&huart1, &rx_buffer[rx_index], 1);
        }
        // 继续接收数据
        else if (rx_index < RX_BUFFER_SIZE - 1) {
            rx_index++;
            HAL_UART_Receive_IT(&huart1, &rx_buffer[rx_index], 1);
        }
        // 缓冲区溢出，重置
        else {
            rx_index = 0;
            HAL_UART_Receive_IT(&huart1, &rx_buffer[rx_index], 1);
        }
    }
}

// 解析收到的命令
static command_t ParseCommand(uint8_t *buffer, uint16_t length) {
    command_t cmd;
    cmd.type = CMD_NONE;
    
    // 简单协议解析
    if (length < 4) return cmd; // 至少需要4字节
    
    cmd.type = buffer[1];       // 第2字节是命令类型
    cmd.channel = buffer[2];    // 第3字节是通道
    cmd.value = buffer[3];      // 第4字节是值
    
    // 复制附加数据
    if (length > 4) {
        uint8_t data_len = length - 4;
        if (data_len > 32) data_len = 32;
        memcpy(cmd.data, &buffer[4], data_len);
    }
    
    return cmd;
}

// 处理接收到的命令
void Comm_ProcessRxData(void) {
    if (!frame_received) return;
    
    // 解析命令
    command_t cmd = ParseCommand(rx_buffer, rx_index);
    
    // 处理命令
    switch (cmd.type) {
        case CMD_SET_CHANNEL:
            RC_Output_SetChannel(cmd.channel, cmd.value);
            Comm_SendResponse(CMD_SET_CHANNEL, 1); // 发送成功响应
            break;
            
        case CMD_GET_CHANNEL:
            // 发送通道值
            tx_buffer[0] = FRAME_START_BYTE;
            tx_buffer[1] = CMD_GET_CHANNEL;
            tx_buffer[2] = cmd.channel;
            // 获取输入通道值并转换为0-255范围
            float ch_value = RC_Input_GetChannelValue(cmd.channel);
            tx_buffer[3] = (uint8_t)((ch_value + 100.0f) * 255.0f / 200.0f);
            tx_buffer[4] = FRAME_END_BYTE;
            HAL_UART_Transmit(&huart1, tx_buffer, 5, 100);
            break;
            
        case CMD_CALIBRATE:
            RC_Input_Calibrate();
            Comm_SendResponse(CMD_CALIBRATE, 1);
            break;
            
        case CMD_SET_OUTPUT_MODE:
            RC_Output_SetMode((output_mode_t)cmd.value);
            Comm_SendResponse(CMD_SET_OUTPUT_MODE, 1);
            break;
            
        // 其他命令处理...
        
        default:
            // 未知命令
            Comm_SendResponse(cmd.type, 0); // 发送失败响应
            break;
    }
    
    frame_received = 0;
}

// 发送状态到UI
void Comm_SendStatus(void) {
    // 构建状态帧
    tx_buffer[0] = FRAME_START_BYTE;
    tx_buffer[1] = 0xF0; // 状态帧标识
    
    // 填充通道值
    for (int i = 0; i < ADC_CHANNELS_NUM; i++) {
        float ch_value = RC_Input_GetChannelValue(i);
        tx_buffer[2 + i] = (uint8_t)((ch_value + 100.0f) * 255.0f / 200.0f);
    }
    
    // 填充开关状态
    uint8_t switch_byte = 0;
    for (int i = 0; i < 8 && i < SWITCH_INPUTS_NUM; i++) {
        if (RC_Input_GetSwitchState(i)) {
            switch_byte |= (1 << i);
        }
    }
    tx_buffer[2 + ADC_CHANNELS_NUM] = switch_byte;
    
    // 结束帧
    tx_buffer[3 + ADC_CHANNELS_NUM] = FRAME_END_BYTE;
    
    // 发送状态帧
    HAL_UART_Transmit(&huart1, tx_buffer, 4 + ADC_CHANNELS_NUM, 100);
}

// 发送响应
void Comm_SendResponse(command_type_t cmd_type, uint8_t status) {
    tx_buffer[0] = FRAME_START_BYTE;
    tx_buffer[1] = cmd_type;
    tx_buffer[2] = status;
    tx_buffer[3] = FRAME_END_BYTE;
    
    HAL_UART_Transmit(&huart1, tx_buffer, 4, 100);
} 