/**
 * 大尺寸示例组件
 */
class largeWidget {
    constructor(config) {
        this.config = config || {};
        this.element = null;
    }
    
    /**
     * 获取组件元数据
     */
    static getMetadata() {
        return {
            id: "large",
            name: "大尺寸示例",
            description: "2x2尺寸的示例小组件",
            author: "系统"
        };
    }
    
    /**
     * 创建DOM元素
     */
    createDOMElement() {
        // 创建组件容器
        this.element = document.createElement('div');
        this.element.className = 'widget large-widget';
        this.element.id = `widget-${this.config.widgetId || 'large'}-${Date.now()}`;
        
        // 创建内容
        const content = document.createElement('div');
        content.className = 'large-content';
        
        // 创建标题
        const title = document.createElement('div');
        title.className = 'large-title';
        title.textContent = '大尺寸组件';
        
        // 创建网格区域
        const grid = document.createElement('div');
        grid.className = 'large-grid';
        
        // 添加4个格子
        for (let i = 1; i <= 4; i++) {
            const cell = document.createElement('div');
            cell.className = 'large-grid-cell';
            cell.textContent = `区域 ${i}`;
            cell.onclick = () => this.handleCellClick(i);
            grid.appendChild(cell);
        }
        
        // 添加到DOM树
        content.appendChild(title);
        content.appendChild(grid);
        this.element.appendChild(content);
        
        // 添加样式
        this.addStyles();
        
        return this.element;
    }
    
    /**
     * 处理格子点击事件
     */
    handleCellClick(cellNumber) {
        alert(`点击了大尺寸组件的区域 ${cellNumber}`);
    }
    
    /**
     * 添加组件样式
     */
    addStyles() {
        // 检查是否已添加样式
        if (document.getElementById('large-widget-style')) {
            return;
        }
        
        // 创建样式元素
        const style = document.createElement('style');
        style.id = 'large-widget-style';
        style.textContent = `
            .large-widget {
                background-color: #fff8e1;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                display: flex;
                flex-direction: column;
                padding: 15px;
                font-family: Arial, sans-serif;
                position: absolute;
                transition: all 0.3s ease;
                border: 2px solid #ffc107;
            }
            
            .large-content {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }
            
            .large-title {
                font-size: 20px;
                font-weight: bold;
                color: #ff8f00;
                margin-bottom: 15px;
                text-align: center;
            }
            
            .large-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 1fr 1fr;
                gap: 10px;
                flex-grow: 1;
            }
            
            .large-grid-cell {
                background-color: #ffecb3;
                border-radius: 8px;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 10px;
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.2s;
                color: #ff6f00;
            }
            
            .large-grid-cell:hover {
                background-color: #ffe082;
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