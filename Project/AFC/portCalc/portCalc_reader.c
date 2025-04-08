/**
 * 通道计算器 - 二进制文件读取模块 (C语言版本)
 * 用于读取二进制格式的端口配置文件并转换为CSV格式
 */

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>

#define MAX_PORT_COUNT 100
#define MAX_INPUT_COUNT 36
#define MAX_CSV_LINE_LENGTH 256
#define MAX_CSV_LINES 1000

// 二进制数据结构
typedef struct {
    uint8_t port_id;
    uint8_t port_type;
    uint16_t max_value;
    uint16_t min_value;
    uint16_t mid_value;  // 仅ST类型使用
} PortParam;

typedef struct {
    uint8_t port_id;
    uint8_t input_id;
    uint8_t exp1;
    uint8_t exp2;
    uint8_t rate1;
    uint8_t rate2;
    int8_t offset;
} PortMap;

typedef struct {
    uint16_t port_count;
    PortParam *port_params;
    size_t port_params_count;
    PortMap *port_maps;
    size_t port_maps_count;
} PortCalcData;

// 工具函数 - 读取小端序的16位无符号整数
uint16_t read_uint16_le(const uint8_t *buffer) {
    return (uint16_t)buffer[0] | ((uint16_t)buffer[1] << 8);
}

// 二进制文件读取函数
PortCalcData* read_binary_file(const char *filename) {
    FILE *file = fopen(filename, "rb");
    if (!file) {
        perror("无法打开二进制文件");
        return NULL;
    }
    
    // 获取文件大小
    fseek(file, 0, SEEK_END);
    long file_size = ftell(file);
    fseek(file, 0, SEEK_SET);
    
    // 分配缓冲区读取文件
    uint8_t *buffer = (uint8_t *)malloc(file_size);
    if (!buffer) {
        perror("内存分配失败");
        fclose(file);
        return NULL;
    }
    
    // 读取文件内容到缓冲区
    if (fread(buffer, 1, file_size, file) != (size_t)file_size) {
        perror("文件读取失败");
        free(buffer);
        fclose(file);
        return NULL;
    }
    
    fclose(file);
    
    // 分配数据结构
    PortCalcData *data = (PortCalcData *)malloc(sizeof(PortCalcData));
    if (!data) {
        perror("内存分配失败");
        free(buffer);
        return NULL;
    }
    
    // 解析文件头部
    size_t offset = 0;
    data->port_count = read_uint16_le(buffer + offset);
    offset += 2;
    
    if (data->port_count > MAX_PORT_COUNT) {
        fprintf(stderr, "错误: 接口数量 (%u) 超过最大限制 (%d)\n", 
                data->port_count, MAX_PORT_COUNT);
        free(buffer);
        free(data);
        return NULL;
    }
    
    // 分配端口参数数组
    data->port_params = (PortParam *)malloc(data->port_count * sizeof(PortParam));
    if (!data->port_params) {
        perror("内存分配失败");
        free(buffer);
        free(data);
        return NULL;
    }
    data->port_params_count = data->port_count;
    
    // 读取端口参数
    for (size_t i = 0; i < data->port_count; i++) {
        PortParam *param = &data->port_params[i];
        
        param->port_id = buffer[offset++];
        param->port_type = buffer[offset++];
        param->max_value = read_uint16_le(buffer + offset);
        offset += 2;
        param->min_value = read_uint16_le(buffer + offset);
        offset += 2;
        
        if (param->port_type == 1) { // ST类型需要中位值
            param->mid_value = read_uint16_le(buffer + offset);
            offset += 2;
        } else {
            param->mid_value = 0; // NST类型不使用中位值
        }
    }
    
    // 计算映射表条目数量
    size_t remaining_bytes = file_size - offset;
    size_t map_entry_count = remaining_bytes / 7; // 每个映射7字节
    
    // 分配映射表数组
    data->port_maps = (PortMap *)malloc(map_entry_count * sizeof(PortMap));
    if (!data->port_maps) {
        perror("内存分配失败");
        free(buffer);
        free(data->port_params);
        free(data);
        return NULL;
    }
    data->port_maps_count = map_entry_count;
    
    // 读取映射表
    for (size_t i = 0; i < map_entry_count; i++) {
        PortMap *map = &data->port_maps[i];
        
        map->port_id = buffer[offset++];
        map->input_id = buffer[offset++];
        map->exp1 = buffer[offset++];
        map->exp2 = buffer[offset++];
        map->rate1 = buffer[offset++];
        map->rate2 = buffer[offset++];
        map->offset = (int8_t)buffer[offset++];
    }
    
    free(buffer);
    return data;
}

// 转换为CSV格式
char* convert_to_csv(const PortCalcData *data) {
    if (!data) {
        return NULL;
    }
    
    // 分配CSV缓冲区
    char **csv_lines = (char **)malloc(MAX_CSV_LINES * sizeof(char *));
    if (!csv_lines) {
        perror("内存分配失败");
        return NULL;
    }
    
    for (int i = 0; i < MAX_CSV_LINES; i++) {
        csv_lines[i] = (char *)malloc(MAX_CSV_LINE_LENGTH);
        if (!csv_lines[i]) {
            perror("内存分配失败");
            for (int j = 0; j < i; j++) {
                free(csv_lines[j]);
            }
            free(csv_lines);
            return NULL;
        }
    }
    
    int line_index = 0;
    
    // 写入接口数量
    snprintf(csv_lines[line_index++], MAX_CSV_LINE_LENGTH, 
             "# 接口数量（1-%d）", MAX_PORT_COUNT);
    
    snprintf(csv_lines[line_index++], MAX_CSV_LINE_LENGTH, 
             "PORT_COUNT,%u", data->port_count);
    
    // 空行
    strcpy(csv_lines[line_index++], "");
    
    // 写入接口参数
    snprintf(csv_lines[line_index++], MAX_CSV_LINE_LENGTH, "# 接口参数部分");
    snprintf(csv_lines[line_index++], MAX_CSV_LINE_LENGTH, 
             "# 格式：PORT_PARAM,接口ID,接口类型(0=NST/1=ST),最大值,最小值,[中位值(仅ST类型需要)]");
    
    for (size_t i = 0; i < data->port_params_count; i++) {
        const PortParam *param = &data->port_params[i];
        
        if (param->port_type == 1) { // ST类型
            snprintf(csv_lines[line_index++], MAX_CSV_LINE_LENGTH,
                    "PORT_PARAM,%u,%u,%u,%u,%u",
                    param->port_id, param->port_type, 
                    param->max_value, param->min_value, param->mid_value);
        } else { // NST类型
            snprintf(csv_lines[line_index++], MAX_CSV_LINE_LENGTH,
                    "PORT_PARAM,%u,%u,%u,%u",
                    param->port_id, param->port_type, 
                    param->max_value, param->min_value);
        }
    }
    
    // 空行
    strcpy(csv_lines[line_index++], "");
    
    // 写入映射表
    snprintf(csv_lines[line_index++], MAX_CSV_LINE_LENGTH, "# 映射表部分");
    snprintf(csv_lines[line_index++], MAX_CSV_LINE_LENGTH, 
             "# 格式：PORT_MAP,接口ID,输入ID(1-36),方向1EXP,方向2EXP,方向1舵量,方向2舵量,偏移量");
    
    for (size_t i = 0; i < data->port_maps_count; i++) {
        const PortMap *map = &data->port_maps[i];
        
        snprintf(csv_lines[line_index++], MAX_CSV_LINE_LENGTH,
                "PORT_MAP,%u,%u,%u,%u,%u,%u,%d",
                map->port_id, map->input_id, 
                map->exp1, map->exp2, 
                map->rate1, map->rate2, 
                map->offset);
    }
    
    // 合并所有行到单个字符串
    size_t total_length = 0;
    for (int i = 0; i < line_index; i++) {
        total_length += strlen(csv_lines[i]) + 1; // +1 用于换行符
    }
    
    char *result = (char *)malloc(total_length + 1); // +1 用于结束符
    if (!result) {
        perror("内存分配失败");
        for (int i = 0; i < MAX_CSV_LINES; i++) {
            free(csv_lines[i]);
        }
        free(csv_lines);
        return NULL;
    }
    
    result[0] = '\0'; // 初始化为空字符串
    
    for (int i = 0; i < line_index; i++) {
        strcat(result, csv_lines[i]);
        strcat(result, "\n");
    }
    
    // 释放临时内存
    for (int i = 0; i < MAX_CSV_LINES; i++) {
        free(csv_lines[i]);
    }
    free(csv_lines);
    
    return result;
}

// 释放数据结构
void free_port_calc_data(PortCalcData *data) {
    if (data) {
        if (data->port_params) {
            free(data->port_params);
        }
        if (data->port_maps) {
            free(data->port_maps);
        }
        free(data);
    }
}

// 示例主函数
int main(int argc, char *argv[]) {
    if (argc < 3) {
        printf("用法: %s <二进制文件> <输出CSV文件>\n", argv[0]);
        return 1;
    }
    
    const char *binary_file = argv[1];
    const char *csv_file = argv[2];
    
    // 读取二进制文件
    PortCalcData *data = read_binary_file(binary_file);
    if (!data) {
        fprintf(stderr, "读取二进制文件失败: %s\n", binary_file);
        return 1;
    }
    
    // 转换为CSV
    char *csv_content = convert_to_csv(data);
    if (!csv_content) {
        fprintf(stderr, "转换为CSV格式失败\n");
        free_port_calc_data(data);
        return 1;
    }
    
    // 写入CSV文件
    FILE *output = fopen(csv_file, "w");
    if (!output) {
        perror("无法创建CSV文件");
        free(csv_content);
        free_port_calc_data(data);
        return 1;
    }
    
    fputs(csv_content, output);
    fclose(output);
    
    printf("成功将二进制文件转换为CSV: %s\n", csv_file);
    
    // 释放资源
    free(csv_content);
    free_port_calc_data(data);
    
    return 0;
} 