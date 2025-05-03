<template>
  <div id="app" class="frame-container">
    <!-- 顶部状态栏 -->
    <AppStatusBar 
      v-if="!isUnpairedRoute" 
      :batteryLevel="batteryLevel"
      :connectionStatus="connectionStatus"
      :currentTime="currentTime"
      :editMode="editMode"
      @toggleEditMode="toggleEditMode"
    />
    
    <!-- 主内容区域 -->
    <div class="bottom-frame">
      <router-view />
    </div>
    
    <!-- 右侧菜单 -->
    <AppMenu v-model:visible="menuVisible" />
    
    <!-- 菜单遮罩层 -->
    <div 
      id="afcMenuOverlay" 
      :class="{ 'show': menuVisible }" 
      @click="menuVisible = false"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import AppStatusBar from '@/components/AppStatusBar.vue';
import AppMenu from '@/components/AppMenu.vue';

export default defineComponent({
  name: 'App',
  components: {
    AppStatusBar,
    AppMenu
  },
  setup() {
    // 状态数据
    const batteryLevel = ref(100);
    const connectionStatus = ref('disconnected');
    const currentTime = ref(new Date());
    const editMode = ref(false);
    const menuVisible = ref(false);
    const route = useRoute();
    
    // 计算属性
    const isUnpairedRoute = computed(() => {
      return route.name === 'Unpaired' || route.name === 'Pairing';
    });
    
    // 更新时间
    const updateTime = () => {
      currentTime.value = new Date();
    };
    
    // 更新电池状态
    const updateBatteryLevel = () => {
      if (window.Android?.getBatteryLevel) {
        batteryLevel.value = window.Android.getBatteryLevel();
      }
    };
    
    // 更新连接状态
    const updateConnectionStatus = () => {
      if (window.Android?.getConnectionStatus) {
        connectionStatus.value = window.Android.getConnectionStatus();
      }
    };
    
    // 切换编辑模式
    const toggleEditMode = () => {
      editMode.value = !editMode.value;
    };
    
    // 初始化触摸事件，监听右滑打开菜单
    const initTouchEvents = () => {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    };
    
    // 清除触摸事件监听
    const clearTouchEvents = () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    // 触摸事件相关变量
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoveX = 0;
    let touchMoveY = 0;
    
    // 处理触摸开始
    const handleTouchStart = (event: TouchEvent) => {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    };
    
    // 处理触摸移动
    const handleTouchMove = (event: TouchEvent) => {
      touchMoveX = event.touches[0].clientX;
      touchMoveY = event.touches[0].clientY;
    };
    
    // 处理触摸结束
    const handleTouchEnd = () => {
      const distanceX = touchMoveX - touchStartX;
      const distanceY = touchMoveY - touchStartY;
      // 如果是从左向右滑动，且水平距离大于垂直距离的2倍，则认为是右滑手势
      if (distanceX > 100 && Math.abs(distanceX) > Math.abs(distanceY) * 2) {
        menuVisible.value = true;
      }
    };
    
    // 创建定时器
    let timeInterval: number;
    let statusInterval: number;
    
    // 组件挂载时
    onMounted(() => {
      // 初始化定时更新时间和状态
      timeInterval = window.setInterval(updateTime, 1000);
      statusInterval = window.setInterval(() => {
        updateBatteryLevel();
        updateConnectionStatus();
      }, 5000);
      
      // 立即更新状态
      updateBatteryLevel();
      updateConnectionStatus();
      
      // 初始化触摸事件
      initTouchEvents();
    });
    
    // 组件卸载时
    onUnmounted(() => {
      // 清除定时器和触摸事件监听
      window.clearInterval(timeInterval);
      window.clearInterval(statusInterval);
      clearTouchEvents();
    });
    
    return {
      batteryLevel,
      connectionStatus,
      currentTime,
      editMode,
      menuVisible,
      isUnpairedRoute,
      toggleEditMode
    };
  }
});
</script>

<style lang="scss">
.frame-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}

.bottom-frame {
  height: 88.89%; /* 8/9的高度 */
  overflow: hidden;
  position: relative;
  flex-grow: 1;
}

#afcMenuOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
  &.show {
    display: block;
  }
}
</style> 