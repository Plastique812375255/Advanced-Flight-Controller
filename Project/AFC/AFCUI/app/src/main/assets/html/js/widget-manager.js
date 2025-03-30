/**
 * 组件管理器 - 负责加载和管理桌面组件
 */
class WidgetManager {
    constructor(desktopGrid) {
        this.desktopGrid = desktopGrid;
        this.widgets = []; // 存储所有已加载的组件实例
        this.commonWidgets = {}; // 存储公共组件定义
        this.modelWidgets = {}; // 存储机型特定组件定义
        this.models = []; // 存储机型列表
        this.currentModel = null; // 当前使用的机型
        this.cellWidth = 0;
        this.cellHeight = 0;
    }

    /**
     * 初始化组件管理器
     */
    async init(modelId) {
        // 加载机型列表
        await this.loadModels();
        
        // 设置当前机型
        if (modelId) {
            this.setCurrentModel(modelId);
        } else {
            // 如果没有指定机型，使用第一个可用的机型
            if (this.models.length > 0) {
                this.setCurrentModel(this.models[0].id);
            }
        }
        
        // 加载公共组件
        await this.loadCommonWidgets();
        
        // 加载用户布局
        this.loadLayout();
    }

    /**
     * 加载机型列表
     */
    async loadModels() {
        try {
            console.log('加载机型列表...');
            const response = await fetch('./models/index.json');
            if (!response.ok) {
                console.error(`加载机型列表失败，状态码: ${response.status}`);
                return;
            }
            
            this.models = await response.json();
            console.log(`已加载 ${this.models.length} 个机型`);
        } catch (error) {
            console.error('加载机型列表失败:', error);
        }
    }

    /**
     * 设置当前使用的机型
     */
    async setCurrentModel(modelId) {
        // 查找机型信息
        const model = this.models.find(m => m.id === modelId);
        if (!model) {
            console.error(`找不到机型: ${modelId}`);
            return false;
        }

        console.log(`设置当前机型为: ${model.name} (${model.id})`);
        
        try {
            // 加载机型配置信息
            const response = await fetch(`./models/${model.path}/config.json`);
            if (!response.ok) {
                console.error(`加载机型配置失败，状态码: ${response.status}`);
                return false;
            }
            
            this.currentModel = await response.json();
            
            // 加载机型特定组件
            await this.loadModelWidgets(model.path);
            
            return true;
        } catch (error) {
            console.error(`设置机型失败: ${modelId}`, error);
            return false;
        }
    }

    /**
     * 加载公共组件定义
     */
    async loadCommonWidgets() {
        try {
            console.log('加载公共组件...');
            const response = await fetch('./widgets/common/index.json');
            if (!response.ok) {
                console.error(`加载公共组件列表失败，状态码: ${response.status}`);
                return;
            }
            
            const commonWidgetList = await response.json();
            console.log('公共组件列表:', commonWidgetList);
            
            // 加载每个公共组件
            for (const widgetInfo of commonWidgetList) {
                console.log(`加载公共组件: ${widgetInfo.id} (${widgetInfo.file})`);
                await this.loadWidgetScript(`./widgets/common/${widgetInfo.file}`, widgetInfo.id, "common");
            }
            
            console.log(`已加载 ${Object.keys(this.commonWidgets).length} 个公共组件`);
        } catch (error) {
            console.error('加载公共组件失败:', error);
        }
    }

    /**
     * 加载机型特定组件定义
     */
    async loadModelWidgets(modelPath) {
        try {
            if (!this.currentModel) {
                console.error('没有设置当前机型，无法加载机型特定组件');
                return;
            }
            
            console.log(`加载机型 ${this.currentModel.id} 的特定组件...`);
            const response = await fetch(`./models/${modelPath}/widgets/index.json`);
            if (!response.ok) {
                console.log(`未找到机型特定组件或加载失败，状态码: ${response.status}`);
                return;
            }
            
            const modelWidgetList = await response.json();
            console.log('机型特定组件列表:', modelWidgetList);
            
            // 初始化当前机型的组件存储
            this.modelWidgets[this.currentModel.id] = {};
            
            // 加载每个机型特定组件
            for (const widgetInfo of modelWidgetList) {
                console.log(`加载机型特定组件: ${widgetInfo.id} (${widgetInfo.file})`);
                await this.loadWidgetScript(`./models/${modelPath}/widgets/${widgetInfo.file}`, widgetInfo.id, "model");
            }
            
            console.log(`已加载 ${Object.keys(this.modelWidgets[this.currentModel.id]).length} 个机型特定组件`);
        } catch (error) {
            console.warn(`加载机型 ${this.currentModel.id} 特定组件失败:`, error);
        }
    }

    /**
     * 加载组件脚本
     */
    async loadWidgetScript(scriptPath, widgetId, source) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.onload = () => {
                console.log(`成功加载组件脚本: ${scriptPath}`);
                
                // 获取组件类，通常脚本会在全局注册一个以组件ID命名的类
                const widgetClass = window[widgetId + "Widget"];
                
                // 注册组件
                if (widgetClass) {
                    this.registerWidget(widgetClass, widgetId, source);
                } else {
                    console.warn(`脚本加载成功，但找不到组件类: ${widgetId}`);
                }
                
                resolve();
            };
            script.onerror = (error) => {
                console.error(`加载组件脚本失败: ${scriptPath}`, error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }

    /**
     * 注册组件定义
     */
    registerWidget(widgetClass, widgetId, source) {
        if (!widgetClass) {
            console.error('组件注册失败: 无效的组件类');
            return;
        }
        
        // 根据组件来源存储到不同的集合中
        if (source === "common") {
            this.commonWidgets[widgetId] = widgetClass;
            console.log(`注册公共组件: ${widgetId}`);
        } else if (source === "model" && this.currentModel) {
            if (!this.modelWidgets[this.currentModel.id]) {
                this.modelWidgets[this.currentModel.id] = {};
            }
            this.modelWidgets[this.currentModel.id][widgetId] = widgetClass;
            console.log(`注册机型特定组件: ${widgetId} (机型: ${this.currentModel.id})`);
        }
    }

    /**
     * 获取组件类定义
     */
    getWidgetClass(widgetId) {
        // 优先查找机型特定组件
        if (this.currentModel && 
            this.modelWidgets[this.currentModel.id] && 
            this.modelWidgets[this.currentModel.id][widgetId]) {
            return this.modelWidgets[this.currentModel.id][widgetId];
        }
        
        // 再查找公共组件
        return this.commonWidgets[widgetId];
    }

    /**
     * 创建组件实例
     */
    createWidget(widgetId, config) {
        console.log(`尝试创建组件: ${widgetId}`);
        
        // 获取组件类
        const WidgetClass = this.getWidgetClass(widgetId);
        
        if (!WidgetClass) {
            console.error(`找不到组件: ${widgetId}`);
            return null;
        }
        
        console.log(`找到组件类: ${WidgetClass.name || widgetId}`);
        
        try {
            // 创建组件实例
            const widget = new WidgetClass(config);
            this.widgets.push(widget);
            
            // 创建DOM元素
            const element = widget.createDOMElement();
            this.desktopGrid.appendChild(element);
            
            // 设置组件位置和大小
            this.updateWidgetSize(widget);
            
            console.log(`成功创建组件: ${widgetId}`);
            
            return widget;
        } catch (error) {
            console.error(`创建组件失败: ${widgetId}`, error);
            return null;
        }
    }
    
    /**
     * 更新组件尺寸
     */
    updateWidgetSize(widget) {
        const element = widget.element;
        if (!element) return;
        
        const col = parseInt(widget.config.col);
        const row = parseInt(widget.config.row);
        const width = parseInt(widget.config.width);
        const height = parseInt(widget.config.height);
        
        // 设置元素尺寸和位置
        element.style.width = `${this.cellWidth * width - 5}px`;
        element.style.height = `${this.cellHeight * height - 5}px`;
        element.style.left = `${col * this.cellWidth}px`;
        element.style.top = `${row * this.cellHeight}px`;
    }
    
    /**
     * 更新所有组件的尺寸和位置
     */
    updateAllWidgets() {
        this.widgets.forEach(widget => {
            this.updateWidgetSize(widget);
        });
    }

    /**
     * 设置网格单元格尺寸
     */
    setCellSize(width, height) {
        this.cellWidth = width;
        this.cellHeight = height;
        this.updateAllWidgets();
    }

    /**
     * 加载用户布局
     */
    loadLayout() {
        if (!this.currentModel) {
            console.error('没有设置当前机型，无法加载布局');
            return;
        }
        
        // 从本地存储加载用户的布局
        let layout = [];
        const storageKey = `desktopLayout_${this.currentModel.id}`;
        
        try {
            const savedLayout = localStorage.getItem(storageKey);
            if (savedLayout) {
                layout = JSON.parse(savedLayout);
                console.log(`从本地存储加载机型 ${this.currentModel.id} 的布局`);
            }
        } catch (error) {
            console.error('加载布局失败:', error);
        }
        
        // 如果没有保存的布局，使用机型默认布局
        if (!layout || layout.length === 0) {
            layout = this.getDefaultLayout();
            console.log(`使用机型 ${this.currentModel.id} 的默认布局`);
        }
        
        // 清空当前组件
        this.clearWidgets();
        
        // 创建组件
        layout.forEach(config => {
            this.createWidget(config.widgetId, config);
        });
    }

    /**
     * 清空当前所有组件
     */
    clearWidgets() {
        // 移除DOM元素
        this.widgets.forEach(widget => {
            if (widget.element && widget.element.parentNode) {
                widget.element.parentNode.removeChild(widget.element);
            }
        });
        
        // 清空组件列表
        this.widgets = [];
    }

    /**
     * 获取默认布局
     */
    getDefaultLayout() {
        // 使用当前机型的默认布局
        if (this.currentModel && this.currentModel.defaults && this.currentModel.defaults.widgets) {
            // 转换为内部使用的配置格式
            return this.currentModel.defaults.widgets.map(widget => {
                return {
                    widgetId: widget.id,
                    col: widget.position.x,
                    row: widget.position.y,
                    width: widget.size.w,
                    height: widget.size.h,
                    // 附加额外信息
                    source: widget.source
                };
            });
        }
        
        // 如果没有机型默认布局，返回一个空布局
        return [];
    }
    
    /**
     * 获取所有可用的组件列表
     */
    getAllAvailableWidgets() {
        const result = [];
        
        // 添加公共组件
        Object.keys(this.commonWidgets).forEach(id => {
            const WidgetClass = this.commonWidgets[id];
            const metadata = WidgetClass.getMetadata ? WidgetClass.getMetadata() : { id: id, name: id };
            result.push({
                id: id,
                name: metadata.name || id,
                description: metadata.description || '',
                source: 'common'
            });
        });
        
        // 添加当前机型的特定组件
        if (this.currentModel && this.modelWidgets[this.currentModel.id]) {
            Object.keys(this.modelWidgets[this.currentModel.id]).forEach(id => {
                const WidgetClass = this.modelWidgets[this.currentModel.id][id];
                const metadata = WidgetClass.getMetadata ? WidgetClass.getMetadata() : { id: id, name: id };
                result.push({
                    id: id,
                    name: metadata.name || id,
                    description: metadata.description || '',
                    source: 'model'
                });
            });
        }
        
        return result;
    }
    
    /**
     * 保存当前布局
     */
    saveCurrentLayout() {
        if (!this.currentModel) {
            console.error('没有设置当前机型，无法保存布局');
            return;
        }
        
        // 提取布局信息
        const layout = this.widgets.map(widget => {
            const config = widget.config;
            return {
                widgetId: config.widgetId,
                col: config.col,
                row: config.row,
                width: config.width,
                height: config.height,
                source: config.source
            };
        });
        
        // 保存到本地存储
        const storageKey = `desktopLayout_${this.currentModel.id}`;
        localStorage.setItem(storageKey, JSON.stringify(layout));
        console.log(`已保存机型 ${this.currentModel.id} 的布局`);
    }
}

// 导出组件管理器
window.WidgetManager = WidgetManager; 