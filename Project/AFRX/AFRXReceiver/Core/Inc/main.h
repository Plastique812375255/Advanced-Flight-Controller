/**
  * @file           : main.h
  * @brief          : 主程序头文件
  */

#ifndef __MAIN_H
#define __MAIN_H

#ifdef __cplusplus
extern "C" {
#endif

/* 包含 ------------------------------------------------------------------*/
#include "stm32f3xx_hal.h"

/* 导出的类型 ------------------------------------------------------------*/
/* 导出的常量 ------------------------------------------------------------*/
/* 导出的宏 --------------------------------------------------------------*/
/* 导出的函数原型 --------------------------------------------------------*/
void Error_Handler(void);

/* 私有定义 --------------------------------------------------------------*/
#define LED_PIN                     GPIO_PIN_13
#define LED_GPIO_PORT               GPIOC

#ifdef __cplusplus
}
#endif

#endif /* __MAIN_H */ 