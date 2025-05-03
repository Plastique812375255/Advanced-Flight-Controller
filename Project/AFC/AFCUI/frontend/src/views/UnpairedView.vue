<template>
  <div class="unpaired-view">
    <div class="logo-container">
      <img src="@/assets/logo.png" alt="AFC Logo" class="logo-image" />
      <h1 class="title">Advanced Flight Controller</h1>
    </div>
    
    <div class="unpaired-text">未连接</div>
    
    <div class="buttons-container">
      <button class="large-button traditional-button" @click="enterTradMode">
        <i class="icon-gamepad"></i>
        使用传统模式
      </button>
      
      <button class="large-button pair-button" @click="startPairing">
        <i class="icon-wifi"></i>
        对频
      </button>
    </div>
    
    <div class="status-panel">
      <h2 class="panel-title">遥控器状态</h2>
      
      <div class="control-status">
        <div class="status-group">
          <div class="status-label">摇杆:</div>
          <div class="status-value">
            <div class="joystick-indicator">
              <div class="joystick-dot" :style="leftJoystickStyle"></div>
            </div>
            <div class="joystick-indicator">
              <div class="joystick-dot" :style="rightJoystickStyle"></div>
            </div>
          </div>
        </div>
        
        <div class="status-group">
          <div class="status-label">开关:</div>
          <div class="status-value">
            <div class="switch-indicators">
              <div v-for="(state, idx) in switchStates" :key="idx" class="switch-indicator" :class="{'switch-on': state}">
                {{ String.fromCharCode(65 + idx) }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="status-group">
          <div class="status-label">飞行模式:</div>
          <div class="status-value">
            <span class="flight-mode">安全模式</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'UnpairedView',
  setup() {
    const router = useRouter();
    
    // 摇杆和开关状态
    const leftStickX = ref(0);
    const leftStickY = ref(0);
    const rightStickX = ref(0);
    const rightStickY = ref(0);
    const switchStates = ref([false, false, false, false, false, false]);
    
    // 转换为CSS样式
    const leftJoystickStyle = computed(() => ({
      left: `${50 + leftStickX.value * 50}%`,
      top: `${50 + leftStickY.value * 50}%`
    }));
    
    const rightJoystickStyle = computed(() => ({
      left: `${50 + rightStickX.value * 50}%`,
      top: `${50 + rightStickY.value * 50}%`
    }));
    
    // 模拟摇杆随机运动，实际应该从Native获取数据
    let joystickSimInterval: number;
    
    const simulateJoystickMovement = () => {
      leftStickX.value = Math.random() * 0.3 * (Math.random() > 0.5 ? 1 : -1);
      leftStickY.value = Math.random() * 0.3 * (Math.random() > 0.5 ? 1 : -1);
      rightStickX.value = Math.random() * 0.3 * (Math.random() > 0.5 ? 1 : -1);
      rightStickY.value = Math.random() * 0.3 * (Math.random() > 0.5 ? 1 : -1);
      
      // 随机切换一个开关状态
      if (Math.random() > 0.9) {
        const idx = Math.floor(Math.random() * switchStates.value.length);
        switchStates.value[idx] = !switchStates.value[idx];
      }
    };
    
    // 进入TRAD模式
    const enterTradMode = () => {
      // 设置连接状态
      localStorage.setItem('isConnected', 'true');
      localStorage.setItem('connectionMode', 'trad');
      // 导航到桌面
      router.push({ name: 'Desktop' });
    };
    
    // 开始对频
    const startPairing = () => {
      router.push({ name: 'Pairing' });
    };
    
    // 组件挂载时
    onMounted(() => {
      // 启动模拟器
      joystickSimInterval = window.setInterval(simulateJoystickMovement, 500);
    });
    
    // 组件卸载时
    onUnmounted(() => {
      window.clearInterval(joystickSimInterval);
    });
    
    return {
      leftJoystickStyle,
      rightJoystickStyle,
      switchStates,
      enterTradMode,
      startPairing
    };
  }
});
</script>

<style lang="scss" scoped>
.unpaired-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #f5f5f5; /* 使用亮色主题 */
}

.logo-container {
  text-align: center;
  margin-bottom: 20px;
  
  .logo-image {
    width: 150px;
    height: auto;
    margin-bottom: 15px;
  }
  
  .title {
    font-size: 24px;
    color: #333;
    margin: 0;
  }
}

.unpaired-text {
  font-size: 32px;
  color: #666;
  font-weight: bold;
  margin-bottom: 30px;
}

.buttons-container {
  display: flex;
  justify-content: center;
  width: 80%; /* 控制按钮区域总宽度 */
  gap: 30px; /* 按钮之间的间隔 */
  margin-bottom: 30px;
}

.large-button {
  width: 45%; /* 设置按钮宽度 */
  height: 160px; /* 设置按钮高度 */
  border-radius: 12px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  box-shadow: 0 6px 10px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  i {
    font-size: 32px;
    margin-bottom: 10px;
  }
  
  &:hover {
    box-shadow: 0 8px 15px rgba(0,0,0,0.3);
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.traditional-button {
  background-color: #607D8B; /* 深蓝灰色 */
  color: white;
  
  &:hover {
    background-color: #455A64;
  }
  
  &:active {
    background-color: #37474F;
  }
}

.pair-button {
  background-color: #2196F3; /* 蓝色 */
  color: white;
  
  &:hover {
    background-color: #1976D2;
  }
  
  &:active {
    background-color: #0D47A1;
  }
}

.status-panel {
  width: 100%;
  max-width: 500px;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.panel-title {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
  text-align: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.control-status {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-group {
  display: flex;
  align-items: center;
}

.status-label {
  width: 80px;
  font-weight: bold;
  color: #555;
}

.status-value {
  flex: 1;
  display: flex;
  align-items: center;
}

.joystick-indicator {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 2px solid #ddd;
  position: relative;
  margin-right: 15px;
}

.joystick-dot {
  position: absolute;
  width: 14px;
  height: 14px;
  background-color: #2196f3;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.switch-indicators {
  display: flex;
  gap: 10px;
}

.switch-indicator {
  width: 30px;
  height: 30px;
  border-radius: 3px;
  background-color: #eee;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.switch-on {
  background-color: #4caf50;
  color: white;
}

.flight-mode {
  padding: 5px 10px;
  background-color: #ffeb3b;
  color: #333;
  border-radius: 4px;
  font-weight: bold;
}
</style> 