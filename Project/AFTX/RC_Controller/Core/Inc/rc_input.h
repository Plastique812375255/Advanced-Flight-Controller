#ifndef RC_INPUT_H
#define RC_INPUT_H

#include "main.h"

// ADC通道数量定义
#define ADC_CHANNELS_NUM 8
// 开关输入数量定义
#define SWITCH_INPUTS_NUM 12
// 定义校准值结构体
typedef struct {
    uint16_t min;
    uint16_t center;
    uint16_t max;
} channel_calibration_t;

// ADC读数结构体
typedef struct {
    uint16_t raw_values[ADC_CHANNELS_NUM];    // 原始ADC值
    float scaled_values[ADC_CHANNELS_NUM];    // 缩放后的值(-100~100)
    channel_calibration_t calibration[ADC_CHANNELS_NUM]; // 校准值
} adc_channels_t;

// 开关状态结构体
typedef struct {
    uint8_t states[SWITCH_INPUTS_NUM];    // 开关状态
} switch_inputs_t;

// 初始化输入系统
void RC_Input_Init(void);
// 处理ADC采样
void RC_Input_ProcessADC(void);
// 读取开关状态
void RC_Input_ReadSwitches(void);
// 获取通道值
float RC_Input_GetChannelValue(uint8_t channel);
// 获取开关值
uint8_t RC_Input_GetSwitchState(uint8_t switch_num);
// 校准功能
void RC_Input_Calibrate(void);

#endif /* RC_INPUT_H */ 