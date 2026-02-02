# 微信云托管 - 捷明达产品目录Web版 Dockerfile
FROM nginx:alpine

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 复制静态文件到nginx默认目录
# 使用 deploy/ 目录作为源
COPY deploy/index.html .
COPY deploy/admin.html .
COPY deploy/cloudbase.config.js .
COPY deploy/cloudbase.full.js .
COPY deploy/tcb.js .
COPY deploy/data/ ./data/
COPY deploy/assets/ ./assets/

# 创建nginx配置文件，支持SPA路由和CORS
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # CORS配置 \
    add_header Access-Control-Allow-Origin "*"; \
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS"; \
    add_header Access-Control-Allow-Headers "Content-Type"; \
    \
    # 静态资源缓存配置 \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # 数据文件缓存配置 \
    location ~* \.(json)$ { \
        expires 1h; \
        add_header Cache-Control "public"; \
    } \
    \
    # 支持前端路由 \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # 安全头设置 \
    add_header X-Frame-Options "SAMEORIGIN"; \
    add_header X-Content-Type-Options "nosniff"; \
    add_header X-XSS-Protection "1; mode=block"; \
}' > /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]