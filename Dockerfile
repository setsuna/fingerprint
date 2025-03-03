# 依赖阶段 - 安装所有依赖
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 构建阶段 - 构建Next.js应用
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 修改next.config.js确保生成standalone输出
# 如果你的next.config.js已经包含此配置，可以跳过此步骤
RUN if [ -f next.config.js ]; then \
      sed -i '/module.exports/c\module.exports = { output: "standalone", ...(' "$(cat next.config.js)" || {} })' next.config.js; \
    else \
      echo 'module.exports = { output: "standalone" }' > next.config.js; \
    fi

RUN npm run build

# 运行阶段 - 只包含生产所需文件
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# 确保非root用户运行
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# 复制必要文件
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 设置应用端口
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 启动应用
CMD ["node", "server.js"]