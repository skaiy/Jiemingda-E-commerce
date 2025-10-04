# 微信云托管极简 Dockerfile
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY src/ .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]