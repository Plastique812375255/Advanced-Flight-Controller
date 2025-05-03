/**
 * 用户自定义组件 - 可自由定制的组件
 */
class CustomWidget extends BaseWidget {
    constructor(config) {
        super(config);
        // 自定义属性
        this.data = config.data || {};
    }
    
    renderContent() {
        this.element.innerHTML = `
            <div class="widget-content" style="display: flex; align-items: center; justify-content: center; height: 100%;">
                <div style="text-align: center; color: #2196F3; font-weight: bold;">2x2</div>
            </div>
        `;
        
        // 添加事件监听
        setTimeout(() => {
            const button = document.getElementById(`${this.getId()}_btn`);
            if (button) {
                button.addEventListener('click', this.handleButtonClick.bind(this));
            }
        }, 0);
    }
    
    handleButtonClick() {
        alert('你点击了自定义组件！');
    }
    
    static getMetadata() {
        return {
            id: 'user.custom',
            name: '自定义组件',
            description: '2x2 蓝色组件，带有交互功能',
            width: 2,
            height: 2
        };
    }
}

// 注册到全局
window.CustomWidget = CustomWidget;

// 尝试直接注册组件
try {
    if (typeof WidgetManager !== 'undefined') {
        console.log('直接注册用户自定义组件');
        WidgetManager.prototype.registerWidget(CustomWidget, false);
    }
} catch (e) {
    console.warn('自定义组件注册延迟，将由主脚本完成', e);
} 