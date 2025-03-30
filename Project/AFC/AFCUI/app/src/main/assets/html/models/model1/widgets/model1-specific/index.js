/**
 * 机型1特定组件
 */
class model1SpecificWidget {
    constructor(config) {
        this.config = config || {};
        this.element = null;
    }
    
    /**
     * 获取组件元数据
     */
    static getMetadata() {
        return {
            id: "model1-specific",
            name: "机型1专用组件",
            description: "仅适用于机型1的特定功能组件",
            author: "机型1开发团队"
        };
    }
    
    /**
     * 创建DOM元素
     */
    createDOMElement() {
        // 创建组件容器
        this.element = document.createElement('div');
        this.element.className = 'widget model1-widget';
        this.element.id = `widget-${this.config.widgetId || 'model1-specific'}-${Date.now()}`;
        
        // 创建组件内容
        const content = document.createElement('div');
        content.className = 'model1-content';
        
        // 创建标题
        const title = document.createElement('div');
        title.className = 'model1-title';
        title.textContent = '机型1专用功能';
        
        // 创建功能区
        const features = document.createElement('div');
        features.className = 'model1-features';
        
        // 添加几个机型1特定的功能按钮
        const functions = [
            { name: '特殊功能1', icon: '⚙️' },
            { name: '特殊功能2', icon: '🔧' },
            { name: '特殊控制', icon: '🎮' }
        ];
        
        functions.forEach(func => {
            const button = document.createElement('button');
            button.className = 'model1-feature-button';
            button.innerHTML = `${func.icon} ${func.name}`;
            button.onclick = () => this.activateFeature(func.name);
            features.appendChild(button);
        });
        
        // 添加到DOM树
        content.appendChild(title);
        content.appendChild(features);
        this.element.appendChild(content);
        
        // 添加样式
        this.addStyles();
        
        return this.element;
    }
    
    /**
     * 激活特定功能
     */
    activateFeature(featureName) {
        alert(`正在激活机型1的特定功能: ${featureName}`);
        // 这里可以添加机型1特有的功能逻辑
    }
    
    /**
     * 添加组件样式
     */
    addStyles() {
        // 检查是否已添加样式
        if (document.getElementById('model1-widget-style')) {
            return;
        }
        
        // 创建样式元素
        const style = document.createElement('style');
        style.id = 'model1-widget-style';
        style.textContent = `
            .model1-widget {
                background-color: #e6f7ff;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                display: flex;
                flex-direction: column;
                padding: 15px;
                font-family: Arial, sans-serif;
                position: absolute;
                transition: all 0.3s ease;
                border: 2px solid #1890ff;
            }
            
            .model1-content {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }
            
            .model1-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #0050b3;
                text-align: center;
                padding-bottom: 5px;
                border-bottom: 1px solid #91d5ff;
            }
            
            .model1-features {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .model1-feature-button {
                background-color: #1890ff;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 8px 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
                font-size: 14px;
            }
            
            .model1-feature-button:hover {
                background-color: #40a9ff;
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