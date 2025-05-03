/**
 * 模型图片组件 - 4x3 组件，显示模型图片
 */
class ModelImageWidget extends BaseWidget {
    renderContent() {
        // 使用占位图URL（这里使用在线直升机图片）
        const imageUrl = 'https://img.freepik.com/free-vector/helicopter-isolated_1284-42282.jpg'; 
        
        this.element.innerHTML = `
            <div class="widget-content" style="display: flex; align-items: center; justify-content: center; padding: 0; overflow: hidden; height: 100%;">
                <img src="${imageUrl}" alt="直升机图片" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                <div id="imageLoadError" style="display: none; color: #f44336; text-align: center; padding: 20px;">
                    图片加载失败<br>
                    <button onclick="document.getElementById('modelImage').src='${imageUrl}'; this.parentNode.style.display='none';" style="margin-top: 10px; padding: 5px 10px;">
                        重试
                    </button>
                </div>
            </div>
        `;
        
        // 添加图片加载错误处理
        const img = this.element.querySelector('img');
        img.id = 'modelImage';
        img.onerror = function() {
            document.getElementById('imageLoadError').style.display = 'block';
            this.style.display = 'none';
        };
    }
    
    static getMetadata() {
        return {
            id: 'system.model-image',
            name: '模型图片',
            description: '4x3 模型图片显示组件',
            width: 4,
            height: 3
        };
    }
}

// 注册到全局
window.ModelImageWidget = ModelImageWidget;

// 尝试直接注册组件
try {
    if (typeof WidgetManager !== 'undefined') {
        console.log('直接注册模型图片组件');
        WidgetManager.prototype.registerWidget(ModelImageWidget, true);
    }
} catch (e) {
    console.warn('模型图片组件注册延迟，将由主脚本完成', e);
} 