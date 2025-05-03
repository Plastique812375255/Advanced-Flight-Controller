/**
 * 小组件管理器
 * 负责管理桌面小组件的注册、加载和布局
 */

import type { WidgetDefinition, GridPosition } from '../typings/modelTypes';

// 注册的小组件组件映射
const registeredWidgets: Record<string, any> = {};

class WidgetManager {
  private widgets: WidgetDefinition[] = [];
  private editMode: boolean = false;
  
  /**
   * 注册小组件组件
   */
  registerWidgetComponent(type: string, component: any) {
    registeredWidgets[type] = component;
  }
  
  /**
   * 获取小组件组件
   */
  getWidgetComponent(type: string): any {
    return registeredWidgets[type];
  }
  
  /**
   * 获取所有注册的小组件类型
   */
  getRegisteredWidgetTypes(): string[] {
    return Object.keys(registeredWidgets);
  }
  
  /**
   * 加载小组件布局
   */
  loadWidgets(widgetDefinitions: WidgetDefinition[]) {
    this.widgets = widgetDefinitions;
  }
  
  /**
   * 获取所有小组件
   */
  getAllWidgets(): WidgetDefinition[] {
    return [...this.widgets];
  }
  
  /**
   * 添加小组件
   */
  addWidget(widget: WidgetDefinition): void {
    // 检查是否已存在相同ID的小组件
    const existingIndex = this.widgets.findIndex(w => w.id === widget.id);
    if (existingIndex >= 0) {
      // 更新现有小组件
      this.widgets[existingIndex] = { ...widget };
    } else {
      // 添加新小组件
      this.widgets.push({ ...widget });
    }
  }
  
  /**
   * 移除小组件
   */
  removeWidget(id: string): boolean {
    const initialLength = this.widgets.length;
    this.widgets = this.widgets.filter(widget => widget.id !== id);
    return initialLength !== this.widgets.length;
  }
  
  /**
   * 更新小组件位置
   */
  updateWidgetPosition(id: string, position: GridPosition): boolean {
    const widget = this.widgets.find(w => w.id === id);
    if (!widget) {
      return false;
    }
    
    widget.gridPosition = { ...position };
    return true;
  }
  
  /**
   * 更新小组件配置
   */
  updateWidgetConfig(id: string, config: Record<string, any>): boolean {
    const widget = this.widgets.find(w => w.id === id);
    if (!widget) {
      return false;
    }
    
    widget.config = { ...widget.config, ...config };
    return true;
  }
  
  /**
   * 获取编辑模式状态
   */
  isEditMode(): boolean {
    return this.editMode;
  }
  
  /**
   * 设置编辑模式状态
   */
  setEditMode(mode: boolean): void {
    this.editMode = mode;
  }
  
  /**
   * 切换编辑模式
   */
  toggleEditMode(): boolean {
    this.editMode = !this.editMode;
    return this.editMode;
  }
  
  /**
   * 保存小组件布局
   */
  saveLayout(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const layout = this.widgets.map(widget => ({
          id: widget.id,
          type: widget.type,
          gridPosition: widget.gridPosition,
          config: widget.config
        }));
        
        if (window.Android?.saveWidgetLayout) {
          const success = window.Android.saveWidgetLayout(JSON.stringify(layout));
          resolve(success);
        } else {
          // 开发环境或接口不可用时，使用localStorage
          localStorage.setItem('widget_layout', JSON.stringify(layout));
          console.log('[开发模式] 已保存小组件布局到localStorage');
          resolve(true);
        }
      } catch (error) {
        console.error('保存小组件布局失败:', error);
        reject(error);
      }
    });
  }
  
  /**
   * 加载保存的布局
   */
  loadSavedLayout(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        if (window.Android?.getWidgetLayout) {
          const layoutJson = window.Android.getWidgetLayout();
          const layout = JSON.parse(layoutJson) as WidgetDefinition[];
          this.widgets = layout;
          resolve(true);
        } else {
          // 开发环境或接口不可用时，从localStorage加载
          const savedLayout = localStorage.getItem('widget_layout');
          if (savedLayout) {
            this.widgets = JSON.parse(savedLayout);
            console.log('[开发模式] 已从localStorage加载小组件布局');
            resolve(true);
          } else {
            console.log('[开发模式] 未找到保存的小组件布局');
            resolve(false);
          }
        }
      } catch (error) {
        console.error('加载小组件布局失败:', error);
        reject(error);
      }
    });
  }
  
  /**
   * 检查位置是否被占用
   */
  isPositionOccupied(position: GridPosition, excludeWidgetId?: string): boolean {
    return this.widgets.some(widget => {
      if (excludeWidgetId && widget.id === excludeWidgetId) {
        return false;
      }
      
      const w = widget.gridPosition;
      
      // 检查重叠
      return (
        position.x < w.x + w.w &&
        position.x + position.w > w.x &&
        position.y < w.y + w.h &&
        position.y + position.h > w.y
      );
    });
  }
  
  /**
   * 寻找可用位置
   */
  findAvailablePosition(width: number, height: number): GridPosition {
    // 网格系统的尺寸 (16x6)
    const gridWidth = 16;
    const gridHeight = 6;
    
    // 查找从左上角开始的第一个可用位置
    for (let y = 0; y < gridHeight - height + 1; y++) {
      for (let x = 0; x < gridWidth - width + 1; x++) {
        const position: GridPosition = { x, y, w: width, h: height };
        if (!this.isPositionOccupied(position)) {
          return position;
        }
      }
    }
    
    // 如果没有找到可用空间，返回左上角位置
    return { x: 0, y: 0, w: width, h: height };
  }
}

// 创建单例实例
const widgetManager = new WidgetManager();

export default widgetManager; 