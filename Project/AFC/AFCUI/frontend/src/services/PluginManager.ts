/**
 * 插件管理器
 * 负责管理插件的安装、加载和运行
 */

import type { PluginDefinition } from '../typings/modelTypes';
import widgetManager from './WidgetManager';
import BatteryMonitorPlugin, { eventHandlers as batteryEventHandlers } from '../plugins/BatteryMonitorPlugin';

// 内置插件列表
const BUILT_IN_PLUGINS: PluginDefinition[] = [
  BatteryMonitorPlugin,
  // 其他内置插件...
];

// 插件事件处理器映射
const pluginEventHandlers: Record<string, any> = {
  'battery-monitor': batteryEventHandlers,
  // 其他插件的事件处理器...
};

class PluginManager {
  private plugins: Map<string, PluginDefinition> = new Map();
  private enabledPlugins: Set<string> = new Set();
  private loadedScripts: Set<string> = new Set();
  
  constructor() {
    // 初始化时加载内置插件
    this.loadBuiltInPlugins();
  }
  
  /**
   * 加载内置插件
   */
  private loadBuiltInPlugins() {
    BUILT_IN_PLUGINS.forEach(plugin => {
      this.plugins.set(plugin.id, plugin);
      this.enabledPlugins.add(plugin.id);
      
      // 如果是小组件类型插件，注册到小组件管理器
      if (plugin.type === 'widget' && plugin.widget) {
        widgetManager.addWidget(plugin.widget);
      }
    });
  }
  
  /**
   * 获取所有可用插件
   */
  getAllPlugins(): PluginDefinition[] {
    return Array.from(this.plugins.values());
  }
  
  /**
   * 获取已启用的插件
   */
  getEnabledPlugins(): PluginDefinition[] {
    return this.getAllPlugins().filter(plugin => this.enabledPlugins.has(plugin.id));
  }
  
  /**
   * 根据ID获取插件
   */
  getPluginById(id: string): PluginDefinition | undefined {
    return this.plugins.get(id);
  }
  
  /**
   * 检查插件是否已启用
   */
  isPluginEnabled(id: string): boolean {
    return this.enabledPlugins.has(id);
  }
  
  /**
   * 启用插件
   */
  enablePlugin(id: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const plugin = this.plugins.get(id);
        if (!plugin) {
          resolve(false);
          return;
        }
        
        // 如果插件已经启用，直接返回成功
        if (this.enabledPlugins.has(id)) {
          resolve(true);
          return;
        }
        
        // 加载插件代码
        if (plugin.entryPoint && !this.loadedScripts.has(plugin.entryPoint)) {
          await this.loadPluginScript(plugin.entryPoint);
        }
        
        // 调用插件初始化事件处理器
        const handlers = pluginEventHandlers[id];
        if (handlers && handlers.onPluginInit) {
          handlers.onPluginInit();
        }
        
        // 如果是小组件类型插件，添加到小组件管理器
        if (plugin.type === 'widget' && plugin.widget) {
          widgetManager.addWidget(plugin.widget);
        }
        
        // 标记为已启用
        this.enabledPlugins.add(id);
        
        // 持久化启用状态
        if (window.Android?.enablePlugin) {
          window.Android.enablePlugin(id);
        }
        
        resolve(true);
      } catch (error) {
        console.error(`启用插件 ${id} 失败:`, error);
        reject(error);
      }
    });
  }
  
  /**
   * 禁用插件
   */
  disablePlugin(id: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        // 如果插件未启用，直接返回成功
        if (!this.enabledPlugins.has(id)) {
          resolve(true);
          return;
        }
        
        const plugin = this.plugins.get(id);
        if (!plugin) {
          resolve(false);
          return;
        }
        
        // 调用插件卸载事件处理器
        const handlers = pluginEventHandlers[id];
        if (handlers && handlers.onPluginUnload) {
          handlers.onPluginUnload();
        }
        
        // 如果是小组件类型插件，从小组件管理器移除
        if (plugin.type === 'widget' && plugin.widget) {
          widgetManager.removeWidget(plugin.widget.id);
        }
        
        // 标记为已禁用
        this.enabledPlugins.delete(id);
        
        // 持久化禁用状态
        if (window.Android?.disablePlugin) {
          window.Android.disablePlugin(id);
        }
        
        resolve(true);
      } catch (error) {
        console.error(`禁用插件 ${id} 失败:`, error);
        reject(error);
      }
    });
  }
  
  /**
   * 安装插件
   */
  installPlugin(pluginData: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        let pluginJson: PluginDefinition;
        
        // 尝试解析插件数据
        try {
          pluginJson = JSON.parse(pluginData) as PluginDefinition;
        } catch (parseError) {
          console.error('插件数据格式无效:', parseError);
          reject(new Error('插件数据格式无效'));
          return;
        }
        
        // 验证插件数据
        if (!pluginJson.id || !pluginJson.name || !pluginJson.version) {
          reject(new Error('插件数据缺少必要字段'));
          return;
        }
        
        // 检查是否已安装相同ID的插件
        if (this.plugins.has(pluginJson.id)) {
          // 进行插件更新
          const currentPlugin = this.plugins.get(pluginJson.id);
          const wasEnabled = this.enabledPlugins.has(pluginJson.id);
          
          // 如果启用状态，先禁用
          if (wasEnabled) {
            await this.disablePlugin(pluginJson.id);
          }
          
          // 更新插件数据
          this.plugins.set(pluginJson.id, pluginJson);
          
          // 如果之前是启用状态，重新启用
          if (wasEnabled) {
            await this.enablePlugin(pluginJson.id);
          }
          
          resolve(true);
          return;
        }
        
        // 添加新插件
        this.plugins.set(pluginJson.id, pluginJson);
        
        // 持久化插件数据
        if (window.Android?.installPlugin) {
          window.Android.installPlugin(pluginData);
        }
        
        // 默认不自动启用，需要用户手动启用
        resolve(true);
      } catch (error) {
        console.error('安装插件失败:', error);
        reject(error);
      }
    });
  }
  
  /**
   * 卸载插件
   */
  uninstallPlugin(id: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.plugins.has(id)) {
          resolve(false);
          return;
        }
        
        // 如果插件已启用，先禁用
        if (this.enabledPlugins.has(id)) {
          await this.disablePlugin(id);
        }
        
        // 从插件列表移除
        this.plugins.delete(id);
        
        // 从已启用插件列表移除
        this.enabledPlugins.delete(id);
        
        // 持久化卸载操作
        if (window.Android?.uninstallPlugin) {
          window.Android.uninstallPlugin(id);
        }
        
        resolve(true);
      } catch (error) {
        console.error(`卸载插件 ${id} 失败:`, error);
        reject(error);
      }
    });
  }
  
  /**
   * 加载用户安装的插件
   */
  loadInstalledPlugins(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        if (window.Android?.getInstalledPlugins) {
          const pluginsJson = window.Android.getInstalledPlugins();
          const pluginsList = JSON.parse(pluginsJson) as {
            id: string;
            data: string;
            enabled: boolean;
          }[];
          
          pluginsList.forEach(item => {
            try {
              const pluginData = JSON.parse(item.data) as PluginDefinition;
              
              // 添加到插件列表
              this.plugins.set(item.id, pluginData);
              
              // 如果是启用状态，添加到启用列表
              if (item.enabled) {
                this.enabledPlugins.add(item.id);
                
                // 对于小组件类型插件，添加到小组件管理器
                if (pluginData.type === 'widget' && pluginData.widget) {
                  widgetManager.addWidget(pluginData.widget);
                }
              }
            } catch (parseError) {
              console.error(`解析插件 ${item.id} 数据失败:`, parseError);
            }
          });
          
          resolve(true);
        } else {
          console.log('[开发模式] 加载已安装插件');
          resolve(true);
        }
      } catch (error) {
        console.error('加载已安装插件失败:', error);
        reject(error);
      }
    });
  }
  
  /**
   * 加载插件脚本
   */
  private loadPluginScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loadedScripts.has(url)) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        this.loadedScripts.add(url);
        resolve();
      };
      script.onerror = () => {
        reject(new Error(`Failed to load script: ${url}`));
      };
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * 初始化所有已启用的插件
   */
  initializeEnabledPlugins(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const enabledPluginIds = Array.from(this.enabledPlugins);
        
        for (const id of enabledPluginIds) {
          const plugin = this.plugins.get(id);
          if (!plugin) continue;
          
          // 加载插件脚本
          if (plugin.entryPoint && !this.loadedScripts.has(plugin.entryPoint)) {
            try {
              await this.loadPluginScript(plugin.entryPoint);
            } catch (error) {
              console.error(`加载插件 ${id} 脚本失败:`, error);
              continue;
            }
          }
          
          // 调用插件初始化事件处理器
          const handlers = pluginEventHandlers[id];
          if (handlers && handlers.onPluginInit) {
            handlers.onPluginInit();
          }
        }
        
        resolve();
      } catch (error) {
        console.error('初始化已启用插件失败:', error);
        reject(error);
      }
    });
  }
}

// 创建单例实例
const pluginManager = new PluginManager();

export default pluginManager; 