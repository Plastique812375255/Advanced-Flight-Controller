<template>
  <div class="setup-model-view">
    <div class="sidebar">
      <div class="logo-container">
        <img src="../assets/logo.png" alt="Logo" class="logo" />
        <h2>模型设置</h2>
      </div>
      <div class="nav-menu">
        <div 
          v-for="(item, index) in menuItems" 
          :key="index" 
          class="nav-item" 
          :class="{ active: currentSection === item.id }"
          @click="currentSection = item.id"
        >
          <i :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </div>
      </div>
      <div class="back-button" @click="goToDesktop">
        <i class="fa fa-arrow-left"></i>
        <span>返回首页</span>
      </div>
    </div>

    <!-- 如果是子路由，则显示子路由内容，否则显示普通设置页面 -->
    <router-view v-if="$route.name !== 'SetupModel'"></router-view>
    
    <div class="main-content" v-if="$route.name === 'SetupModel'">
      <!-- 基本信息 -->
      <div v-if="currentSection === 'basic'" class="content-section">
        <h2 class="section-title">基本信息</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>模型名称</label>
            <input type="text" v-model="modelConfig.name" placeholder="输入模型名称" />
          </div>
          <div class="form-group">
            <label>飞机类型</label>
            <select v-model="modelConfig.type">
              <option value="quadcopter">四轴飞行器</option>
              <option value="hexacopter">六轴飞行器</option>
              <option value="octocopter">八轴飞行器</option>
              <option value="plane">固定翼</option>
              <option value="vtol">垂直起降</option>
            </select>
          </div>
          <div class="form-group">
            <label>框架尺寸</label>
            <div class="input-with-unit">
              <input type="number" v-model="modelConfig.frameSize" />
              <span class="unit">mm</span>
            </div>
          </div>
          <div class="form-group">
            <label>重量</label>
            <div class="input-with-unit">
              <input type="number" v-model="modelConfig.weight" />
              <span class="unit">g</span>
            </div>
          </div>
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="modelConfig.notes" rows="3" placeholder="输入备注信息"></textarea>
          </div>
        </div>
      </div>

      <!-- 电机设置 -->
      <div v-if="currentSection === 'motors'" class="content-section">
        <h2 class="section-title">电机设置</h2>
        <div class="motor-config">
          <div class="motor-layout">
            <div v-if="modelConfig.type === 'quadcopter'" class="quad-layout">
              <div class="motor-diagram">
                <div class="motor motor-1">1</div>
                <div class="motor motor-2">2</div>
                <div class="motor motor-3">3</div>
                <div class="motor motor-4">4</div>
                <div class="frame-lines"></div>
              </div>
            </div>
          </div>
          <div class="motor-settings">
            <div class="form-group">
              <label>电机类型</label>
              <select v-model="motorConfig.type">
                <option value="brushless">无刷电机</option>
                <option value="brushed">有刷电机</option>
              </select>
            </div>
            <div class="form-group">
              <label>电机KV值</label>
              <div class="input-with-unit">
                <input type="number" v-model="motorConfig.kv" />
                <span class="unit">KV</span>
              </div>
            </div>
            <div class="form-group">
              <label>电调类型</label>
              <select v-model="motorConfig.escType">
                <option value="standard">标准PWM</option>
                <option value="oneshot125">Oneshot125</option>
                <option value="oneshot42">Oneshot42</option>
                <option value="multishot">Multishot</option>
                <option value="dshot300">DShot300</option>
                <option value="dshot600">DShot600</option>
                <option value="dshot1200">DShot1200</option>
              </select>
            </div>
            <div class="form-group">
              <label>电机顺序</label>
              <select v-model="motorConfig.direction">
                <option value="default">默认 (顺时针)</option>
                <option value="reversed">反向 (逆时针)</option>
              </select>
            </div>
            <div class="form-group">
              <label>电机极数</label>
              <input type="number" v-model="motorConfig.poles" />
            </div>
            <div class="form-group">
              <label>怠速值</label>
              <div class="range-with-value">
                <input type="range" v-model="motorConfig.idleThrottle" min="0" max="20" />
                <span class="range-value">{{ motorConfig.idleThrottle }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 遥控器设置 -->
      <div v-if="currentSection === 'radio'" class="content-section">
        <h2 class="section-title">遥控器设置</h2>
        <div class="radio-setup">
          <div class="form-group">
            <label>接收机类型</label>
            <select v-model="radioConfig.receiverType">
              <option value="ppm">PPM</option>
              <option value="sbus">SBUS</option>
              <option value="spektrum">Spektrum DSM</option>
              <option value="ibus">IBUS</option>
              <option value="crsf">CRSF</option>
            </select>
          </div>
          <div class="form-group">
            <label>遥控器模式</label>
            <div class="radio-modes">
              <div 
                v-for="mode in ['Mode 1', 'Mode 2', 'Mode 3', 'Mode 4']" 
                :key="mode"
                class="radio-mode-option"
                :class="{ active: radioConfig.stickMode === mode }"
                @click="radioConfig.stickMode = mode"
              >
                <div class="mode-diagram">
                  <div class="sticks-container">
                    <div class="stick left-stick"></div>
                    <div class="stick right-stick"></div>
                  </div>
                  <div class="mode-label">{{ mode }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="channels-mapping">
            <h3>通道映射</h3>
            <div class="channel-map-item" v-for="(channel, index) in radioConfig.channelMap" :key="index">
              <div class="channel-function">{{ channel.function }}</div>
              <select v-model="channel.mappedTo">
                <option v-for="n in 12" :key="n" :value="n">通道 {{ n }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 电池设置 -->
      <div v-if="currentSection === 'battery'" class="content-section">
        <h2 class="section-title">电池设置</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>电池类型</label>
            <select v-model="batteryConfig.type">
              <option value="lipo">LiPo</option>
              <option value="lihv">LiHV</option>
              <option value="lion">Li-Ion</option>
              <option value="nimh">NiMH</option>
            </select>
          </div>
          <div class="form-group">
            <label>电池节数</label>
            <select v-model="batteryConfig.cells">
              <option v-for="n in 12" :key="n" :value="n">{{ n }}S</option>
            </select>
          </div>
          <div class="form-group">
            <label>容量</label>
            <div class="input-with-unit">
              <input type="number" v-model="batteryConfig.capacity" />
              <span class="unit">mAh</span>
            </div>
          </div>
          <div class="form-group">
            <label>放电倍率</label>
            <div class="input-with-unit">
              <input type="number" v-model="batteryConfig.cRate" step="5" />
              <span class="unit">C</span>
            </div>
          </div>
          <div class="form-group col-span-2">
            <label>低电压报警阈值</label>
            <div class="input-with-unit">
              <input type="number" v-model="batteryConfig.lowVoltage" step="0.1" />
              <span class="unit">V/cell</span>
            </div>
          </div>
          <div class="form-group col-span-2">
            <label>严重低电压阈值</label>
            <div class="input-with-unit">
              <input type="number" v-model="batteryConfig.criticalVoltage" step="0.1" />
              <span class="unit">V/cell</span>
            </div>
          </div>
          <div class="form-group">
            <label>启用电池监测</label>
            <div class="toggle-switch">
              <input type="checkbox" id="enable-battery" v-model="batteryConfig.monitoring" />
              <label for="enable-battery"></label>
            </div>
          </div>
        </div>
      </div>

      <!-- 失效保护 -->
      <div v-if="currentSection === 'failsafe'" class="content-section">
        <h2 class="section-title">失效保护设置</h2>
        <div class="form-grid">
          <div class="form-group col-span-2">
            <label>接收机信号丢失保护</label>
            <select v-model="failsafeConfig.rxLoss">
              <option value="drop">坠落（关闭所有电机）</option>
              <option value="land">自动降落</option>
              <option value="rth">返航</option>
              <option value="hover">悬停</option>
            </select>
          </div>
          <div class="form-group">
            <label>触发延迟</label>
            <div class="input-with-unit">
              <input type="number" v-model="failsafeConfig.delay" />
              <span class="unit">秒</span>
            </div>
          </div>
          <div class="form-group">
            <label>低电量保护</label>
            <select v-model="failsafeConfig.lowBattery">
              <option value="warning">仅警告</option>
              <option value="land">自动降落</option>
              <option value="rth">返航</option>
            </select>
          </div>
          <div class="form-group col-span-2">
            <label>GPS信号丢失保护</label>
            <select v-model="failsafeConfig.gpsLoss">
              <option value="altitude-hold">定高模式</option>
              <option value="land">自动降落</option>
              <option value="no-action">无动作</option>
            </select>
          </div>
          <div class="form-group col-span-2">
            <label>禁止解锁条件</label>
            <div class="checkbox-group">
              <div class="checkbox-item">
                <input type="checkbox" id="gps-check" v-model="failsafeConfig.armingCheck.gps" />
                <label for="gps-check">GPS未定位</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="battery-check" v-model="failsafeConfig.armingCheck.battery" />
                <label for="battery-check">电池电压低</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="accel-check" v-model="failsafeConfig.armingCheck.accelerometer" />
                <label for="accel-check">加速度计未校准</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="radio-check" v-model="failsafeConfig.armingCheck.radio" />
                <label for="radio-check">遥控器未连接</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="action-bar" v-if="$route.name === 'SetupModel'">
      <button class="secondary-button" @click="resetConfig">重置</button>
      <button class="primary-button" @click="saveConfig">保存配置</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SetupModelView',
  data() {
    return {
      currentSection: 'basic',
      menuItems: [
        { id: 'basic', name: '基本信息', icon: 'fa fa-info-circle' },
        { id: 'motors', name: '电机设置', icon: 'fa fa-cog' },
        { id: 'radio', name: '遥控器设置', icon: 'fa fa-gamepad' },
        { id: 'battery', name: '电池设置', icon: 'fa fa-battery-three-quarters' },
        { id: 'failsafe', name: '失效保护', icon: 'fa fa-shield' }
      ],
      modelConfig: {
        name: '我的四轴',
        type: 'quadcopter',
        frameSize: 250,
        weight: 500,
        notes: ''
      },
      motorConfig: {
        type: 'brushless',
        kv: 2300,
        escType: 'dshot600',
        direction: 'default',
        poles: 14,
        idleThrottle: 5.5
      },
      radioConfig: {
        receiverType: 'sbus',
        stickMode: 'Mode 2',
        channelMap: [
          { function: '油门', mappedTo: 3 },
          { function: '副翼', mappedTo: 1 },
          { function: '升降', mappedTo: 2 },
          { function: '方向', mappedTo: 4 },
          { function: '飞行模式', mappedTo: 5 },
          { function: '解锁开关', mappedTo: 6 }
        ]
      },
      batteryConfig: {
        type: 'lipo',
        cells: 4,
        capacity: 1500,
        cRate: 75,
        lowVoltage: 3.5,
        criticalVoltage: 3.2,
        monitoring: true
      },
      failsafeConfig: {
        rxLoss: 'land',
        delay: 1.5,
        lowBattery: 'warning',
        gpsLoss: 'altitude-hold',
        armingCheck: {
          gps: true,
          battery: true,
          accelerometer: true,
          radio: true
        }
      }
    }
  },
  methods: {
    saveConfig() {
      // 保存配置到持久化存储
      console.log('保存配置:', {
        model: this.modelConfig,
        motor: this.motorConfig,
        radio: this.radioConfig,
        battery: this.batteryConfig,
        failsafe: this.failsafeConfig
      });
      // 这里可以添加提示保存成功的消息
      alert('配置已保存');
    },
    resetConfig() {
      if (confirm('确定要重置所有配置吗？这将丢失所有未保存的更改。')) {
        // 重置为默认配置
        this.modelConfig = {
          name: '默认四轴',
          type: 'quadcopter',
          frameSize: 250,
          weight: 500,
          notes: ''
        };
        // 其他配置项也可以重置
      }
    },
    goToDesktop() {
      this.$router.push({ name: 'Desktop' });
    }
  }
}
</script>

<style lang="scss" scoped>
.setup-model-view {
  display: flex;
  height: 100vh;
  background-color: #f5f7f9;
}

.sidebar {
  width: 220px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  
  .logo-container {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    .logo {
      width: 60px;
      height: 60px;
      margin-bottom: 10px;
    }
    
    h2 {
      font-size: 18px;
      font-weight: 500;
      margin: 0;
    }
  }
  
  .nav-menu {
    flex: 1;
    padding: 20px 0;
    
    .nav-item {
      padding: 12px 20px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: background-color 0.3s;
      
      i {
        margin-right: 12px;
        width: 20px;
        text-align: center;
      }
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      &.active {
        background-color: #3498db;
      }
    }
  }
  
  .back-button {
    padding: 15px 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    
    i {
      margin-right: 12px;
    }
    
    &:hover {
      background-color: #243342;
    }
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

.section-title {
  font-size: 22px;
  font-weight: 500;
  margin-bottom: 25px;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  
  .form-group {
    margin-bottom: 10px;
    
    &.col-span-2 {
      grid-column: span 2;
    }
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #34495e;
    }
    
    input[type="text"],
    input[type="number"],
    select,
    textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      
      &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
      }
    }
    
    textarea {
      resize: vertical;
    }
    
    .input-with-unit {
      display: flex;
      align-items: center;
      
      input {
        flex: 1;
        border-radius: 4px 0 0 4px;
      }
      
      .unit {
        background-color: #f0f2f5;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-left: none;
        border-radius: 0 4px 4px 0;
        color: #666;
        font-size: 14px;
      }
    }
    
    .range-with-value {
      display: flex;
      align-items: center;
      
      input[type="range"] {
        flex: 1;
        margin-right: 10px;
      }
      
      .range-value {
        min-width: 40px;
        text-align: right;
        font-weight: 500;
      }
    }
    
    .toggle-switch {
      position: relative;
      width: 60px;
      height: 30px;
      
      input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      label {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        border-radius: 15px;
        cursor: pointer;
        transition: 0.4s;
        
        &:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          border-radius: 50%;
          transition: 0.4s;
        }
      }
      
      input:checked + label {
        background-color: #2196F3;
      }
      
      input:checked + label:before {
        transform: translateX(30px);
      }
    }
    
    .checkbox-group {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      
      .checkbox-item {
        display: flex;
        align-items: center;
        
        input {
          margin-right: 8px;
        }
      }
    }
  }
}

// 电机设置特有样式
.motor-config {
  display: flex;
  gap: 30px;
  
  .motor-layout {
    flex: 1;
    
    .quad-layout {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
      
      .motor-diagram {
        position: relative;
        width: 300px;
        height: 300px;
        
        .motor {
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #3498db;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          font-size: 18px;
          
          &.motor-1 {
            top: 0;
            left: 0;
          }
          
          &.motor-2 {
            top: 0;
            right: 0;
          }
          
          &.motor-3 {
            bottom: 0;
            right: 0;
          }
          
          &.motor-4 {
            bottom: 0;
            left: 0;
          }
        }
        
        .frame-lines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          
          &:before, &:after {
            content: '';
            position: absolute;
            background-color: #34495e;
          }
          
          &:before {
            top: 50%;
            left: 0;
            width: 100%;
            height: 3px;
            transform: translateY(-50%);
          }
          
          &:after {
            top: 0;
            left: 50%;
            width: 3px;
            height: 100%;
            transform: translateX(-50%);
          }
        }
      }
    }
  }
  
  .motor-settings {
    flex: 1;
  }
}

// 遥控器设置特有样式
.radio-setup {
  .radio-modes {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    
    .radio-mode-option {
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      
      &.active {
        border-color: #3498db;
        background-color: rgba(52, 152, 219, 0.1);
      }
      
      .mode-diagram {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .sticks-container {
          width: 80px;
          height: 50px;
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          
          .stick {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: #34495e;
            position: relative;
            
            &:before {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              width: 10px;
              height: 10px;
              background-color: #ecf0f1;
              border-radius: 50%;
              transform: translate(-50%, -50%);
            }
          }
        }
        
        .mode-label {
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }
  
  .channels-mapping {
    margin-top: 30px;
    
    h3 {
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: 500;
    }
    
    .channel-map-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 4px;
      
      .channel-function {
        font-weight: 500;
      }
      
      select {
        width: 120px;
      }
    }
  }
}

.action-bar {
  padding: 15px 30px;
  background-color: white;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  
  button {
    padding: 10px 20px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    
    &.primary-button {
      background-color: #3498db;
      color: white;
      border: none;
      
      &:hover {
        background-color: #2980b9;
      }
    }
    
    &.secondary-button {
      background-color: white;
      color: #34495e;
      border: 1px solid #ddd;
      
      &:hover {
        background-color: #f8f9fa;
      }
    }
  }
}
</style> 