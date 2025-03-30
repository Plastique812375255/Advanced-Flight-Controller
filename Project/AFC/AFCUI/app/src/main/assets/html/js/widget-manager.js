/**
 * 组件管理器 - 负责加载和管理桌面组件
 */
class WidgetManager {
    constructor(desktopGrid) {
        this.desktopGrid = desktopGrid;
        this.widgets = []; // 存储所有已加载的组件实例
        this.systemWidgets = {}; // 存储系统组件定义
        this.userWidgets = {}; // 存储用户组件定义
        this.cellWidth = 0;
        this.cellHeight = 0;
    }

    /**
     * 初始化组件管理器
     */
    async init() {
        // 加载系统组件
        await this.loadSystemWidgets();
        
        // 加载用户组件
        await this.loadUserWidgets();
        
        // 加载用户布局
        this.loadLayout();
    }

    /**
     * 加载系统组件定义
     */
    async loadSystemWidgets() {
        try {
            // 获取系统组件列表
            console.log('开始加载系统组件...');
            const response = await fetch('./widgets/system/index.json');
            if (!response.ok) {
                console.error(`加载系统组件列表失败，状态码: ${response.status}`);
                const text = await response.text();
                console.error(`响应内容: ${text.substring(0, 100)}...`);
                throw new Error(`加载系统组件列表失败，状态码: ${response.status}`);
            }
            
            const systemWidgetList = await response.json();
            console.log('系统组件列表:', systemWidgetList);
            
            // 加载每个系统组件
            for (const widgetInfo of systemWidgetList) {
                console.log(`加载系统组件: ${widgetInfo.id} (${widgetInfo.file})`);
                await this.loadWidgetScript(`./widgets/system/${widgetInfo.file}`, true);
            }
            
            console.log(`已加载 ${Object.keys(this.systemWidgets).length} 个系统组件`);
        } catch (error) {
            console.error('加载系统组件失败:', error);
        }
    }

    /**
     * 加载用户组件定义
     */
    async loadUserWidgets() {
        try {
            // 获取用户组件列表
            console.log('开始加载用户组件...');
            const response = await fetch('./widgets/user/index.json');
            if (!response.ok) {
                console.log(`未找到用户组件，状态码: ${response.status}`);
                return;
            }
            
            const userWidgetList = await response.json();
            console.log('用户组件列表:', userWidgetList);
            
            // 加载每个用户组件
            for (const widgetInfo of userWidgetList) {
                console.log(`加载用户组件: ${widgetInfo.id} (${widgetInfo.file})`);
                await this.loadWidgetScript(`./widgets/user/${widgetInfo.file}`, false);
            }
            
            console.log(`已加载 ${Object.keys(this.userWidgets).length} 个用户组件`);
        } catch (error) {
            console.warn('加载用户组件失败或没有用户组件:', error);
        }
    }

    /**
     * 加载组件脚本
     */
    async loadWidgetScript(scriptPath, isSystem) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.onload = () => {
                console.log(`成功加载组件脚本: ${scriptPath}`);
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
    registerWidget(widgetClass, isSystem = true) {
        const widgetInfo = widgetClass.getMetadata();
        
        if (!widgetInfo || !widgetInfo.id) {
            console.error('组件注册失败: 无效的组件元数据');
            return;
        }
        
        // 根据组件来源存储到不同的集合中
        if (isSystem) {
            this.systemWidgets[widgetInfo.id] = widgetClass;
        } else {
            this.userWidgets[widgetInfo.id] = widgetClass;
        }
        
        console.log(`注册组件: ${widgetInfo.name} (${widgetInfo.id})`);
    }

    /**
     * 创建组件实例
     */
    createWidget(widgetId, config) {
        console.log(`尝试创建组件: ${widgetId}`);
        
        // 先查找系统组件，再查找用户组件
        const WidgetClass = this.systemWidgets[widgetId] || this.userWidgets[widgetId];
        
        if (!WidgetClass) {
            console.error(`找不到组件: ${widgetId}`);
            return null;
        }
        
        console.log(`找到组件类: ${WidgetClass.name}`);
        
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
        // 从本地存储加载用户的布局
        let layout = [];
        
        try {
            const savedLayout = localStorage.getItem('desktopLayout');
            if (savedLayout) {
                layout = JSON.parse(savedLayout);
            }
        } catch (error) {
            console.error('加载布局失败:', error);
        }
        
        // 如果没有保存的布局，使用默认布局
        if (!layout || layout.length === 0) {
            layout = this.getDefaultLayout();
        }
        
        // 创建组件
        layout.forEach(config => {
            this.createWidget(config.widgetId, config);
        });
    }

    /**
     * 获取默认布局
     */
    getDefaultLayout() {
        return [
            {
                widgetId: 'system.small',
                col: 1,
                row: 1,
                width: 1,
                height: 1
            },
            {
                widgetId: 'system.medium',
                col: 3,
                row: 2,
                width: 3,
                height: 1
            },
            {
                widgetId: 'system.large',
                col: 6,
                row: 3,
                width: 4,
                height: 2
            }
        ];
    }

    /**
     * 保存当前布局
     */
    saveLayout() {
        const layout = this.widgets.map(widget => {
            return {
                widgetId: widget.getId(),
                col: widget.config.col,
                row: widget.config.row,
                width: widget.config.width,
                height: widget.config.height
            };
        });
        
        try {
            localStorage.setItem('desktopLayout', JSON.stringify(layout));
        } catch (error) {
            console.error('保存布局失败:', error);
        }
    }

    /**
     * 移除组件
     */
    removeWidget(widgetId) {
        console.log(`尝试移除组件: ${widgetId}`);
        
        // 查找组件在数组中的索引
        const index = this.widgets.findIndex(widget => 
            widget.getId() === widgetId || 
            (widget.element && widget.element.id === widgetId));
        
        if (index !== -1) {
            // 从数组中移除组件
            const removedWidget = this.widgets.splice(index, 1)[0];
            console.log(`成功移除组件, 当前组件数量: ${this.widgets.length}`);
            return true;
        }
        
        console.warn(`未找到组件ID: ${widgetId}`);
        return false;
    }

    /**
     * 清空桌面
     */
    clearDesktop() {
        this.widgets.forEach(widget => {
            if (widget.element && widget.element.parentNode) {
                widget.element.parentNode.removeChild(widget.element);
            }
        });
        
        this.widgets = [];
    }
}

// 导出组件管理器
window.WidgetManager = WidgetManager; 