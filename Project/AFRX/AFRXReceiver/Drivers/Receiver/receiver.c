/**
  * @file           : receiver.c
  * @brief          : 接收机模块源文件
  */

/* 包含 ------------------------------------------------------------------*/
#include "receiver.h"
#include "main.h"

/* 私有类型定义 ----------------------------------------------------------*/
/* 私有宏 ----------------------------------------------------------------*/
#define UART_BUFFER_SIZE  64  /* 串口缓冲区大小 */

/* 私有变量 --------------------------------------------------------------*/
static UART_HandleTypeDef huart1;
static TIM_HandleTypeDef htim2;

static RECEIVER_ProtocolTypeDef CurrentProtocol = PROTOCOL_SBUS;
static uint8_t UartRxBuffer[UART_BUFFER_SIZE];
static ControlData_t LastControlData;
static uint32_t LastReceivedTime = 0;

/* 私有函数原型 ----------------------------------------------------------*/
static void RECEIVER_UART_Init(void);
static void RECEIVER_TIM_Init(void);
static void RECEIVER_SBUS_Process(uint8_t *data, uint32_t length);
static void RECEIVER_IBUS_Process(uint8_t *data, uint32_t length);
static void RECEIVER_PPM_Process(uint16_t *captures, uint32_t count);
static void RECEIVER_CRSF_Process(uint8_t *data, uint32_t length);

/**
  * @brief  接收机模块初始化
  */
void RECEIVER_Init(void)
{
  // 初始化控制数据
  for (int i = 0; i < CHANNEL_COUNT; i++)
  {
    LastControlData.Channels[i] = CHANNEL_VALUE_MID;
  }
  LastControlData.FrameLoss = 0;
  LastControlData.FailSafe = 0;
  LastControlData.LastUpdateTime = 0;
  
  // 初始化通信接口
  RECEIVER_UART_Init();
  RECEIVER_TIM_Init();
  
  // 启动接收
  HAL_UART_Receive_DMA(&huart1, UartRxBuffer, UART_BUFFER_SIZE);
  HAL_TIM_IC_Start_DMA(&htim2, TIM_CHANNEL_1, (uint32_t*)UartRxBuffer, UART_BUFFER_SIZE / 2);
}

/**
  * @brief  获取最新的控制数据
  * @param  controlData: 指向控制数据结构的指针
  * @retval 接收状态
  */
RECEIVER_StatusTypeDef RECEIVER_GetControlData(ControlData_t *controlData)
{
  uint32_t currentTime = HAL_GetTick();
  
  // 检查接收超时
  if (currentTime - LastReceivedTime > 500) // 500ms超时
  {
    LastControlData.FrameLoss = 1;
    if (currentTime - LastReceivedTime > 1000) // 1000ms激活失控保护
    {
      LastControlData.FailSafe = 1;
    }
  }
  
  // 复制最新的控制数据
  *controlData = LastControlData;
  
  // 返回状态
  if (LastControlData.FailSafe)
  {
    return RECEIVER_TIMEOUT;
  }
  else if (LastControlData.FrameLoss)
  {
    return RECEIVER_ERROR;
  }
  else
  {
    return RECEIVER_OK;
  }
}

/**
  * @brief  设置接收协议
  * @param  protocol: 要使用的协议
  */
void RECEIVER_SetProtocol(RECEIVER_ProtocolTypeDef protocol)
{
  // 停止当前接收
  HAL_UART_AbortReceive(&huart1);
  HAL_TIM_IC_Stop_DMA(&htim2, TIM_CHANNEL_1);
  
  // 设置新协议
  CurrentProtocol = protocol;
  
  // 根据协议调整硬件配置
  switch (protocol)
  {
    case PROTOCOL_SBUS:
      huart1.Init.BaudRate = 100000;
      huart1.Init.StopBits = UART_STOPBITS_2;
      huart1.Init.Parity = UART_PARITY_EVEN;
      break;
      
    case PROTOCOL_IBUS:
      huart1.Init.BaudRate = 115200;
      huart1.Init.StopBits = UART_STOPBITS_1;
      huart1.Init.Parity = UART_PARITY_NONE;
      break;
      
    case PROTOCOL_CRSF:
      huart1.Init.BaudRate = 420000;
      huart1.Init.StopBits = UART_STOPBITS_1;
      huart1.Init.Parity = UART_PARITY_NONE;
      break;
      
    case PROTOCOL_PPM:
      // PPM使用定时器捕获，不需要UART
      break;
      
    default:
      break;
  }
  
  // 重新初始化通信接口（如果需要）
  if (protocol != PROTOCOL_PPM)
  {
    HAL_UART_Init(&huart1);
    HAL_UART_Receive_DMA(&huart1, UartRxBuffer, UART_BUFFER_SIZE);
  }
  else
  {
    HAL_TIM_IC_Start_DMA(&htim2, TIM_CHANNEL_1, (uint32_t*)UartRxBuffer, UART_BUFFER_SIZE / 2);
  }
}

/**
  * @brief  UART初始化
  */
static void RECEIVER_UART_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};
  
  // 使能外设时钟
  __HAL_RCC_USART1_CLK_ENABLE();
  __HAL_RCC_DMA1_CLK_ENABLE();
  
  // 配置GPIO
  GPIO_InitStruct.Pin = GPIO_PIN_10;
  GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
  GPIO_InitStruct.Alternate = GPIO_AF7_USART1;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);
  
  // 配置UART
  huart1.Instance = USART1;
  huart1.Init.BaudRate = 100000;
  huart1.Init.WordLength = UART_WORDLENGTH_8B;
  huart1.Init.StopBits = UART_STOPBITS_2;
  huart1.Init.Parity = UART_PARITY_EVEN;
  huart1.Init.Mode = UART_MODE_RX;
  huart1.Init.HwFlowCtl = UART_HWCONTROL_NONE;
  huart1.Init.OverSampling = UART_OVERSAMPLING_16;
  HAL_UART_Init(&huart1);
  
  // 配置DMA
  HAL_DMA_MuxRequestGeneratorConfig(DMA1, DMA_REQUEST_0, DMA_REQUIREGEN_0);
  
  // 配置中断优先级
  HAL_NVIC_SetPriority(USART1_IRQn, 5, 0);
  HAL_NVIC_EnableIRQ(USART1_IRQn);
  HAL_NVIC_SetPriority(DMA1_Channel1_IRQn, 5, 0);
  HAL_NVIC_EnableIRQ(DMA1_Channel1_IRQn);
}

/**
  * @brief  定时器初始化（用于PPM接收）
  */
static void RECEIVER_TIM_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};
  TIM_IC_InitTypeDef sConfigIC = {0};
  
  // 使能外设时钟
  __HAL_RCC_TIM2_CLK_ENABLE();
  
  // 配置GPIO
  GPIO_InitStruct.Pin = GPIO_PIN_0;
  GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
  GPIO_InitStruct.Alternate = GPIO_AF1_TIM2;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);
  
  // 配置定时器
  htim2.Instance = TIM2;
  htim2.Init.Prescaler = (uint32_t)((SystemCoreClock / 2) / 1000000) - 1; // 1us分辨率
  htim2.Init.CounterMode = TIM_COUNTERMODE_UP;
  htim2.Init.Period = 0xFFFFFFFF;
  htim2.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
  HAL_TIM_IC_Init(&htim2);
  
  // 配置输入捕获
  sConfigIC.ICPolarity = TIM_ICPOLARITY_RISING;
  sConfigIC.ICSelection = TIM_ICSELECTION_DIRECTTI;
  sConfigIC.ICPrescaler = TIM_ICPSC_DIV1;
  sConfigIC.ICFilter = 0x0F; // 数字滤波
  HAL_TIM_IC_ConfigChannel(&htim2, &sConfigIC, TIM_CHANNEL_1);
  
  // 配置中断优先级
  HAL_NVIC_SetPriority(TIM2_IRQn, 5, 0);
  HAL_NVIC_EnableIRQ(TIM2_IRQn);
}

/**
  * @brief  UART接收完成回调
  */
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
  if (huart->Instance == USART1)
  {
    LastReceivedTime = HAL_GetTick();
    LastControlData.FrameLoss = 0;
    LastControlData.FailSafe = 0;
    
    switch (CurrentProtocol)
    {
      case PROTOCOL_SBUS:
        RECEIVER_SBUS_Process(UartRxBuffer, UART_BUFFER_SIZE);
        break;
        
      case PROTOCOL_IBUS:
        RECEIVER_IBUS_Process(UartRxBuffer, UART_BUFFER_SIZE);
        break;
        
      case PROTOCOL_CRSF:
        RECEIVER_CRSF_Process(UartRxBuffer, UART_BUFFER_SIZE);
        break;
        
      default:
        break;
    }
    
    // 重启接收
    HAL_UART_Receive_DMA(&huart1, UartRxBuffer, UART_BUFFER_SIZE);
  }
}

/**
  * @brief  定时器捕获完成回调（用于PPM接收）
  */
void HAL_TIM_IC_CaptureCallback(TIM_HandleTypeDef *htim)
{
  static uint16_t captures[CHANNEL_COUNT + 1];
  static uint32_t captureIndex = 0;
  static uint32_t lastCapture = 0;
  uint32_t currentCapture = 0;
  
  if (htim->Instance == TIM2 && htim->Channel == HAL_TIM_ACTIVE_CHANNEL_1)
  {
    currentCapture = HAL_TIM_ReadCapturedValue(htim, TIM_CHANNEL_1);
    
    // 计算脉冲宽度
    if (lastCapture < currentCapture)
    {
      captures[captureIndex] = currentCapture - lastCapture;
    }
    else
    {
      captures[captureIndex] = (0xFFFFFFFF - lastCapture) + currentCapture;
    }
    
    lastCapture = currentCapture;
    
    // 检测帧结束（同步脉冲>2.5ms）
    if (captures[captureIndex] > 2500)
    {
      if (captureIndex > 0)
      {
        RECEIVER_PPM_Process(captures, captureIndex);
        
        LastReceivedTime = HAL_GetTick();
        LastControlData.FrameLoss = 0;
        LastControlData.FailSafe = 0;
      }
      captureIndex = 0;
    }
    else
    {
      captureIndex++;
      if (captureIndex >= CHANNEL_COUNT + 1)
      {
        captureIndex = 0;
      }
    }
  }
}

/**
  * @brief  处理SBUS协议数据
  */
static void RECEIVER_SBUS_Process(uint8_t *data, uint32_t length)
{
  // 查找帧起始标志（0x0F）和结束标志（0x00）
  for (uint32_t i = 0; i < length - 25; i++)
  {
    if (data[i] == 0x0F && data[i + 24] == 0x00)
    {
      // 解码16个通道（11位分辨率）
      uint8_t *frame = &data[i + 1];
      
      // 解码SBUS帧
      LastControlData.Channels[0]  = ((frame[0]     | frame[1] << 8)                     & 0x07FF);
      LastControlData.Channels[1]  = ((frame[1] >> 3 | frame[2] << 5)                     & 0x07FF);
      LastControlData.Channels[2]  = ((frame[2] >> 6 | frame[3] << 2 | frame[4] << 10)   & 0x07FF);
      LastControlData.Channels[3]  = ((frame[4] >> 1 | frame[5] << 7)                     & 0x07FF);
      LastControlData.Channels[4]  = ((frame[5] >> 4 | frame[6] << 4)                     & 0x07FF);
      LastControlData.Channels[5]  = ((frame[6] >> 7 | frame[7] << 1 | frame[8] << 9)    & 0x07FF);
      LastControlData.Channels[6]  = ((frame[8] >> 2 | frame[9] << 6)                     & 0x07FF);
      LastControlData.Channels[7]  = ((frame[9] >> 5 | frame[10] << 3)                   & 0x07FF);
      LastControlData.Channels[8]  = ((frame[11]    | frame[12] << 8)                    & 0x07FF);
      LastControlData.Channels[9]  = ((frame[12] >> 3 | frame[13] << 5)                  & 0x07FF);
      LastControlData.Channels[10] = ((frame[13] >> 6 | frame[14] << 2 | frame[15] << 10) & 0x07FF);
      LastControlData.Channels[11] = ((frame[15] >> 1 | frame[16] << 7)                  & 0x07FF);
      LastControlData.Channels[12] = ((frame[16] >> 4 | frame[17] << 4)                  & 0x07FF);
      LastControlData.Channels[13] = ((frame[17] >> 7 | frame[18] << 1 | frame[19] << 9) & 0x07FF);
      LastControlData.Channels[14] = ((frame[19] >> 2 | frame[20] << 6)                  & 0x07FF);
      LastControlData.Channels[15] = ((frame[20] >> 5 | frame[21] << 3)                  & 0x07FF);
      
      // 失控保护标志
      LastControlData.FailSafe = (frame[22] & (1 << 3)) ? 1 : 0;
      
      // 帧丢失标志
      LastControlData.FrameLoss = (frame[22] & (1 << 2)) ? 1 : 0;
      
      // 转换为1000-2000范围
      for (int i = 0; i < CHANNEL_COUNT; i++)
      {
        LastControlData.Channels[i] = (LastControlData.Channels[i] * 1000 / 2048) + 1000;
        
        // 限制范围
        if (LastControlData.Channels[i] < CHANNEL_VALUE_MIN)
          LastControlData.Channels[i] = CHANNEL_VALUE_MIN;
        if (LastControlData.Channels[i] > CHANNEL_VALUE_MAX)
          LastControlData.Channels[i] = CHANNEL_VALUE_MAX;
      }
      
      break;
    }
  }
}

/**
  * @brief  处理IBUS协议数据
  */
static void RECEIVER_IBUS_Process(uint8_t *data, uint32_t length)
{
  // 查找帧起始标志（0x20, 0x40）
  for (uint32_t i = 0; i < length - 32; i++)
  {
    if (data[i] == 0x20 && data[i + 1] == 0x40)
    {
      uint8_t *frame = &data[i + 2];
      
      // 验证校验和
      uint16_t checksum = 0xFFFF;
      for (int j = 0; j < 28; j++)
      {
        checksum -= data[i + j];
      }
      
      uint16_t recvChecksum = data[i + 30] | (data[i + 31] << 8);
      
      if (checksum == recvChecksum)
      {
        // 解码通道数据（14个通道，16位分辨率）
        for (int j = 0; j < 14; j++)
        {
          uint16_t value = frame[j * 2] | (frame[j * 2 + 1] << 8);
          
          // 转换为1000-2000范围
          LastControlData.Channels[j] = (value - 1000) + CHANNEL_VALUE_MIN;
          
          // 限制范围
          if (LastControlData.Channels[j] < CHANNEL_VALUE_MIN)
            LastControlData.Channels[j] = CHANNEL_VALUE_MIN;
          if (LastControlData.Channels[j] > CHANNEL_VALUE_MAX)
            LastControlData.Channels[j] = CHANNEL_VALUE_MAX;
        }
      }
      
      break;
    }
  }
}

/**
  * @brief  处理PPM协议数据
  */
static void RECEIVER_PPM_Process(uint16_t *captures, uint32_t count)
{
  // 处理PPM帧（跳过同步脉冲）
  for (uint32_t i = 0; i < count && i < CHANNEL_COUNT; i++)
  {
    // 转换脉宽为通道值（一般PPM脉宽为1000-2000us）
    uint16_t value = captures[i];
    
    // 检验有效脉宽
    if (value >= 900 && value <= 2100)
    {
      LastControlData.Channels[i] = value;
      
      // 限制范围
      if (LastControlData.Channels[i] < CHANNEL_VALUE_MIN)
        LastControlData.Channels[i] = CHANNEL_VALUE_MIN;
      if (LastControlData.Channels[i] > CHANNEL_VALUE_MAX)
        LastControlData.Channels[i] = CHANNEL_VALUE_MAX;
    }
  }
}

/**
  * @brief  处理CRSF协议数据
  */
static void RECEIVER_CRSF_Process(uint8_t *data, uint32_t length)
{
  // CRSF协议解析（简化版）
  for (uint32_t i = 0; i < length - 26; i++)
  {
    if (data[i] == 0xC8 && data[i + 1] == 0x18 && data[i + 2] == 0x16)
    {
      uint8_t *frame = &data[i + 3];
      
      // 解码通道数据（16个通道，11位分辨率）
      uint32_t channelBits = 
        (uint32_t)frame[0] +
        ((uint32_t)frame[1] << 8) +
        ((uint32_t)frame[2] << 16) +
        ((uint32_t)frame[3] << 24);
      
      LastControlData.Channels[0] = (channelBits & 0x7FF);
      LastControlData.Channels[1] = ((channelBits >> 11) & 0x7FF);
      LastControlData.Channels[2] = ((channelBits >> 22) & 0x7FF);
      
      channelBits = 
        (uint32_t)frame[4] +
        ((uint32_t)frame[5] << 8) +
        ((uint32_t)frame[6] << 16) +
        ((uint32_t)frame[7] << 24);
      
      LastControlData.Channels[3] = (channelBits & 0x7FF);
      LastControlData.Channels[4] = ((channelBits >> 11) & 0x7FF);
      LastControlData.Channels[5] = ((channelBits >> 22) & 0x7FF);
      
      // 转换为1000-2000范围
      for (int i = 0; i < 6; i++)
      {
        LastControlData.Channels[i] = (LastControlData.Channels[i] * 1000 / 1600) + 990;
        
        // 限制范围
        if (LastControlData.Channels[i] < CHANNEL_VALUE_MIN)
          LastControlData.Channels[i] = CHANNEL_VALUE_MIN;
        if (LastControlData.Channels[i] > CHANNEL_VALUE_MAX)
          LastControlData.Channels[i] = CHANNEL_VALUE_MAX;
      }
      
      break;
    }
  }
} 