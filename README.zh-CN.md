# Scrutiny UI

[![CI](https://github.com/AlliotTech/scrutiny-ui/actions/workflows/ci-pages.yml/badge.svg)](https://github.com/AlliotTech/scrutiny-ui/actions/workflows/ci-pages.yml)
[![Release](https://img.shields.io/github/v/release/AlliotTech/scrutiny-ui?display_name=tag)](https://github.com/AlliotTech/scrutiny-ui/releases)
[![License](https://img.shields.io/github/license/AlliotTech/scrutiny-ui)](LICENSE)

这是 Scrutiny 的独立前端，基于 Next.js（App Router）、React、TypeScript、Tailwind 和 shadcn/ui。

---
**语言:** [English](README.md) | 中文
---

- 演示地址: https://alliottech.github.io/scrutiny-ui/
- 贡献指南: `CONTRIBUTING.md`

## 截图
<p float="left">
  <img src="screenshot/dashboard.png" width="32%" />
  <img src="screenshot/device.png" width="32%" />
  <img src="screenshot/setting.png" width="32%" />
</p>

## 快速开始
```bash
pnpm install
pnpm dev
```
访问 `http://localhost:3000`。

## 构建
```bash
pnpm build
```
当 `NEXT_OUTPUT=export` 时，静态文件输出到 `out/`。

## 下载（Release）
```bash
curl -L -o scrutiny-web-frontend.tar.gz https://github.com/AlliotTech/scrutiny-ui/releases/latest/download/scrutiny-web-frontend.tar.gz
tar -xzf scrutiny-web-frontend.tar.gz -C ./data/web
```

## 快速替换部署
确保 `web` 服务挂载静态目录：
```yaml
services:
  web:
    image: 'ghcr.io/analogj/scrutiny:master-web'
    ports:
      - '8080:8080'
    volumes:
      - './data/config:/opt/scrutiny/config'
      - './data/web:/opt/scrutiny/web:ro' # <- 静态文件挂载位置
    environment:
      SCRUTINY_WEB_INFLUXDB_HOST: 'influxdb'
    depends_on:
      influxdb:
        condition: service_healthy
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 5s
      timeout: 10s
      retries: 20
      start_period: 10s
```

下载并替换静态文件：
```bash
curl -L -o scrutiny-web-frontend.tar.gz https://github.com/AlliotTech/scrutiny-ui/releases/latest/download/scrutiny-web-frontend.tar.gz
tar -xzf scrutiny-web-frontend.tar.gz -C ./data/web
```

## 路由
- 设备详情使用查询参数：`/device?wwn=...`（用于静态导出）

## 环境变量
- `NEXT_PUBLIC_USE_MOCKS=true|false` 启用 MSW mock（开发/演示）
- `NEXT_PUBLIC_BASE_PATH=/web` 部署在 `/web` 时使用
- `NEXT_OUTPUT=export` 开启静态导出到 `out/`

## API
所有请求都是相对当前域名：
- `GET /api/summary`
- `GET /api/summary/temp?duration_key=week|month|year|forever`
- `GET /api/device/:wwn/details?duration_key=...`
- `POST /api/device/:wwn/archive`
- `POST /api/device/:wwn/unarchive`
- `DELETE /api/device/:wwn`
- `GET /api/settings`
- `POST /api/settings`
- `GET /api/health`
- `POST /api/health/notify`

## 测试
```bash
pnpm test
pnpm test:ui
```

## 部署
- GitHub Pages 演示使用 mock 数据，构建自 `main`。
- 生产静态包由 release tag 构建，部署目标为 `/web`。

## 项目结构
```
app/(dashboard)/page.tsx
app/device/page.tsx
app/settings/page.tsx
components/ui/*
components/dashboard/*
components/device/*
components/settings/*
lib/api.ts
lib/i18n/*
lib/types.ts
lib/format.ts
```

## 说明
- i18n 仅客户端生效（无语言前缀路由），语言保存在 localStorage。
- 若 UI 与后端不同域名，需要配置后端 CORS。
