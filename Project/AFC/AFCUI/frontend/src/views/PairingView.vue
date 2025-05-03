<template>
  <div class="pairing-view">
    <div class="pairing-header">
      <button class="back-button" @click="goBack">
        <i class="icon-arrow-left"></i>
        返回
      </button>
      <h1 class="pairing-title">对频模式</h1>
    </div>
    
    <div class="pairing-content">
      <div class="pairing-status">
        <div class="status-icon" :class="{ 'scanning': isScanning }">
          <i class="icon-wifi"></i>
        </div>
        <div class="status-text">{{ statusText }}</div>
      </div>
      
      <div class="instructions">
        <p>请按照以下步骤进行对频：</p>
        <ol>
          <li>长按接收机上的<strong>BIND</strong>按钮</li>
          <li>开启接收机电源，确保接收机LED灯闪烁</li>
          <li>点击下方"开始对频"按钮</li>
          <li>等待对频完成</li>
        </ol>
      </div>
      
      <div class="action-buttons">
        <button 
          class="action-button" 
          :class="{ 'primary': !isScanning, 'secondary': isScanning }"
          @click="togglePairing"
        >
          {{ isScanning ? '停止扫描' : '开始对频' }}
        </button>
      </div>
      
      <div v-if="devices.length > 0" class="device-list">
        <h2 class="section-title">发现的设备</h2>
        <div v-for="device in devices" :key="device.id" class="device-item" @click="connectToDevice(device)">
          <div class="device-info">
            <div class="device-name">{{ device.name }}</div>
            <div class="device-id">ID: {{ device.id }}</div>
          </div>
          <div class="device-signal">
            <i class="icon-signal"></i>
            {{ device.signal }}%
          </div>
        </div>
      </div>
    </div>
    
    <!-- 连接中对话框 -->
    <div v-if="connecting" class="connection-dialog">
      <div class="dialog-content">
        <div class="spinner"></div>
        <div class="dialog-text">正在连接到 {{ selectedDevice?.name }}</div>
        <div class="dialog-subtext">请勿关闭页面...</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

interface Device {
  id: string;
  name: string;
  signal: number;
  type: string;
}

export default defineComponent({
  name: 'PairingView',
  setup() {
    const router = useRouter();
    const isScanning = ref(false);
    const devices = ref<Device[]>([]);
    const connecting = ref(false);
    const selectedDevice = ref<Device | null>(null);
    let scanTimer: number | null = null;
    let pairingTimeout: number | null = null;
    
    // 扫描状态文本
    const statusText = computed(() => {
      if (connecting.value) return '连接中...';
      return isScanning.value ? '正在扫描...' : '等待开始对频';
    });
    
    // 返回上一页
    const goBack = () => {
      stopScanning();
      router.push({ name: 'Unpaired' });
    };
    
    // 开始/停止扫描
    const togglePairing = () => {
      if (isScanning.value) {
        stopScanning();
      } else {
        startScanning();
      }
    };
    
    // 开始扫描
    const startScanning = () => {
      isScanning.value = true;
      devices.value = [];
      
      // 模拟发现设备过程
      scanTimer = window.setInterval(() => {
        if (Math.random() > 0.7 && devices.value.length < 5) {
          // 随机添加设备
          const newDevice: Device = {
            id: Math.random().toString(36).substring(2, 10).toUpperCase(),
            name: `AFRX-${Math.floor(Math.random() * 1000)}`,
            signal: Math.floor(Math.random() * 50) + 50,
            type: Math.random() > 0.3 ? 'AFRX' : 'LEGACY'
          };
          
          devices.value.push(newDevice);
        }
        
        // 更新信号强度
        devices.value.forEach(device => {
          device.signal = Math.min(100, Math.max(1, device.signal + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5)));
        });
      }, 1000);
      
      // 设置一个超时，如果30秒内没有设备，自动停止扫描
      pairingTimeout = window.setTimeout(() => {
        if (devices.value.length === 0) {
          stopScanning();
          alert('未发现设备，请确认接收机处于对频模式并重试。');
        }
      }, 30000);
    };
    
    // 停止扫描
    const stopScanning = () => {
      isScanning.value = false;
      if (scanTimer) {
        window.clearInterval(scanTimer);
        scanTimer = null;
      }
      if (pairingTimeout) {
        window.clearTimeout(pairingTimeout);
        pairingTimeout = null;
      }
    };
    
    // 连接到设备
    const connectToDevice = (device: Device) => {
      selectedDevice.value = device;
      connecting.value = true;
      stopScanning();
      
      // 模拟连接过程
      window.setTimeout(() => {
        connecting.value = false;
        
        // 保存连接状态
        localStorage.setItem('isConnected', 'true');
        localStorage.setItem('connectionMode', 'afc');
        localStorage.setItem('connectedDevice', JSON.stringify(device));
        
        // 如果是新设备，进入设置向导
        if (device.type === 'LEGACY' || Math.random() > 0.7) {
          router.push({ name: 'SetupModel' });
        } else {
          // 否则直接进入桌面
          router.push({ name: 'Desktop' });
        }
      }, 3000);
    };
    
    // 组件卸载时清理
    onUnmounted(() => {
      stopScanning();
    });
    
    return {
      isScanning,
      devices,
      statusText,
      connecting,
      selectedDevice,
      goBack,
      togglePairing,
      connectToDevice
    };
  }
});
</script>

<style lang="scss" scoped>
.pairing-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
  position: relative;
}

.pairing-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #2196f3;
  color: white;
}

.back-button {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  
  i {
    margin-right: 5px;
  }
}

.pairing-title {
  flex: 1;
  text-align: center;
  margin: 0;
  font-size: 20px;
}

.pairing-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
}

.pairing-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.status-icon {
  font-size: 60px;
  color: #2196f3;
  margin-bottom: 15px;
  
  &.scanning i {
    animation: pulse 1.5s infinite;
  }
}

.status-text {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.instructions {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  p {
    margin-top: 0;
    font-weight: bold;
  }
  
  ol {
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 10px;
    line-height: 1.5;
  }
}

.action-buttons {
  margin-bottom: 30px;
  text-align: center;
}

.action-button {
  padding: 15px 30px;
  border: none;
  border-radius: 30px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background-color: #2196f3;
    color: white;
    box-shadow: 0 4px 10px rgba(33, 150, 243, 0.3);
    
    &:hover {
      background-color: #1976d2;
      box-shadow: 0 6px 15px rgba(33, 150, 243, 0.4);
    }
  }
  
  &.secondary {
    background-color: #f44336;
    color: white;
    box-shadow: 0 4px 10px rgba(244, 67, 54, 0.3);
    
    &:hover {
      background-color: #d32f2f;
      box-shadow: 0 6px 15px rgba(244, 67, 54, 0.4);
    }
  }
}

.device-list {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e3f2fd;
    transform: translateY(-2px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
}

.device-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.device-id {
  font-size: 12px;
  color: #666;
}

.device-signal {
  font-weight: bold;
  color: #4caf50;
  display: flex;
  align-items: center;
  
  i {
    margin-right: 5px;
  }
}

.connection-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.dialog-content {
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  max-width: 80%;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #2196f3;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

.dialog-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.dialog-subtext {
  color: #666;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 