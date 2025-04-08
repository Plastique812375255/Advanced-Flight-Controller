/**
 * 通道计算器 - CSV到二进制文件转换模块
 * 用于将端口配置的CSV文件转换为压缩的二进制文件
 */

// 文件结构常量
const MAX_PORT_COUNT = 100;
const MAX_INPUT_COUNT = 36;
const LINEAR_INPUT_COUNT = 20; // 线性输入数量
const FILE_HEADER = "AFC"; // 3字节文件头
const MODEL_NAME_LENGTH = 15; // 模型名称长度
const MAX_GEARS = 16; // 最大档位数量

// 映射模式常量
const MAP_MODE_ADD = 0;      // 相加模式
const MAP_MODE_MULTIPLY = 1; // 相乘模式
const MAP_MODE_REPLACE = 2;  // 替代模式

/**
 * 将CSV文本解析为结构化数据
 * @param {string} csvText - CSV文件内容
 * @returns {Object} 解析后的结构化数据
 */
function parseCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') {
    throw new Error('CSV内容无效：必须提供有效的CSV文本');
  }
  
  const lines = csvText.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  if (lines.length === 0) {
    throw new Error('CSV内容为空：未找到有效数据行');
  }
  
  const result = {
    modelName: "默认模型",    // 默认模型名称
    modelId: 0,              // 默认模型ID
    gearCount: 1,            // 默认档位数量
    portCount: 0,
    portParams: [],
    portMaps: [],
    inputParams: [], // 线性输入参数
    warnings: []
  };
  
  let hasPortCountLine = false;
  let hasModelInfoLine = false;
  
  lines.forEach((line, lineIndex) => {
    const parts = line.split(',').map(part => part.trim());
    const recordType = parts[0];
    
    if (recordType === 'MODEL_INFO') {
      if (hasModelInfoLine) {
        throw new Error('CSV格式错误：多次定义MODEL_INFO');
      }
      
      if (parts.length < 4) {
        throw new Error(`CSV格式错误：MODEL_INFO行(第${lineIndex+1}行)参数不足，需要4个参数`);
      }
      
      // 解析模型名称（最多15个字符）
      result.modelName = parts[1].substring(0, MODEL_NAME_LENGTH);
      
      // 解析模型ID
      const modelId = parseInt(parts[2], 10);
      if (isNaN(modelId)) {
        throw new Error(`CSV格式错误：模型ID(${parts[2]})无效，应为整数`);
      }
      result.modelId = modelId;
      
      // 解析档位数量
      const gearCount = parseInt(parts[3], 10);
      if (isNaN(gearCount) || gearCount < 1 || gearCount > MAX_GEARS) {
        throw new Error(`CSV格式错误：档位数量(${parts[3]})无效，应在1-${MAX_GEARS}之间`);
      }
      result.gearCount = gearCount;
      
      hasModelInfoLine = true;
    } 
    else if (recordType === 'PORT_COUNT') {
      if (hasPortCountLine) {
        throw new Error('CSV格式错误：多次定义PORT_COUNT');
      }
      
      if (parts.length < 2) {
        throw new Error('CSV格式错误：PORT_COUNT行缺少接口数量值');
      }
      
      const countValue = parts[1];
      if (!/^\d+$/.test(countValue)) {
        throw new Error(`CSV格式错误：接口数量"${countValue}"不是有效的整数`);
      }
      
      result.portCount = parseInt(parts[1], 10);
      if (result.portCount < 1 || result.portCount > MAX_PORT_COUNT) {
        throw new Error(`接口数量必须在1-${MAX_PORT_COUNT}之间，当前值：${result.portCount}`);
      }
      
      hasPortCountLine = true;
    } 
    else if (recordType === 'PORT_PARAM') {
      if (!hasPortCountLine) {
        throw new Error('CSV格式错误：在定义PORT_COUNT之前发现PORT_PARAM');
      }
      
      if (parts.length < 5) {
        throw new Error(`CSV格式错误：PORT_PARAM行(第${lineIndex+1}行)参数不足`);
      }
      
      const portId = parseInt(parts[1], 10);
      if (isNaN(portId) || portId < 1 || portId > result.portCount) {
        throw new Error(`CSV格式错误：接口ID(${parts[1]})无效，应在1-${result.portCount}之间`);
      }
      
      // 检查是否已经定义了这个接口
      if (result.portParams.some(param => param.portId === portId)) {
        throw new Error(`CSV格式错误：接口ID(${portId})重复定义`);
      }
      
      const portType = parseInt(parts[2], 10);
      if (isNaN(portType) || (portType !== 0 && portType !== 1)) {
        throw new Error(`CSV格式错误：接口类型(${parts[2]})无效，应为0或1`);
      }
      
      const maxValue = parseInt(parts[3], 10);
      if (isNaN(maxValue)) {
        throw new Error(`CSV格式错误：接口${portId}的最大值(${parts[3]})无效`);
      }
      
      const minValue = parseInt(parts[4], 10);
      if (isNaN(minValue) || minValue > maxValue) {
        throw new Error(`CSV格式错误：接口${portId}的最小值(${parts[4]})无效`);
      }
      
      let midValue = null;
      
      if (portType === 1) { // ST类型需要中位值
        if (parts.length < 6) {
          throw new Error(`CSV格式错误：ST类型接口(ID:${portId})需要提供中位值`);
        }
        
        midValue = parseInt(parts[5], 10);
        if (isNaN(midValue) || midValue < minValue || midValue > maxValue) {
          throw new Error(`CSV格式错误：接口${portId}的中位值(${parts[5]})超出范围[${minValue}, ${maxValue}]`);
        }
      }
      
      result.portParams.push({
        portId,
        portType,
        maxValue,
        minValue,
        midValue
      });
    } 
    else if (recordType === 'INPUT_PARAM') {
      if (!hasPortCountLine) {
        throw new Error('CSV格式错误：在定义PORT_COUNT之前发现INPUT_PARAM');
      }
      
      if (parts.length < 7) {
        throw new Error(`CSV格式错误：INPUT_PARAM行(第${lineIndex+1}行)参数不足，需要7个参数`);
      }
      
      const inputId = parseInt(parts[1], 10);
      if (isNaN(inputId) || inputId < 1 || inputId > LINEAR_INPUT_COUNT) {
        throw new Error(`CSV格式错误：线性输入ID(${parts[1]})无效，应在1-${LINEAR_INPUT_COUNT}之间`);
      }
      
      // 检查是否已经定义了这个输入
      if (result.inputParams.some(param => param.inputId === inputId)) {
        throw new Error(`CSV格式错误：线性输入ID(${inputId})重复定义`);
      }
      
      const exp = parseInt(parts[2], 10);
      if (isNaN(exp) || exp < -100 || exp > 100) {
        throw new Error(`CSV格式错误：线性输入${inputId}的EXP值(${parts[2]})无效，应在-100到100之间`);
      }
      
      const travelUp = parseInt(parts[3], 10);
      if (isNaN(travelUp) || travelUp < 0 || travelUp > 200) {
        throw new Error(`CSV格式错误：线性输入${inputId}的行程上值(${parts[3]})无效，应在0-200之间`);
      }
      
      const travelDown = parseInt(parts[4], 10);
      if (isNaN(travelDown) || travelDown < 0 || travelDown > 200) {
        throw new Error(`CSV格式错误：线性输入${inputId}的行程下值(${parts[4]})无效，应在0-200之间`);
      }
      
      const center = parseInt(parts[5], 10);
      if (isNaN(center) || center < -100 || center > 100) {
        throw new Error(`CSV格式错误：线性输入${inputId}的中位点值(${parts[5]})无效，应在-100到100之间`);
      }
      
      const offset = parseInt(parts[6], 10);
      if (isNaN(offset) || offset < -100 || offset > 100) {
        throw new Error(`CSV格式错误：线性输入${inputId}的偏移值(${parts[6]})无效，应在-100到100之间`);
      }
      
      result.inputParams.push({
        inputId,
        exp,
        travelUp,
        travelDown,
        center,
        offset
      });
    }
    else if (recordType === 'PORT_MAP') {
      if (!hasPortCountLine) {
        throw new Error('CSV格式错误：在定义PORT_COUNT之前发现PORT_MAP');
      }
      
      // 检查必要的参数数量（现在需要12个参数，增加了启用状态）
      if (parts.length < 12) {
        result.warnings.push(`警告: 第${lineIndex+1}行映射表参数不足，应该有12个参数，实际只有${parts.length}个`);
        return;
      }
      
      const portId = parseInt(parts[1]);
      if (isNaN(portId) || portId < 1 || portId > result.portCount) {
        result.warnings.push(`警告: 第${lineIndex+1}行接口ID无效: ${parts[1]}`);
        return;
      }
      
      const inputId = parseInt(parts[2]);
      if (isNaN(inputId) || inputId < 1 || inputId > MAX_INPUT_COUNT) {
        result.warnings.push(`警告: 第${lineIndex+1}行输入ID无效: ${parts[2]}`);
        return;
      }
      
      const exp1 = Math.max(0, Math.min(100, parseInt(parts[3]) || 0));
      const exp2 = Math.max(0, Math.min(100, parseInt(parts[4]) || 0));
      const rate1 = Math.max(0, Math.min(100, parseInt(parts[5]) || 0));
      const rate2 = Math.max(0, Math.min(100, parseInt(parts[6]) || 0));
      const offsetValue = Math.max(-100, Math.min(100, parseInt(parts[7]) || 0));
      const delay = Math.max(0, Math.min(10000, parseInt(parts[8]) || 0));
      const speed = Math.max(0, Math.min(100, parseInt(parts[9]) || 0));
      
      // 解析映射模式参数
      const mode = parseInt(parts[10]);
      const validMode = (mode === MAP_MODE_ADD || mode === MAP_MODE_MULTIPLY || mode === MAP_MODE_REPLACE) 
          ? mode 
          : MAP_MODE_ADD; // 如果模式无效，默认使用相加模式
      
      // 解析启用状态（16位二进制数，表示在每个档位下是否启用）
      let enableFlags;
      try {
        enableFlags = parseInt(parts[11], 16); // 解析为16进制
        if (isNaN(enableFlags)) {
          throw new Error(`无效的启用标志: ${parts[11]}`);
        }
      } catch (e) {
        enableFlags = 0xFFFF; // 默认在所有档位下启用
        result.warnings.push(`警告: 第${lineIndex+1}行启用标志无效，默认在所有档位下启用`);
      }
      
      // 验证档位范围
      const maxAllowedGear = (1 << result.gearCount) - 1;
      if (enableFlags > maxAllowedGear) {
        result.warnings.push(`警告: 第${lineIndex+1}行启用标志超出档位范围，已自动调整`);
        enableFlags &= maxAllowedGear; // 只保留有效档位数量的位
      }
      
      result.portMaps.push({
        portId,
        inputId,
        exp1,
        exp2,
        rate1,
        rate2,
        offset: offsetValue,
        delay,
        speed,
        mode: validMode,
        enableFlags // 新增：启用状态
      });
    } else {
      throw new Error(`CSV格式错误：未知记录类型"${recordType}"(第${lineIndex+1}行)`);
    }
  });
  
  if (!hasPortCountLine) {
    throw new Error('CSV格式错误：缺少PORT_COUNT行');
  }
  
  // 如果没有设置模型信息，使用默认值
  if (!hasModelInfoLine) {
    result.warnings.push('警告: 缺少MODEL_INFO行，使用默认值');
  }
  
  // 检查每个接口是否都有对应的参数配置
  const configuredPorts = new Set(result.portParams.map(param => param.portId));
  const mappedPorts = new Set(result.portMaps.map(map => map.portId));
  
  for (let portId = 1; portId <= result.portCount; portId++) {
    if (!configuredPorts.has(portId)) {
      throw new Error(`CSV格式错误：接口${portId}没有参数配置`);
    }
    if (!mappedPorts.has(portId)) {
      console.warn(`警告: 接口${portId}没有映射输入`);
    }
  }
  
  return result;
}

/**
 * 将解析后的数据转换为二进制格式
 * @param {Object} data - 解析后的结构化数据
 * @returns {ArrayBuffer} 二进制数据
 */
function convertToBinary(data) {
  console.log("开始转换为二进制");
  
  // 计算二进制文件所需的总字节数
  // 1. 文件头: 3字节 "AFC"
  // 2. 模型名称: 15字节
  // 3. 模型ID: 4字节
  // 4. 档位数量: 1字节
  // 5. 接口数量: 2字节
  const headerSize = 3 + MODEL_NAME_LENGTH + 4 + 1 + 2;
  
  // 6. 接口参数
  const portParamSize = data.portParams.length * 8;
  
  // 7. 线性输入参数
  const inputParamSize = LINEAR_INPUT_COUNT * 5;
  
  // 8. 映射表
  const mapTableSize = data.portMaps.length * 12;
  
  // 总大小 (确保至少有一个映射的额外空间)
  const totalSize = headerSize + portParamSize + inputParamSize + mapTableSize + 12;
  
  console.log(`计算二进制文件大小: 总计${totalSize}字节 = 头部${headerSize} + 端口参数${portParamSize} + 线性输入${inputParamSize} + 映射表${mapTableSize}`);
  
  // 创建二进制缓冲区
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  
  // 写入文件头 "AFC"
  view.setUint8(0, 65); // 'A'
  view.setUint8(1, 70); // 'F'
  view.setUint8(2, 67); // 'C'
  
  // 写入模型名称 (15字节)
  const encoder = new TextEncoder();
  const modelNameBytes = encoder.encode(data.modelName.padEnd(MODEL_NAME_LENGTH, ' '));
  for (let i = 0; i < MODEL_NAME_LENGTH; i++) {
    view.setUint8(3 + i, i < modelNameBytes.length ? modelNameBytes[i] : 32); // 32是空格的ASCII码
  }
  
  // 写入模型ID (4字节)
  view.setUint32(3 + MODEL_NAME_LENGTH, data.modelId, true);
  
  // 写入档位数量 (1字节)
  view.setUint8(3 + MODEL_NAME_LENGTH + 4, data.gearCount);
  
  // 写入端口数量 (2字节)
  view.setUint16(3 + MODEL_NAME_LENGTH + 4 + 1, data.portCount, true);
  
  let offset = headerSize; // 当前写入位置
  
  // 写入接口参数
  for (let i = 0; i < data.portParams.length; i++) {
    const param = data.portParams[i];
    
    // 1字节接口ID
    view.setUint8(offset, param.portId);
    offset += 1;
    
    // 1字节接口类型
    view.setUint8(offset, param.portType);
    offset += 1;
    
    // 2字节最大值
    view.setUint16(offset, param.maxValue, true);
    offset += 2;
    
    // 2字节最小值
    view.setUint16(offset, param.minValue, true);
    offset += 2;
    
    // 2字节中位值
    if (param.portType === 1) { // ST类型
      view.setUint16(offset, param.midValue, true);
    } else {
      view.setUint16(offset, 0, true); // NST类型没有中位值，写入0
    }
    offset += 2;
  }
  
  // 更新偏移量表示我们在二进制文件中的当前位置
  console.log(`端口参数写入完成，当前偏移量: ${offset}`);
  
  // 写入线性输入参数
  for (let inputId = 1; inputId <= LINEAR_INPUT_COUNT; inputId++) {
    const input = data.inputParams.find(p => p.inputId === inputId);
    
    if (input) {
      view.setInt8(offset, input.exp);
      view.setUint8(offset + 1, input.travelUp);
      view.setUint8(offset + 2, input.travelDown);
      view.setInt8(offset + 3, input.center);
      view.setInt8(offset + 4, input.offset);
    } else {
      // 未定义的线性输入使用默认值
      view.setInt8(offset, 0); // EXP
      view.setUint8(offset + 1, 100); // 行程上
      view.setUint8(offset + 2, 100); // 行程下
      view.setInt8(offset + 3, 0); // 中位点
      view.setInt8(offset + 4, 0); // 偏移
    }
    
    offset += 5;
  }
  
  console.log(`线性输入参数写入完成，当前偏移量: ${offset}`);
  
  // 写入映射表
  for (let i = 0; i < data.portMaps.length; i++) {
    const map = data.portMaps[i];
    
    // 检查剩余空间
    if (offset + 12 > buffer.byteLength) {
      console.error(`错误：无法写入映射#${i+1}，缓冲区大小不足，当前偏移量=${offset}，缓冲区大小=${buffer.byteLength}`);
      break;
    }
    
    // 写入端口ID (1字节)
    view.setUint8(offset, map.portId);
    offset += 1;
    
    // 写入输入ID (1字节)
    view.setUint8(offset, map.inputId);
    offset += 1;
    
    // 写入方向1 EXP (1字节)
    view.setUint8(offset, map.exp1);
    offset += 1;
    
    // 写入方向2 EXP (1字节)
    view.setUint8(offset, map.exp2);
    offset += 1;
    
    // 写入方向1舵量 (1字节)
    view.setUint8(offset, map.rate1);
    offset += 1;
    
    // 写入方向2舵量 (1字节)
    view.setUint8(offset, map.rate2);
    offset += 1;
    
    // 写入偏移量 (1字节 - 有符号)
    view.setInt8(offset, map.offset);
    offset += 1;
    
    // 写入延迟 (2字节)
    view.setUint16(offset, map.delay, true);
    offset += 2;
    
    // 写入速度 (1字节)
    view.setUint8(offset, map.speed);
    offset += 1;
    
    // 写入映射模式 (1字节)
    view.setUint8(offset, map.mode);
    offset += 1;
    
    // 写入启用标志 (2字节)
    view.setUint16(offset, map.enableFlags, true);
    offset += 2;
    
    console.log(`写入映射#${i+1}: 端口=${map.portId}, 输入=${map.inputId}, 模式=${map.mode}, 启用标志=0x${map.enableFlags.toString(16).padStart(4, '0')}`);
  }
  
  console.log(`二进制转换完成，总共${buffer.byteLength}字节，实际写入${offset}字节`);
  
  return buffer;
}

/**
 * 将二进制数据转换回CSV格式
 * @param {ArrayBuffer} buffer - 二进制数据
 * @returns {string} CSV文本
 */
function binaryToCSV(buffer) {
  console.log(`开始从二进制数据转换为CSV，总共${buffer.byteLength}字节`);
  
  if (!(buffer instanceof ArrayBuffer)) {
    throw new Error('无效的二进制数据：必须提供ArrayBuffer');
  }
  
  // 检查数据大小
  if (buffer.byteLength < 25) { // 至少需要文件头(3) + 模型名称(15) + 模型ID(4) + 档位数量(1) + 端口数量(2)
    throw new Error('二进制数据格式无效：文件太小，无法读取文件头和必要信息');
  }
  
  const view = new DataView(buffer);
  
  // 读取文件头 (3字节)
  const decoder = new TextDecoder();
  const headerBytes = new Uint8Array(buffer, 0, 3);
  const fileHeader = decoder.decode(headerBytes);
  
  if (fileHeader !== FILE_HEADER) {
    throw new Error(`无效的文件头：${fileHeader}，应为${FILE_HEADER}`);
  }
  
  // 读取模型名称 (15字节)
  const modelNameBytes = new Uint8Array(buffer, 3, MODEL_NAME_LENGTH);
  let modelName = decoder.decode(modelNameBytes).trim();
  
  // 读取模型ID (4字节)
  const modelId = view.getUint32(3 + MODEL_NAME_LENGTH, true);
  
  // 读取档位数量 (1字节)
  const gearCount = view.getUint8(3 + MODEL_NAME_LENGTH + 4);
  
  // 读取端口数量 (2字节)
  const portCount = view.getUint16(3 + MODEL_NAME_LENGTH + 4 + 1, true);
  console.log(`读取文件头: 模型=${modelName}, ID=${modelId}, 档位=${gearCount}, 端口=${portCount}`);
  
  // 验证端口数量
  if (portCount < 1 || portCount > MAX_PORT_COUNT) {
    throw new Error(`无效的端口数量：${portCount}，应在1-${MAX_PORT_COUNT}之间`);
  }
  
  // 准备CSV行
  const csvLines = [
    '# 模型信息',
    `MODEL_INFO,${modelName},${modelId},${gearCount}`,
    '',
    `# 接口数量（1-${MAX_PORT_COUNT}）`,
    `PORT_COUNT,${portCount}`,
    '',
    '# 接口参数部分',
    '# 格式：PORT_PARAM,接口ID,接口类型(0=NST/1=ST),最大值,最小值,[中位值(仅ST类型需要)]'
  ];
  
  let offset = 3 + MODEL_NAME_LENGTH + 4 + 1 + 2; // 跳过头部信息
  
  // 读取接口参数
  const portParams = [];
  for (let i = 0; i < portCount; i++) {
    // 检查是否有足够的数据
    if (offset + 8 > buffer.byteLength) {
      console.warn(`警告：接口参数数据不足，预期${portCount}个接口，实际只能读取${i}个`);
      break;
    }
    
    const portId = view.getUint8(offset);
    offset += 1;
    
    const portType = view.getUint8(offset);
    offset += 1;
    
    // 使用getInt16读取有符号数
    const maxValue = view.getInt16(offset, true);
    offset += 2;
    
    const minValue = view.getInt16(offset, true);
    offset += 2;
    
    let midValue = 0;
    if (portType === 1) { // ST类型
      midValue = view.getInt16(offset, true);
    } else {
      // 跳过中位值字段
      midValue = null;
    }
    offset += 2;
    
    portParams.push({
      portId,
      portType,
      maxValue,
      minValue,
      midValue
    });
    
    // 添加到CSV行
    if (portType === 1) { // ST类型
      csvLines.push(`PORT_PARAM,${portId},${portType},${maxValue},${minValue},${midValue}`);
    } else {
      csvLines.push(`PORT_PARAM,${portId},${portType},${maxValue},${minValue}`);
    }
  }
  
  console.log(`读取了${portCount}个端口参数，当前偏移量: ${offset}`);
  
  // 添加线性输入参数部分
  csvLines.push('', '# 线性输入参数部分');
  csvLines.push('# 格式：INPUT_PARAM,输入ID,EXP,行程上,行程下,中位点,偏移');
  
  // 读取线性输入参数
  for (let inputId = 1; inputId <= LINEAR_INPUT_COUNT; inputId++) {
    // 确保有5字节可读
    if (offset + 5 > buffer.byteLength) {
      console.warn(`警告：数据不足，无法读取线性输入#${inputId}，提前结束`);
      break;
    }
    
    const exp = view.getInt8(offset);
    const travelUp = view.getUint8(offset + 1);
    const travelDown = view.getUint8(offset + 2);
    const center = view.getInt8(offset + 3);
    const inputOffset = view.getInt8(offset + 4);
    
    csvLines.push(`INPUT_PARAM,${inputId},${exp},${travelUp},${travelDown},${center},${inputOffset}`);
    offset += 5;
  }
  
  console.log(`读取了线性输入参数，当前偏移量: ${offset}`);
  
  // 读取映射表
  let mappingCount = 0;
  const mapEntrySize = 12; // 每个映射条目12字节
  const maxMappings = Math.floor((buffer.byteLength - offset) / mapEntrySize);
  
  csvLines.push('', '# 映射表部分');
  csvLines.push('# 格式：PORT_MAP,接口ID,输入ID,方向1EXP,方向2EXP,方向1舵量,方向2舵量,偏移量,延迟,速度,映射模式(0=相加/1=相乘/2=替代),启用标志(16进制)');
  
  for (let i = 0; i < maxMappings; i++) {
    if (offset + mapEntrySize > buffer.byteLength) break;
    
    const startOffset = offset;
    
    // 读取端口ID (1字节)
    const portId = view.getUint8(offset);
    offset += 1;
    
    // 验证端口ID
    if (portId < 1 || portId > portCount) {
      console.warn(`警告：映射条目引用了无效的端口ID：${portId}，跳过此条目`);
      offset = startOffset + mapEntrySize; // 跳到下一条目
      continue;
    }
    
    // 读取输入ID (1字节)
    const inputId = view.getUint8(offset);
    offset += 1;
    
    // 验证输入ID
    if (inputId < 1 || inputId > MAX_INPUT_COUNT) {
      console.warn(`警告：映射条目包含无效的输入ID：${inputId}，跳过此条目`);
      offset = startOffset + mapEntrySize; // 跳到下一条目
      continue;
    }
    
    // 读取方向1 EXP (1字节)
    const exp1 = view.getUint8(offset);
    offset += 1;
    
    // 读取方向2 EXP (1字节)
    const exp2 = view.getUint8(offset);
    offset += 1;
    
    // 读取方向1舵量 (1字节)
    const rate1 = view.getUint8(offset);
    offset += 1;
    
    // 读取方向2舵量 (1字节)
    const rate2 = view.getUint8(offset);
    offset += 1;
    
    // 读取偏移量 (1字节 - 有符号)
    const mapOffset = view.getInt8(offset);
    offset += 1;
    
    // 读取延迟 (2字节)
    const delay = view.getUint16(offset, true);
    offset += 2;
    
    // 读取速度 (1字节)
    const speed = view.getUint8(offset);
    offset += 1;
    
    // 读取映射模式 (1字节)
    const mode = view.getUint8(offset);
    offset += 1;
    
    // 读取启用标志 (2字节)
    const enableFlags = view.getUint16(offset, true);
    offset += 2;
    
    // 验证映射模式
    const validMode = (mode >= 0 && mode <= 2) ? mode : 0;
    
    // 启用标志以16进制形式表示
    const enableFlagsHex = enableFlags.toString(16).padStart(4, '0').toUpperCase();
    
    csvLines.push(`PORT_MAP,${portId},${inputId},${exp1},${exp2},${rate1},${rate2},${mapOffset},${delay},${speed},${validMode},${enableFlagsHex}`);
    mappingCount++;
    
    console.log(`读取映射#${mappingCount}: 端口=${portId}, 输入=${inputId}, 模式=${validMode}, 启用标志=0x${enableFlagsHex}`);
  }
  
  console.log(`读取了${mappingCount}个映射条目，二进制到CSV转换完成`);
  
  return csvLines.join('\n');
}

/**
 * 将CSV文件转换为二进制文件
 * @param {string} csvText - CSV文件内容
 * @returns {ArrayBuffer} 二进制数据
 */
function csvToBinary(csvText) {
  try {
    // 预处理CSV数据 - 检查明显的大小问题
    const lineCount = (csvText.match(/\n/g) || []).length + 1;
    if (lineCount > 10000) {
      console.warn(`警告：CSV文件包含${lineCount}行，这可能会导致较大的二进制文件`);
    }
    
    // 尝试解析CSV数据
    const data = parseCSV(csvText);
    
    // 安全检查 - 确保端口ID的连续性（1到N）
    const portIds = data.portParams.map(param => param.portId).sort((a, b) => a - b);
    for (let i = 0; i < portIds.length; i++) {
      if (portIds[i] !== i + 1) {
        throw new Error(`CSV数据错误：接口ID不连续，预期ID ${i+1}，实际ID ${portIds[i]}`);
      }
    }
    
    // 安全检查 - 确保线性输入ID的有效性
    if (data.inputParams.length > 0) {
      const inputIds = data.inputParams.map(param => param.inputId);
      for (const inputId of inputIds) {
        if (inputId < 1 || inputId > LINEAR_INPUT_COUNT) {
          throw new Error(`CSV数据错误：线性输入ID(${inputId})无效，应在1-${LINEAR_INPUT_COUNT}之间`);
        }
      }
    }
    
    // 额外验证：检查档位数量是否在合理范围内
    if (data.gearCount < 1 || data.gearCount > MAX_GEARS) {
      throw new Error(`CSV数据错误：档位数量(${data.gearCount})无效，应在1-${MAX_GEARS}之间`);
    }
    
    // 最大大小检查 - 防止内存溢出
    if (buffer.byteLength > 1000000) { // 1MB
      throw new Error(`生成的二进制文件过大(${(buffer.byteLength/1024/1024).toFixed(2)}MB)，超出合理范围`);
    }
    
    // 转换为二进制格式
    try {
      return convertToBinary(data);
    } catch (conversionError) {
      throw new Error(`二进制转换失败：${conversionError.message}`);
    }
  } catch (error) {
    // 在错误消息中添加更多上下文信息
    console.error("CSV转换错误:", error);
    throw new Error(`CSV转换失败：${error.message}`);
  }
}

// 如果在浏览器环境中
if (typeof window !== 'undefined') {
  window.portCalc = {
    csvToBinary,
    binaryToCSV,
    parseCSV
  };
}

// 如果在Node.js环境中
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    csvToBinary,
    binaryToCSV,
    parseCSV,
    convertToBinary
  };
} 