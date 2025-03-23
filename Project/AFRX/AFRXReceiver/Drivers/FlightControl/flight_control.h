/**
  * @file           : flight_control.h
  * @brief          : 飞行控制模块头文件
  */

#ifndef __FLIGHT_CONTROL_H
#define __FLIGHT_CONTROL_H

#ifdef __cplusplus
extern "C" {
#endif

/* 包含 ------------------------------------------------------------------*/
#include "stm32f3xx_hal.h"
#include "receiver.h"

/* 导出的类型 ------------------------------------------------------------*/
typedef struct {
  float P;                     /* 比例系数 */
  float I;                     /* 积分系数 */
  float D;                     /* 微分系数 */
  float ITerm;                 /* 积分项 */
  float LastError;             /* 上次误差 */
  float ILimit;                /* 积分限幅 */
} PID_t;

typedef struct {
  uint8_t AileronChannel;      /* 副翼通道 */
  uint8_t ElevatorChannel;     /* 升降通道 */
  uint8_t ThrottleChannel;     /* 油门通道 */
  uint8_t RudderChannel;       /* 方向舵通道 */
  uint8_t ModeChannel;         /* 模式通道 */
  uint8_t AuxChannel;          /* 辅助通道 */
  
  PID_t RollPID;               /* 滚转PID */
  PID_t PitchPID;              /* 俯仰PID */
  PID_t YawPID;                /* 偏航PID */
  
  float RollMix;               /* 横滚混控比例 */
  float PitchMix;              /* 俯仰混控比例 */
  float YawMix;                /* 偏航混控比例 */
  
  uint8_t ChannelReverse;      /* 通道反向标志位 */
  float TrimValues[CHANNEL_COUNT]; /* 微调值 */
} FlightConfig_t;

/* 导出的常量 ------------------------------------------------------------*/
#define DEFAULT_P           0.5f
#define DEFAULT_I           0.02f
#define DEFAULT_D           0.1f
#define DEFAULT_I_LIMIT     50.0f

/* 导出的宏 --------------------------------------------------------------*/
#define IS_CHANNEL_REVERSED(config, channel) ((config.ChannelReverse & (1 << (channel))) != 0)

/* 导出的函数原型 --------------------------------------------------------*/
void FLIGHT_Init(void);
void FLIGHT_ProcessControls(ControlData_t *controlData);
void FLIGHT_SetDefaultConfig(void);
void FLIGHT_LoadConfig(void);
void FLIGHT_SaveConfig(void);

#ifdef __cplusplus
}
#endif

#endif /* __FLIGHT_CONTROL_H */ 