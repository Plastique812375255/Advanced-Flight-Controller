import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './styles/global.scss'

// 创建应用实例
const app = createApp(App)

// 使用路由和状态管理
app.use(router)
app.use(createPinia())

// 与Android的通信接口
declare global {
  interface Window {
    Android?: {
      sendToNative: (data: string) => void;
      getBatteryLevel: () => number;
      getConnectionStatus: () => string;
      // 其他根据需要添加的Android接口方法
    };
  }
}

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err);
  console.log('错误信息:', info);
  // 可以在这里添加错误上报或恢复逻辑
}

// 挂载应用
app.mount('#app') 