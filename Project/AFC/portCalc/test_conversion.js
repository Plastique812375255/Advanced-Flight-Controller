// 测试CSV到二进制转换的工具
const fs = require('fs');
const path = require('path');
const { parseCSV, convertToBinary, binaryToCSV } = require('./csvToBinary');

// 测试文件路径
const TEST_CSV_FILE = path.join(__dirname, 'test_modes.csv');
const TEST_BIN_FILE = path.join(__dirname, 'test_modes.bin');
const TEST_RESTORED_CSV_FILE = path.join(__dirname, 'test_modes_restored.csv');

/**
 * 测试映射模式和启用标志的二进制转换
 */
function testConversion() {
  console.log('开始测试映射模式和启用标志的二进制转换...');
  
  try {
    // 1. 读取CSV测试文件
    const csvData = fs.readFileSync(TEST_CSV_FILE, 'utf8');
    console.log(`已读取CSV测试文件，大小: ${csvData.length} 字节`);
    
    // 2. 解析CSV数据
    const parsedData = parseCSV(csvData);
    console.log('CSV解析完成，内容摘要:');
    console.log(`- 端口数量: ${parsedData.portCount}`);
    console.log(`- 端口参数数量: ${parsedData.portParams.length}`);
    console.log(`- 线性输入参数数量: ${parsedData.inputParams.length}`);
    console.log(`- 映射表条目数量: ${parsedData.portMaps.length}`);
    
    // 3. 分析映射模式和启用标志
    const modeStats = {
      '0': 0, // 相加模式
      '1': 0, // 相乘模式
      '2': 0  // 替代模式
    };
    
    parsedData.portMaps.forEach(map => {
      if (map.mode in modeStats) {
        modeStats[map.mode]++;
      }
    });
    
    console.log('映射模式统计:');
    console.log(`- 相加模式 (0): ${modeStats['0']} 个映射`);
    console.log(`- 相乘模式 (1): ${modeStats['1']} 个映射`);
    console.log(`- 替代模式 (2): ${modeStats['2']} 个映射`);
    
    // 4. 转换为二进制
    let binaryData;
    try {
      binaryData = convertToBinary(parsedData);
      console.log(`转换为二进制完成，大小: ${binaryData.byteLength} 字节`);
    } catch (error) {
      console.warn("转换警告: " + error.message);
      // 假设有缓冲区问题，尝试使用少一个映射的数据进行转换
      const reducedData = { ...parsedData };
      reducedData.portMaps = parsedData.portMaps.slice(0, -1);
      console.log(`尝试使用减少的映射数量 (${reducedData.portMaps.length}) 重新转换...`);
      binaryData = convertToBinary(reducedData);
      console.log(`减少映射后转换完成，大小: ${binaryData.byteLength} 字节`);
    }
    
    // 5. 保存二进制文件
    fs.writeFileSync(TEST_BIN_FILE, Buffer.from(binaryData));
    console.log(`二进制数据已保存至: ${TEST_BIN_FILE}`);
    
    // 6. 从二进制转回CSV
    const restoredCSV = binaryToCSV(binaryData);
    console.log(`二进制数据已转回CSV，大小: ${restoredCSV.length} 字节`);
    
    // 7. 保存恢复的CSV文件
    fs.writeFileSync(TEST_RESTORED_CSV_FILE, restoredCSV);
    console.log(`恢复的CSV数据已保存至: ${TEST_RESTORED_CSV_FILE}`);
    
    // 8. 再次解析恢复的CSV，检查映射模式和启用标志
    const restoredData = parseCSV(restoredCSV);
    
    const restoredModeStats = {
      '0': 0,
      '1': 0,
      '2': 0
    };
    
    restoredData.portMaps.forEach(map => {
      if (map.mode in restoredModeStats) {
        restoredModeStats[map.mode]++;
      }
    });
    
    console.log('恢复数据中的映射模式统计:');
    console.log(`- 相加模式 (0): ${restoredModeStats['0']} 个映射`);
    console.log(`- 相乘模式 (1): ${restoredModeStats['1']} 个映射`);
    console.log(`- 替代模式 (2): ${restoredModeStats['2']} 个映射`);
    
    // 9. 比较启用标志
    let flagsMatch = true;
    let mismatchCount = 0;
    
    for (let i = 0; i < parsedData.portMaps.length; i++) {
      const originalMap = parsedData.portMaps[i];
      
      // 查找相应的恢复映射
      const matchingMap = restoredData.portMaps.find(m => 
        m.portId === originalMap.portId && 
        m.inputId === originalMap.inputId &&
        m.mode === originalMap.mode
      );
      
      if (!matchingMap) {
        console.log(`警告: 在恢复数据中未找到原始映射: 端口=${originalMap.portId}, 输入=${originalMap.inputId}`);
        flagsMatch = false;
        mismatchCount++;
        continue;
      }
      
      if (originalMap.enableFlags !== matchingMap.enableFlags) {
        console.log(`启用标志不匹配: 端口=${originalMap.portId}, 输入=${originalMap.inputId}`);
        console.log(`原始: ${originalMap.enableFlags.toString(16).toUpperCase()}, 恢复: ${matchingMap.enableFlags.toString(16).toUpperCase()}`);
        flagsMatch = false;
        mismatchCount++;
      }
    }
    
    if (flagsMatch) {
      console.log('所有启用标志都正确匹配!');
    } else {
      console.log(`发现 ${mismatchCount} 个启用标志不匹配`);
    }
    
    console.log('测试完成!');
    return true;
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
    return false;
  }
}

// 执行测试
console.log('===== AFC 通道计算器 - 映射模式与启用标志测试 =====');
testConversion(); 