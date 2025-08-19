/**
 * 字体加载优化脚本
 */
(function() {
    'use strict';
    
    // 添加字体显示优化
    function optimizeFontDisplay() {
        // 为 FontAwesome 字体添加 font-display: swap
        const fontAwesomeCSS = `
        @font-face {
            font-family: "Font Awesome 6 Free";
            font-style: normal;
            font-weight: 900;
            font-display: swap;
        }
        @font-face {
            font-family: "Font Awesome 6 Free";
            font-style: normal;
            font-weight: 400;
            font-display: swap;
        }
        @font-face {
            font-family: "Font Awesome 6 Brands";
            font-style: normal;
            font-weight: 400;
            font-display: swap;
        }
        `;
        
        const style = document.createElement('style');
        style.textContent = fontAwesomeCSS;
        document.head.appendChild(style);
    }
    
    // 预加载关键字体
    function preloadFonts() {
        const fontLinks = [
            'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/webfonts/fa-solid-900.woff2',
            'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/webfonts/fa-brands-400.woff2',
            'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/webfonts/fa-regular-400.woff2'
        ];
        
        fontLinks.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            link.href = url;
            document.head.appendChild(link);
        });
    }
    
    // 初始化
    function init() {
        optimizeFontDisplay();
        preloadFonts();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
