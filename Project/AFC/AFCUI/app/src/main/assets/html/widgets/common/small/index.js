/**
 * 小尺寸示例组件
 */
class smallWidget {
    constructor(config) {
        this.config = config || {};
        this.element = null;
    }
    
    /**
     * 获取组件元数据
     */
    static getMetadata() {
        return {
            id: "small",
            name: "小尺寸示例",
            description: "1x1尺寸的示例小组件",
            author: "系统"
        };
    }
    
    /**
     * 创建DOM元素
     */
    createDOMElement() {
        // 创建组件容器
        this.element = document.createElement('div');
        this.element.className = 'widget small-widget';
        this.element.id = `widget-${this.config.widgetId || 'small'}-${Date.now()}`;
        
        // 创建内容
        const content = document.createElement('div');
        content.className = 'small-content';
        content.textContent = '小组件';
        
        // 添加到DOM树
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
        if (document.getElementById('small-widget-style')) {
            return;
        }
        
        // 创建样式元素
        const style = document.createElement('style');
        style.id = 'small-widget-style';
        style.textContent = `
            .small-widget {
                background-color: #e8f5e9;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 10px;
                font-family: Arial, sans-serif;
                position: absolute;
                transition: all 0.3s ease;
                border: 2px solid #4caf50;
            }
            
            .small-content {
                font-size: 16px;
                font-weight: bold;
                color: #2e7d32;
                text-align: center;
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