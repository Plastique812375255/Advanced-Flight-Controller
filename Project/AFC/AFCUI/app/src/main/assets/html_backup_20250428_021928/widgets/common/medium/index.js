/**
 * 中尺寸示例组件
 */
class mediumWidget {
    constructor(config) {
        this.config = config || {};
        this.element = null;
    }
    
    /**
     * 获取组件元数据
     */
    static getMetadata() {
        return {
            id: "medium",
            name: "中尺寸示例",
            description: "2x1尺寸的示例小组件",
            author: "系统"
        };
    }
    
    /**
     * 创建DOM元素
     */
    createDOMElement() {
        // 创建组件容器
        this.element = document.createElement('div');
        this.element.className = 'widget medium-widget';
        this.element.id = `widget-${this.config.widgetId || 'medium'}-${Date.now()}`;
        
        // 创建内容
        const content = document.createElement('div');
        content.className = 'medium-content';
        
        // 创建标题
        const title = document.createElement('div');
        title.className = 'medium-title';
        title.textContent = '中尺寸组件';
        
        // 创建描述
        const description = document.createElement('div');
        description.className = 'medium-description';
        description.textContent = '这是一个2x1尺寸的示例组件';
        
        // 添加到DOM树
        content.appendChild(title);
        content.appendChild(description);
        this.element.appendChild(content);
        
        // 添加样式
        this.addStyles();
        
        return this.element;
    }
    
    /**
     * 添加组件样式
     */
    addStyles() {
        // 检查是否已添加样式
        if (document.getElementById('medium-widget-style')) {
            return;
        }
        
        // 创建样式元素
        const style = document.createElement('style');
        style.id = 'medium-widget-style';
        style.textContent = `
            .medium-widget {
                background-color: #e3f2fd;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 15px;
                font-family: Arial, sans-serif;
                position: absolute;
                transition: all 0.3s ease;
                border: 2px solid #2196f3;
            }
            
            .medium-content {
                display: flex;
                flex-direction: column;
                width: 100%;
            }
            
            .medium-title {
                font-size: 18px;
                font-weight: bold;
                color: #1565c0;
                margin-bottom: 8px;
            }
            
            .medium-description {
                font-size: 14px;
                color: #1976d2;
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