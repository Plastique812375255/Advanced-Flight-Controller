/**
 * 机型、小组件和插件的类型定义
 */

// 参数数据类型（从index.d.ts中导入）
import { ParamData } from './index';

// 网格位置定义
export interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

// 小组件定义
export interface WidgetDefinition {
  id: string;
  type: string;
  name: string;
  gridPosition: GridPosition;
  config?: Record<string, any>;
  permissions?: string[];
}

// 电机位置定义
export interface MotorPosition {
  id: number;
  x: number;
  y: number;
  rotation: number;
  ccw: boolean;
}

// 校准步骤定义
export interface CalibrationStep {
  id: string;
  name: string;
  instructions: string;
  requiredHardware?: string[];
}

// 机型定义
export interface ModelDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  version: string;
  author: string;
  category: string;
  
  // 基础属性
  properties: {
    type: string;
    mixerType: string;
    frameSize: number;
    defaultBatteryType: string;
    defaultBatteryCells: number;
    maxMotorCount: number;
    [key: string]: any;
  };
  
  // 参数列表
  params: ParamData[];
  
  // 小组件布局
  widgetLayout: WidgetDefinition[];
  
  // 机架图示
  frame: {
    imageUrl: string;
    motorPositions: MotorPosition[];
  };
  
  // 校准向导
  calibrationSteps: CalibrationStep[];
}

// 插件定义
export interface PluginDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  thumbnail: string;
  
  // 插件类型
  type: 'widget' | 'feature' | 'theme';
  
  // 兼容性信息
  compatibility: {
    minAppVersion: string;
    maxAppVersion?: string;
    supportedModels: string[];
  };
  
  // 插件权限
  permissions: string[];
  
  // 配置选项
  config?: Record<string, any>;
  
  // 小组件定义（仅widget类型）
  widget?: WidgetDefinition;
  
  // 入口文件路径
  entryPoint: string;
} 