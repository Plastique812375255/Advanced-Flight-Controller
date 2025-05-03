/**
 * 电池监控插件
 * 监控电池电压、电流和剩余容量，提供低电量警告
 */
import type { PluginDefinition } from '../../../typings/modelTypes';
import type { AndroidInterface } from '../../../typings/index';

// 电池监控小组件
const batteryWidget = {
  id: 'battery-monitor',
  type: 'battery',
  name: '电池监控',
  gridPosition: { x: 0, y: 0, w: 4, h: 2 },
  config: {
    warningThreshold: 20, // 剩余电量百分比警告阈值
    criticalThreshold: 10, // 剩余电量百分比严重警告阈值
    cellWarningVoltage: 3.5, // 单节电池电压警告阈值
    showCellVoltages: true, // 是否显示单节电压
    showGraph: true, // 是否显示电压图表
    graphDuration: 300 // 图表显示的时间周期（秒）
  }
};

// 插件事件处理器
const eventHandlers = {
  // 电池电量低事件处理器
  onBatteryLow: (data: { percentage: number; voltage: number }) => {
    const { percentage, voltage } = data;
    if (percentage <= batteryWidget.config.criticalThreshold) {
      // 严重低电量警告
      showCriticalBatteryWarning(percentage, voltage);
    } else if (percentage <= batteryWidget.config.warningThreshold) {
      // 低电量警告
      showBatteryWarning(percentage, voltage);
    }
  },
  
  // 插件初始化
  onPluginInit: () => {
    console.log('电池监控插件已初始化');
    
    // 注册电池监控服务
    registerBatteryMonitor();
  },
  
  // 插件卸载
  onPluginUnload: () => {
    console.log('电池监控插件已卸载');
    
    // 取消注册电池监控服务
    unregisterBatteryMonitor();
  }
};

// 显示电池警告
function showBatteryWarning(percentage: number, voltage: number) {
  // 实际应用中，应调用Android接口显示系统通知
  if (window.Android) {
    const android = window.Android as AndroidInterface;
    android.showNotification(
      'battery_warning',
      '电池电量低',
      `电池电量已降至${percentage}%，请尽快着陆。`,
      'warning'
    );
  } else {
    console.log(`[电池警告] 电量: ${percentage}%, 电压: ${voltage}V`);
  }
}

// 显示严重电池警告
function showCriticalBatteryWarning(percentage: number, voltage: number) {
  // 实际应用中，应调用Android接口显示系统通知
  if (window.Android) {
    const android = window.Android as AndroidInterface;
    android.showNotification(
      'battery_critical',
      '电池电量严重不足',
      `电池电量已降至${percentage}%，请立即着陆！`,
      'critical'
    );
  } else {
    console.log(`[严重电池警告] 电量: ${percentage}%, 电压: ${voltage}V`);
  }
}

// 注册电池监控服务
function registerBatteryMonitor() {
  // 实际应用中，应启动一个后台服务进行电池监控
  if (window.Android) {
    const android = window.Android as AndroidInterface;
    android.registerBatteryMonitor(
      batteryWidget.config.cellWarningVoltage,
      batteryWidget.config.warningThreshold,
      batteryWidget.config.criticalThreshold
    );
  } else {
    console.log('[开发模式] 已注册电池监控服务');
    
    // 在开发环境中模拟电池状态更新
    startDemoBatteryUpdates();
  }
}

// 取消注册电池监控服务
function unregisterBatteryMonitor() {
  if (window.Android) {
    const android = window.Android as AndroidInterface;
    android.unregisterBatteryMonitor();
  } else {
    console.log('[开发模式] 已取消注册电池监控服务');
    
    // 停止模拟更新
    stopDemoBatteryUpdates();
  }
}

// 模拟电池更新的定时器ID
let demoTimerId: number | null = null;

// 开始模拟电池状态更新
function startDemoBatteryUpdates() {
  if (demoTimerId !== null) {
    return;
  }
  
  // 每5秒更新一次模拟电池数据
  demoTimerId = window.setInterval(() => {
    // 生成模拟电池数据
    const percentage = Math.max(0, 100 - (Date.now() % 1000000) / 10000);
    const voltage = 3.7 * 4 * (percentage / 100);
    
    // 检查是否需要触发警告
    if (percentage <= batteryWidget.config.warningThreshold) {
      eventHandlers.onBatteryLow({ percentage, voltage });
    }
    
    // 将数据发送给小组件
    document.dispatchEvent(new CustomEvent('batteryUpdate', {
      detail: {
        percentage,
        voltage,
        current: 10.5 * (percentage / 100),
        capacity: {
          used: 2200 * (1 - percentage / 100),
          total: 2200
        },
        cells: [
          3.7 * (percentage / 100),
          3.7 * (percentage / 100) * 0.98,
          3.7 * (percentage / 100) * 1.02,
          3.7 * (percentage / 100) * 0.99
        ]
      }
    }));
  }, 5000);
}

// 停止模拟电池状态更新
function stopDemoBatteryUpdates() {
  if (demoTimerId !== null) {
    window.clearInterval(demoTimerId);
    demoTimerId = null;
  }
}

// 电池监控插件定义
const batteryMonitorPlugin: PluginDefinition = {
  id: 'battery-monitor',
  name: '电池监控',
  description: '监控电池电压、电流和剩余容量，提供低电量警告',
  version: '1.0.0',
  author: 'AFC Team',
  thumbnail: '/assets/plugins/battery-monitor/icon.png', // 更新图标路径
  
  // 插件类型
  type: 'widget',
  
  // 兼容性信息
  compatibility: {
    minAppVersion: '1.0.0',
    supportedModels: ['*'] // 所有机型都支持
  },
  
  // 插件权限
  permissions: [
    'read_battery',
    'show_notifications'
  ],
  
  // 配置选项
  config: {
    warningThreshold: 20,
    criticalThreshold: 10,
    cellWarningVoltage: 3.5,
    enableVoiceAlerts: true
  },
  
  // 小组件定义
  widget: batteryWidget,
  
  // 入口文件路径
  entryPoint: 'plugins/battery-monitor/index.js'
};

// 导出插件定义和事件处理器
export { eventHandlers };
export default batteryMonitorPlugin; 