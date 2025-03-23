#ifndef RC_OUTPUT_H
#define RC_OUTPUT_H

#include "main.h"

// 输出通道数量
#define OUTPUT_CHANNELS_NUM 4

// 输出模式
typedef enum {
    OUTPUT_MODE_PWM,
    OUTPUT_MODE_PPM,
    OUTPUT_MODE_SBUS
} output_mode_t;

// 输出数据结构体
typedef struct {
    uint16_t channel_values[OUTPUT_CHANNELS_NUM];  // 通道值(1000-2000微秒)
    output_mode_t output_mode;                    // 输出模式
} rc_output_t;

// 初始化输出系统
void RC_Output_Init(void);
// 设置通道值
void RC_Output_SetChannel(uint8_t channel, uint16_t value);
// 更新所有输出
void RC_Output_Update(void);
// 配置输出模式
void RC_Output_SetMode(output_mode_t mode);

#endif /* RC_OUTPUT_H */ 