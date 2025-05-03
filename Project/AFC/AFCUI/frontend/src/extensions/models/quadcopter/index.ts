/**
 * 四轴飞行器模型定义
 * 机型文件包含特定机型的配置和参数预设
 */

import type { ModelDefinition } from '../../../typings/modelTypes';
import type { ParamData } from '../../../typings/index';

// 四轴飞行器的默认参数
const defaultParams: ParamData[] = [
  // PID参数组
  {
    id: 'pid_pitch_p',
    name: '俯仰P增益',
    description: '俯仰轴的比例增益，控制响应强度',
    category: 'pid',
    type: 'number',
    value: 4.5,
    defaultValue: 4.5,
    min: 0,
    max: 10,
    step: 0.1
  },
  {
    id: 'pid_pitch_i',
    name: '俯仰I增益',
    description: '俯仰轴的积分增益，消除稳态误差',
    category: 'pid',
    type: 'number',
    value: 0.03,
    defaultValue: 0.03,
    min: 0,
    max: 0.2,
    step: 0.01
  },
  {
    id: 'pid_pitch_d',
    name: '俯仰D增益',
    description: '俯仰轴的微分增益，减少过冲和震荡',
    category: 'pid',
    type: 'number',
    value: 18,
    defaultValue: 18,
    min: 0,
    max: 50,
    step: 1
  },
  {
    id: 'pid_roll_p',
    name: '横滚P增益',
    description: '横滚轴的比例增益，控制响应强度',
    category: 'pid',
    type: 'number',
    value: 4.5,
    defaultValue: 4.5,
    min: 0,
    max: 10,
    step: 0.1
  },
  // 飞行参数组
  {
    id: 'max_angle',
    name: '最大倾角',
    description: '飞行器允许的最大倾斜角度',
    category: 'flight',
    type: 'number',
    value: 55,
    defaultValue: 55,
    min: 10,
    max: 80,
    step: 1
  },
  {
    id: 'max_rate',
    name: '最大角速度',
    description: '飞行器的最大旋转速度',
    category: 'flight',
    type: 'number',
    value: 360,
    defaultValue: 360,
    min: 180,
    max: 720,
    step: 10
  },
  // 电池参数组
  {
    id: 'battery_cells',
    name: '电池节数',
    description: '锂电池的节数',
    category: 'battery',
    type: 'number',
    value: 4,
    defaultValue: 4,
    min: 1,
    max: 12,
    step: 1
  },
  {
    id: 'voltage_warning',
    name: '低电压警告',
    description: '电池低电压警告阈值',
    category: 'battery',
    type: 'number',
    value: 3.5,
    defaultValue: 3.5,
    min: 3.0,
    max: 3.8,
    step: 0.1
  }
];

// 四轴飞行器的默认小组件布局
const defaultWidgetLayout = [
  {
    id: 'attitude',
    type: 'attitude',
    name: '姿态指示器',
    gridPosition: { x: 0, y: 0, w: 6, h: 3 }
  },
  {
    id: 'flight-data',
    type: 'flight-data',
    name: '飞行数据',
    gridPosition: { x: 6, y: 0, w: 5, h: 3 }
  },
  {
    id: 'battery',
    type: 'battery',
    name: '电池监控',
    gridPosition: { x: 11, y: 0, w: 5, h: 1 }
  },
  {
    id: 'channels',
    type: 'channels',
    name: '通道监视器',
    gridPosition: { x: 0, y: 3, w: 8, h: 3 }
  },
  {
    id: 'motors',
    type: 'motors',
    name: '电机输出',
    gridPosition: { x: 8, y: 3, w: 8, h: 3 }
  }
];

// 四轴飞行器的出厂配置
const quadcopterModel: ModelDefinition = {
  id: 'quadcopter',
  name: '四轴飞行器',
  description: '标准X型四轴飞行器配置',
  thumbnail: '/assets/models/quadcopter/icon.png',
  version: '1.0.0',
  author: 'AFC Team',
  category: 'multirotor',
  
  // 基础属性
  properties: {
    type: 'quadcopter',
    mixerType: 'quad_x',
    frameSize: 250, // mm
    defaultBatteryType: 'lipo',
    defaultBatteryCells: 4,
    maxMotorCount: 4
  },
  
  // 默认参数
  params: defaultParams,
  
  // 默认小组件布局
  widgetLayout: defaultWidgetLayout,
  
  // 机架图示配置
  frame: {
    imageUrl: '/assets/models/quadcopter/frame.svg',
    motorPositions: [
      { id: 1, x: 30, y: 30, rotation: 0, ccw: true },
      { id: 2, x: 70, y: 30, rotation: 0, ccw: false },
      { id: 3, x: 70, y: 70, rotation: 0, ccw: true },
      { id: 4, x: 30, y: 70, rotation: 0, ccw: false }
    ]
  },
  
  // 校准向导配置
  calibrationSteps: [
    {
      id: 'accelerometer',
      name: '加速度计校准',
      instructions: '将飞行器放置在水平面上，点击开始，然后按照提示依次将飞行器放置在6个不同的方向。'
    },
    {
      id: 'gyroscope',
      name: '陀螺仪校准',
      instructions: '将飞行器放置在静止的水平面上，点击开始，然后保持飞行器静止不动直到校准完成。'
    },
    {
      id: 'compass',
      name: '指南针校准',
      instructions: '点击开始，然后在30秒内慢慢旋转飞行器，使其能够采集各个方向的磁场数据。'
    },
    {
      id: 'radio',
      name: '遥控器校准',
      instructions: '确保遥控器已开启并连接，然后按照提示依次拨动各个摇杆和开关到最大和最小位置。'
    }
  ]
};

export default quadcopterModel; 