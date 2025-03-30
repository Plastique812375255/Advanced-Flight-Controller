## Advanced-Flight-Controller
A new kind of RC remote controller which includes intelligent receiver that can optionally add functions.  
Use Android as the UI user machine to control the upper **microcontroller** for operation.  
Most calculations are based on the RX, with the TX transmitting only the sticks and switchs positions as much as possible.  
Inspiration source: **Vbar Control**. *Thank you, Mikado*.  
**Warning: Cause I'm Chinese, although I have worked in English for many years, but my partner cannot use English as Americans. So there will be a large number of Mandarin. Get used to that. I will add the translation.**  
  
## AFC遥控器主页面  
使用安卓作为UI用户机，控制上层的**单片机**进行工作。  
大部分计算基于接收端，发射端尽可能只传递摇杆与开关位置。  
灵感来源：**Vbar Control**。*谢谢你，Mikado*。  


## AFC主要模块（随时更新，纯属C4教主个人脑回路）
1. 安卓+H5作为上位机。
2. 发射端使用F7主控。控制本身不经过UI，UI只负责调参。
3. 接收端使用啥再说。

## 功能实现与扩展性
1. 所有功能实现基于机型设计。
2. 每个机型对应一组调试向导、参数控制。
3. 除此之外还有所有机型均有的菜单（关联菜单与系统菜单）

## 机型数据
1. D机型ID
2. D机型名称
3. A接口功能
4. A映射表
5. A输出重映射
6. A飞行模式数据
7. A曲线
8. A额外参数
