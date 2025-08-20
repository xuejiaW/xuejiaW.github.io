# 🚀 Cloudflare CDN 加速设置指南

## 1. 注册 Cloudflare 账号
访问：https://www.cloudflare.com/
点击"Sign Up"免费注册

## 2. 添加您的域名
- 登录后点击"Add a Site"
- 输入您的域名：tuncle.blog
- 选择"Free"计划

## 3. 更改 DNS 服务器
Cloudflare 会提供两个 DNS 服务器，例如：
- ray.ns.cloudflare.com
- sara.ns.cloudflare.com

在您的域名注册商处（如阿里云、腾讯云等）将 DNS 服务器改为 Cloudflare 提供的地址。

## 4. 优化设置（重要！）
在 Cloudflare 控制面板中启用以下优化：

### Speed 标签页：
- ✅ Auto Minify: CSS, JavaScript, HTML 全部勾选
- ✅ Brotli: 启用
- ✅ Rocket Loader: 启用
- ✅ Mirage: 启用

### Caching 标签页：
- ✅ Caching Level: Standard
- ✅ Browser Cache TTL: 4 hours
- ✅ Always Online: 启用

### Network 标签页：
- ✅ HTTP/2: 启用
- ✅ HTTP/3 (with QUIC): 启用
- ✅ 0-RTT Connection Resumption: 启用

## 预期效果：
- 🚀 全球访问速度提升 30-70%
- 📦 自动压缩和优化
- 🛡️ DDoS 防护和安全增强
- 📊 详细的访问统计
