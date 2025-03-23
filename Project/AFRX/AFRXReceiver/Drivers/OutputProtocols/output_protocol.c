/**
  * @file           : output_protocol.c
  * @brief          : 输出协议模块源文件
  */

/* 包含 ------------------------------------------------------------------*/
#include "output_protocol.h"
#include "main.h"

/* 私有类型定义 ----------------------------------------------------------*/
/* 私有宏 ----------------------------------------------------------------*/
#define TIM_CLOCK_FREQ           72000000   /* 定时器时钟频率 */
#define SBUS_TX_BUFFER_SIZE      25         /* SBUS发送缓冲区大小 */
#define SBUS_FRAME_HEADER        0x0F       /* SBUS帧头 */
#define SBUS_FRAME_FOOTER        0x00       /* SBUS帧尾 */

/* 私有变量 --------------------------------------------------------------*/
static TIM_HandleTypeDef htim1;
static UART_HandleTypeDef huart2;
static DMA_HandleTypeDef hdma_tim1_ch1;
static DMA_HandleTypeDef hdma_usart2_tx;

static OUTPUT_ProtocolTypeDef CurrentProtocol = OUTPUT_PWM;
static uint8_t SBusTxBuffer[SBUS_TX_BUFFER_SIZE];
static uint16_t DshotDmaBuffer[MAX_PWM_CHANNELS][17];
static volatile uint8_t OutputBusy = 0;

/* 私有函数原型 ----------------------------------------------------------*/
static void OUTPUT_PWM_Init(void);
static void OUTPUT_SBUS_Init(void);
static void OUTPUT_DSHOT_Init(void);
static void OUTPUT_PPM_Init(void);

static OUTPUT_StatusTypeDef OUTPUT_PWM_Update(ControlData_t *controlData);
static OUTPUT_StatusTypeDef OUTPUT_SBUS_Update(ControlData_t *controlData);
static OUTPUT_StatusTypeDef OUTPUT_DSHOT_Update(ControlData_t *controlData);
static OUTPUT_StatusTypeDef OUTPUT_PPM_Update(ControlData_t *controlData);

/**
  * @brief  输出协议模块初始化
  */
void OUTPUT_Init(void)
{
  // 根据当前输出协议初始化相应接口
  switch (CurrentProtocol)
  {
    case OUTPUT_PWM:
      OUTPUT_PWM_Init();
      break;
      
    case OUTPUT_SBUS:
      OUTPUT_SBUS_Init();
      break;
      
    case OUTPUT_DSHOT:
      OUTPUT_DSHOT_Init();
      break;
      
    case OUTPUT_PPM:
      OUTPUT_PPM_Init();
      break;
      
    default:
      OUTPUT_PWM_Init();
      break;
  }
}

/**
  * @brief  更新输出通道
  * @param  controlData: 指向控制数据结构的指针
  * @retval 输出状态
  */
OUTPUT_StatusTypeDef OUTPUT_UpdateChannels(ControlData_t *controlData)
{
  if (OutputBusy)
  {
    return OUTPUT_BUSY;
  }
  
  OutputBusy = 1;
  
  OUTPUT_StatusTypeDef status = OUTPUT_ERROR;
  
  // 根据当前协议调用对应的更新函数
  switch (CurrentProtocol)
  {
    case OUTPUT_PWM:
      status = OUTPUT_PWM_Update(controlData);
      break;
      
    case OUTPUT_SBUS:
      status = OUTPUT_SBUS_Update(controlData);
      break;
      
    case OUTPUT_DSHOT:
      status = OUTPUT_DSHOT_Update(controlData);
      break;
      
    case OUTPUT_PPM:
      status = OUTPUT_PPM_Update(controlData);
      break;
      
    default:
      status = OUTPUT_PWM_Update(controlData);
      break;
  }
  
  OutputBusy = 0;
  return status;
}

/**
  * @brief  设置输出协议
  * @param  protocol: 要使用的协议
  */
void OUTPUT_SetProtocol(OUTPUT_ProtocolTypeDef protocol)
{
  // 停止当前输出
  OUTPUT_EmergencyStop();
  
  // 设置新协议
  CurrentProtocol = protocol;
  
  // 初始化新协议
  OUTPUT_Init();
}

/**
  * @brief  紧急停止所有输出
  */
void OUTPUT_EmergencyStop(void)
{
  // 停止所有定时器
  HAL_TIM_PWM_Stop(&htim1, TIM_CHANNEL_1);
  HAL_TIM_PWM_Stop(&htim1, TIM_CHANNEL_2);
  HAL_TIM_PWM_Stop(&htim1, TIM_CHANNEL_3);
  HAL_TIM_PWM_Stop(&htim1, TIM_CHANNEL_4);
  
  // 停止SBUS发送
  HAL_UART_AbortTransmit(&huart2);
  
  // 等待所有传输完成
  HAL_Delay(10);
}

/**
  * @brief  标准PWM输出初始化
  */
static void OUTPUT_PWM_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};
  TIM_ClockConfigTypeDef sClockSourceConfig = {0};
  TIM_MasterConfigTypeDef sMasterConfig = {0};
  TIM_OC_InitTypeDef sConfigOC = {0};
  
  // 使能外设时钟
  __HAL_RCC_TIM1_CLK_ENABLE();
  __HAL_RCC_GPIOA_CLK_ENABLE();
  
  // 配置GPIO
  GPIO_InitStruct.Pin = GPIO_PIN_8|GPIO_PIN_9|GPIO_PIN_10|GPIO_PIN_11;
  GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
  GPIO_InitStruct.Alternate = GPIO_AF6_TIM1;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);
  
  // 配置定时器
  htim1.Instance = TIM1;
  htim1.Init.Prescaler = ((TIM_CLOCK_FREQ / 1000000) - 1); // 1us resolution
  htim1.Init.CounterMode = TIM_COUNTERMODE_UP;
  htim1.Init.Period = PWM_PERIOD_US - 1; // 20ms period (50Hz)
  htim1.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
  htim1.Init.RepetitionCounter = 0;
  htim1.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
  HAL_TIM_PWM_Init(&htim1);
  
  sClockSourceConfig.ClockSource = TIM_CLOCKSOURCE_INTERNAL;
  HAL_TIM_ConfigClockSource(&htim1, &sClockSourceConfig);
  
  sMasterConfig.MasterOutputTrigger = TIM_TRGO_RESET;
  sMasterConfig.MasterOutputTrigger2 = TIM_TRGO2_RESET;
  sMasterConfig.MasterSlaveMode = TIM_MASTERSLAVEMODE_DISABLE;
  HAL_TIMEx_MasterConfigSynchronization(&htim1, &sMasterConfig);
  
  // 配置PWM通道
  sConfigOC.OCMode = TIM_OCMODE_PWM1;
  sConfigOC.Pulse = PWM_US_TO_COMPARE(MIN_PULSE_WIDTH_US);
  sConfigOC.OCPolarity = TIM_OCPOLARITY_HIGH;
  sConfigOC.OCNPolarity = TIM_OCNPOLARITY_HIGH;
  sConfigOC.OCFastMode = TIM_OCFAST_DISABLE;
  sConfigOC.OCIdleState = TIM_OCIDLESTATE_RESET;
  sConfigOC.OCNIdleState = TIM_OCNIDLESTATE_RESET;
  
  HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_1);
  HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_2);
  HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_3);
  HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_4);
  
  // 启动PWM输出
  HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_1);
  HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_2);
  HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_3);
  HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_4);
}

/**
  * @brief  SBUS输出初始化
  */
static void OUTPUT_SBUS_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};
  
  // 使能外设时钟
  __HAL_RCC_USART2_CLK_ENABLE();
  __HAL_RCC_GPIOA_CLK_ENABLE();
  __HAL_RCC_DMA1_CLK_ENABLE();
  
  // 配置GPIO
  GPIO_InitStruct.Pin = GPIO_PIN_2;
  GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
  GPIO_InitStruct.Alternate = GPIO_AF7_USART2;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);
  
  // 配置DMA
  hdma_usart2_tx.Instance = DMA1_Channel7;
  hdma_usart2_tx.Init.Direction = DMA_MEMORY_TO_PERIPH;
  hdma_usart2_tx.Init.PeriphInc = DMA_PINC_DISABLE;
  hdma_usart2_tx.Init.MemInc = DMA_MINC_ENABLE;
  hdma_usart2_tx.Init.PeriphDataAlignment = DMA_PDATAALIGN_BYTE;
  hdma_usart2_tx.Init.MemDataAlignment = DMA_MDATAALIGN_BYTE;
  hdma_usart2_tx.Init.Mode = DMA_NORMAL;
  hdma_usart2_tx.Init.Priority = DMA_PRIORITY_LOW;
  HAL_DMA_Init(&hdma_usart2_tx);
  
  __HAL_LINKDMA(&huart2, hdmatx, hdma_usart2_tx);
  
  // 配置UART
  huart2.Instance = USART2;
  huart2.Init.BaudRate = 100000;
  huart2.Init.WordLength = UART_WORDLENGTH_8B;
  huart2.Init.StopBits = UART_STOPBITS_2;
  huart2.Init.Parity = UART_PARITY_EVEN;
  huart2.Init.Mode = UART_MODE_TX;
  huart2.Init.HwFlowCtl = UART_HWCONTROL_NONE;
  huart2.Init.OverSampling = UART_OVERSAMPLING_16;
  huart2.Init.OneBitSampling = UART_ONE_BIT_SAMPLE_DISABLE;
  HAL_UART_Init(&huart2);
  
  // 初始化SBUS缓冲区
  SBusTxBuffer[0] = SBUS_FRAME_HEADER;
  for (int i = 1; i < SBUS_TX_BUFFER_SIZE - 1; i++)
  {
    SBusTxBuffer[i] = 0;
  }
  SBusTxBuffer[SBUS_TX_BUFFER_SIZE - 1] = SBUS_FRAME_FOOTER;
}

/**
  * @brief  DSHOT输出初始化
  */
static void OUTPUT_DSHOT_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};
  TIM_ClockConfigTypeDef sClockSourceConfig = {0};
  TIM_MasterConfigTypeDef sMasterConfig = {0};
  TIM_OC_InitTypeDef sConfigOC = {0};
  
  // 使能外设时钟
  __HAL_RCC_TIM1_CLK_ENABLE();
  __HAL_RCC_GPIOA_CLK_ENABLE();
  __HAL_RCC_DMA1_CLK_ENABLE();
  
  // 配置GPIO
  GPIO_InitStruct.Pin = GPIO_PIN_8|GPIO_PIN_9|GPIO_PIN_10|GPIO_PIN_11;
  GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
  GPIO_InitStruct.Alternate = GPIO_AF6_TIM1;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);
  
  // 配置DMA
  hdma_tim1_ch1.Instance = DMA1_Channel2;
  hdma_tim1_ch1.Init.Direction = DMA_MEMORY_TO_PERIPH;
  hdma_tim1_ch1.Init.PeriphInc = DMA_PINC_DISABLE;
  hdma_tim1_ch1.Init.MemInc = DMA_MINC_ENABLE;
  hdma_tim1_ch1.Init.PeriphDataAlignment = DMA_PDATAALIGN_HALFWORD;
  hdma_tim1_ch1.Init.MemDataAlignment = DMA_MDATAALIGN_HALFWORD;
  hdma_tim1_ch1.Init.Mode = DMA_NORMAL;
  hdma_tim1_ch1.Init.Priority = DMA_PRIORITY_HIGH;
  HAL_DMA_Init(&hdma_tim1_ch1);
  
  __HAL_LINKDMA(&htim1, hdma[TIM_DMA_ID_CC1], hdma_tim1_ch1);
  
  // 配置定时器
  htim1.Instance = TIM1;
  htim1.Init.Prescaler = 0;
  htim1.Init.CounterMode = TIM_COUNTERMODE_UP;
  htim1.Init.Period = 60; // DShot600
  htim1.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
  htim1.Init.RepetitionCounter = 0;
  htim1.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
  HAL_TIM_PWM_Init(&htim1);
  
  sClockSourceConfig.ClockSource = TIM_CLOCKSOURCE_INTERNAL;
  HAL_TIM_ConfigClockSource(&htim1, &sClockSourceConfig);
  
  sMasterConfig.MasterOutputTrigger = TIM_TRGO_RESET;
  sMasterConfig.MasterOutputTrigger2 = TIM_TRGO2_RESET;
  sMasterConfig.MasterSlaveMode = TIM_MASTERSLAVEMODE_DISABLE;
  HAL_TIMEx_MasterConfigSynchronization(&htim1, &sMasterConfig);
  
  // 配置PWM通道
  sConfigOC.OCMode = TIM_OCMODE_PWM1;
  sConfigOC.Pulse = 0;
  sConfigOC.OCPolarity = TIM_OCPOLARITY_HIGH;
  sConfigOC.OCNPolarity = TIM_OCNPOLARITY_HIGH;
  sConfigOC.OCFastMode = TIM_OCFAST_DISABLE;
  sConfigOC.OCIdleState = TIM_OCIDLESTATE_RESET;
  sConfigOC.OCNIdleState = TIM_OCNIDLESTATE_RESET;
  
  HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_1);
  HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_2);
  HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_3);
  HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_4);
  
  // 初始化DShot缓冲区
  for (int i = 0; i < MAX_PWM_CHANNELS; i++)
  {
    for (int j = 0; j < 17; j++)
    {
      DshotDmaBuffer[i][j] = 0;
    }
  }
}

/**
  * @brief  PPM输出初始化
  */
static void OUTPUT_PPM_Init(void)
{
  // PPM输出类似于单通道PWM，但需要特殊的时序
  GPIO_InitTypeDef GPIO_InitStruct = {0};
  TIM_ClockConfigTypeDef sClockSourceConfig = {0};
  TIM_MasterConfigTypeDef sMasterConfig = {0};
  TIM_OC_InitTypeDef sConfigOC = {0};
  
  // 使能外设时钟
  __HAL_RCC_TIM1_CLK_ENABLE();
  __HAL_RCC_GPIOA_CLK_ENABLE();
  
  // 配置GPIO
  GPIO_InitStruct.Pin = GPIO_PIN_8;
  GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
  GPIO_InitStruct.Alternate = GPIO_AF6_TIM1;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);
  
  // 配置定时器
  htim1.Instance = TIM1;
  htim1.Init.Prescaler = ((TIM_CLOCK_FREQ / 1000000) - 1); // 1us resolution
  htim1.Init.CounterMode = TIM_COUNTERMODE_UP;
  htim1.Init.Period = 22500 - 1; // 22.5ms period (适合8通道PPM)
  htim1.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
  htim1.Init.RepetitionCounter = 0;
  htim1.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
  HAL_TIM_PWM_Init(&htim1);
  
  sClockSourceConfig.ClockSource = TIM_CLOCKSOURCE_INTERNAL;
  HAL_TIM_ConfigClockSource(&htim1, &sClockSourceConfig);
  
  sMasterConfig.MasterOutputTrigger = TIM_TRGO_RESET;
  sMasterConfig.MasterOutputTrigger2 = TIM_TRGO2_RESET;
  sMasterConfig.MasterSlaveMode = TIM_MASTERSLAVEMODE_DISABLE;
  HAL_TIMEx_MasterConfigSynchronization(&htim1, &sMasterConfig);
  
  // 配置PWM通道
  sConfigOC.OCMode = TIM_OCMODE_PWM1;
  sConfigOC.Pulse = 300; // 300us pulse (sync pulse)
  sConfigOC.OCPolarity = TIM_OCPOLARITY_HIGH;
  sConfigOC.OCNPolarity = TIM_OCNPOLARITY_HIGH;
  sConfigOC.OCFastMode = TIM_OCFAST_DISABLE;
  sConfigOC.OCIdleState = TIM_OCIDLESTATE_RESET;
  sConfigOC.OCNIdleState = TIM_OCNIDLESTATE_RESET;
  
  HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_1);
  
  // 启动PWM输出
  HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_1);
}

/**
  * @brief  标准PWM输出更新
  * @param  controlData: 指向控制数据结构的指针
  * @retval 输出状态
  */
static OUTPUT_StatusTypeDef OUTPUT_PWM_Update(ControlData_t *controlData)
{
  // 通道1-4直接映射到TIM1的4个PWM通道
  uint16_t pwmValues[4];
  
  for (int i = 0; i < 4 && i < CHANNEL_COUNT; i++)
  {
    // 将通道值(1000-2000)转换为比较值
    uint16_t pulseWidth = MIN_PULSE_WIDTH_US + 
                         (controlData->Channels[i] - CHANNEL_VALUE_MIN) * 
                         (MAX_PULSE_WIDTH_US - MIN_PULSE_WIDTH_US) / 
                         (CHANNEL_VALUE_MAX - CHANNEL_VALUE_MIN);
    
    pwmValues[i] = PWM_US_TO_COMPARE(pulseWidth);
  }
  
  // 更新PWM比较值
  __HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_1, pwmValues[0]);
  __HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_2, pwmValues[1]);
  __HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_3, pwmValues[2]);
  __HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_4, pwmValues[3]);
  
  return OUTPUT_OK;
}

/**
  * @brief  SBUS输出更新
  * @param  controlData: 指向控制数据结构的指针
  * @retval 输出状态
  */
static OUTPUT_StatusTypeDef OUTPUT_SBUS_Update(ControlData_t *controlData)
{
  // 如果上一次发送尚未完成，返回忙状态
  if (HAL_UART_GetState(&huart2) == HAL_UART_STATE_BUSY_TX)
  {
    return OUTPUT_BUSY;
  }
  
  // 将通道值转换为SBUS格式
  // SBUS帧格式: 0x0F, 22字节通道数据, CH17, CH18, 标志字节, 0x00
  
  // 转换为11位分辨率
  uint16_t channels[16];
  for (int i = 0; i < 16 && i < CHANNEL_COUNT; i++)
  {
    // 将1000-2000映射到173-1811 (SBUS标准范围)
    channels[i] = ((controlData->Channels[i] - CHANNEL_VALUE_MIN) * 1639 / 1000) + 173;
  }
  
  // 打包成SBUS格式
  SBusTxBuffer[0] = SBUS_FRAME_HEADER; // 帧头
  
  // 22字节通道数据
  SBusTxBuffer[1] = (uint8_t) ((channels[0] & 0x07FF));
  SBusTxBuffer[2] = (uint8_t) ((channels[0] & 0x07FF) >> 8 | (channels[1] & 0x07FF) << 3);
  SBusTxBuffer[3] = (uint8_t) ((channels[1] & 0x07FF) >> 5 | (channels[2] & 0x07FF) << 6);
  SBusTxBuffer[4] = (uint8_t) ((channels[2] & 0x07FF) >> 2);
  SBusTxBuffer[5] = (uint8_t) ((channels[2] & 0x07FF) >> 10 | (channels[3] & 0x07FF) << 1);
  SBusTxBuffer[6] = (uint8_t) ((channels[3] & 0x07FF) >> 7 | (channels[4] & 0x07FF) << 4);
  SBusTxBuffer[7] = (uint8_t) ((channels[4] & 0x07FF) >> 4 | (channels[5] & 0x07FF) << 7);
  SBusTxBuffer[8] = (uint8_t) ((channels[5] & 0x07FF) >> 1);
  SBusTxBuffer[9] = (uint8_t) ((channels[5] & 0x07FF) >> 9 | (channels[6] & 0x07FF) << 2);
  SBusTxBuffer[10] = (uint8_t) ((channels[6] & 0x07FF) >> 6 | (channels[7] & 0x07FF) << 5);
  SBusTxBuffer[11] = (uint8_t) ((channels[7] & 0x07FF) >> 3);
  SBusTxBuffer[12] = (uint8_t) ((channels[8] & 0x07FF));
  SBusTxBuffer[13] = (uint8_t) ((channels[8] & 0x07FF) >> 8 | (channels[9] & 0x07FF) << 3);
  SBusTxBuffer[14] = (uint8_t) ((channels[9] & 0x07FF) >> 5 | (channels[10] & 0x07FF) << 6);
  SBusTxBuffer[15] = (uint8_t) ((channels[10] & 0x07FF) >> 2);
  SBusTxBuffer[16] = (uint8_t) ((channels[10] & 0x07FF) >> 10 | (channels[11] & 0x07FF) << 1);
  SBusTxBuffer[17] = (uint8_t) ((channels[11] & 0x07FF) >> 7 | (channels[12] & 0x07FF) << 4);
  SBusTxBuffer[18] = (uint8_t) ((channels[12] & 0x07FF) >> 4 | (channels[13] & 0x07FF) << 7);
  SBusTxBuffer[19] = (uint8_t) ((channels[13] & 0x07FF) >> 1);
  SBusTxBuffer[20] = (uint8_t) ((channels[13] & 0x07FF) >> 9 | (channels[14] & 0x07FF) << 2);
  SBusTxBuffer[21] = (uint8_t) ((channels[14] & 0x07FF) >> 6 | (channels[15] & 0x07FF) << 5);
  SBusTxBuffer[22] = (uint8_t) ((channels[15] & 0x07FF) >> 3);
  
  // 标志字节
  SBusTxBuffer[23] = 0;
  if (controlData->FailSafe)
  {
    SBusTxBuffer[23] |= (1 << 3);
  }
  if (controlData->FrameLoss)
  {
    SBusTxBuffer[23] |= (1 << 2);
  }
  
  // 帧尾
  SBusTxBuffer[24] = SBUS_FRAME_FOOTER;
  
  // 通过DMA发送
  if (HAL_UART_Transmit_DMA(&huart2, SBusTxBuffer, SBUS_TX_BUFFER_SIZE) != HAL_OK)
  {
    return OUTPUT_ERROR;
  }
  
  return OUTPUT_OK;
}

/**
  * @brief  DSHOT输出更新
  * @param  controlData: 指向控制数据结构的指针
  * @retval 输出状态
  */
static OUTPUT_StatusTypeDef OUTPUT_DSHOT_Update(ControlData_t *controlData)
{
  // 如果DMA传输忙，返回
  if (HAL_DMA_GetState(&hdma_tim1_ch1) == HAL_DMA_STATE_BUSY)
  {
    return OUTPUT_BUSY;
  }
  
  // 将通道值转换为DSHOT命令
  for (int motor = 0; motor < 4 && motor < CHANNEL_COUNT; motor++)
  {
    // 将通道值1000-2000映射到48-2047 (DSHOT范围)
    uint16_t value = ((controlData->Channels[motor] - CHANNEL_VALUE_MIN) * 2000 / 1000) + 48;
    if (value > 2047) value = 2047;
    
    // 添加电调命令的前5位（通常为0表示普通命令）
    uint16_t packet = (value << 5) | 0;
    
    // 计算校验和（XOR前12位的每个位组）
    uint16_t csum = 0;
    uint16_t csum_data = packet;
    for (int i = 0; i < 3; i++)
    {
      csum ^= csum_data;
      csum_data >>= 4;
    }
    csum &= 0xF;
    
    // 将校验和添加到数据包
    packet = (packet << 4) | csum;
    
    // 将16位包转换为DShot脉冲序列
    for (int i = 0; i < 16; i++)
    {
      if (packet & (1 << (15 - i)))
      {
        // 1 bit - 高电平时间为周期的75%
        DshotDmaBuffer[motor][i] = htim1.Init.Period * 3 / 4;
      }
      else
      {
        // 0 bit - 高电平时间为周期的37.5%
        DshotDmaBuffer[motor][i] = htim1.Init.Period * 3 / 8;
      }
    }
    
    // 添加尾部零位
    DshotDmaBuffer[motor][16] = 0;
  }
  
  // 通过DMA发送第一个电机的命令
  if (HAL_TIM_PWM_Start_DMA(&htim1, TIM_CHANNEL_1, (uint32_t *)DshotDmaBuffer[0], 17) != HAL_OK)
  {
    return OUTPUT_ERROR;
  }
  
  // 注意：在实际应用中，我们需要在DMA完成回调中顺序发送其他电机的命令
  // 简化版本不实现完整的DSHOT协议
  
  return OUTPUT_OK;
}

/**
  * @brief  PPM输出更新
  * @param  controlData: 指向控制数据结构的指针
  * @retval 输出状态
  */
static OUTPUT_StatusTypeDef OUTPUT_PPM_Update(ControlData_t *controlData)
{
  // PPM需要特殊处理，需要在定时器中断中动态更改PWM脉宽
  // 简化版本不实现完整的PPM输出逻辑
  
  // 在实际项目中，我们需要使用定时器中断来顺序产生PPM脉冲
  // 这通常需要定时器中断处理程序和一个通道值缓冲区
  
  return OUTPUT_OK;
}

/**
  * @brief  UART发送完成回调
  */
void HAL_UART_TxCpltCallback(UART_HandleTypeDef *huart)
{
  if (huart->Instance == USART2)
  {
    // SBUS发送完成
  }
}

/**
  * @brief  DMA传输完成回调
  */
void HAL_TIM_PWM_PulseFinishedCallback(TIM_HandleTypeDef *htim)
{
  static uint8_t motorIndex = 1;
  
  if (htim->Instance == TIM1 && htim->Channel == HAL_TIM_ACTIVE_CHANNEL_1)
  {
    // DSHOT DMA传输完成
    if (CurrentProtocol == OUTPUT_DSHOT && motorIndex < 4)
    {
      // 停止当前通道
      HAL_TIM_PWM_Stop_DMA(htim, TIM_CHANNEL_1 << (motorIndex - 1));
      
      // 启动下一个通道（在实际应用中，我们需要根据通道映射关系进行调整）
      if (HAL_TIM_PWM_Start_DMA(htim, TIM_CHANNEL_1 << motorIndex, 
                              (uint32_t *)DshotDmaBuffer[motorIndex], 17) == HAL_OK)
      {
        motorIndex++;
      }
    }
    else
    {
      // 重置电机索引，为下一次传输做准备
      motorIndex = 1;
    }
  }
} 