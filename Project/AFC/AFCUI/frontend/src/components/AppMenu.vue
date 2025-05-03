<template>
  <div class="menu" :class="{ show: modelValue }">
    <!-- 菜单头部 -->
    <div class="menu-header">
      <div class="menu-title">菜单</div>
      <button class="menu-close" @click="closeMenu">&times;</button>
    </div>
    
    <!-- 菜单内容 -->
    <div class="menu-content">
      <!-- 主菜单分组 -->
      <div class="menu-group">
        <div class="menu-group-title">主菜单</div>
        <div class="menu-item" @click="navigate('Desktop')">
          <i class="icon-home"></i>
          <span>桌面</span>
        </div>
        <div class="menu-item" @click="navigateToModelParams(1)">
          <i class="icon-sliders"></i>
          <span>参数设置</span>
        </div>
        <div class="menu-item" @click="toggleEditMode">
          <i class="icon-edit"></i>
          <span>编辑桌面</span>
        </div>
      </div>
      
      <!-- 模型菜单分组 -->
      <div class="menu-group">
        <div class="menu-group-title">模型</div>
        <div class="menu-item" @click="navigate('SetupModel')">
          <i class="icon-cog"></i>
          <span>模型设置</span>
        </div>
        <div class="menu-item" @click="showModelSelector">
          <i class="icon-list"></i>
          <span>切换模型</span>
        </div>
      </div>
      
      <!-- 系统菜单分组 -->
      <div class="menu-group">
        <div class="menu-group-title">系统</div>
        <div class="menu-item" @click="showSettings">
          <i class="icon-cogs"></i>
          <span>系统设置</span>
        </div>
        <div class="menu-item" @click="navigate('Unpaired')">
          <i class="icon-sign-out-alt"></i>
          <span>断开连接</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'AppMenu',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const router = useRouter();
    
    // 关闭菜单
    const closeMenu = () => {
      emit('update:modelValue', false);
    };
    
    // 导航到指定路由
    const navigate = (routeName: string) => {
      closeMenu();
      router.push({ name: routeName });
    };
    
    // 切换编辑模式
    const toggleEditMode = () => {
      closeMenu();
      // 触发全局事件
      window.dispatchEvent(new CustomEvent('toggleEditMode'));
    };
    
    // 显示模型选择器
    const showModelSelector = () => {
      closeMenu();
      // 实现模型选择器逻辑
      alert('模型选择器功能尚未实现');
    };
    
    // 显示设置页面
    const showSettings = () => {
      closeMenu();
      // 实现设置页面逻辑
      alert('系统设置功能尚未实现');
    };
    
    // 导航到特定模型的参数设置页面
    const navigateToModelParams = (modelId: number) => {
      closeMenu();
      router.push({ 
        name: 'ModelParams',
        params: { modelId: modelId.toString() }
      });
    };
    
    return {
      closeMenu,
      navigate,
      toggleEditMode,
      showModelSelector,
      showSettings,
      navigateToModelParams
    };
  }
});
</script>

<style lang="scss" scoped>
.menu {
  position: fixed;
  top: 0;
  right: -300px;
  width: 300px;
  height: 100%;
  background-color: #fff;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  z-index: 1000;
  transition: right 0.3s ease;
  overflow-y: auto;
  
  &.show {
    right: 0;
  }
}

.menu-header {
  padding: 15px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-title {
  font-size: 18px;
  font-weight: bold;
}

.menu-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #555;
  
  &:hover {
    color: #f44336;
  }
}

.menu-content {
  padding: 10px 0;
}

.menu-group {
  margin-bottom: 20px;
}

.menu-group-title {
  padding: 5px 15px;
  font-size: 14px;
  color: #888;
  text-transform: uppercase;
}

.menu-item {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    background-color: #f8f8f8;
  }
  
  i {
    margin-right: 15px;
    font-size: 18px;
    width: 24px;
    text-align: center;
    color: #555;
  }
  
  span {
    font-size: 16px;
  }
}
</style> 