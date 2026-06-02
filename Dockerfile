# Náttarklubbin — static site served by nginx
FROM nginx:1.27-alpine

# Site server config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static assets
COPY index.html styles.css main.js /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 80
