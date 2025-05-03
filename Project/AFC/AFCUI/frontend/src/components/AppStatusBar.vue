<template>
  <div class="top-frame" :class="{ 'delete-active': editMode }">
    <!-- 编辑模式退出按钮 -->
    <button 
      v-if="editMode" 
      id="exitEditModeBtn" 
      @click="$emit('toggleEditMode')"
    >
      退出编辑
    </button>
    
    <!-- 删除区域提示 -->
    <div class="delete-zone-text">拖动组件至此处删除</div>
    
    <!-- 左侧：连接状态 -->
    <div class="connection-status">
      <i :class="connectionStatusIcon"></i>
      {{ connectionStatusText }}
    </div>
    
    <!-- 中间：时间 -->
    <div class="current-time">
      {{ formattedTime }}
    </div>
    
    <!-- 右侧：电池状态 -->
    <div class="battery-status">
      <i :class="batteryIcon"></i>
      {{ batteryLevel }}%
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'AppStatusBar',
  props: {
    batteryLevel: {
      type: Number,
      default: 100
    },
    connectionStatus: {
      type: String,
      default: 'disconnected'
    },
    currentTime: {
      type: Date,
      required: true
    },
    editMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggleEditMode'],
  setup(props) {
    // 格式化时间
    const formattedTime = computed(() => {
      const time = props.currentTime;
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    });
    
    // 电池图标
    const batteryIcon = computed(() => {
      const level = props.batteryLevel;
      if (level > 80) return 'icon-battery-full';
      if (level > 60) return 'icon-battery-three-quarters';
      if (level > 40) return 'icon-battery-half';
      if (level > 20) return 'icon-battery-quarter';
      return 'icon-battery-empty';
    });
    
    // 连接状态图标
    const connectionStatusIcon = computed(() => {
      switch (props.connectionStatus) {
        case 'connected': return 'icon-link';
        case 'connecting': return 'icon-spin icon-sync';
        default: return 'icon-unlink';
      }
    });
    
    // 连接状态文本
    const connectionStatusText = computed(() => {
      switch (props.connectionStatus) {
        case 'connected': return '已连接';
        case 'connecting': return '连接中';
        default: return '未连接';
      }
    });
    
    return {
      formattedTime,
      batteryIcon,
      connectionStatusIcon,
      connectionStatusText
    };
  }
});
</script>

<style lang="scss" scoped>
.top-frame {
  height: 11.11%; /* 1/9的高度 */
  min-height: 50px;
  background-color: #333;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  padding: 10px 15px;
  box-sizing: border-box;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

/* 删除区域样式 */
.top-frame.delete-active {
  background: linear-gradient(to bottom, rgba(255, 0, 0, 0.8), #333);
  transition: all 0.3s ease;
}

.delete-zone-text {
  display: none;
  color: white;
  font-weight: bold;
  font-size: 16px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  animation: pulse 2s infinite;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
}

.top-frame.delete-active .delete-zone-text {
  display: block;
}

@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

/* 状态显示元素 */
.connection-status, .current-time, .battery-status {
  transition: opacity 0.3s ease;
}

/* 编辑模式下隐藏状态显示元素 */
.top-frame.delete-active .connection-status,
.top-frame.delete-active .current-time,
.top-frame.delete-active .battery-status {
  opacity: 0;
  visibility: hidden;
}

/* 退出编辑模式按钮 */
#exitEditModeBtn {
  display: none;
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  z-index: 1001;
  font-size: 16px;
  box-shadow: 0 3px 8px rgba(0,0,0,0.3);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.top-frame.delete-active #exitEditModeBtn {
  display: block;
}
</style> 