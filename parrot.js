// Ждем полной загрузки страницы, чтобы body был доступен
document.addEventListener('DOMContentLoaded', function() {
    // 1. Создаем элемент изображения
    const parrot = document.createElement('img');
    
    // 2. Устанавливаем начальные пути (папка images должна быть в корне)
    parrot.src = 'images/parrot.png';
    parrot.alt = 'Попугай';
    
    // 3. Добавляем стили через JS для закрепления в углу
    Object.assign(parrot.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '50px', // Размер попугая
        zIndex: '10000', // Чтобы был поверх всех элементов
        cursor: 'pointer',
        transition: 'transform 0.2s',
        
        // Убираем синее выделение и подсветку при клике
        userSelect: 'none',
        webkitUserSelect: 'none',
        msUserSelect: 'none',
        webkitTapHighlightColor: 'transparent',
        outline: 'none'
    });

    // Эффект легкого увеличения при наведении мышки
    parrot.onmouseover = () => parrot.style.transform = 'scale(1.1)';
    parrot.onmouseout = () => parrot.style.transform = 'scale(1)';

    // 4. Логика переключения картинок при нажатии
    parrot.addEventListener('click', function() {
        // Проверяем, что сейчас отображается .png
        if (this.src.toLowerCase().endsWith('parrot.png')) {
            this.src = 'images/parrot.gif';
        } else {
            this.src = 'images/parrot.png';
        }
    });

    // 5. Добавляем попугая на страницу
    document.body.appendChild(parrot);
});

