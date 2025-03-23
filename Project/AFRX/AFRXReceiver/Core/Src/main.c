/**
  * @file           : main.c
  * @brief          : 航模接收机主程序
  */
#include "main.h"
#include "receiver.h"
#include "flight_control.h"
#include "output_protocol.h"

// 私有变量
static ControlData_t controlData;

// 私有函数原型
static void SystemClock_Config(void);
static void GPIO_Init(void);
static void Error_Handler(void);

/**
  * @brief  程序入口点
  */
int main(void)
{
  // 复位所有外设，初始化Flash接口和Systick
  HAL_Init();
  
  // 配置系统时钟
  SystemClock_Config();
  
  // 初始化GPIO
  GPIO_Init();
  
  // 初始化接收机模块
  RECEIVER_Init();
  
  // 初始化输出协议模块
  OUTPUT_Init();
  
  // 初始化飞控模块
  FLIGHT_Init();
  
  // 主循环
  while (1)
  {
    // 接收控制信号
    if (RECEIVER_GetControlData(&controlData) == RECEIVER_OK)
    {
      // 处理飞行控制计算
      FLIGHT_ProcessControls(&controlData);
      
      // 输出到舵机/电调
      OUTPUT_UpdateChannels(&controlData);
    }
    
    // 系统任务处理
    HAL_Delay(1); // 防止CPU占用过高
  }
}

/**
  * @brief  系统时钟配置
  */
static void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};
  
  // 配置主PLL
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSE;
  RCC_OscInitStruct.HSEState = RCC_HSE_ON;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
  RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_HSE;
  RCC_OscInitStruct.PLL.PLLMUL = RCC_PLL_MUL9;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
  {
    Error_Handler();
  }
  
  // 配置系统时钟源、AHB、APB总线时钟
  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK|RCC_CLOCKTYPE_SYSCLK
                              |RCC_CLOCKTYPE_PCLK1|RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV2;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;
  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_2) != HAL_OK)
  {
    Error_Handler();
  }
}

/**
  * @brief  GPIO初始化
  */
static void GPIO_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};
  
  // 使能GPIO时钟
  __HAL_RCC_GPIOA_CLK_ENABLE();
  __HAL_RCC_GPIOB_CLK_ENABLE();
  __HAL_RCC_GPIOC_CLK_ENABLE();
  
  // 配置LED引脚（作为状态指示器）
  GPIO_InitStruct.Pin = GPIO_PIN_13;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOC, &GPIO_InitStruct);
}

/**
  * @brief  错误处理函数
  */
static void Error_Handler(void)
{
  // 错误状态下无限循环
  while(1)
  {
  }
}

#ifdef  USE_FULL_ASSERT
/**
  * @brief  断言失败处理函数
  */
void assert_failed(uint8_t *file, uint32_t line)
{
  /* 用户可以添加自己的实现来报告文件名和行号，
     例如：printf("断言错误: 文件 %s 第 %d 行\r\n", file, line) */
  
  /* 无限循环 */
  while (1)
  {
  }
}
#endif 