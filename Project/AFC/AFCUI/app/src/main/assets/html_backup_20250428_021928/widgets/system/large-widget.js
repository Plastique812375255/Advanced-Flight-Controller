/**
 * 大组件 - 4x2 黄色组件
 */
class LargeWidget extends BaseWidget {
    renderContent() {
        this.element.innerHTML = `
            <div class="widget-content" style="display: flex; align-items: center; justify-content: center; height: 100%;">
                <div style="text-align: center; color: #ffc107; font-weight: bold;">4x2</div>
            </div>
        `;
    }
    
    static getMetadata() {
        return {
            id: 'system.large',
            name: '大组件',
            description: '4x2 黄色组件',
            width: 4,
            height: 2
        };
    }
}

// 注册到全局
window.LargeWidget = LargeWidget;

// 尝试直接注册组件
try {
    if (typeof WidgetManager !== 'undefined') {
        console.log('直接注册系统大组件');
        WidgetManager.prototype.registerWidget(LargeWidget, true);
    }
} catch (e) {
    console.warn('大组件注册延迟，将由主脚本完成', e);
} 