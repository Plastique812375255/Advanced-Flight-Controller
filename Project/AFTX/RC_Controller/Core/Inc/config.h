#ifndef CONFIG_H
#define CONFIG_H

#include "main.h"
#include "rc_input.h"
#include "rc_output.h"

// 系统配置结构体
typedef struct {
    channel_calibration_t channel_calibration[ADC_CHANNELS_NUM];
    output_mode_t output_mode;
    uint16_t update_rate_hz;
    uint8_t failsafe_values[OUTPUT_CHANNELS_NUM];
} system_config_t;

// 加载配置
void Config_Load(void);
// 保存配置
void Config_Save(void);
// 恢复默认配置
void Config_RestoreDefaults(void);

#endif /* CONFIG_H */ 