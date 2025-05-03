<template>
  <div class="desktop-view">
    <div class="header">
      <div class="logo">
        <img src="../assets/logo.png" alt="AFC Logo" class="logo-img" />
        <h1 class="title">高级飞控系统</h1>
      </div>
      <div class="status-bar">
        <div class="status-item connected">
          <i class="fa fa-link"></i>
          <span>已连接</span>
        </div>
        <div class="status-item">
          <i class="fa fa-battery-three-quarters"></i>
          <span>12.6V</span>
        </div>
        <div class="status-item">
          <i class="fa fa-signal"></i>
          <span>RSSI: 85%</span>
        </div>
      </div>
    </div>

    <div class="dashboard">
      <div class="widgets-container">
        <div class="widget-row">
          <div class="widget flight-data">
            <div class="widget-header">
              <h3>飞行数据</h3>
              <div class="widget-actions">
                <button class="action-button">
                  <i class="fa fa-expand"></i>
                </button>
              </div>
            </div>
            <div class="widget-content">
              <div class="data-grid">
                <div class="data-item">
                  <div class="data-label">速度</div>
                  <div class="data-value">12.5 m/s</div>
                </div>
                <div class="data-item">
                  <div class="data-label">高度</div>
                  <div class="data-value">32.4 m</div>
                </div>
                <div class="data-item">
                  <div class="data-label">垂直速度</div>
                  <div class="data-value">0.2 m/s</div>
                </div>
                <div class="data-item">
                  <div class="data-label">距离</div>
                  <div class="data-value">125 m</div>
                </div>
                <div class="data-item">
                  <div class="data-label">飞行时间</div>
                  <div class="data-value">05:32</div>
                </div>
                <div class="data-item">
                  <div class="data-label">GPS卫星</div>
                  <div class="data-value">12</div>
                </div>
              </div>
            </div>
          </div>

          <div class="widget attitude">
            <div class="widget-header">
              <h3>姿态显示</h3>
              <div class="widget-actions">
                <button class="action-button">
                  <i class="fa fa-expand"></i>
                </button>
              </div>
            </div>
            <div class="widget-content">
              <div class="artificial-horizon">
                <div class="horizon-circle">
                  <div class="horizon-line"></div>
                  <div class="pitch-indicator"></div>
                  <div class="roll-indicator">
                    <div class="aircraft-icon">
                      <i class="fa fa-plane"></i>
                    </div>
                  </div>
                </div>
                <div class="attitude-data">
                  <div class="attitude-item">
                    <span class="label">俯仰:</span>
                    <span class="value">2.5°</span>
                  </div>
                  <div class="attitude-item">
                    <span class="label">横滚:</span>
                    <span class="value">-1.8°</span>
                  </div>
                  <div class="attitude-item">
                    <span class="label">航向:</span>
                    <span class="value">278°</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="widget-row">
          <div class="widget channels">
            <div class="widget-header">
              <h3>通道监视器</h3>
              <div class="widget-actions">
                <button class="action-button">
                  <i class="fa fa-expand"></i>
                </button>
              </div>
            </div>
            <div class="widget-content">
              <div class="channels-grid">
                <div class="channel-item">
                  <div class="channel-label">油门</div>
                  <div class="channel-bar-container">
                    <div class="channel-bar" :style="{ width: '45%' }"></div>
                  </div>
                  <div class="channel-value">1245</div>
                </div>
                <div class="channel-item">
                  <div class="channel-label">副翼</div>
                  <div class="channel-bar-container">
                    <div class="channel-bar" :style="{ width: '65%' }"></div>
                  </div>
                  <div class="channel-value">1652</div>
                </div>
                <div class="channel-item">
                  <div class="channel-label">升降</div>
                  <div class="channel-bar-container">
                    <div class="channel-bar" :style="{ width: '50%' }"></div>
                  </div>
                  <div class="channel-value">1500</div>
                </div>
                <div class="channel-item">
                  <div class="channel-label">方向</div>
                  <div class="channel-bar-container">
                    <div class="channel-bar" :style="{ width: '48%' }"></div>
                  </div>
                  <div class="channel-value">1482</div>
                </div>
                <div class="channel-item">
                  <div class="channel-label">模式</div>
                  <div class="channel-bar-container">
                    <div class="channel-bar" :style="{ width: '90%' }"></div>
                  </div>
                  <div class="channel-value">1900</div>
                </div>
                <div class="channel-item">
                  <div class="channel-label">辅助1</div>
                  <div class="channel-bar-container">
                    <div class="channel-bar" :style="{ width: '10%' }"></div>
                  </div>
                  <div class="channel-value">1000</div>
                </div>
              </div>
            </div>
          </div>

          <div class="widget motors">
            <div class="widget-header">
              <h3>电机输出</h3>
              <div class="widget-actions">
                <button class="action-button">
                  <i class="fa fa-expand"></i>
                </button>
              </div>
            </div>
            <div class="widget-content">
              <div class="motors-display">
                <div class="motor-item" v-for="n in 4" :key="n">
                  <div class="motor-label">电机 {{ n }}</div>
                  <div class="motor-circle">
                    <div class="motor-value">{{ Math.floor(1000 + Math.random() * 1000) }}</div>
                    <svg class="motor-gauge" width="80" height="80">
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="35" 
                        fill="none" 
                        stroke="#e0e0e0" 
                        stroke-width="5"
                      />
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="35" 
                        fill="none" 
                        stroke="#2196f3" 
                        stroke-width="5" 
                        stroke-dasharray="220" 
                        :stroke-dashoffset="Math.random() * 150 + 50" 
                        transform="rotate(-90 40 40)"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="menu-sidebar">
        <div class="menu-item" @click="navigateTo('SetupModel')">
          <i class="fa fa-cogs"></i>
          <span>模型设置</span>
        </div>
        <div class="menu-item" @click="navigateToModelParams(1)">
          <i class="fa fa-sliders"></i>
          <span>参数调整</span>
        </div>
        <div class="menu-item">
          <i class="fa fa-map-marker"></i>
          <span>航点规划</span>
        </div>
        <div class="menu-item">
          <i class="fa fa-area-chart"></i>
          <span>数据分析</span>
        </div>
        <div class="menu-item">
          <i class="fa fa-wrench"></i>
          <span>校准向导</span>
        </div>
        <div class="menu-item">
          <i class="fa fa-upload"></i>
          <span>固件更新</span>
        </div>
        <div class="menu-item">
          <i class="fa fa-file-text"></i>
          <span>飞行日志</span>
        </div>
        <div class="menu-item">
          <i class="fa fa-cog"></i>
          <span>系统设置</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="status-messages">
        <div class="status-message">系统就绪</div>
      </div>
      <div class="connection-info">
        <span>COM5 | 115200bps</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DesktopView',
  methods: {
    navigateTo(routeName) {
      this.$router.push({ name: routeName });
    },
    navigateToModelParams(modelId) {
      this.$router.push({ 
        name: 'ModelParams',
        params: { modelId: modelId.toString() }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.desktop-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #263238;
  color: white;
  padding: 0.8rem 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  .logo {
    display: flex;
    align-items: center;
    
    .logo-img {
      height: 35px;
      margin-right: 15px;
    }
    
    .title {
      font-size: 1.5rem;
      font-weight: 500;
      margin: 0;
    }
  }
  
  .status-bar {
    display: flex;
    gap: 1.5rem;
    
    .status-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #bdbdbd;
      
      &.connected {
        color: #4caf50;
      }
      
      i {
        font-size: 1.1rem;
      }
    }
  }
}

.dashboard {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.widgets-container {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.widget-row {
  display: flex;
  gap: 1rem;
  
  .widget {
    flex: 1;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
    color: #333;
  }
  
  .widget-actions {
    .action-button {
      background: none;
      border: none;
      color: #757575;
      cursor: pointer;
      
      &:hover {
        color: #2196f3;
      }
    }
  }
}

.widget-content {
  flex: 1;
  padding: 1rem;
}

// Flight Data Widget
.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  
  .data-item {
    display: flex;
    flex-direction: column;
    
    .data-label {
      font-size: 0.85rem;
      color: #757575;
      margin-bottom: 0.3rem;
    }
    
    .data-value {
      font-size: 1.2rem;
      font-weight: 500;
      color: #333;
    }
  }
}

// Attitude Widget
.artificial-horizon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  
  .horizon-circle {
    position: relative;
    width: 150px;
    height: 150px;
    background: linear-gradient(to bottom, #2196f3 0%, #2196f3 50%, #81c784 50%, #81c784 100%);
    border-radius: 50%;
    margin-bottom: 1rem;
    overflow: hidden;
    
    .horizon-line {
      position: absolute;
      width: 100%;
      height: 2px;
      background-color: white;
      top: 50%;
      left: 0;
    }
    
    .pitch-indicator {
      position: absolute;
      width: 100%;
      height: 100%;
      background: transparent;
    }
    
    .roll-indicator {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      
      .aircraft-icon {
        color: #ff5722;
        font-size: 1.8rem;
        transform: rotate(-1.8deg);
      }
    }
  }
  
  .attitude-data {
    display: flex;
    gap: 1.5rem;
    
    .attitude-item {
      display: flex;
      gap: 0.5rem;
      
      .label {
        color: #757575;
      }
      
      .value {
        font-weight: 500;
      }
    }
  }
}

// Channels Widget
.channels-grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  
  .channel-item {
    display: flex;
    align-items: center;
    
    .channel-label {
      width: 60px;
      font-size: 0.9rem;
      color: #555;
    }
    
    .channel-bar-container {
      flex: 1;
      height: 12px;
      background-color: #f0f0f0;
      border-radius: 6px;
      margin: 0 10px;
      overflow: hidden;
      
      .channel-bar {
        height: 100%;
        background-color: #2196f3;
        transition: width 0.3s;
      }
    }
    
    .channel-value {
      width: 50px;
      text-align: right;
      font-size: 0.9rem;
      font-weight: 500;
    }
  }
}

// Motors Widget
.motors-display {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  
  .motor-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .motor-label {
      font-size: 0.9rem;
      color: #555;
      margin-bottom: 0.5rem;
    }
    
    .motor-circle {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      
      .motor-value {
        position: absolute;
        font-size: 0.9rem;
        font-weight: 500;
      }
    }
  }
}

// Menu Sidebar
.menu-sidebar {
  width: 220px;
  background-color: #37474f;
  color: white;
  padding: 1rem 0;
  overflow-y: auto;
  
  .menu-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem 1.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
    
    i {
      width: 20px;
      text-align: center;
      font-size: 1.1rem;
    }
    
    &:hover {
      background-color: #455a64;
    }
  }
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem;
  background-color: #eceff1;
  border-top: 1px solid #e0e0e0;
  font-size: 0.9rem;
  color: #546e7a;
}
</style> 