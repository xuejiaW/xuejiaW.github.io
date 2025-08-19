/**
 * Performance Optimization Script
 * 页面性能优化：DNS预取、关键CSS内联、异步CSS加载
 */

(function() {
    'use strict';
    
    // DNS预取和预连接
    function addDNSPrefetch() {
        const prefetchLinks = [
            { rel: 'dns-prefetch', href: '//cdn.jsdelivr.net' },
            { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: true },
            { rel: 'dns-prefetch', href: '//www.googletagmanager.com' },
            { rel: 'preconnect', href: 'https://www.googletagmanager.com' },
            { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
        ];
        
        prefetchLinks.forEach(linkConfig => {
            const link = document.createElement('link');
            Object.entries(linkConfig).forEach(([key, value]) => {
                if (key === 'crossorigin' && value) {
                    link.setAttribute('crossorigin', '');
                } else {
                    link[key] = value;
                }
            });
            document.head.appendChild(link);
        });
    }
    
    // 关键CSS内联
    function addCriticalCSS() {
        const criticalCSS = `
        /* 关键CSS - 仅包含首屏渲染必需的样式 */
        :root{--global-bg:#fff;--font-color:#363636;--hr-border:#a4d8fa;--hr-before-color:#49b1f5;--search-bg:#f7f7fa;--search-input-color:#464646;--search-result-title:#4c4948;--preloader-bg:#37474f;--preloader-color:#fff;--tab-border-color:#f0f0f0;--tab-button-bg:#f7f7fa;--tab-button-active-bg:#fff;--card-bg:#fff;--sidebar-bg:#f7f7fa;--btn-hover-color:#ff7242;--btn-color:#fff;--btn-bg:#49b1f5;--text-bg-hover:#49b1f5;--light-grey:#eee;--dark-grey:#999;--white:#fff;--text-highlight-color:#1f2d3d;--blockquote-color:#6a737d;--blockquote-bg:#fafafa}
        *,*::before,*::after{box-sizing:border-box}
        body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Lato,Roboto,"PingFang SC","Microsoft YaHei",sans-serif;font-size:14px;line-height:2;color:var(--font-color);background:var(--global-bg);overflow-wrap:break-word}
        #web_bg{position:fixed;top:0;left:0;width:100%;height:100%;z-index:-999;background:var(--global-bg)}
        .layout{min-height:100vh}
        #header{position:relative;background:var(--card-bg);animation:header-effect 1s}
        #nav{position:relative;display:flex;align-items:center;justify-content:space-between;padding:0 36px;transition:all .3s}
        #nav .site-name{font-size:1.1rem;font-weight:bold;color:var(--font-color)}
        #content-inner{min-height:calc(100vh - 60px)}
        .loading{position:fixed;top:0;left:0;width:100%;height:100%;background:var(--preloader-bg);z-index:9999;display:flex;align-items:center;justify-content:center;color:var(--preloader-color)}
        /* 防止布局偏移 */
        .site-meta .avatar{width:110px;height:110px;min-width:110px;min-height:110px}
        .site-meta .avatar img{width:100%;height:100%;object-fit:cover;background-color:#f0f0f0}
        .menus_items{min-height:50px}
        /* 字体优化 */
        @font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:900;font-display:swap}
        @font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:400;font-display:swap}
        @font-face{font-family:"Font Awesome 6 Brands";font-style:normal;font-weight:400;font-display:swap}
        @keyframes header-effect{0%{opacity:0;transform:translateY(-20px)}100%{opacity:1;transform:translateY(0)}}
        `;
        
        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.appendChild(style);
    }
    
    // 异步加载CSS
    function loadCSSAsync(href, media = 'all') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print';
        link.onload = function() {
            this.media = media;
            this.onload = null;
        };
        document.head.appendChild(link);
        
        // 为不支持JavaScript的浏览器提供fallback
        const noscript = document.createElement('noscript');
        const fallbackLink = document.createElement('link');
        fallbackLink.rel = 'stylesheet';
        fallbackLink.href = href;
        noscript.appendChild(fallbackLink);
        document.head.appendChild(noscript);
    }
    
    // 主初始化函数
    function init() {
        // 检查当前语言环境
        const isEnglish = window.location.pathname.startsWith('/en');
        const cssPath = isEnglish ? '/en/css/index.css' : '/css/index.css';
        
        // 执行优化步骤
        addDNSPrefetch();
        addCriticalCSS();
        loadCSSAsync(cssPath);
        loadCSSAsync('https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free/css/all.min.css');
    }
    
    // 当DOM准备就绪时执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
