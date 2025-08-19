#!/usr/bin/env pwsh
# Git 优化推送脚本

Write-Host "🚀 开始优化推送..." -ForegroundColor Green

# 1. 压缩仓库
Write-Host "📦 压缩Git仓库..." -ForegroundColor Yellow
git gc --aggressive --prune=now

# 2. 检查仓库大小
Write-Host "📊 检查仓库大小..." -ForegroundColor Yellow
$repoSize = (Get-ChildItem -Path .git -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "仓库大小: $([Math]::Round($repoSize, 2)) MB" -ForegroundColor Cyan

# 3. 分批推送（如果有很多提交）
$commits = git rev-list --count origin/source..HEAD
if ($commits -gt 10) {
    Write-Host "⚡ 检测到 $commits 个待推送提交，将分批推送..." -ForegroundColor Yellow
    
    # 推送前几个提交
    $halfway = [Math]::Floor($commits / 2)
    git push origin source~$halfway:source --force-with-lease
    
    Write-Host "⏳ 等待5秒..." -ForegroundColor Yellow
    Start-Sleep 5
    
    # 推送剩余提交
    git push origin source
} else {
    Write-Host "🔄 直接推送..." -ForegroundColor Yellow
    git push origin source
}

Write-Host "✅ 推送完成！" -ForegroundColor Green
