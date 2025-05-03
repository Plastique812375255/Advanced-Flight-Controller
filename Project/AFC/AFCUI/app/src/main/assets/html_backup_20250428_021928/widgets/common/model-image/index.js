/**
 * 机型图片显示组件
 */
class modelImageWidget {
    constructor(config) {
        this.config = config || {};
        this.element = null;
        this.imageElement = null;
        this.modelData = null;
    }
    
    /**
     * 获取组件元数据
     */
    static getMetadata() {
        return {
            id: "model-image",
            name: "机型图片",
            description: "显示当前机型图片的组件",
            author: "系统"
        };
    }
    
    /**
     * 创建DOM元素
     */
    createDOMElement() {
        // 创建组件容器
        this.element = document.createElement('div');
        this.element.className = 'widget model-image-widget';
        this.element.id = `widget-${this.config.widgetId || 'model-image'}-${Date.now()}`;
        
        // 创建内容容器
        const content = document.createElement('div');
        content.className = 'model-image-content';
        
        // 创建图片元素
        this.imageElement = document.createElement('img');
        this.imageElement.className = 'model-image';
        this.imageElement.alt = '机型图片';
        
        // 创建标题元素
        this.titleElement = document.createElement('div');
        this.titleElement.className = 'model-image-title';
        
        // 添加到DOM树
        content.appendChild(this.imageElement);
        content.appendChild(this.titleElement);
        this.element.appendChild(content);
        
        // 创建错误信息元素
        this.errorElement = document.createElement('div');
        this.errorElement.className = 'model-image-error';
        this.errorElement.style.display = 'none';
        this.element.appendChild(this.errorElement);
        
        // 添加样式
        this.addStyles();
        
        // 加载当前机型信息
        this.loadModelInfo();
        
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
                this.showError('无法加载机型信息');
            }
        } catch (error) {
            console.error('加载机型信息失败:', error);
            this.showError('加载失败');
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
        
        // 设置图片标题
        this.titleElement.textContent = this.modelData.name || '未知机型';
        
        // 加载图片
        const modelId = this.modelData.id;
        const imagePath = `./models/${modelId}/resources/preview.png`;
        
        this.imageElement.src = imagePath;
        this.imageElement.onerror = () => {
            this.showError('图片加载失败');
        };
        this.imageElement.onload = () => {
            this.errorElement.style.display = 'none';
            this.imageElement.style.display = 'block';
        };
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'flex';
        this.imageElement.style.display = 'none';
    }
    
    /**
     * 添加组件样式
     */
    addStyles() {
        // 检查是否已添加样式
        if (document.getElementById('model-image-widget-style')) {
            return;
        }
        
        // 创建样式元素
        const style = document.createElement('style');
        style.id = 'model-image-widget-style';
        style.textContent = `
            .model-image-widget {
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                display: flex;
                flex-direction: column;
                padding: 10px;
                font-family: Arial, sans-serif;
                position: absolute;
                transition: all 0.3s ease;
                overflow: hidden;
            }
            
            .model-image-content {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }
            
            .model-image {
                width: 100%;
                height: calc(100% - 30px);
                object-fit: contain;
                border-radius: 6px;
            }
            
            .model-image-title {
                font-size: 16px;
                font-weight: bold;
                text-align: center;
                margin-top: 8px;
                color: #333;
            }
            
            .model-image-error {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: calc(100% - 30px);
                background-color: #f5f5f5;
                color: #f44336;
                font-size: 14px;
                border-radius: 6px;
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