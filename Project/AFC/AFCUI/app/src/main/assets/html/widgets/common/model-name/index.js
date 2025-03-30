/**
 * 机型名称显示组件
 */
class modelNameWidget {
    constructor(config) {
        this.config = config || {};
        this.element = null;
        this.nameElement = null;
        this.modelData = null;
    }
    
    /**
     * 获取组件元数据
     */
    static getMetadata() {
        return {
            id: "model-name",
            name: "机型名称",
            description: "显示当前机型名称的组件",
            author: "系统"
        };
    }
    
    /**
     * 创建DOM元素
     */
    createDOMElement() {
        // 创建组件容器
        this.element = document.createElement('div');
        this.element.className = 'widget model-name-widget';
        this.element.id = `widget-${this.config.widgetId || 'model-name'}-${Date.now()}`;
        
        // 创建内容
        const content = document.createElement('div');
        content.className = 'model-name-content';
        
        // 创建标签
        const label = document.createElement('div');
        label.className = 'model-name-label';
        label.textContent = '当前机型:';
        
        // 创建名称显示
        this.nameElement = document.createElement('div');
        this.nameElement.className = 'model-name-value';
        
        // 创建版本显示
        this.versionElement = document.createElement('div');
        this.versionElement.className = 'model-name-version';
        
        // 添加到DOM树
        content.appendChild(label);
        content.appendChild(this.nameElement);
        content.appendChild(this.versionElement);
        this.element.appendChild(content);
        
        // 添加样式
        this.addStyles();
        
        // 加载当前机型信息
        this.loadModelInfo();
        
        // 添加刷新按钮
        const refreshButton = document.createElement('button');
        refreshButton.className = 'model-name-refresh';
        refreshButton.textContent = '刷新';
        refreshButton.onclick = () => this.loadModelInfo();
        this.element.appendChild(refreshButton);
        
        return this.element;
    }
    
    /**
     * 加载当前机型信息
     */
    async loadModelInfo() {
        try {
            // 获取当前使用的机型ID
            const currentModelId = this.getCurrentModelId();
            
            // 加载机型详细信息
            const response = await fetch(`./models/${currentModelId}/config.json`);
            if (response.ok) {
                this.modelData = await response.json();
                
                // 更新显示
                this.updateDisplay();
            } else {
                this.nameElement.textContent = '未知机型';
                this.versionElement.textContent = '';
            }
        } catch (error) {
            console.error('加载机型信息失败:', error);
            this.nameElement.textContent = '加载失败';
            this.versionElement.textContent = '';
        }
    }
    
    /**
     * 获取当前机型ID
     */
    getCurrentModelId() {
        // 这里需要从某个地方获取当前机型的ID
        // 在实际应用中，可以从window全局变量、本地存储或API中获取
        
        // 从页面URL参数获取
        const urlParams = new URLSearchParams(window.location.search);
        const modelId = urlParams.get('model');
        
        // 如果URL中没有指定，从localStorage获取
        if (!modelId) {
            return localStorage.getItem('currentModelId') || 'model1';
        }
        
        return modelId;
    }
    
    /**
     * 更新显示
     */
    updateDisplay() {
        if (!this.modelData) return;
        
        this.nameElement.textContent = this.modelData.name || '未知机型';
        this.versionElement.textContent = `版本: ${this.modelData.version || '未知'}`;
        
        // 根据机型更新样式
        this.element.style.borderColor = this.getModelColor(this.modelData.id);
    }
    
    /**
     * 根据机型ID获取颜色
     */
    getModelColor(modelId) {
        const colors = {
            'model1': '#2196f3', // 蓝色
            'model2': '#f44336', // 红色
            'model3': '#4caf50'  // 绿色
        };
        
        return colors[modelId] || '#9e9e9e'; // 默认灰色
    }
    
    /**
     * 添加组件样式
     */
    addStyles() {
        // 检查是否已添加样式
        if (document.getElementById('model-name-widget-style')) {
            return;
        }
        
        // 创建样式元素
        const style = document.createElement('style');
        style.id = 'model-name-widget-style';
        style.textContent = `
            .model-name-widget {
                background-color: #f5f5f5;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                display: flex;
                flex-direction: column;
                padding: 15px;
                font-family: Arial, sans-serif;
                position: absolute;
                transition: all 0.3s ease;
                border: 3px solid #2196f3;
            }
            
            .model-name-content {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .model-name-label {
                font-size: 14px;
                color: #757575;
            }
            
            .model-name-value {
                font-size: 20px;
                font-weight: bold;
                color: #212121;
            }
            
            .model-name-version {
                font-size: 12px;
                color: #757575;
                margin-top: 5px;
            }
            
            .model-name-refresh {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: transparent;
                border: 1px solid #bdbdbd;
                border-radius: 4px;
                padding: 2px 5px;
                font-size: 12px;
                cursor: pointer;
                color: #757575;
            }
            
            .model-name-refresh:hover {
                background-color: #e0e0e0;
            }
        `;
        
        // 添加到文档头部
        document.head.appendChild(style);
    }
    
    /**
     * 销毁组件
     */
    destroy() {
        // 移除DOM元素
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
} 