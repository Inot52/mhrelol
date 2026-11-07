document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. ЛОГИКА СМЕНЫ ФОНОВ (с приближением) ---
    const bg1 = document.querySelector('.bg1');
    const bg2 = document.querySelector('.bg2');
    let currentBg = 1;

    setInterval(() => {
        if (currentBg === 1) {
            bg1.classList.remove('active');
            bg2.classList.add('active');
            currentBg = 2;
        } else {
            bg2.classList.remove('active');
            bg1.classList.add('active');
            currentBg = 1;
        }
    }, 12000); // 12 секунд

    // --- 2. ЛОГИКА АНИМАЦИИ БУКВ "Загрузка:" ---
    const textContainer = document.getElementById('animated-text');
    const text = "Загрузка:";
    textContainer.innerHTML = ''; 
    const spans = [];

    for(let i = 0; i < text.length; i++) {
        let span = document.createElement('span');
        span.innerText = text[i];
        textContainer.appendChild(span);
        spans.push(span);
    }

    async function animateLoadingText() {
        while(true) {
            for(let i = 0; i < spans.length; i++) {
                spans[i].style.opacity = 1;
                await new Promise(r => setTimeout(r, 100)); 
            }
            await new Promise(r => setTimeout(r, 3000));
            for(let i = 0; i < spans.length; i++) {
                spans[i].style.opacity = 0;
                await new Promise(r => setTimeout(r, 100));
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    animateLoadingText();

    // --- 3. НАДЁЖНЫЙ ЗАПУСК АУДИО ---
    const bgMusic = document.getElementById('bg-music');
    bgMusic.volume = 0.5; // Настраиваем начальную громкость (50%)

    // Функция воспроизведения
    function playAudio() {
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                console.log("Музыка успешно воспроизводится");
            }).catch(error => {
                console.log("Автозапуск заблокирован браузером. Ожидание взаимодействия...");
            });
        }
    }

    // Пробуем запустить сразу
    playAudio();

    // Резервный запуск: если человек открыл в браузере и кликнул по экрану
    document.body.addEventListener('click', () => {
        playAudio();
    }, { once: true });
});

// ==========================================
// --- GARRY'S MOD API (ИНТЕГРАЦИЯ) ---
// ==========================================

let filesTotal = 0;
let filesNeeded = 0;
const progressBar = document.querySelector('.loading-bar-fill');
const onlineCountElement = document.querySelector('.online-count');

function updateProgressBar() {
    let percentage = 0;
    if (filesTotal > 0) {
        percentage = ((filesTotal - filesNeeded) / filesTotal) * 100;
    }
    percentage = Math.max(0, Math.min(percentage, 100));
    
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
}

window.SetFilesTotal = function(total) {
    filesTotal = total;
    updateProgressBar();
};

window.SetFilesNeeded = function(needed) {
    filesNeeded = needed;
    updateProgressBar();
};

// Вызывается GMod'ом при подключении к серверу
window.GameDetails = function(servername, serverurl, mapname, maxplayers, steamid, gamemode, volume, language) {
    const bgMusic = document.getElementById('bg-music');
    
    // Включаем музыку при вызове этой функции движком GMod
    if (bgMusic) {
        if (volume !== undefined && volume !== null) {
            bgMusic.volume = volume; // Берем громкость из настроек GMod
        }
        bgMusic.play().catch(e => console.log("GMod Audio Play Error:", e));
    }

    // Отображение онлайна/слотов
    if (onlineCountElement) {
        onlineCountElement.innerText = maxplayers;
    }
};

window.SetStatusChanged = function(status) {
    if (filesTotal === 0 && progressBar) {
        progressBar.style.width = '100%';
    }
    
    // Пробуем запустить музыку еще и при смене статуса загрузки
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic && bgMusic.paused) {
        bgMusic.play().catch(() => {});
    }
};

window.DownloadingFile = function(fileName) {};