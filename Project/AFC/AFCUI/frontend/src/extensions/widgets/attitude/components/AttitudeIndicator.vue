<!--
  姿态指示器小组件
  显示飞行器的姿态（俯仰和横滚角度）
-->
<template>
  <div class="widget attitude-widget">
    <div class="widget-header">
      <h3>{{ title }}</h3>
      <div class="widget-actions" v-if="!editMode">
        <button class="action-button" @click="toggleFullscreen">
          <i class="fa fa-expand"></i>
        </button>
      </div>
    </div>
    
    <div class="widget-content">
      <div class="artificial-horizon">
        <div 
          class="horizon-circle" 
          :style="{
            transform: `rotateX(${pitch}deg) rotateZ(${roll}deg)`
          }"
        >
          <div class="horizon-line"></div>
          <div class="pitch-marks">
            <div class="pitch-mark" v-for="mark in pitchMarks" :key="mark.value"
              :style="{
                transform: `translateY(${mark.position}px)`,
                opacity: mark.opacity
              }"
            >
              <div class="mark-line" :class="{ 'zero-mark': mark.value === 0 }"></div>
              <span class="mark-value">{{ mark.label }}</span>
            </div>
          </div>
        </div>
        
        <div class="roll-indicator">
          <div class="roll-scale">
            <div class="roll-mark" v-for="mark in rollMarks" :key="mark.value"
              :style="{ transform: `rotate(${mark.value}deg)` }"
            >
              <div class="mark-line"></div>
            </div>
          </div>
          <div 
            class="roll-pointer"
            :style="{ transform: `rotate(${roll}deg)` }"
          ></div>
        </div>
        
        <div class="aircraft-indicator">
          <i class="fa fa-plane"></i>
        </div>
        
        <div class="attitude-data" v-if="config.showNumericValues">
          <div class="attitude-item">
            <div class="label">俯仰</div>
            <div class="value">{{ formattedPitch }}°</div>
          </div>
          <div class="attitude-item">
            <div class="label">横滚</div>
            <div class="value">{{ formattedRoll }}°</div>
          </div>
          <div class="attitude-item" v-if="config.showHeading">
            <div class="label">航向</div>
            <div class="value">{{ formattedHeading }}°</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import type { AndroidInterface } from '../../../../typings/index';

export default defineComponent({
  name: 'AttitudeIndicator',
  props: {
    title: {
      type: String,
      default: '姿态指示器'
    },
    editMode: {
      type: Boolean,
      default: false
    },
    config: {
      type: Object,
      default: () => ({
        refreshRate: 100,
        showHeading: true,
        showNumericValues: true,
        responsiveness: 0.8
      })
    }
  },
  setup(props) {
    // 姿态数据
    const pitch = ref(0);
    const roll = ref(0);
    const heading = ref(0);
    
    // 全屏显示状态
    const isFullscreen = ref(false);
    
    // 定时器ID
    let timerId: number | null = null;
    
    // 格式化角度显示
    const formattedPitch = computed(() => pitch.value.toFixed(1));
    const formattedRoll = computed(() => roll.value.toFixed(1));
    const formattedHeading = computed(() => heading.value.toFixed(0));
    
    // 生成俯仰标记
    const pitchMarks = computed(() => {
      const marks = [];
      for (let i = -90; i <= 90; i += 10) {
        // 中心位置为0度，每10度50像素
        const position = i * 5;
        
        // 标记的可见度基于当前俯仰角
        const distance = Math.abs(i - pitch.value);
        const opacity = distance > 45 ? 0 : 1 - (distance / 45);
        
        marks.push({
          value: i,
          position,
          opacity,
          label: i !== 0 ? Math.abs(i).toString() : ''
        });
      }
      return marks;
    });
    
    // 生成横滚标记
    const rollMarks = computed(() => {
      const marks = [];
      for (let i = -180; i <= 180; i += 30) {
        marks.push({
          value: i,
          label: i !== 0 ? i.toString() : ''
        });
      }
      return marks;
    });
    
    // 读取姿态数据方法
    const updateAttitudeData = () => {
      // 实际应用中，应从Android接口读取真实数据
      if (window.Android) {
        try {
          const android = window.Android as AndroidInterface;
          const dataJson = android.getAttitudeData();
          const data = JSON.parse(dataJson);
          
          // 添加平滑过渡效果
          const responsiveness = props.config.responsiveness || 0.8;
          pitch.value = pitch.value * (1 - responsiveness) + data.pitch * responsiveness;
          roll.value = roll.value * (1 - responsiveness) + data.roll * responsiveness;
          heading.value = heading.value * (1 - responsiveness) + data.heading * responsiveness;
        } catch (error) {
          console.error('读取姿态数据失败:', error);
          // 生成模拟数据
          generateDemoData();
        }
      } else {
        // 在开发环境或接口不可用时生成模拟数据
        generateDemoData();
      }
    };
    
    // 生成演示数据方法
    const generateDemoData = () => {
      // 添加平滑过渡效果
      const responsiveness = props.config.responsiveness || 0.8;
      
      // 生成-25到25度之间的缓慢变化的俯仰角
      const pitchAmplitude = 25;
      const pitchPeriod = 10000; // 10秒一个周期
      const targetPitch = pitchAmplitude * Math.sin(Date.now() / pitchPeriod * (2 * Math.PI));
      pitch.value = pitch.value * (1 - responsiveness) + targetPitch * responsiveness;
      
      // 生成-45到45度之间的缓慢变化的横滚角
      const rollAmplitude = 45;
      const rollPeriod = 8000; // 8秒一个周期
      const targetRoll = rollAmplitude * Math.sin(Date.now() / rollPeriod * (2 * Math.PI));
      roll.value = roll.value * (1 - responsiveness) + targetRoll * responsiveness;
      
      // 生成0到359度之间的缓慢变化的航向角
      const headingSpeed = 10; // 每秒10度
      const targetHeading = (Date.now() / 1000 * headingSpeed) % 360;
      
      // 处理航向角的边界情况（从359度到0度的过渡）
      const currentHeading = heading.value;
      let headingDiff = targetHeading - currentHeading;
      
      // 处理跨越0/360边界的情况
      if (headingDiff > 180) headingDiff -= 360;
      if (headingDiff < -180) headingDiff += 360;
      
      heading.value = (currentHeading + headingDiff * responsiveness + 360) % 360;
    };
    
    // 切换全屏显示
    const toggleFullscreen = () => {
      isFullscreen.value = !isFullscreen.value;
      const element = document.querySelector('.attitude-widget') as HTMLElement;
      
      if (isFullscreen.value) {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    };
    
    // 组件挂载时启动数据更新
    onMounted(() => {
      // 初始更新
      updateAttitudeData();
      
      // 设置定时刷新
      const refreshRate = props.config.refreshRate || 100;
      timerId = window.setInterval(updateAttitudeData, refreshRate);
      
      // 监听全屏变化事件
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    });
    
    // 处理全屏状态变化
    const handleFullscreenChange = () => {
      isFullscreen.value = !!document.fullscreenElement;
    };
    
    // 组件卸载前清除定时器
    onUnmounted(() => {
      if (timerId !== null) {
        clearInterval(timerId);
      }
      
      // 移除全屏事件监听
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    });
    
    return {
      pitch,
      roll,
      heading,
      formattedPitch,
      formattedRoll,
      formattedHeading,
      pitchMarks,
      rollMarks,
      isFullscreen,
      toggleFullscreen
    };
  }
});
</script>

<style scoped>
.attitude-widget {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ecf0f1;
}

.widget-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.widget-actions {
  display: flex;
}

.action-button {
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-button:hover {
  background-color: #ecf0f1;
  color: #2c3e50;
}

.widget-content {
  flex-grow: 1;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.artificial-horizon {
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 300px;
  background-color: #34495e;
  border-radius: 50%;
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 500px;
}

.horizon-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.05s ease-out;
}

.horizon-line {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #ffffff;
  transform: translateY(-50%);
}

.horizon-circle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background-color: #3498db;
  transform: translateZ(-1px);
}

.horizon-circle::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background-color: #e67e22;
  transform: translateZ(-1px);
}

.pitch-marks {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.pitch-mark {
  position: absolute;
  width: 100%;
  height: 2px;
  left: 0;
  top: 50%;
  transition: opacity 0.2s;
}

.mark-line {
  position: absolute;
  left: 50%;
  top: 0;
  width: 30%;
  height: 100%;
  background-color: #ffffff;
  transform: translateX(-50%);
}

.zero-mark {
  width: 50%;
}

.mark-value {
  position: absolute;
  left: 20%;
  top: -10px;
  color: #ffffff;
  font-size: 12px;
}

.roll-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.roll-scale {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.roll-mark {
  position: absolute;
  top: 10%;
  left: 50%;
  transform-origin: center bottom;
}

.roll-mark .mark-line {
  width: 2px;
  height: 10px;
  background-color: #ffffff;
}

.roll-pointer {
  position: absolute;
  top: 10%;
  left: 50%;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 15px solid #e74c3c;
  transform-origin: center 120%;
  transform: translateX(-50%);
  transition: transform 0.05s ease-out;
}

.aircraft-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  color: #f1c40f;
  font-size: 24px;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.attitude-data {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-around;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  padding: 8px;
}

.attitude-item {
  text-align: center;
}

.label {
  font-size: 12px;
  color: #bdc3c7;
}

.value {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

/* 全屏样式 */
:fullscreen .attitude-widget {
  border-radius: 0;
  box-shadow: none;
}

:fullscreen .artificial-horizon {
  max-height: none;
}
</style> 