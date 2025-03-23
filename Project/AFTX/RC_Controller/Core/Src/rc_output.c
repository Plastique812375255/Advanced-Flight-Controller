#include "rc_output.h"
#include "main.h"

// 全局变量
static rc_output_t output_data;

// 外部声明
extern TIM_HandleTypeDef htim1; // 根据实际配置修改

// 初始化输出系统
void RC_Output_Init(void) {
    // 初始化通道值为中间值
    for (int i = 0; i < OUTPUT_CHANNELS_NUM; i++) {
        output_data.channel_values[i] = 1500; // 中间值 (1500μs)
    }
    
    // 默认PWM输出模式
    output_data.output_mode = OUTPUT_MODE_PWM;
    
    // 启动定时器PWM
    HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_1);
    HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_2);
    HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_3);
    HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_4);
}

// 设置通道值
void RC_Output_SetChannel(uint8_t channel, uint16_t value) {
    if (channel < OUTPUT_CHANNELS_NUM) {
        // 限制值在1000-2000范围内
        if (value < 1000) value = 1000;
        if (value > 2000) value = 2000;
        
        output_data.channel_values[channel] = value;
    }
}

// 更新所有输出
void RC_Output_Update(void) {
    // 根据当前输出模式更新输出信号
    switch (output_data.output_mode) {
        case OUTPUT_MODE_PWM:
            // 直接更新PWM占空比
            // 假设PWM周期为20ms (20000μs)，1000-2000μs对应5%-10%占空比
            // 需要根据定时器的实际配置调整计算公式
            __HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_1, output_data.channel_values[0]);
            __HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_2, output_data.channel_values[1]);
            __HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_3, output_data.channel_values[2]);
            __HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_4, output_data.channel_values[3]);
            break;
            
        case OUTPUT_MODE_PPM:
            // PPM信号生成代码
            // 这需要使用单独的定时器中断来实现
            break;
            
        case OUTPUT_MODE_SBUS:
            // SBUS信号生成代码
            // 这需要使用UART来实现
            break;
    }
}

// 配置输出模式
void RC_Output_SetMode(output_mode_t mode) {
    output_data.output_mode = mode;
    
    // 根据模式重新配置输出硬件
    switch (mode) {
        case OUTPUT_MODE_PWM:
            // 配置定时器为PWM模式
            break;
            
        case OUTPUT_MODE_PPM:
            // 配置定时器为PPM模式
            break;
            
        case OUTPUT_MODE_SBUS:
            // 配置UART为SBUS模式
            break;
    }
} 