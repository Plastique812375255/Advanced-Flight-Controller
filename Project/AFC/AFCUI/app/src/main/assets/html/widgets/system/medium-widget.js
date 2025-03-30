/**
 * 中组件 - 1x3 绿色组件
 */
class MediumWidget extends BaseWidget {
    renderContent() {
        this.element.innerHTML = `
            <div class="widget-content" style="display: flex; align-items: center; justify-content: center; height: 100%;">
                <div style="text-align: center; color: #4caf50; font-weight: bold;">1x3</div>
            </div>
        `;
    }
    
    static getMetadata() {
        return {
            id: 'system.medium',
            name: '中组件',
            description: '3x1 绿色组件',
            width: 3,
            height: 1
        };
    }
}

// 注册到全局
window.MediumWidget = MediumWidget;

// 尝试直接注册组件
try {
    if (typeof WidgetManager !== 'undefined') {
        console.log('直接注册系统中组件');
        WidgetManager.prototype.registerWidget(MediumWidget, true);
    }
} catch (e) {
    console.warn('中组件注册延迟，将由主脚本完成', e);
} 