<template>
  <div class="params-view">
    <div class="header">
      <div class="title-section">
        <button class="back-button" @click="goBack">
          <i class="fa fa-arrow-left"></i>
        </button>
        <h1 class="title">参数设置 - {{ modelName }}</h1>
      </div>
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchTerm" 
          placeholder="搜索参数..." 
          @input="filterParams"
        />
        <button class="search-button">
          <i class="fa fa-search"></i>
        </button>
      </div>
      <div class="actions">
        <button class="action-button" @click="loadDefaultParams">
          <i class="fa fa-refresh"></i> 恢复默认值
        </button>
        <button class="action-button" @click="saveAllParams">
          <i class="fa fa-save"></i> 保存全部
        </button>
      </div>
    </div>

    <div class="params-container">
      <div class="categories">
        <div 
          v-for="(category, index) in categories" 
          :key="index"
          :class="['category-item', { active: currentCategory === category.id }]"
          @click="selectCategory(category.id)"
        >
          <i :class="['fa', category.icon]"></i>
          <span>{{ category.name }}</span>
        </div>
      </div>

      <div class="params-list">
        <div class="category-title">
          <h2>{{ getCurrentCategoryName() }}</h2>
          <span class="param-count">{{ filteredParams.length }}个参数</span>
        </div>

        <div class="param-items">
          <div v-if="filteredParams.length === 0" class="no-params">
            没有找到符合条件的参数
          </div>
          
          <div 
            v-for="(param, index) in filteredParams" 
            :key="index"
            class="param-item"
          >
            <div class="param-info">
              <div class="param-name">{{ param.name }}</div>
              <div class="param-description">{{ param.description }}</div>
              <div class="param-id">ID: {{ param.id }}</div>
            </div>
            
            <div class="param-value">
              <template v-if="param.type === 'select'">
                <select v-model="param.value">
                  <option 
                    v-for="option in param.options" 
                    :key="option.value" 
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </template>
              
              <template v-else-if="param.type === 'number'">
                <div class="number-input">
                  <button @click="decrementValue(param)">-</button>
                  <input 
                    type="number" 
                    v-model.number="param.value"
                    :min="param.min" 
                    :max="param.max"
                    :step="param.step || 1"
                  />
                  <button @click="incrementValue(param)">+</button>
                </div>
                <div class="param-range">
                  <span>{{ param.min }}</span>
                  <input 
                    type="range" 
                    v-model.number="param.value" 
                    :min="param.min" 
                    :max="param.max"
                    :step="param.step || 1"
                  />
                  <span>{{ param.max }}</span>
                </div>
              </template>
              
              <template v-else-if="param.type === 'boolean'">
                <label class="switch">
                  <input type="checkbox" v-model="param.value" />
                  <span class="slider"></span>
                </label>
              </template>
              
              <template v-else>
                <input type="text" v-model="param.value" />
              </template>
              
              <div class="param-actions">
                <button 
                  class="reset-button" 
                  @click="resetParam(param)"
                  title="重置为默认值"
                >
                  <i class="fa fa-undo"></i>
                </button>
                <button 
                  class="save-button" 
                  @click="saveParam(param)"
                  title="保存此参数"
                >
                  <i class="fa fa-check"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default defineComponent({
  name: 'ParamsView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    // 基础数据
    const searchTerm = ref('');
    const currentCategory = ref('pid');
    const modelId = ref(route.params.modelId as string);
    const modelName = ref('默认模型');
    
    // 分类列表
    const categories: Category[] = [
      { id: 'pid', name: 'PID控制', icon: 'fa-sliders' },
      { id: 'radio', name: '遥控器设置', icon: 'fa-gamepad' },
      { id: 'sensors', name: '传感器', icon: 'fa-microchip' },
      { id: 'flight', name: '飞行参数', icon: 'fa-plane' },
      { id: 'battery', name: '电池监控', icon: 'fa-battery-three-quarters' },
      { id: 'failsafe', name: '失效保护', icon: 'fa-shield' },
      { id: 'system', name: '系统设置', icon: 'fa-cogs' }
    ];
    
    // 参数列表
    const params = ref<ParamData[]>([]);
    const filteredParams = ref<ParamData[]>([]);
    
    // 返回模型设置页面
    const goBack = () => {
      router.push({ name: 'SetupModel' });
    };
    
    // 根据模型ID加载参数
    const loadModelParams = () => {
      console.log(`加载模型ID ${modelId.value} 的参数`);
      
      try {
        // 尝试从Android接口获取数据
        if (window.Android?.getModelById) {
          const modelJson = window.Android.getModelById(modelId.value);
          const modelData = JSON.parse(modelJson) as ModelData;
          modelName.value = modelData.name;
          
          if (window.Android.getModelParams) {
            const paramsJson = window.Android.getModelParams(modelId.value);
            const paramsData = JSON.parse(paramsJson) as ParamData[];
            params.value = paramsData;
          }
        } else {
          // 开发环境或Android接口不可用时使用模拟数据
          modelName.value = `模型 ${modelId.value}`;
          // 使用现有示例数据
          loadMockParams();
        }
      } catch (error) {
        console.error('加载模型参数时出错:', error);
        // 出错时使用模拟数据
        modelName.value = `模型 ${modelId.value}`;
        loadMockParams();
      }
      
      // 过滤参数显示
      filterParams();
    };
    
    // 加载模拟数据（开发环境使用）
    const loadMockParams = () => {
      params.value = [
        {
          id: 'pid_pitch_p',
          name: '俯仰P增益',
          description: '俯仰轴的比例增益，控制响应强度',
          category: 'pid',
          type: 'number',
          value: 4.5,
          defaultValue: 4.5,
          min: 0,
          max: 10,
          step: 0.1
        },
        {
          id: 'pid_pitch_i',
          name: '俯仰I增益',
          description: '俯仰轴的积分增益，消除稳态误差',
          category: 'pid',
          type: 'number',
          value: 0.03,
          defaultValue: 0.03,
          min: 0,
          max: 0.2,
          step: 0.01
        },
        // ...可以添加更多的模拟参数...
        {
          id: 'failsafe_procedure',
          name: '失控保护程序',
          description: '信号丢失时执行的动作',
          category: 'failsafe',
          type: 'select',
          value: 'land',
          defaultValue: 'land',
          options: [
            { value: 'land', label: '自动降落' },
            { value: 'rth', label: '返航' },
            { value: 'hover', label: '悬停' },
            { value: 'drop', label: '直接关闭电机' }
          ]
        }
      ];
    };
    
    // 获取当前分类名称
    const getCurrentCategoryName = () => {
      const category = categories.find(c => c.id === currentCategory.value);
      return category ? category.name : '';
    };
    
    // 选择分类
    const selectCategory = (categoryId: string) => {
      currentCategory.value = categoryId;
      filterParams();
    };
    
    // 筛选参数
    const filterParams = () => {
      const searchLower = searchTerm.value.toLowerCase();
      filteredParams.value = params.value.filter(param => {
        // 如果有搜索词，搜索所有类别
        if (searchTerm.value) {
          return (
            param.name.toLowerCase().includes(searchLower) ||
            param.description.toLowerCase().includes(searchLower) ||
            param.id.toLowerCase().includes(searchLower)
          );
        }
        // 否则，只显示当前类别的参数
        return param.category === currentCategory.value;
      });
    };
    
    // 增加数值参数
    const incrementValue = (param: ParamData) => {
      if (typeof param.value === 'number' && param.max !== undefined) {
        if (param.value < param.max) {
          param.value = Number((param.value + (param.step || 1)).toFixed(2));
        }
      }
    };
    
    // 减少数值参数
    const decrementValue = (param: ParamData) => {
      if (typeof param.value === 'number' && param.min !== undefined) {
        if (param.value > param.min) {
          param.value = Number((param.value - (param.step || 1)).toFixed(2));
        }
      }
    };
    
    // 重置参数为默认值
    const resetParam = (param: ParamData) => {
      param.value = param.defaultValue;
    };
    
    // 保存单个参数
    const saveParam = (param: ParamData) => {
      try {
        if (window.Android?.saveModelParams) {
          const paramJson = JSON.stringify([param]);
          const success = window.Android.saveModelParams(modelId.value, paramJson);
          if (success) {
            console.log(`参数 ${param.id} 保存成功`);
            // 可以添加保存成功的用户反馈
          } else {
            console.error(`参数 ${param.id} 保存失败`);
            // 可以添加保存失败的用户反馈
          }
        } else {
          console.log(`[开发模式] 保存参数 ${param.id}: ${param.value}`);
          // 可以添加开发模式的用户反馈
        }
      } catch (error) {
        console.error('保存参数时出错:', error);
        // 可以添加错误处理的用户反馈
      }
    };
    
    // 保存所有参数
    const saveAllParams = () => {
      try {
        if (window.Android?.saveModelParams) {
          const paramsJson = JSON.stringify(params.value);
          const success = window.Android.saveModelParams(modelId.value, paramsJson);
          if (success) {
            console.log('所有参数保存成功');
            // 可以添加保存成功的用户反馈
          } else {
            console.error('保存所有参数失败');
            // 可以添加保存失败的用户反馈
          }
        } else {
          console.log('[开发模式] 保存所有参数');
          // 可以添加开发模式的用户反馈
        }
      } catch (error) {
        console.error('保存所有参数时出错:', error);
        // 可以添加错误处理的用户反馈
      }
    };
    
    // 加载默认参数
    const loadDefaultParams = () => {
      // 重置所有参数为默认值
      params.value.forEach(param => {
        param.value = param.defaultValue;
      });
      
      // 更新过滤后的参数
      filterParams();
      
      console.log('已重置所有参数为默认值');
      // 可以添加用户反馈
    };
    
    // 初始化
    onMounted(() => {
      loadModelParams();
    });
    
    return {
      searchTerm,
      currentCategory,
      modelId,
      modelName,
      categories,
      params: computed(() => params.value),
      filteredParams: computed(() => filteredParams.value),
      goBack,
      getCurrentCategoryName,
      selectCategory,
      filterParams,
      incrementValue,
      decrementValue,
      resetParam,
      saveParam,
      saveAllParams,
      loadDefaultParams
    };
  }
});
</script>

<style lang="scss" scoped>
.params-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  .title-section {
    display: flex;
    align-items: center;
    
    .back-button {
      background: none;
      border: none;
      color: #333;
      font-size: 1.2rem;
      margin-right: 1rem;
      cursor: pointer;
      
      &:hover {
        color: #2196f3;
      }
    }
  
    .title {
      font-size: 1.8rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
  }
  
  .search-bar {
    display: flex;
    align-items: center;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    
    input {
      width: 250px;
      padding: 0.6rem 1rem;
      border: none;
      font-size: 1rem;
      
      &:focus {
        outline: none;
      }
    }
    
    .search-button {
      background-color: #2196f3;
      color: white;
      border: none;
      padding: 0.6rem 1rem;
      cursor: pointer;
      
      &:hover {
        background-color: #1976d2;
      }
    }
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
    
    .action-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: white;
      color: #555;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      &:hover {
        background-color: #f0f0f0;
      }
    }
  }
}

.params-container {
  display: flex;
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.categories {
  width: 200px;
  background-color: #333;
  color: white;
  padding: 1rem 0;
  
  .category-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem 1.2rem;
    cursor: pointer;
    transition: all 0.2s;
    
    i {
      width: 20px;
      text-align: center;
    }
    
    &:hover {
      background-color: #444;
    }
    
    &.active {
      background-color: #2196f3;
      
      &:hover {
        background-color: #1976d2;
      }
    }
  }
}

.params-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  
  .category-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #eee;
    
    h2 {
      font-size: 1.4rem;
      font-weight: 600;
      margin: 0;
      color: #333;
    }
    
    .param-count {
      font-size: 0.9rem;
      color: #777;
      background-color: #f0f0f0;
      padding: 0.3rem 0.6rem;
      border-radius: 12px;
    }
  }
  
  .param-items {
    padding: 1rem 1.5rem;
    
    .no-params {
      text-align: center;
      padding: 2rem;
      color: #777;
    }
    
    .param-item {
      display: flex;
      padding: 1rem;
      border-bottom: 1px solid #eee;
      
      &:last-child {
        border-bottom: none;
      }
      
      .param-info {
        flex: 1;
        
        .param-name {
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 0.3rem;
          color: #333;
        }
        
        .param-description {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.3rem;
        }
        
        .param-id {
          font-size: 0.8rem;
          color: #999;
          font-family: monospace;
        }
      }
      
      .param-value {
        width: 300px;
        display: flex;
        flex-direction: column;
        
        select, input[type="text"] {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          
          &:focus {
            outline: none;
            border-color: #2196f3;
          }
        }
        
        .number-input {
          display: flex;
          align-items: center;
          
          input {
            width: 80px;
            text-align: center;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 0;
            font-size: 1rem;
            
            &:focus {
              outline: none;
              border-color: #2196f3;
            }
          }
          
          button {
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            padding: 0.5rem 0.8rem;
            cursor: pointer;
            
            &:first-child {
              border-radius: 4px 0 0 4px;
            }
            
            &:last-child {
              border-radius: 0 4px 4px 0;
            }
            
            &:hover {
              background-color: #e0e0e0;
            }
          }
        }
        
        .param-range {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          
          span {
            font-size: 0.8rem;
            color: #777;
            width: 30px;
          }
          
          input[type="range"] {
            flex: 1;
          }
        }
        
        // 开关样式
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
          
          input {
            opacity: 0;
            width: 0;
            height: 0;
            
            &:checked + .slider {
              background-color: #2196f3;
              
              &:before {
                transform: translateX(26px);
              }
            }
          }
          
          .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
            
            &:before {
              position: absolute;
              content: "";
              height: 16px;
              width: 16px;
              left: 4px;
              bottom: 4px;
              background-color: white;
              transition: .4s;
              border-radius: 50%;
            }
          }
        }
        
        .param-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.8rem;
          justify-content: flex-end;
          
          button {
            padding: 0.4rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            
            &.reset-button {
              background-color: #f0f0f0;
              color: #555;
              
              &:hover {
                background-color: #e0e0e0;
              }
            }
            
            &.save-button {
              background-color: #4caf50;
              color: white;
              
              &:hover {
                background-color: #3d8b40;
              }
            }
          }
        }
      }
    }
  }
}
</style> 