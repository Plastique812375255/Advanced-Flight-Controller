/**
 * 飞翼机型控制面板组件
 */
class flywingControlWidget {
    constructor(config) {
        this.config = config || {};
        this.element = null;
    }
    
    /**
     * 获取组件元数据
     */
    static getMetadata() {
        return {
            id: "10002-control",
            name: "飞翼控制面板",
            description: "飞翼机型专用控制面板小组件",
            author: "飞翼开发团队"
        };
    }
    
    /**
     * 创建DOM元素
     */
    createDOMElement() {
        // 创建组件容器
        this.element = document.createElement('div');
        this.element.className = 'widget flywing-control';
        this.element.id = `widget-${this.config.widgetId || '10002-control'}-${Date.now()}`;
        
        // 创建组件内容
        const content = document.createElement('div');
        content.className = 'flywing-control-content';
        
        // 创建标题
        const title = document.createElement('div');
        title.className = 'flywing-control-title';
        title.textContent = '飞翼控制面板';
        
        // 创建控制区域
        const controlArea = document.createElement('div');
        controlArea.className = 'flywing-control-area';
        
        // 添加飞行模式选择
        const modeSelector = document.createElement('div');
        modeSelector.className = 'control-section';
        modeSelector.innerHTML = `
            <div class="section-title">飞行模式</div>
            <div class="mode-buttons">
                <button class="mode-button active" data-mode="normal">常规</button>
                <button class="mode-button" data-mode="acro">特技</button>
                <button class="mode-button" data-mode="auto">自动</button>
            </div>
        `;
        
        // 添加快速控制项
        const quickControls = document.createElement('div');
        quickControls.className = 'control-section';
        quickControls.innerHTML = `
            <div class="section-title">快速控制</div>
            <div class="control-sliders">
                <div class="control-slider">
                    <label>油门</label>
                    <input type="range" min="0" max="100" value="50" class="slider" id="throttle-slider">
                    <span class="slider-value">50%</span>
                </div>
                <div class="control-slider">
                    <label>升降舵</label>
                    <input type="range" min="-100" max="100" value="0" class="slider" id="elevator-slider">
                    <span class="slider-value">0%</span>
                </div>
            </div>
        `;
        
        // 添加事件监听
        modeSelector.querySelectorAll('.mode-button').forEach(button => {
            button.addEventListener('click', () => {
                // 移除所有按钮的active类
                modeSelector.querySelectorAll('.mode-button').forEach(b => {
                    b.classList.remove('active');
                });
                // 添加active类到点击的按钮
                button.classList.add('active');
                // 显示模式切换信息
                alert(`已切换到${button.textContent}模式`);
            });
        });
        
        // 添加滑块事件监听
        quickControls.querySelectorAll('.slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                const valueDisplay = e.target.parentNode.querySelector('.slider-value');
                valueDisplay.textContent = `${value}%`;
            });
        });
        
        // 添加到DOM树
        controlArea.appendChild(modeSelector);
        controlArea.appendChild(quickControls);
        content.appendChild(title);
        content.appendChild(controlArea);
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
        if (document.getElementById('flywing-control-style')) {
            return;
        }
        
        // 创建样式元素
        const style = document.createElement('style');
        style.id = 'flywing-control-style';
        style.textContent = `
            .flywing-control {
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
            
            .flywing-control-content {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }
            
            .flywing-control-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #d32f2f;
                text-align: center;
                padding-bottom: 5px;
                border-bottom: 1px solid #ffcdd2;
            }
            
            .flywing-control-area {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .control-section {
                background-color: white;
                border-radius: 8px;
                padding: 10px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .section-title {
                font-size: 14px;
                font-weight: bold;
                color: #757575;
                margin-bottom: 10px;
            }
            
            .mode-buttons {
                display: flex;
                gap: 5px;
            }
            
            .mode-button {
                flex: 1;
                padding: 8px;
                border: 1px solid #ddd;
                background-color: #f9f9f9;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .mode-button.active {
                background-color: #f44336;
                color: white;
                border-color: #d32f2f;
            }
            
            .control-sliders {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .control-slider {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .control-slider label {
                width: 60px;
                font-size: 14px;
                color: #555;
            }
            
            .slider {
                flex: 1;
                -webkit-appearance: none;
                appearance: none;
                height: 10px;
                background: #ddd;
                border-radius: 5px;
                outline: none;
            }
            
            .slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #f44336;
                cursor: pointer;
            }
            
            .slider-value {
                width: 45px;
                text-align: right;
                font-size: 14px;
                font-weight: bold;
                color: #333;
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