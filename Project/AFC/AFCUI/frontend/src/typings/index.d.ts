/**
 * 自定义全局类型声明
 */

// Android交互接口类型定义
export interface AndroidInterface {
  // 基础通信方法
  sendToNative: (data: string) => void;
  receiveFromNative: (callback: (data: string) => void) => void;
  
  // 状态查询方法
  getBatteryLevel: () => number;
  getConnectionStatus: () => 'connected' | 'disconnected' | string;
  getSignalStrength: () => number;
  getSystemTime: () => string;
  
  // 模型操作方法
  getModelList: () => string; // 返回JSON字符串
  getModelById: (modelId: string) => string; // 返回JSON字符串
  saveModelParams: (modelId: string, paramsJson: string) => boolean;
  getModelParams: (modelId: string) => string; // 返回JSON字符串
  
  // 系统操作方法
  rebootSystem: () => void;
  updateFirmware: (firmwareData: string) => boolean;
  formatStorage: () => boolean;

  // 通知相关方法
  showNotification: (id: string, title: string, message: string, type: 'info' | 'warning' | 'critical') => void;
  cancelNotification: (id: string) => void;
  
  // 传感器数据方法
  getAttitudeData: () => string; // 返回姿态数据的JSON字符串
  getGpsData: () => string; // 返回GPS数据的JSON字符串
  getRssiData: () => string; // 返回RSSI数据的JSON字符串
  
  // 电池监控方法
  registerBatteryMonitor: (cellWarningVoltage: number, warningThreshold: number, criticalThreshold: number) => boolean;
  unregisterBatteryMonitor: () => void;
  getBatteryData: () => string; // 返回电池数据的JSON字符串
  
  // 插件管理方法
  installPlugin: (pluginData: string) => boolean;
  uninstallPlugin: (pluginId: string) => boolean;
  enablePlugin: (pluginId: string) => boolean;
  disablePlugin: (pluginId: string) => boolean;
  getInstalledPlugins: () => string; // 返回已安装插件的JSON字符串

  // 机型管理方法
  saveModelData: (modelJson: string) => boolean;
  exportModel: (modelId: string, destination: string) => boolean;
  importModel: (source: string) => string; // 返回导入的机型ID
  
  // 小组件管理方法
  saveWidgetLayout: (layoutJson: string) => boolean;
  getWidgetLayout: () => string; // 返回小组件布局的JSON字符串
  
  // 系统配置方法
  getSystemConfig: () => string; // 返回系统配置的JSON字符串
  saveSystemConfig: (configJson: string) => boolean;
}

// 模型数据类型
export interface ModelData {
  id: string;
  name: string;
  type: string;
  lastModified: string;
}

// 参数数据类型
export interface ParamData {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'number' | 'select' | 'boolean' | 'text';
  value: string | number | boolean;
  defaultValue: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{value: string; label: string}>;
}

// 扩展Window接口
declare global {
  interface Window {
    Android?: AndroidInterface;
  }
} 