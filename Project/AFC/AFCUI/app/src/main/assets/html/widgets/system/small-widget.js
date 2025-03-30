/**
 * 小组件 - 1x1 红色组件
 */
class SmallWidget extends BaseWidget {
    renderContent() {
        this.element.innerHTML = `
            <div class="widget-content" style="display: flex; align-items: center; justify-content: center; height: 100%;">
                <div style="text-align: center; color: #f44336; font-weight: bold;">1x1</div>
            </div>
        `;
    }
    
    static getMetadata() {
        return {
            id: 'system.small',
            name: '小组件',
            description: '1x1 红色组件',
            width: 1,
            height: 1
        };
    }
}

// 注册到全局
window.SmallWidget = SmallWidget;

// 尝试直接注册组件
try {
    if (typeof WidgetManager !== 'undefined') {
        console.log('直接注册系统小组件');
        WidgetManager.prototype.registerWidget(SmallWidget, true);
    }
} catch (e) {
    console.warn('小组件注册延迟，将由主脚本完成', e);
} 