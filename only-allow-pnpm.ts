#!/usr/bin/env node

// 此脚本确保只能使用pnpm作为包管理器
const userAgent: string = process.env.npm_config_user_agent || '';

if (!userAgent.includes('pnpm')) {
  console.error('\x1b[31m%s\x1b[0m', '请使用pnpm作为包管理器!');
  console.error('\x1b[31m%s\x1b[0m', '安装方法: npm install -g pnpm');
  console.error('\x1b[31m%s\x1b[0m', '正确用法: pnpm install');
  process.exit(1);
}
