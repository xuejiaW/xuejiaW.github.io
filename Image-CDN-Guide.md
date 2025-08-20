# 📸 图片 CDN 加速方案

## 1. 图床 + CDN 组合（最简单）

### A. GitHub + jsDelivr（免费推荐）
将图片上传到 GitHub 仓库，通过 jsDelivr 访问：

```markdown
<!-- 原来的图片路径 -->
![avatar](/img/avatar.jpg)

<!-- 优化后的 CDN 路径 -->
![avatar](https://cdn.jsdelivr.net/gh/xuejiaW/xuejiaW.github.io@source/source-zh/img/avatar.jpg)
```

### B. 七牛云图床（国内用户推荐）
- 🆓 免费额度充足
- 🚀 自动压缩优化
- 📱 自动 WebP 转换

### C. 腾讯云 COS + CDN
- 💎 企业级稳定性
- 🔧 智能压缩
- 📊 详细统计

## 2. 自动化图片优化脚本

创建一个脚本来自动替换图片链接为 CDN 链接：

```javascript
// 自动替换图片为 CDN 链接
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[src^="/"]');
    images.forEach(img => {
        const cdnUrl = 'https://cdn.jsdelivr.net/gh/xuejiaW/xuejiaW.github.io@source/source-zh' + img.src;
        img.src = cdnUrl;
    });
});
```

## 3. WebP 格式优化
- 🗜️ 体积减少 25-50%
- 🚀 加载速度显著提升
- 🌐 现代浏览器支持良好

预期效果：
- 📈 图片加载速度提升 40-70%
- 💾 节省带宽 30-50%
- 📱 移动端体验大幅改善
