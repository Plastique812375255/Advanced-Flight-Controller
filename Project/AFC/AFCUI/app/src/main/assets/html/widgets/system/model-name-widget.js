/**
 * 模型名称组件 - 3x1 组件，显示型号名称
 */
class ModelNameWidget extends BaseWidget {
    renderContent() {
        this.element.innerHTML = `
            <div class="widget-content" style="display: flex; align-items: center; justify-content: center; height: 100%;">
                <div style="text-align: center; font-size: 24px; font-weight: bold; color: #333;">OMP M7</div>
            </div>
        `;
    }
    
    static getMetadata() {
        return {
            id: 'system.model-name',
            name: '模型名称',
            description: '3x1 模型名称显示组件',
            width: 3,
            height: 1
        };
    }
}

// 注册到全局
window.ModelNameWidget = ModelNameWidget;

// 尝试直接注册组件
try {
    if (typeof WidgetManager !== 'undefined') {
        console.log('直接注册模型名称组件');
        WidgetManager.prototype.registerWidget(ModelNameWidget, true);
    }
} catch (e) {
    console.warn('模型名称组件注册延迟，将由主脚本完成', e);
} 