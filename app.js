document.addEventListener('DOMContentLoaded', () => {
    // Елементи UI
    const themeToggleBtn = document.getElementById('theme-toggle');
    const syncBtn = document.getElementById('sync-btn');
    const syncStatusText = document.getElementById('sync-status');
    const authModal = document.getElementById('auth-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const savePatBtn = document.getElementById('save-pat');
    const patInput = document.getElementById('github-pat-input');
    const authError = document.getElementById('auth-error');

    // Ключ для збереження токена в локальному сховищі браузера
    const STORAGE_KEY = 'multix_github_pat';

    // 1. Управління темою
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
    });

    // 2. Управління модальним вікном
    syncBtn.addEventListener('click', () => {
        patInput.value = localStorage.getItem(STORAGE_KEY) || '';
        authError.classList.add('hidden');
        authModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        authModal.classList.add('hidden');
    });

    // 3. Збереження та перевірка GitHub PAT
    savePatBtn.addEventListener('click', async () => {
        const token = patInput.value.trim();
        
        if (!token) {
            showError("Будь ласка, введіть токен.");
            return;
        }

        savePatBtn.textContent = "Перевірка...";
        savePatBtn.disabled = true;

        try {
            // Тестовий запит до GitHub API для перевірки токена
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                
                // Якщо все добре - зберігаємо локально
                localStorage.setItem(STORAGE_KEY, token);
                
                // Оновлюємо UI (Стиль MULTIX: Зелений = Синхронізовано)
                syncBtn.className = 'btn outline green';
                syncStatusText.textContent = `Sync: ${userData.login}`;
                
                authModal.classList.add('hidden');
            } else {
                showError("Невірний токен або немає доступу. Код: " + response.status);
            }
        } catch (error) {
            showError("Помилка мережі при спробі зв'язатися з GitHub.");
        } finally {
            savePatBtn.textContent = "Зберегти та Перевірити";
            savePatBtn.disabled = false;
        }
    });

    function showError(message) {
        authError.textContent = message;
        authError.classList.remove('hidden');
    }

    // 4. Ініціалізація при завантаженні
    const savedToken = localStorage.getItem(STORAGE_KEY);
    if (savedToken) {
        syncStatusText.textContent = "Токен збережено (?)";
        syncBtn.className = 'btn outline yellow'; // Жовтий означає: токен є, але ще не перевіряли в цій сесії
    }
});
