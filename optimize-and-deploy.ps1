# 性能优化部署脚本
# 运行此脚本来执行完整的性能优化

Write-Host "开始 Hexo 博客性能优化..."

# 清理缓存
Write-Host "清理缓存..."
hexo clean

# 生成静态文件
Write-Host "生成静态文件..."
hexo generate

# 检查生成的文件
Write-Host "检查关键文件是否存在..."
$criticalFiles = @(
    "public/js/performance-optimization.js",
    "public/js/font-optimization.js", 
    "public/js/image-optimization.js",
    "public/css/layout-fix.css"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file 存在" -ForegroundColor Green
    } else {
        Write-Host "✗ $file 缺失" -ForegroundColor Red
    }
}

# 部署
Write-Host "部署到 GitHub Pages..."
hexo deploy

Write-Host "优化完成！建议："
Write-Host "1. 等待几分钟让 CDN 缓存更新"
Write-Host "2. 使用 PageSpeed Insights 重新测试"
Write-Host "3. 检查 Lighthouse 分数改善情况"
Write-Host "4. 如果使用自定义域名，考虑配置服务器缓存头"
