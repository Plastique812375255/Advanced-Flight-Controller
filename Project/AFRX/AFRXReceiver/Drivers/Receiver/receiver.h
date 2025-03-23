/**
  * @file           : receiver.h
  * @brief          : 接收机模块头文件
  */

#ifndef __RECEIVER_H
#define __RECEIVER_H

#ifdef __cplusplus
extern "C" {
#endif

/* 包含 ------------------------------------------------------------------*/
#include "stm32f3xx_hal.h"

/* 导出的类型 ------------------------------------------------------------*/
typedef enum {
  RECEIVER_OK       = 0x00,    /* 接收成功 */
  RECEIVER_ERROR    = 0x01,    /* 接收出错 */
  RECEIVER_TIMEOUT  = 0x02     /* 接收超时 */
} RECEIVER_StatusTypeDef;

typedef enum {
  PROTOCOL_SBUS     = 0x00,    /* SBUS协议 */
  PROTOCOL_PPM      = 0x01,    /* PPM协议 */
  PROTOCOL_IBUS     = 0x02,    /* IBUS协议 */
  PROTOCOL_CRSF     = 0x03     /* CRSF协议 */
} RECEIVER_ProtocolTypeDef;

typedef struct {
  uint16_t Channels[16];       /* 通道值 (1000-2000) */
  uint8_t  FrameLoss;          /* 帧丢失标志 */
  uint8_t  FailSafe;           /* 失控保护标志 */
  uint32_t LastUpdateTime;     /* 最后更新时间 */
} ControlData_t;

/* 导出的常量 ------------------------------------------------------------*/
#define CHANNEL_COUNT             16      /* 最大支持的通道数 */
#define CHANNEL_VALUE_MIN         1000    /* 通道最小值 */
#define CHANNEL_VALUE_MID         1500    /* 通道中间值 */
#define CHANNEL_VALUE_MAX         2000    /* 通道最大值 */

/* 导出的宏 --------------------------------------------------------------*/

/* 导出的函数原型 --------------------------------------------------------*/
void RECEIVER_Init(void);
RECEIVER_StatusTypeDef RECEIVER_GetControlData(ControlData_t *controlData);
void RECEIVER_SetProtocol(RECEIVER_ProtocolTypeDef protocol);

#ifdef __cplusplus
}
#endif

#endif /* __RECEIVER_H */ 