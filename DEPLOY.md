# HeyGem.ai 部署指南

本文档提供了 HeyGem.ai Web 应用的部署指南。本应用支持使用 Docker 和传统方式部署。

## 环境要求

- Node.js 16+ (开发和构建)
- Nginx (传统部署)
- Docker & Docker Compose (容器化部署)

## 生产环境变量

生产环境变量已经配置在 `.env.production` 文件中，如果需要修改 API 地址，请相应调整该文件。

## 部署方式一：使用 Docker

### 构建并启动容器

```bash
# 构建镜像
docker build -t heygem-web .

# 运行容器
docker run -d -p 80:80 --name heygem-web-app heygem-web
```

### 使用 Docker Compose

创建 `docker-compose.yml` 文件：

```yaml
version: '3'
services:
  heygem-web:
    build: .
    ports:
      - "80:80"
    restart: always
```

然后运行：

```bash
docker-compose up -d
```

## 部署方式二：传统部署

### 1. 构建应用

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 2. 配置 Nginx

将 `nginx.conf` 文件复制到 Nginx 的配置目录：

```bash
sudo cp nginx.conf /etc/nginx/sites-available/heygem
sudo ln -s /etc/nginx/sites-available/heygem /etc/nginx/sites-enabled/
```

### 3. 部署静态资源

将构建生成的 `dist` 目录复制到服务器：

```bash
sudo mkdir -p /var/www/heygem
sudo cp -r dist/* /var/www/heygem/dist/
```

### 4. 启动 Nginx

```bash
sudo systemctl restart nginx
```

## 检查部署

访问您的域名或服务器 IP 地址，确认应用是否正常运行。

## 故障排除

1. **API 跨域问题**：确保 Nginx 配置中的代理设置正确。
2. **静态资源无法加载**：检查路径配置和文件权限。
3. **Nginx 错误**：查看 Nginx 错误日志 `/var/log/nginx/error.log`。

## 性能优化

- 启用 Nginx Gzip 压缩
- 配置适当的缓存策略
- 考虑使用 CDN 加速静态资源

如有任何部署问题，请联系技术支持。
