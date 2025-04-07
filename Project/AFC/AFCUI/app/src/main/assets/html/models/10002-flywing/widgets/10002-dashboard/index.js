/**
 * 飞翼机型仪表盘组件
 */
class flywingDashboardWidget {
    constructor(config) {
        this.config = config || {};
        this.element = null;
    }
    
    /**
     * 获取组件元数据
     */
    static getMetadata() {
        return {
            id: "10002-dashboard",
            name: "飞翼仪表盘",
            description: "飞翼机型专用综合仪表盘",
            author: "飞翼开发团队"
        };
    }
    
    /**
     * 创建DOM元素
     */
    createDOMElement() {
        // 创建组件容器
        this.element = document.createElement('div');
        this.element.className = 'widget flywing-dashboard';
        this.element.id = `widget-${this.config.widgetId || '10002-dashboard'}-${Date.now()}`;
        
        // 创建组件内容
        const content = document.createElement('div');
        content.className = 'flywing-content';
        
        // 创建标题
        const title = document.createElement('div');
        title.className = 'flywing-title';
        title.textContent = '飞翼仪表盘';
        
        // 创建仪表盘区域
        const dashboard = document.createElement('div');
        dashboard.className = 'flywing-dashboard-area';
        
        // 添加仪表盘项目
        const gauges = [
            { name: '高度', value: '1200m', icon: '📈' },
            { name: '速度', value: '120km/h', icon: '🚀' },
            { name: '电量', value: '85%', icon: '🔋' }
        ];
        
        gauges.forEach(gauge => {
            const gaugeElement = document.createElement('div');
            gaugeElement.className = 'flywing-gauge';
            gaugeElement.innerHTML = `
                <div class="gauge-icon">${gauge.icon}</div>
                <div class="gauge-name">${gauge.name}</div>
                <div class="gauge-value">${gauge.value}</div>
            `;
            dashboard.appendChild(gaugeElement);
        });
        
        // 添加到DOM树
        content.appendChild(title);
        content.appendChild(dashboard);
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
        if (document.getElementById('flywing-dashboard-style')) {
            return;
        }
        
        // 创建样式元素
        const style = document.createElement('style');
        style.id = 'flywing-dashboard-style';
        style.textContent = `
            .flywing-dashboard {
                background-color: #f5f5f5;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                display: flex;
                flex-direction: column;
                padding: 15px;
                font-family: Arial, sans-serif;
                position: absolute;
                transition: all 0.3s ease;
                border: 2px solid #f44336;
            }
            
            .flywing-content {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }
            
            .flywing-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #d32f2f;
                text-align: center;
                padding-bottom: 5px;
                border-bottom: 1px solid #ffcdd2;
            }
            
            .flywing-dashboard-area {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                gap: 10px;
            }
            
            .flywing-gauge {
                background-color: white;
                border-radius: 8px;
                padding: 10px;
                min-width: 80px;
                text-align: center;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .gauge-icon {
                font-size: 24px;
                margin-bottom: 5px;
            }
            
            .gauge-name {
                font-size: 12px;
                color: #757575;
                margin-bottom: 5px;
            }
            
            .gauge-value {
                font-size: 16px;
                font-weight: bold;
                color: #d32f2f;
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