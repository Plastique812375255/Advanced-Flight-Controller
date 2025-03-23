/**
  * @file           : output_protocol.h
  * @brief          : 输出协议模块头文件
  */

#ifndef __OUTPUT_PROTOCOL_H
#define __OUTPUT_PROTOCOL_H

#ifdef __cplusplus
extern "C" {
#endif

/* 包含 ------------------------------------------------------------------*/
#include "stm32f3xx_hal.h"
#include "receiver.h"

/* 导出的类型 ------------------------------------------------------------*/
typedef enum {
  OUTPUT_OK       = 0x00,    /* 输出成功 */
  OUTPUT_ERROR    = 0x01,    /* 输出错误 */
  OUTPUT_BUSY     = 0x02     /* 输出忙 */
} OUTPUT_StatusTypeDef;

typedef enum {
  OUTPUT_PWM      = 0x00,    /* 标准PWM */
  OUTPUT_SBUS     = 0x01,    /* SBUS输出 */
  OUTPUT_DSHOT    = 0x02,    /* DSHOT数字协议 */
  OUTPUT_PPM      = 0x03     /* PPM输出 */
} OUTPUT_ProtocolTypeDef;

/* 导出的常量 ------------------------------------------------------------*/
#define MAX_PWM_CHANNELS      8    /* 最大PWM输出通道数 */
#define PWM_PERIOD_US         20000 /* PWM周期(微秒) */
#define MIN_PULSE_WIDTH_US    1000  /* 最小脉宽(微秒) */
#define MAX_PULSE_WIDTH_US    2000  /* 最大脉宽(微秒) */

/* 导出的宏 --------------------------------------------------------------*/
#define PWM_US_TO_COMPARE(us)  ((uint32_t)((us) * (TIM_CLOCK_FREQ / 1000000)))

/* 导出的函数原型 --------------------------------------------------------*/
void OUTPUT_Init(void);
OUTPUT_StatusTypeDef OUTPUT_UpdateChannels(ControlData_t *controlData);
void OUTPUT_SetProtocol(OUTPUT_ProtocolTypeDef protocol);
void OUTPUT_EmergencyStop(void);

#ifdef __cplusplus
}
#endif

#endif /* __OUTPUT_PROTOCOL_H */ 