#include "rc_input.h"
#include "main.h"

// 全局变量
static adc_channels_t adc_data;
static switch_inputs_t switch_data;

// 外部声明
extern ADC_HandleTypeDef hadc1; // 根据实际配置修改

// 初始化输入系统
void RC_Input_Init(void) {
    // 初始化ADC数据结构
    for (int i = 0; i < ADC_CHANNELS_NUM; i++) {
        adc_data.raw_values[i] = 0;
        adc_data.scaled_values[i] = 0.0f;
        
        // 默认校准值
        adc_data.calibration[i].min = 0;
        adc_data.calibration[i].center = 2048;
        adc_data.calibration[i].max = 4095;
    }
    
    // 初始化开关状态
    for (int i = 0; i < SWITCH_INPUTS_NUM; i++) {
        switch_data.states[i] = 0;
    }
    
    // 启动ADC转换
    HAL_ADC_Start_DMA(&hadc1, (uint32_t*)adc_data.raw_values, ADC_CHANNELS_NUM);
}

// 处理ADC读数并缩放
void RC_Input_ProcessADC(void) {
    for (int i = 0; i < ADC_CHANNELS_NUM; i++) {
        // 防止除零错误
        if (adc_data.calibration[i].max == adc_data.calibration[i].min) {
            adc_data.scaled_values[i] = 0;
            continue;
        }
        
        uint16_t value = adc_data.raw_values[i];
        
        // 限制在校准范围内
        if (value < adc_data.calibration[i].min) value = adc_data.calibration[i].min;
        if (value > adc_data.calibration[i].max) value = adc_data.calibration[i].max;
        
        // 计算中心偏移
        if (value < adc_data.calibration[i].center) {
            // 负值区域 (-100 ~ 0)
            adc_data.scaled_values[i] = -100.0f * 
                (adc_data.calibration[i].center - value) / 
                (adc_data.calibration[i].center - adc_data.calibration[i].min);
        } else {
            // 正值区域 (0 ~ 100)
            adc_data.scaled_values[i] = 100.0f * 
                (value - adc_data.calibration[i].center) / 
                (adc_data.calibration[i].max - adc_data.calibration[i].center);
        }
    }
}

// 读取开关状态
void RC_Input_ReadSwitches(void) {
    // 读取所有开关GPIO状态
    // 这里需要根据实际硬件配置填写
    switch_data.states[0] = HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_0);
    switch_data.states[1] = HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_1);
    // ... 继续添加其他开关
}

// 获取通道值 (-100~100)
float RC_Input_GetChannelValue(uint8_t channel) {
    if (channel < ADC_CHANNELS_NUM) {
        return adc_data.scaled_values[channel];
    }
    return 0.0f;
}

// 获取开关状态
uint8_t RC_Input_GetSwitchState(uint8_t switch_num) {
    if (switch_num < SWITCH_INPUTS_NUM) {
        return switch_data.states[switch_num];
    }
    return 0;
}

// 校准功能
void RC_Input_Calibrate(void) {
    // 这里实现校准逻辑...
    // 需要记录每个通道的最小、中间和最大值
    
    // 简单示例：将当前值设为中间值
    for (int i = 0; i < ADC_CHANNELS_NUM; i++) {
        adc_data.calibration[i].center = adc_data.raw_values[i];
    }
} 