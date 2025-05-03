<template>
  <div class="battery-widget">
    <div class="widget-header">
      <div class="widget-title">电池状态</div>
      <div class="battery-percentage" :class="batteryLevelClass">{{ batteryData.percentage.toFixed(1) }}%</div>
    </div>
    
    <div class="battery-main">
      <div class="battery-visual">
        <div class="battery-icon">
          <div class="battery-level" 
               :style="{ width: `${batteryData.percentage}%`, backgroundColor: batteryLevelColor }"></div>
        </div>
      </div>
      
      <div class="battery-info">
        <div class="info-row">
          <span class="info-label">电压:</span>
          <span class="info-value">{{ batteryData.voltage.toFixed(2) }}V</span>
        </div>
        <div class="info-row">
          <span class="info-label">电流:</span>
          <span class="info-value">{{ batteryData.current.toFixed(2) }}A</span>
        </div>
        <div class="info-row">
          <span class="info-label">已用容量:</span>
          <span class="info-value">{{ batteryData.capacity.used.toFixed(0) }}mAh</span>
        </div>
      </div>
    </div>
    
    <div v-if="config.showCellVoltages && batteryData.cells.length > 0" class="cell-voltages">
      <div class="section-title">单节电压</div>
      <div class="cells-grid">
        <div v-for="(voltage, index) in batteryData.cells" :key="index" 
             class="cell-item" :class="getCellVoltageClass(voltage)">
          <div class="cell-index">{{ index + 1 }}</div>
          <div class="cell-voltage">{{ voltage.toFixed(2) }}V</div>
        </div>
      </div>
    </div>
    
    <div v-if="config.showGraph" class="voltage-graph">
      <div class="section-title">电压趋势</div>
      <div class="graph-container" ref="graphContainer">
        <!-- 图表将在mounted中通过Canvas绘制 -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue';
import type { AndroidInterface } from '../../../../typings/index';

interface BatteryData {
  percentage: number;
  voltage: number;
  current: number;
  capacity: {
    used: number;
    total: number;
  };
  cells: number[];
}

export default defineComponent({
  name: 'BatteryWidget',
  props: {
    config: {
      type: Object,
      default: () => ({
        warningThreshold: 20,
        criticalThreshold: 10,
        cellWarningVoltage: 3.5,
        showCellVoltages: true,
        showGraph: true,
        graphDuration: 300
      })
    }
  },
  setup(props) {
    // 电池数据
    const batteryData = reactive<BatteryData>({
      percentage: 80,
      voltage: 16.4,
      current: 8.5,
      capacity: {
        used: 450,
        total: 2200
      },
      cells: [4.15, 4.13, 4.12, 4.14]
    });
    
    // 图表相关
    const graphContainer = ref<HTMLElement | null>(null);
    const voltageHistory = ref<{time: number; voltage: number}[]>([]);
    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;
    let animationFrameId: number | null = null;
    
    // 监听电池数据更新
    const handleBatteryUpdate = (event: CustomEvent) => {
      const newData = event.detail as BatteryData;
      Object.assign(batteryData, newData);
      
      // 更新电压历史
      voltageHistory.value.push({
        time: Date.now(),
        voltage: newData.voltage
      });
      
      // 删除超过显示时间的历史数据
      const cutoffTime = Date.now() - props.config.graphDuration * 1000;
      while (voltageHistory.value.length > 0 && voltageHistory.value[0].time < cutoffTime) {
        voltageHistory.value.shift();
      }
    };
    
    // 绘制电压图表
    const drawVoltageGraph = () => {
      if (!canvas || !ctx || voltageHistory.value.length < 2) return;
      
      const width = canvas.width;
      const height = canvas.height;
      const now = Date.now();
      const timeRange = props.config.graphDuration * 1000;
      const startTime = now - timeRange;
      
      // 找出电压范围
      let minVoltage = Math.min(...voltageHistory.value.map(v => v.voltage));
      let maxVoltage = Math.max(...voltageHistory.value.map(v => v.voltage));
      const voltageMargin = (maxVoltage - minVoltage) * 0.1;
      minVoltage -= voltageMargin;
      maxVoltage += voltageMargin;
      
      // 清除画布
      ctx.clearRect(0, 0, width, height);
      
      // 绘制背景网格
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
      ctx.lineWidth = 1;
      
      // 绘制水平网格线
      for (let i = 0; i <= 4; i++) {
        const y = height - (height * (i / 4));
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // 绘制垂直网格线
      for (let i = 0; i <= 6; i++) {
        const x = width * (i / 6);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // 绘制电压曲线
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      voltageHistory.value.forEach((point, index) => {
        const x = width * ((point.time - startTime) / timeRange);
        const y = height - (height * ((point.voltage - minVoltage) / (maxVoltage - minVoltage)));
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // 绘制填充区域
      ctx.fillStyle = 'rgba(52, 152, 219, 0.2)';
      ctx.beginPath();
      voltageHistory.value.forEach((point, index) => {
        const x = width * ((point.time - startTime) / timeRange);
        const y = height - (height * ((point.voltage - minVoltage) / (maxVoltage - minVoltage)));
        
        if (index === 0) {
          ctx.moveTo(x, height);
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      if (voltageHistory.value.length > 0) {
        const lastPoint = voltageHistory.value[voltageHistory.value.length - 1];
        const x = width * ((lastPoint.time - startTime) / timeRange);
        ctx.lineTo(x, height);
      }
      
      ctx.fill();
      
      // 继续绘制下一帧
      animationFrameId = requestAnimationFrame(drawVoltageGraph);
    };
    
    // 初始化图表
    const initGraph = () => {
      if (!graphContainer.value) return;
      
      canvas = document.createElement('canvas');
      canvas.width = graphContainer.value.clientWidth;
      canvas.height = graphContainer.value.clientHeight;
      graphContainer.value.appendChild(canvas);
      
      ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // 开始绘制循环
      animationFrameId = requestAnimationFrame(drawVoltageGraph);
    };
    
    // 电池电量等级样式
    const batteryLevelClass = computed(() => {
      if (batteryData.percentage <= props.config.criticalThreshold) {
        return 'critical';
      } else if (batteryData.percentage <= props.config.warningThreshold) {
        return 'warning';
      } else {
        return 'normal';
      }
    });
    
    // 电池电量颜色
    const batteryLevelColor = computed(() => {
      if (batteryData.percentage <= props.config.criticalThreshold) {
        return '#e74c3c';
      } else if (batteryData.percentage <= props.config.warningThreshold) {
        return '#f39c12';
      } else {
        return '#2ecc71';
      }
    });
    
    // 获取单节电池电压样式
    const getCellVoltageClass = (voltage: number) => {
      if (voltage < props.config.cellWarningVoltage) {
        return 'cell-low';
      } else {
        return 'cell-normal';
      }
    };
    
    // 在真实环境中获取电池数据
    const fetchRealBatteryData = () => {
      if (window.Android) {
        const android = window.Android as AndroidInterface;
        try {
          const batteryDataJson = android.getBatteryData();
          const data = JSON.parse(batteryDataJson);
          Object.assign(batteryData, data);
          
          // 更新电压历史
          voltageHistory.value.push({
            time: Date.now(),
            voltage: data.voltage
          });
        } catch (error) {
          console.error('获取电池数据失败:', error);
        }
      }
    };
    
    // 组件加载后执行的操作
    onMounted(() => {
      // 添加电池数据更新事件监听器
      document.addEventListener('batteryUpdate', handleBatteryUpdate as EventListener);
      
      // 如果配置了显示图表，初始化图表
      if (props.config.showGraph) {
        initGraph();
      }
      
      // 在真实环境中，尝试获取初始电池数据
      fetchRealBatteryData();
    });
    
    // 组件卸载前清理资源
    onUnmounted(() => {
      // 移除事件监听器
      document.removeEventListener('batteryUpdate', handleBatteryUpdate as EventListener);
      
      // 取消动画帧
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    });
    
    // 监听配置变化
    watch(() => props.config.showGraph, (newValue) => {
      if (newValue && !canvas && graphContainer.value) {
        initGraph();
      }
    });
    
    return {
      batteryData,
      graphContainer,
      batteryLevelClass,
      batteryLevelColor,
      getCellVoltageClass
    };
  }
});
</script>

<style scoped>
.battery-widget {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.widget-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.battery-percentage {
  font-size: 20px;
  font-weight: 700;
}

.battery-percentage.normal {
  color: #2ecc71;
}

.battery-percentage.warning {
  color: #f39c12;
}

.battery-percentage.critical {
  color: #e74c3c;
}

.battery-main {
  display: flex;
  margin-bottom: 16px;
}

.battery-visual {
  flex: 0 0 40%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.battery-icon {
  width: 80%;
  height: 32px;
  border: 2px solid #95a5a6;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.battery-icon::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 8px;
  width: 6px;
  height: 16px;
  background-color: #95a5a6;
  border-radius: 0 2px 2px 0;
}

.battery-level {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  transition: width 0.5s;
}

.battery-info {
  flex: 0 0 60%;
  padding-left: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-label {
  color: #7f8c8d;
}

.info-value {
  font-weight: 600;
  color: #2c3e50;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  margin-top: 4px;
}

.cell-voltages {
  margin-bottom: 16px;
}

.cells-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
}

.cell-item {
  border-radius: 4px;
  padding: 6px;
  text-align: center;
}

.cell-normal {
  background-color: rgba(46, 204, 113, 0.1);
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.cell-low {
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.cell-index {
  font-size: 12px;
  color: #7f8c8d;
}

.cell-voltage {
  font-size: 14px;
  font-weight: 600;
}

.cell-normal .cell-voltage {
  color: #27ae60;
}

.cell-low .cell-voltage {
  color: #c0392b;
}

.voltage-graph {
  flex-grow: 1;
  min-height: 100px;
}

.graph-container {
  width: 100%;
  height: 100%;
  background-color: rgba(236, 240, 241, 0.5);
  border-radius: 4px;
}
</style> 