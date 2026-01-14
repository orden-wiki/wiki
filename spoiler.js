// spoiler.js - автоматические спойлеры для изображений и iframe
(function() {
    // Конфигурация
    const config = {
        blurStrength: 25,
        brightness: 0.3,
        animationSpeed: 0.7,
        autoOpen: false,
        excludeSelectors: [
            '.flag',
            '.content-box img',
            '.info-image img',
            '.warning-message img',
            '.logo img',
            'img[width="16"]',
            'img[height="16"]',
            'img[src*="logo"]',
            'img[src*="icon"]'
        ]
    };
    
    let spoilersCreated = false;
    
    // Основная функция
    function initSpoilers() {
        if (spoilersCreated) return;
        spoilersCreated = true;
        
        console.log('Инициализация спойлеров...');
        
        // 1. Сначала скрываем ВСЕ изображения, которые могут стать спойлерами
        hideAllPotentialSpoilers();
        
        // 2. Добавляем CSS
        addSpoilerStyles();
        
        // 3. Добавляем Font Awesome если нет
        if (!document.querySelector('link[href*="font-awesome"]')) {
            addFontAwesome();
        }
        
        // 4. Создаем спойлеры
        setTimeout(() => {
            processImages();
            processIframes();
            addEventListeners();
            
            console.log(`Создано спойлеров: изображений - ${imageCount}, iframe - ${iframeCount}`);
        }, 100);
    }
    
    // ВРЕМЕННО скрываем все потенциальные изображения
    function hideAllPotentialSpoilers() {
        const style = document.createElement('style');
        style.id = 'temp-spoiler-hide';
        style.textContent = `
            /* Временно скрываем изображения, пока не созданы спойлеры */
            img:not(.flag):not(.content-box img):not(.info-image img):not(.warning-message img):not(.logo img) {
                opacity: 0.01 !important;
                visibility: hidden !important;
                transition: none !important;
            }
            
            /* Временно скрываем iframe */
            iframe {
                opacity: 0.01 !important;
                visibility: hidden !important;
                transition: none !important;
            }
            
            /* Исключения - сразу показываем */
            .flag,
            .content-box img,
            .info-image img,
            .warning-message img,
            .logo img,
            img[width="16"],
            img[height="16"] {
                opacity: 1 !important;
                visibility: visible !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Убираем временное скрытие после создания спойлеров
    function removeTempHide() {
        const tempStyle = document.getElementById('temp-spoiler-hide');
        if (tempStyle) {
            setTimeout(() => {
                tempStyle.remove();
            }, 500);
        }
    }
    
    let imageCount = 0;
    let iframeCount = 0;
    
    // Добавляем CSS стили
    function addSpoilerStyles() {
        const style = document.createElement('style');
        style.id = 'spoiler-styles';
        style.textContent = `
            /* Основные стили спойлеров */
            .spoiler-wrapper {
                position: relative;
                display: block;
                margin: 1.5em 0;
                cursor: pointer;
                border: 2px dashed #a2a9b1;
                background: linear-gradient(45deg, #1a1a1a, #2d2d2d);
                overflow: hidden;
                border-radius: 10px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                opacity: 0;
                animation: spoilerFadeIn 0.3s ease forwards;
            }
            
            @keyframes spoilerFadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .spoiler-wrapper:hover {
                border-color: #4dabf7;
                box-shadow: 0 6px 20px rgba(77, 171, 247, 0.4);
                transform: translateY(-2px);
            }
            
            .spoiler-wrapper.revealed {
                border: 2px solid #4CAF50;
                cursor: default;
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            }
            
            /* Оверлей спойлера */
            .spoiler-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, 
                    rgba(20, 30, 48, 0.95), 
                    rgba(36, 59, 85, 0.95));
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: white;
                z-index: 1000;
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                padding: 30px;
                box-sizing: border-box;
                text-align: center;
                backdrop-filter: blur(10px);
            }
            
            .spoiler-overlay:hover {
                background: linear-gradient(135deg, 
                    rgba(30, 40, 58, 0.98), 
                    rgba(46, 69, 95, 0.98));
            }
            
            /* Иконка */
            .spoiler-icon {
                font-size: 3.5rem;
                margin-bottom: 20px;
                color: #4dabf7;
                animation: spoilerPulse 2s infinite ease-in-out;
                text-shadow: 0 0 20px rgba(77, 171, 247, 0.7);
            }
            
            @keyframes spoilerPulse {
                0%, 100% { 
                    transform: scale(1) rotate(0deg); 
                    opacity: 1; 
                }
                50% { 
                    transform: scale(1.1) rotate(5deg); 
                    opacity: 0.9; 
                }
            }
            
            /* Текст оверлея */
            .spoiler-title {
                font-size: 1.5rem;
                font-weight: bold;
                margin-bottom: 10px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                letter-spacing: 0.5px;
            }
            
            .spoiler-action {
                font-size: 1.1rem;
                margin-bottom: 15px;
                color: #ffd700;
                font-weight: 600;
                padding: 8px 20px;
                background: rgba(255, 215, 0, 0.1);
                border-radius: 25px;
                border: 1px solid rgba(255, 215, 0, 0.3);
            }
            
            .spoiler-warning {
                font-size: 0.9rem;
                color: #ff9999;
                margin-bottom: 20px;
                max-width: 80%;
                padding: 10px 15px;
                background: rgba(255, 0, 0, 0.15);
                border-radius: 15px;
                border: 1px solid rgba(255, 100, 100, 0.4);
                line-height: 1.4;
            }
            
            .spoiler-hint {
                font-size: 0.85rem;
                color: #aaa;
                margin-top: 15px;
                opacity: 0.8;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            /* Контент внутри спойлера */
            .spoiler-wrapper img {
                width: 100%;
                height: auto;
                display: block;
                filter: blur(${config.blurStrength}px) 
                       brightness(${config.brightness}) 
                       saturate(0.5);
                transition: filter ${config.animationSpeed}s ease;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            .spoiler-wrapper iframe {
                width: 100%;
                height: 400px;
                display: block;
                filter: blur(${config.blurStrength + 5}px) 
                       brightness(${config.brightness - 0.1}) 
                       grayscale(1);
                transition: all ${config.animationSpeed}s ease;
                pointer-events: none;
                border: none;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            /* Контейнеры сайтов */
            .spoiler-wrapper .site-container {
                filter: blur(${config.blurStrength + 5}px) 
                       brightness(${config.brightness - 0.1});
                transition: filter ${config.animationSpeed}s ease;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            /* Когда спойлер раскрыт */
            .spoiler-wrapper.revealed .spoiler-overlay {
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transform: translateY(-20px);
            }
            
            .spoiler-wrapper.revealed img,
            .spoiler-wrapper.revealed iframe,
            .spoiler-wrapper.revealed .site-container {
                filter: none !important;
            }
            
            .spoiler-wrapper.revealed iframe {
                pointer-events: auto !important;
            }
            
            /* Адаптивность */
            @media (max-width: 768px) {
                .spoiler-icon {
                    font-size: 2.5rem;
                }
                
                .spoiler-title {
                    font-size: 1.2rem;
                }
                
                .spoiler-action {
                    font-size: 1rem;
                    padding: 6px 15px;
                }
                
                .spoiler-wrapper iframe {
                    height: 300px;
                }
                
                .spoiler-overlay {
                    padding: 20px;
                }
            }
            
            @media (max-width: 480px) {
                .spoiler-wrapper iframe {
                    height: 250px;
                }
                
                .spoiler-icon {
                    font-size: 2rem;
                }
                
                .spoiler-title {
                    font-size: 1rem;
                }
            }
            
            /* Убираем временное скрытие для обернутых элементов */
            .spoiler-wrapper img,
            .spoiler-wrapper iframe,
            .spoiler-wrapper .site-container {
                opacity: 1 !important;
                visibility: visible !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Добавляем Font Awesome
    function addFontAwesome() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(link);
    }
    
    // Обрабатываем изображения
    function processImages() {
        // Находим все изображения в основном контенте
        const allImages = document.querySelectorAll('img');
        
        allImages.forEach(img => {
            // Проверяем исключения
            if (shouldExclude(img)) {
                // Для исключенных возвращаем видимость
                img.style.opacity = '1';
                img.style.visibility = 'visible';
                return;
            }
            
            // Пропускаем уже обработанные
            if (img.closest('.spoiler-wrapper')) return;
            
            // Сохраняем текущие стили
            const originalOpacity = img.style.opacity;
            const originalVisibility = img.style.visibility;
            
            // Создаем спойлер
            createImageSpoiler(img);
            imageCount++;
            
            // Восстанавливаем видимость через обертку
            setTimeout(() => {
                img.style.opacity = originalOpacity || '1';
                img.style.visibility = originalVisibility || 'visible';
            }, 50);
        });
    }
    
    // Обрабатываем iframe
    function processIframes() {
        const iframes = document.querySelectorAll('iframe');
        
        iframes.forEach(iframe => {
            if (iframe.closest('.spoiler-wrapper')) return;
            
            // Сохраняем текущие стили
            const originalOpacity = iframe.style.opacity;
            const originalVisibility = iframe.style.visibility;
            
            createIframeSpoiler(iframe);
            iframeCount++;
            
            // Восстанавливаем видимость
            setTimeout(() => {
                iframe.style.opacity = originalOpacity || '1';
                iframe.style.visibility = originalVisibility || 'visible';
            }, 50);
        });
    }
    
    // Проверка на исключения
    function shouldExclude(element) {
        for (const selector of config.excludeSelectors) {
            if (element.matches(selector) || element.closest(selector)) {
                return true;
            }
        }
        
        // Исключаем очень маленькие изображения (иконки)
        if (element.width <= 24 || element.height <= 24) {
            return true;
        }
        
        // Исключаем изображения без src
        if (!element.src || element.src.trim() === '') {
            return true;
        }
        
        // Исключаем base64 изображения (обычно иконки)
        if (element.src.startsWith('data:')) {
            return true;
        }
        
        return false;
    }
    
    // Создаем спойлер для изображения
    function createImageSpoiler(img) {
        const wrapper = document.createElement('div');
        wrapper.className = 'spoiler-wrapper';
        wrapper.dataset.type = 'image';
        wrapper.dataset.src = img.src;
        
        // Сразу применяем фильтры к изображению
        img.style.filter = `blur(${config.blurStrength}px) brightness(${config.brightness}) saturate(0.5)`;
        img.style.transition = `filter ${config.animationSpeed}s ease`;
        
        const overlay = createOverlay('image', {
            title: 'Изображение скрыто',
            warning: 'Смотреть на свой страх и риск'
        });
        
        wrapper.appendChild(overlay);
        
        // Обертываем изображение
        const parent = img.parentNode;
        parent.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        
        // Удаляем временное скрытие для этого элемента
        removeTempHide();
        
        return wrapper;
    }
    
    // Создаем спойлер для iframe
    function createIframeSpoiler(iframe) {
        const wrapper = document.createElement('div');
        wrapper.className = 'spoiler-wrapper';
        wrapper.dataset.type = 'iframe';
        wrapper.dataset.src = iframe.src;
        
        // Сразу применяем фильтры к iframe
        iframe.style.filter = `blur(${config.blurStrength + 5}px) brightness(${config.brightness - 0.1}) grayscale(1)`;
        iframe.style.transition = `all ${config.animationSpeed}s ease`;
        iframe.style.pointerEvents = 'none';
        
        const overlay = createOverlay('iframe', {
            title: 'Внешний контент скрыт',
            warning: 'Смотреть на свой страх и риск'
        });
        
        wrapper.appendChild(overlay);
        
        // Проверяем, если iframe уже в .site-container
        const siteContainer = iframe.closest('.site-container');
        if (siteContainer) {
            // Сразу применяем фильтры к контейнеру
            siteContainer.style.filter = `blur(${config.blurStrength + 5}px) brightness(${config.brightness - 0.1})`;
            siteContainer.style.transition = `filter ${config.animationSpeed}s ease`;
            
            // Обертываем весь контейнер
            const grandParent = siteContainer.parentNode;
            grandParent.insertBefore(wrapper, siteContainer);
            wrapper.appendChild(siteContainer);
        } else {
            // Обертываем только iframe
            const parent = iframe.parentNode;
            parent.insertBefore(wrapper, iframe);
            wrapper.appendChild(iframe);
        }
        
        // Удаляем временное скрытие
        removeTempHide();
        
        return wrapper;
    }
    
    // Создаем оверлей
    function createOverlay(type, texts) {
        const overlay = document.createElement('div');
        overlay.className = 'spoiler-overlay';
        
        const icon = type === 'iframe' ? 'fa-globe' : 'fa-eye';
        
        overlay.innerHTML = `
            <div class="spoiler-icon">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div class="spoiler-title">${texts.title}</div>
            <div class="spoiler-action">Нажмите для просмотра</div>
            
        `;
        
        return overlay;
    }
    
    // Добавляем обработчики событий
    function addEventListeners() {
        document.addEventListener('click', function(e) {
            const spoiler = e.target.closest('.spoiler-wrapper');
            if (spoiler && e.target.closest('.spoiler-overlay')) {
                toggleSpoiler(spoiler);
            }
        });
        
        // Добавляем поддержку клавиатуры
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.spoiler-wrapper.revealed').forEach(spoiler => {
                    spoiler.classList.remove('revealed');
                    const iframe = spoiler.querySelector('iframe');
                    if (iframe) iframe.style.pointerEvents = 'none';
                    
                    const src = spoiler.dataset.src;
                    if (src) {
                        localStorage.removeItem(`spoiler_${btoa(src)}`);
                    }
                });
            }
        });
    }
    
    // Функция переключения спойлера
    function toggleSpoiler(spoiler) {
        const isRevealed = spoiler.classList.contains('revealed');
        
        if (!isRevealed) {
            spoiler.classList.add('revealed');
            
            const iframe = spoiler.querySelector('iframe');
            if (iframe) {
                iframe.style.pointerEvents = 'auto';
                
                setTimeout(() => {
                    spoiler.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 100);
            }
            
            spoiler.style.transform = 'scale(1.02)';
            setTimeout(() => {
                spoiler.style.transform = '';
            }, 300);
            
            const src = spoiler.dataset.src;
            if (src) {
                localStorage.setItem(`spoiler_${btoa(src)}`, 'revealed');
            }
        } else {
            spoiler.classList.remove('revealed');
            const iframe = spoiler.querySelector('iframe');
            if (iframe) iframe.style.pointerEvents = 'none';
        }
    }
    
    // Публичные методы
    window.SpoilerManager = {
        init: function(options = {}) {
            if (options.autoOpen !== undefined) {
                config.autoOpen = options.autoOpen;
            }
            
            // Запускаем сразу, не ждем DOMContentLoaded
            setTimeout(initSpoilers, 10);
        },
        
        toggleAll: function(state) {
            const spoilers = document.querySelectorAll('.spoiler-wrapper');
            spoilers.forEach(spoiler => {
                if (state === 'open') {
                    spoiler.classList.add('revealed');
                    const iframe = spoiler.querySelector('iframe');
                    if (iframe) iframe.style.pointerEvents = 'auto';
                } else if (state === 'close') {
                    spoiler.classList.remove('revealed');
                    const iframe = spoiler.querySelector('iframe');
                    if (iframe) iframe.style.pointerEvents = 'none';
                }
            });
        },
        
        toggle: function(element) {
            if (typeof element === 'string') {
                element = document.querySelector(element);
            }
            if (element && element.classList.contains('spoiler-wrapper')) {
                toggleSpoiler(element);
            }
        },
        
        // Принудительно показать все изображения (для отладки)
        showAllImages: function() {
            const tempStyle = document.getElementById('temp-spoiler-hide');
            if (tempStyle) tempStyle.remove();
            
            const allImages = document.querySelectorAll('img');
            allImages.forEach(img => {
                img.style.opacity = '1';
                img.style.visibility = 'visible';
            });
        }
    };
    
    // Запускаем как можно раньше
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            SpoilerManager.init({ autoOpen: false });
        });
    } else {
        SpoilerManager.init({ autoOpen: false });
    }
})();
