/**
 * 姿态指示器小组件
 * 显示飞行器的俯仰、横滚和航向数据
 */
import type { WidgetDefinition } from '../../../typings/modelTypes';

// 姿态指示器定义
const attitudeWidget: WidgetDefinition = {
  id: 'attitude-indicator',
  type: 'attitude',
  name: '姿态指示器',
  gridPosition: { x: 0, y: 0, w: 6, h: 4 },
  config: {
    refreshRate: 100, // 刷新频率（毫秒）
    showHeading: true, // 是否显示航向数据
    showNumericValues: true, // 是否显示数值
    responsiveness: 0.8 // 响应速度（0-1）
  }
};

export default attitudeWidget; 