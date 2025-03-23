#include "config.h"
#include <string.h>

// 全局配置结构体
static system_config_t system_config;

// 默认配置
static const system_config_t default_config = {
    .channel_calibration = {
        {0, 2048, 4095},
        {0, 2048, 4095},
        {0, 2048, 4095},
        {0, 2048, 4095},
        {0, 2048, 4095},
        {0, 2048, 4095},
        {0, 2048, 4095},
        {0, 2048, 4095}
    },
    .output_mode = OUTPUT_MODE_PWM,
    .update_rate_hz = 50,
    .failsafe_values = {1500, 1500, 1000, 1500} // 中间值，中间值，油门最低，中间值
};

// 从flash读取配置
void Config_Load(void) {
    // 这里应该从Flash读取配置
    // 简化起见，先使用默认配置
    memcpy(&system_config, &default_config, sizeof(system_config_t));
}

// 保存配置到flash
void Config_Save(void) {
    // 这里应该将配置写入到Flash
    // 简化起见，这里不实现
}

// 恢复默认配置
void Config_RestoreDefaults(void) {
    memcpy(&system_config, &default_config, sizeof(system_config_t));
    Config_Save();
} 