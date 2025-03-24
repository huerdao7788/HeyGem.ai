# 构建阶段
FROM node:18 as build-stage

WORKDIR /app

# 设置pnpm
RUN npm install -g pnpm@8.x

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
COPY .npmrc ./

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 生产阶段
FROM nginx:stable-alpine as production-stage

# 复制自定义nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建结果到nginx
COPY --from=build-stage /app/dist /var/www/heygem/dist

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
