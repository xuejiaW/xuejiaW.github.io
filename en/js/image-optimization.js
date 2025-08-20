/**
 * 图片优化脚本 - 防止 LCP 延迟
 */
(function() {
    'use strict';
    
    // 为 LCP 图片添加 fetchpriority="high"
    function optimizeLCPImage() {
        const avatar = document.querySelector('img[src="/img/avatar.jpg"]');
        if (avatar) {
            // 添加高优先级
            avatar.setAttribute('fetchpriority', 'high');
            // 预设尺寸防止 CLS
            avatar.setAttribute('width', '110');
            avatar.setAttribute('height', '110');
            // 添加 loading="eager" 避免延迟加载
            avatar.setAttribute('loading', 'eager');
        }
    }
    
    // 优化其他图片
    function optimizeImages() {
        const images = document.querySelectorAll('img:not([src="/img/avatar.jpg"])');
        images.forEach(img => {
            // 为非关键图片启用原生延迟加载
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            // 添加解码优化
            img.setAttribute('decoding', 'async');
        });
    }
    
    // 预加载关键图片
    function preloadCriticalImages() {
        const criticalImages = ['/img/avatar.jpg'];
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            link.setAttribute('fetchpriority', 'high');
            document.head.appendChild(link);
        });
    }
    
    // 初始化
    function init() {
        preloadCriticalImages();
        optimizeLCPImage();
        optimizeImages();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
