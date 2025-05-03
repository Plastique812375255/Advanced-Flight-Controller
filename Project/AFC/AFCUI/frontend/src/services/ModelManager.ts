/**
 * 模型管理器
 * 负责管理机型的加载、保存和切换
 */

import type { ModelDefinition } from '../typings/modelTypes';
import type { ModelData, AndroidInterface } from '../typings/index';
import QuadcopterModel from '../extensions/models/quadcopter';

// 默认机型列表
const DEFAULT_MODELS: ModelDefinition[] = [
  QuadcopterModel,
  // 其他内置机型...
];

class ModelManager {
  private models: Map<string, ModelDefinition> = new Map();
  private activeModelId: string | null = null;
  
  constructor() {
    // 初始化时加载默认机型
    this.loadDefaultModels();
  }
  
  /**
   * 加载默认机型
   */
  private loadDefaultModels() {
    DEFAULT_MODELS.forEach(model => {
      this.models.set(model.id, model);
    });
  }
  
  /**
   * 获取所有可用机型
   */
  getAllModels(): ModelDefinition[] {
    return Array.from(this.models.values());
  }
  
  /**
   * 根据ID获取机型
   */
  getModelById(id: string): ModelDefinition | undefined {
    return this.models.get(id);
  }
  
  /**
   * 设置当前活动机型
   */
  setActiveModel(id: string): boolean {
    if (this.models.has(id)) {
      this.activeModelId = id;
      return true;
    }
    return false;
  }
  
  /**
   * 获取当前活动机型
   */
  getActiveModel(): ModelDefinition | null {
    if (this.activeModelId) {
      return this.models.get(this.activeModelId) || null;
    }
    return null;
  }
  
  /**
   * 添加新机型
   */
  addModel(model: ModelDefinition): boolean {
    // 检查机型ID是否已存在
    if (this.models.has(model.id)) {
      return false;
    }
    
    this.models.set(model.id, model);
    return true;
  }
  
  /**
   * 更新现有机型
   */
  updateModel(model: ModelDefinition): boolean {
    if (!this.models.has(model.id)) {
      return false;
    }
    
    this.models.set(model.id, model);
    return true;
  }
  
  /**
   * 删除机型
   */
  deleteModel(id: string): boolean {
    // 不允许删除当前活动机型
    if (id === this.activeModelId) {
      return false;
    }
    
    return this.models.delete(id);
  }
  
  /**
   * 加载用户自定义机型
   */
  loadCustomModels(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        if (window.Android) {
          const android = window.Android as AndroidInterface;
          const modelListJson = android.getModelList();
          const modelList = JSON.parse(modelListJson) as ModelData[];
          
          modelList.forEach(modelData => {
            // 获取完整的模型定义
            if (window.Android) {
              const android = window.Android as AndroidInterface;
              const modelJson = android.getModelById(modelData.id);
              const model = JSON.parse(modelJson) as ModelDefinition;
              
              if (!this.models.has(model.id)) {
                this.models.set(model.id, model);
              }
            }
          });
          
          resolve(true);
        } else {
          console.log('[开发模式] 加载自定义机型');
          resolve(true);
        }
      } catch (error) {
        console.error('加载自定义机型失败:', error);
        reject(error);
      }
    });
  }
  
  /**
   * 保存机型到存储
   */
  saveModel(model: ModelDefinition): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // 更新内存中的模型
        this.models.set(model.id, model);
        
        // 保存到本地存储或通过Android接口保存
        if (window.Android) {
          const android = window.Android as AndroidInterface;
          const success = android.saveModelData(JSON.stringify(model));
          resolve(success);
        } else {
          console.log('[开发模式] 保存机型:', model.id);
          resolve(true);
        }
      } catch (error) {
        console.error('保存机型失败:', error);
        reject(error);
      }
    });
  }
  
  /**
   * 克隆现有机型
   */
  cloneModel(id: string, newName: string): ModelDefinition | null {
    const sourceModel = this.getModelById(id);
    if (!sourceModel) {
      return null;
    }
    
    // 创建克隆机型
    const clonedModel: ModelDefinition = JSON.parse(JSON.stringify(sourceModel));
    
    // 生成新ID和名称
    clonedModel.id = `${sourceModel.id}_clone_${Date.now()}`;
    clonedModel.name = newName;
    
    // 添加到模型列表
    this.addModel(clonedModel);
    
    return clonedModel;
  }
}

// 创建单例实例
const modelManager = new ModelManager();

export default modelManager; 