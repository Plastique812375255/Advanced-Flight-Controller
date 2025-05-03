#!/bin/bash

# 设置变量
ASSETS_DIR="app/src/main/assets"
HTML_DIR="$ASSETS_DIR/html"
BACKUP_DIR="$ASSETS_DIR/html_backup_$(date +%Y%m%d_%H%M%S)"

# 确保脚本在AFCUI目录下运行
if [ ! -d "$ASSETS_DIR" ]; then
  echo "错误: 找不到assets目录，请确保在AFCUI目录下运行此脚本"
  exit 1
fi

# 创建备份目录
echo "备份当前HTML文件..."
if [ -d "$HTML_DIR" ]; then
  mkdir -p "$BACKUP_DIR"
  cp -r "$HTML_DIR"/* "$BACKUP_DIR"
  echo "已将当前HTML文件备份到 $BACKUP_DIR"
  
  # 清空html目录（但保留目录结构）
  echo "清空html目录..."
  rm -rf "$HTML_DIR"/*
else
  echo "未找到html目录，将创建新目录"
  mkdir -p "$HTML_DIR"
fi

echo "目录准备完成，现在可以将Vue构建文件放入 $HTML_DIR 目录"
echo "请运行以下命令构建Vue项目:"
echo "  cd frontend"
echo "  npm run build  # 或 yarn build"
echo ""
echo "构建完成后，运行Android Studio重新编译应用" 