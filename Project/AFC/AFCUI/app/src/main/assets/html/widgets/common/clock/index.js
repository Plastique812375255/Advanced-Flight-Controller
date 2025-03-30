/**
 * 时钟组件
 */
class clockWidget {
    constructor(config) {
        this.config = config || {};
        this.element = null;
        this.interval = null;
    }
    
    /**
     * 获取组件元数据
     */
    static getMetadata() {
        return {
            id: "clock",
            name: "时钟",
            description: "显示当前时间的组件",
            author: "系统"
        };
    }
    
    /**
     * 创建DOM元素
     */
    createDOMElement() {
        // 创建组件容器
        this.element = document.createElement('div');
        this.element.className = 'widget clock-widget';
        this.element.id = `widget-${this.config.widgetId || 'clock'}-${Date.now()}`;
        
        // 创建时钟内容
        const content = document.createElement('div');
        content.className = 'clock-content';
        
        // 创建时间显示
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'time-display';
        
        // 创建日期显示
        const dateDisplay = document.createElement('div');
        dateDisplay.className = 'date-display';
        
        // 添加到DOM树
        content.appendChild(timeDisplay);
        content.appendChild(dateDisplay);
        this.element.appendChild(content);
        
        // 更新时间
        this.updateTime(timeDisplay, dateDisplay);
        
        // 设置定时器，每秒更新一次
        this.interval = setInterval(() => {
            this.updateTime(timeDisplay, dateDisplay);
        }, 1000);
        
        // 添加样式
        this.addStyles();
        
        return this.element;
    }
    
    /**
     * 更新时间显示
     */
    updateTime(timeElement, dateElement) {
        const now = new Date();
        
        // 格式化时间: HH:MM:SS
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        
        // 格式化日期: YYYY-MM-DD 星期几
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const weekDay = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()];
        dateElement.textContent = `${year}-${month}-${day} ${weekDay}`;
    }
    
    /**
     * 添加组件样式
     */
    addStyles() {
        // 检查是否已添加样式
        if (document.getElementById('clock-widget-style')) {
            return;
        }
        
        // 创建样式元素
        const style = document.createElement('style');
        style.id = 'clock-widget-style';
        style.textContent = `
            .clock-widget {
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 10px;
                font-family: Arial, sans-serif;
                position: absolute;
                transition: all 0.3s ease;
            }
            
            .clock-content {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
            }
            
            .time-display {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .date-display {
                font-size: 14px;
                color: #666;
            }
        `;
        
        // 添加到文档头部
        document.head.appendChild(style);
    }
    
    /**
     * 销毁组件
     */
    destroy() {
        // 清除定时器
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        // 移除DOM元素
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
} 