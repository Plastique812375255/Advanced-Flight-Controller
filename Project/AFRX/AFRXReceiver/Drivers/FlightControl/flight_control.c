/**
  * @file           : flight_control.c
  * @brief          : 飞行控制模块源文件
  */

/* 包含 ------------------------------------------------------------------*/
#include "flight_control.h"
#include "main.h"
#include "output_protocol.h"

/* 私有类型定义 ----------------------------------------------------------*/
typedef enum {
  MODE_NORMAL = 0,             /* 标准模式 */
  MODE_ACRO,                   /* 特技模式 */
  MODE_ANGLE,                  /* 自稳模式 */
  MODE_HEADFREE,               /* 无头模式 */
  MODE_FAILSAFE                /* 失控保护模式 */
} FlightMode_t;

/* 私有宏 ----------------------------------------------------------------*/
#define MODE_COUNT               5   /* 飞行模式数量 */
#define DEADBAND                 20  /* 摇杆中位死区 */
#define MAX_ANGLE                45  /* 最大倾角（度） */
#define SCALE_FACTOR             0.5f /* 控制比例因子 */

/* 私有变量 --------------------------------------------------------------*/
static FlightConfig_t FlightConfig;
static FlightMode_t CurrentMode = MODE_NORMAL;
static ControlData_t ProcessedControls;

/* 私有函数原型 ----------------------------------------------------------*/
static void FLIGHT_UpdateMode(ControlData_t *controlData);
static void FLIGHT_ApplyMixing(ControlData_t *controlData);
static float FLIGHT_UpdatePID(PID_t *pid, float error, float dt);
static float FLIGHT_Constrain(float value, float min, float max);

/**
  * @brief  飞行控制模块初始化
  */
void FLIGHT_Init(void)
{
  // 加载配置（如果存在）
  if (HAL_OK != FLIGHT_LoadConfig())
  {
    // 否则使用默认配置
    FLIGHT_SetDefaultConfig();
  }
  
  // 初始化处理后的控制数据
  for (int i = 0; i < CHANNEL_COUNT; i++)
  {
    ProcessedControls.Channels[i] = CHANNEL_VALUE_MID;
  }
  ProcessedControls.FrameLoss = 0;
  ProcessedControls.FailSafe = 0;
}

/**
  * @brief  处理控制数据
  * @param  controlData: 指向控制数据结构的指针
  */
void FLIGHT_ProcessControls(ControlData_t *controlData)
{
  static uint32_t lastUpdateTime = 0;
  uint32_t currentTime = HAL_GetTick();
  float dt = (currentTime - lastUpdateTime) / 1000.0f; // 计算时间间隔（秒）
  
  if (dt <= 0.0f || dt > 0.5f) // 时间间隔异常
  {
    dt = 0.01f; // 默认10ms
  }
  
  lastUpdateTime = currentTime;
  
  // 更新飞行模式
  FLIGHT_UpdateMode(controlData);
  
  // 应用通道反向和微调
  for (int i = 0; i < CHANNEL_COUNT; i++)
  {
    float value = (float)controlData->Channels[i];
    
    // 应用通道反向
    if (IS_CHANNEL_REVERSED(FlightConfig, i))
    {
      value = CHANNEL_VALUE_MAX - (value - CHANNEL_VALUE_MIN);
    }
    
    // 应用微调
    value += FlightConfig.TrimValues[i];
    
    // 限制范围
    value = FLIGHT_Constrain(value, CHANNEL_VALUE_MIN, CHANNEL_VALUE_MAX);
    
    ProcessedControls.Channels[i] = (uint16_t)value;
  }
  
  // 计算控制量（以中点为基准的偏移量）
  float rollInput = (ProcessedControls.Channels[FlightConfig.AileronChannel] - CHANNEL_VALUE_MID);
  float pitchInput = (ProcessedControls.Channels[FlightConfig.ElevatorChannel] - CHANNEL_VALUE_MID);
  float yawInput = (ProcessedControls.Channels[FlightConfig.RudderChannel] - CHANNEL_VALUE_MID);
  
  // 应用死区
  if (fabs(rollInput) < DEADBAND) rollInput = 0;
  if (fabs(pitchInput) < DEADBAND) pitchInput = 0;
  if (fabs(yawInput) < DEADBAND) yawInput = 0;
  
  // 根据飞行模式处理控制
  switch (CurrentMode)
  {
    case MODE_NORMAL:
      // 标准模式下直接使用输入
      break;
      
    case MODE_ACRO:
      // 特技模式下使用更高灵敏度
      rollInput *= 1.5f;
      pitchInput *= 1.5f;
      yawInput *= 1.5f;
      break;
      
    case MODE_ANGLE:
      // 自稳模式下使用PID控制(这里需要陀螺仪和加速度计数据，简化版不实现)
      {
        // 示例代码，实际实现需要姿态传感器数据
        float rollError = 0 - rollInput / 5.0f; // 假设目标角度是由摇杆/5得到的
        float pitchError = 0 - pitchInput / 5.0f;
        
        // 使用PID计算输出
        rollInput = FLIGHT_UpdatePID(&FlightConfig.RollPID, rollError, dt);
        pitchInput = FLIGHT_UpdatePID(&FlightConfig.PitchPID, pitchError, dt);
      }
      break;
      
    case MODE_HEADFREE:
      // 无头模式（需要磁力计/GPS数据，简化版不实现）
      break;
      
    case MODE_FAILSAFE:
      // 失控保护模式，设置安全控制值
      rollInput = 0;
      pitchInput = 0;
      yawInput = 0;
      ProcessedControls.Channels[FlightConfig.ThrottleChannel] = CHANNEL_VALUE_MIN;
      break;
  }
  
  // 应用比例因子
  rollInput *= SCALE_FACTOR;
  pitchInput *= SCALE_FACTOR;
  yawInput *= SCALE_FACTOR;
  
  // 更新处理后的控制通道
  ProcessedControls.Channels[FlightConfig.AileronChannel] = 
    FLIGHT_Constrain(CHANNEL_VALUE_MID + rollInput, CHANNEL_VALUE_MIN, CHANNEL_VALUE_MAX);
  
  ProcessedControls.Channels[FlightConfig.ElevatorChannel] = 
    FLIGHT_Constrain(CHANNEL_VALUE_MID + pitchInput, CHANNEL_VALUE_MIN, CHANNEL_VALUE_MAX);
  
  ProcessedControls.Channels[FlightConfig.RudderChannel] = 
    FLIGHT_Constrain(CHANNEL_VALUE_MID + yawInput, CHANNEL_VALUE_MIN, CHANNEL_VALUE_MAX);
  
  // 应用混控（例如，飞翼或三角翼布局等需要混控）
  FLIGHT_ApplyMixing(&ProcessedControls);
  
  // 更新控制数据
  *controlData = ProcessedControls;
}

/**
  * @brief  设置默认配置
  */
void FLIGHT_SetDefaultConfig(void)
{
  // 设置默认通道映射
  FlightConfig.AileronChannel = 0;    // 通道1: 副翼
  FlightConfig.ElevatorChannel = 1;   // 通道2: 升降
  FlightConfig.ThrottleChannel = 2;   // 通道3: 油门
  FlightConfig.RudderChannel = 3;     // 通道4: 方向舵
  FlightConfig.ModeChannel = 4;       // 通道5: 模式
  FlightConfig.AuxChannel = 5;        // 通道6: 辅助
  
  // 设置默认PID参数
  FlightConfig.RollPID.P = DEFAULT_P;
  FlightConfig.RollPID.I = DEFAULT_I;
  FlightConfig.RollPID.D = DEFAULT_D;
  FlightConfig.RollPID.ILimit = DEFAULT_I_LIMIT;
  FlightConfig.RollPID.ITerm = 0.0f;
  FlightConfig.RollPID.LastError = 0.0f;
  
  FlightConfig.PitchPID.P = DEFAULT_P;
  FlightConfig.PitchPID.I = DEFAULT_I;
  FlightConfig.PitchPID.D = DEFAULT_D;
  FlightConfig.PitchPID.ILimit = DEFAULT_I_LIMIT;
  FlightConfig.PitchPID.ITerm = 0.0f;
  FlightConfig.PitchPID.LastError = 0.0f;
  
  FlightConfig.YawPID.P = DEFAULT_P * 0.8f;
  FlightConfig.YawPID.I = DEFAULT_I * 0.8f;
  FlightConfig.YawPID.D = DEFAULT_D * 0.5f;
  FlightConfig.YawPID.ILimit = DEFAULT_I_LIMIT;
  FlightConfig.YawPID.ITerm = 0.0f;
  FlightConfig.YawPID.LastError = 0.0f;
  
  // 设置默认混控参数（标准固定翼）
  FlightConfig.RollMix = 1.0f;
  FlightConfig.PitchMix = 1.0f;
  FlightConfig.YawMix = 0.5f;
  
  // 清除通道反向标志
  FlightConfig.ChannelReverse = 0;
  
  // 清除微调值
  for (int i = 0; i < CHANNEL_COUNT; i++)
  {
    FlightConfig.TrimValues[i] = 0.0f;
  }
  
  // 保存默认配置
  FLIGHT_SaveConfig();
}

/**
  * @brief  加载配置
  * @retval HAL状态
  */
void FLIGHT_LoadConfig(void)
{
  // 在实际项目中，从FLASH或EEPROM加载配置
  // 简化版仅使用默认值
  FLIGHT_SetDefaultConfig();
}

/**
  * @brief  保存配置
  * @retval HAL状态
  */
void FLIGHT_SaveConfig(void)
{
  // 在实际项目中，保存配置到FLASH或EEPROM
  // 简化版不实现
}

/**
  * @brief  更新飞行模式
  * @param  controlData: 指向控制数据结构的指针
  */
static void FLIGHT_UpdateMode(ControlData_t *controlData)
{
  // 检查失控保护
  if (controlData->FailSafe)
  {
    CurrentMode = MODE_FAILSAFE;
    return;
  }
  
  // 根据模式通道值确定飞行模式
  uint16_t modeValue = controlData->Channels[FlightConfig.ModeChannel];
  
  // 将通道值映射到模式（均分通道范围）
  float rangePerMode = (float)(CHANNEL_VALUE_MAX - CHANNEL_VALUE_MIN) / MODE_COUNT;
  uint8_t modeIndex = (modeValue - CHANNEL_VALUE_MIN) / rangePerMode;
  
  // 限制模式索引
  if (modeIndex >= MODE_COUNT)
  {
    modeIndex = MODE_COUNT - 1;
  }
  
  // 更新当前模式
  CurrentMode = (FlightMode_t)modeIndex;
}

/**
  * @brief  应用混控
  * @param  controlData: 指向控制数据结构的指针
  */
static void FLIGHT_ApplyMixing(ControlData_t *controlData)
{
  // 获取基础通道值
  float rollInput = (float)(controlData->Channels[FlightConfig.AileronChannel] - CHANNEL_VALUE_MID);
  float pitchInput = (float)(controlData->Channels[FlightConfig.ElevatorChannel] - CHANNEL_VALUE_MID);
  float yawInput = (float)(controlData->Channels[FlightConfig.RudderChannel] - CHANNEL_VALUE_MID);
  
  // 计算混控输出（示例：飞翼布局）
  // 左副翼 = 升降 + 副翼
  // 右副翼 = 升降 - 副翼
  
  float leftOutput = pitchInput * FlightConfig.PitchMix + rollInput * FlightConfig.RollMix;
  float rightOutput = pitchInput * FlightConfig.PitchMix - rollInput * FlightConfig.RollMix;
  
  // 应用方向舵混控（如果需要）
  leftOutput += yawInput * FlightConfig.YawMix;
  rightOutput -= yawInput * FlightConfig.YawMix;
  
  // 更新输出通道
  // 注意：以下通道分配需要根据实际舵机连接调整
  // 这里假设通道6和7分别连接左右副翼
  if (CHANNEL_COUNT > 7)
  {
    controlData->Channels[6] = FLIGHT_Constrain(CHANNEL_VALUE_MID + leftOutput, CHANNEL_VALUE_MIN, CHANNEL_VALUE_MAX);
    controlData->Channels[7] = FLIGHT_Constrain(CHANNEL_VALUE_MID + rightOutput, CHANNEL_VALUE_MIN, CHANNEL_VALUE_MAX);
  }
}

/**
  * @brief  更新PID控制器
  * @param  pid: 指向PID结构的指针
  * @param  error: 当前误差
  * @param  dt: 时间间隔(秒)
  * @retval PID输出值
  */
static float FLIGHT_UpdatePID(PID_t *pid, float error, float dt)
{
  float pTerm, dTerm;
  float output;
  
  // 比例项
  pTerm = error * pid->P;
  
  // 积分项
  pid->ITerm += error * pid->I * dt;
  
  // 积分限幅
  pid->ITerm = FLIGHT_Constrain(pid->ITerm, -pid->ILimit, pid->ILimit);
  
  // 微分项（使用误差变化率）
  dTerm = (error - pid->LastError) * pid->D / dt;
  
  // 保存当前误差
  pid->LastError = error;
  
  // 计算总输出
  output = pTerm + pid->ITerm + dTerm;
  
  return output;
}

/**
  * @brief  限制值在指定范围内
  * @param  value: 输入值
  * @param  min: 最小值
  * @param  max: 最大值
  * @retval 限制后的值
  */
static float FLIGHT_Constrain(float value, float min, float max)
{
  if (value < min)
  {
    return min;
  }
  else if (value > max)
  {
    return max;
  }
  else
  {
    return value;
  }
} 