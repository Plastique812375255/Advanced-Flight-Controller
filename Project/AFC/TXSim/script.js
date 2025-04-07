// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取摇杆元素
    const joystick1 = document.getElementById('joystick1');
    const joystick1Knob = document.getElementById('joystick1-knob');
    const joystick2 = document.getElementById('joystick2');
    const joystick2Knob = document.getElementById('joystick2-knob');
    
    // 获取数据显示元素
    const joystick1XData = document.getElementById('joystick1-x-data');
    const joystick1YData = document.getElementById('joystick1-y-data');
    const joystick2XData = document.getElementById('joystick2-x-data');
    const joystick2YData = document.getElementById('joystick2-y-data');
    
    // 摇杆数据
    let joystick1Pos = { x: 0, y: 0 };
    let joystick2Pos = { x: 0, y: 0 };
    
    // 初始化摇杆位置
    resetJoystick(joystick1, joystick1Knob, { x: 0, y: 0 });
    resetJoystick(joystick2, joystick2Knob, { x: 0, y: 0 });
    
    // 处理第一个摇杆的拖动（上下不回中，左右回中）
    initJoystick(joystick1, joystick1Knob, joystick1Pos, joystick1XData, joystick1YData, true, false);
    
    // 处理第二个摇杆的拖动（全部回中）
    initJoystick(joystick2, joystick2Knob, joystick2Pos, joystick2XData, joystick2YData, true, true);
    
    // 初始化所有滑块
    for (let i = 1; i <= 16; i++) {
        initSlider(i);
    }
    
    // 初始化所有开关
    initSwitches();
});

/**
 * 初始化摇杆控制
 * @param {HTMLElement} joystickFrame - 摇杆框架元素
 * @param {HTMLElement} joystickKnob - 摇杆旋钮元素
 * @param {Object} posRef - 位置引用对象
 * @param {HTMLElement} xDataElement - X数据显示元素
 * @param {HTMLElement} yDataElement - Y数据显示元素
 * @param {boolean} resetXOnRelease - 释放时是否重置X位置
 * @param {boolean} resetYOnRelease - 释放时是否重置Y位置
 */
function initJoystick(joystickFrame, joystickKnob, posRef, xDataElement, yDataElement, resetXOnRelease, resetYOnRelease) {
    let isDragging = false;
    
    // 监听鼠标按下事件
    joystickKnob.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });
    
    // 监听鼠标移动事件
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const rect = joystickFrame.getBoundingClientRect();
            const frameWidth = rect.width;
            const frameHeight = rect.height;
            
            // 计算摇杆位置（相对于摇杆框架中心）
            let x = e.clientX - rect.left - frameWidth / 2;
            let y = e.clientY - rect.top - frameHeight / 2;
            
            // 限制摇杆在框架内
            const maxDistance = frameWidth / 2 - joystickKnob.offsetWidth / 2;
            const distance = Math.sqrt(x * x + y * y);
            
            if (distance > maxDistance) {
                const ratio = maxDistance / distance;
                x *= ratio;
                y *= ratio;
            }
            
            // 更新摇杆位置
            moveJoystick(joystickFrame, joystickKnob, { x, y });
            
            // 更新位置引用
            posRef.x = x;
            posRef.y = y;
            
            // 计算并显示摇杆数值（-2048 到 2048）
            const valueX = Math.round(x / maxDistance * 2048);
            const valueY = Math.round(-y / maxDistance * 2048); // 注意Y轴是反的
            
            xDataElement.textContent = valueX;
            yDataElement.textContent = valueY;
        }
    });
    
    // 监听鼠标松开事件
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            
            // 根据摇杆类型处理回中
            if (resetXOnRelease && resetYOnRelease) {
                // 全部回中
                resetJoystick(joystickFrame, joystickKnob, { x: 0, y: 0 });
                posRef.x = 0;
                posRef.y = 0;
                xDataElement.textContent = 0;
                yDataElement.textContent = 0;
            } else if (resetXOnRelease && !resetYOnRelease) {
                // 仅X回中
                resetJoystick(joystickFrame, joystickKnob, { x: 0, y: posRef.y });
                posRef.x = 0;
                xDataElement.textContent = 0;
            } else if (!resetXOnRelease && resetYOnRelease) {
                // 仅Y回中
                resetJoystick(joystickFrame, joystickKnob, { x: posRef.x, y: 0 });
                posRef.y = 0;
                yDataElement.textContent = 0;
            }
        }
    });
    
    // 监听鼠标离开事件
    document.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            
            // 同样根据摇杆类型处理回中
            if (resetXOnRelease && resetYOnRelease) {
                resetJoystick(joystickFrame, joystickKnob, { x: 0, y: 0 });
                posRef.x = 0;
                posRef.y = 0;
                xDataElement.textContent = 0;
                yDataElement.textContent = 0;
            } else if (resetXOnRelease && !resetYOnRelease) {
                resetJoystick(joystickFrame, joystickKnob, { x: 0, y: posRef.y });
                posRef.x = 0;
                xDataElement.textContent = 0;
            } else if (!resetXOnRelease && resetYOnRelease) {
                resetJoystick(joystickFrame, joystickKnob, { x: posRef.x, y: 0 });
                posRef.y = 0;
                yDataElement.textContent = 0;
            }
        }
    });
}

/**
 * 移动摇杆到指定位置
 * @param {HTMLElement} joystickFrame - 摇杆框架元素
 * @param {HTMLElement} joystickKnob - 摇杆旋钮元素
 * @param {Object} pos - 位置对象 {x, y}
 */
function moveJoystick(joystickFrame, joystickKnob, pos) {
    const frameCenter = {
        x: joystickFrame.offsetWidth / 2,
        y: joystickFrame.offsetHeight / 2
    };
    
    joystickKnob.style.left = (frameCenter.x + pos.x - joystickKnob.offsetWidth / 2) + 'px';
    joystickKnob.style.top = (frameCenter.y + pos.y - joystickKnob.offsetHeight / 2) + 'px';
}

/**
 * 重置摇杆位置
 * @param {HTMLElement} joystickFrame - 摇杆框架元素
 * @param {HTMLElement} joystickKnob - 摇杆旋钮元素
 * @param {Object} pos - 位置对象 {x, y}
 */
function resetJoystick(joystickFrame, joystickKnob, pos) {
    const frameCenter = {
        x: joystickFrame.offsetWidth / 2,
        y: joystickFrame.offsetHeight / 2
    };
    
    joystickKnob.style.left = (frameCenter.x + pos.x - joystickKnob.offsetWidth / 2) + 'px';
    joystickKnob.style.top = (frameCenter.y + pos.y - joystickKnob.offsetHeight / 2) + 'px';
}

/**
 * 初始化滑块
 * @param {number} index - 滑块索引
 */
function initSlider(index) {
    const slider = document.getElementById(`slider${index}`);
    const sliderValue = document.getElementById(`slider${index}-value`);
    const sliderData = document.getElementById(`slider${index}-data`);
    
    // 更新初始值
    sliderValue.textContent = slider.value;
    sliderData.textContent = slider.value;
    
    // 监听滑块变化
    slider.addEventListener('input', () => {
        sliderValue.textContent = slider.value;
        sliderData.textContent = slider.value;
    });
}

/**
 * 初始化所有开关
 */
function initSwitches() {
    const switchButtons = document.querySelectorAll('.switch-btn');
    
    switchButtons.forEach(button => {
        button.addEventListener('click', () => {
            const switchId = button.getAttribute('data-switch');
            const value = button.getAttribute('data-value');
            
            // 移除同组开关的活动状态
            document.querySelectorAll(`.switch-btn[data-switch="${switchId}"]`).forEach(btn => {
                btn.classList.remove('active');
            });
            
            // 添加当前开关的活动状态
            button.classList.add('active');
            
            // 更新数值显示
            const switchValue = document.getElementById(`switch${switchId}-value`);
            const switchData = document.getElementById(`switch${switchId}-data`);
            
            switchValue.textContent = value;
            switchData.textContent = value;
        });
    });
} 