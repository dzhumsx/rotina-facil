// ===========================
// Rotina Fácil - Main Script
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    //Testar conexão com o servidor
    fetch("https://rotina-facil-production.up.railway.app:8080/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teste: "olá do client!" })
    })
        .then(res => res.json())
        .then(data => console.log("Resposta do webhook:", data))
        .catch(err => console.error("Erro ao conectar:", err));

    // Testar nova rota GET /api/message
    fetch("https://rotina-facil-production.up.railway.app:8080/api/message")
        .then(res => res.text())
        .then(data => console.log("Resposta do servidor (/api/message):", data))
        .catch(err => console.error("Erro ao conectar na API:", err));

    initCalendar();
    initViewToggle();
    initTaskInteractions();
    initChatAssistant();
    initSidebarInteractions();



});

// ===========================
// CALENDAR
// ===========================

const MONTHS_PT = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const WEEKDAYS_PT = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
];

const WEEKDAYS_SHORT_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

let currentDate = new Date();
let selectedDate = new Date();

// Set to April 23 to match the design
selectedDate.setMonth(3); // April (0-indexed)
selectedDate.setDate(23);
selectedDate.setFullYear(2025);
currentDate = new Date(selectedDate);

function initCalendar() {
    renderCalendar();
    updateNavTitle();
    updatePanelTitle();
    updateQuickDays();

    document.getElementById('calendar-prev').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        updateNavTitle();
    });

    document.getElementById('calendar-next').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
        updateNavTitle();
    });
}

function renderCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const btn = createDayButton(day, true);
        calendarDays.appendChild(btn);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
        const btn = createDayButton(i, false, isToday);
        btn.addEventListener('click', () => selectDate(i, month, year));
        calendarDays.appendChild(btn);
    }

    // Next month days
    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
        const btn = createDayButton(i, true);
        calendarDays.appendChild(btn);
    }
}

function createDayButton(day, isOtherMonth, isToday = false) {
    const btn = document.createElement('button');
    btn.className = 'calendar-day';
    btn.textContent = day;
    if (isOtherMonth) btn.classList.add('other-month');
    if (isToday) btn.classList.add('today');
    return btn;
}

function selectDate(day, month, year) {
    selectedDate = new Date(year, month, day);
    renderCalendar();
    updatePanelTitle();
    updateSelectedDateLabel();
    updateQuickDays();

    // Mark selected day  
    const days = document.querySelectorAll('.calendar-day:not(.other-month)');
    days.forEach(d => {
        d.classList.remove('selected');
        if (parseInt(d.textContent) === day) {
            d.classList.add('selected');
        }
    });
}

function updateNavTitle() {
    const navTitle = document.getElementById('calendar-nav-title');
    const weekday = WEEKDAYS_PT[currentDate.getDay()];
    const day = currentDate.getDate();
    const month = MONTHS_PT[currentDate.getMonth()];
    navTitle.textContent = `${weekday}, ${day} de ${month}`;
}

function updatePanelTitle() {
    const panelTitle = document.getElementById('panel-title');
    const weekday = WEEKDAYS_PT[selectedDate.getDay()];
    const day = selectedDate.getDate();
    const month = MONTHS_PT[selectedDate.getMonth()];
    panelTitle.textContent = `${weekday}, ${day} de ${month}`;
}

function updateSelectedDateLabel() {
    const label = document.getElementById('selected-date-label');
    const weekday = WEEKDAYS_PT[selectedDate.getDay()];
    const day = selectedDate.getDate();
    const month = MONTHS_PT[selectedDate.getMonth()];
    label.textContent = `${weekday}, ${day} de ${month}`;
}

function updateQuickDays() {
    const container = document.getElementById('quick-days');
    container.innerHTML = '';

    const dayNames = ['Hoje', 'Amanhã'];
    for (let i = 0; i < 4; i++) {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + i);

        const item = document.createElement('div');
        item.className = 'quick-day-item';

        const name = i < 2 ? dayNames[i] : WEEKDAYS_SHORT_PT[d.getDay()] + 'a';
        if (i >= 2) {
            // Use short weekday name
            const shortName = WEEKDAYS_PT[d.getDay()].split('-')[0];
            item.innerHTML = `
                <span class="quick-day-name">${shortName.length > 8 ? shortName.substring(0, 6) : shortName}</span>
                <span class="quick-day-date">${d.getDate()}</span>
            `;
        } else {
            item.innerHTML = `
                <span class="quick-day-name">${name}</span>
                <span class="quick-day-date">${d.getDate()}</span>
            `;
        }

        item.addEventListener('click', () => {
            selectedDate = new Date(d);
            currentDate = new Date(d);
            renderCalendar();
            updateNavTitle();
            updatePanelTitle();
            updateSelectedDateLabel();
            updateQuickDays();
        });

        container.appendChild(item);
    }
}

// ===========================
// VIEW TOGGLE
// ===========================

function initViewToggle() {
    const toggleBtns = document.querySelectorAll('.view-toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// ===========================
// TASK INTERACTIONS
// ===========================

function initTaskInteractions() {
    // Task card click animation
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach((card, index) => {
        // Staggered entrance animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + index * 80);

        card.addEventListener('click', () => {
            // Ripple effect
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = 'translateY(-2px)';
            }, 150);
        });
    });

    // Add task button
    const addTaskBtn = document.getElementById('add-task-btn');
    addTaskBtn.addEventListener('click', () => {
        addTaskBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            addTaskBtn.style.transform = 'translateY(-2px)';
        }, 150);
    });
}

// ===========================
// CHAT ASSISTANT
// ===========================

function initChatAssistant() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const chatArea = document.getElementById('assistant-chat');
    const suggestionsArea = document.getElementById('chat-suggestions');

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message user-message';
        userMsg.innerHTML = `
            <div class="chat-bubble">${escapeHtml(text)}</div>
        `;
        userMsg.style.opacity = '0';
        userMsg.style.transform = 'translateY(10px)';
        chatArea.appendChild(userMsg);

        setTimeout(() => {
            userMsg.style.transition = 'all 0.3s ease';
            userMsg.style.opacity = '1';
            userMsg.style.transform = 'translateY(0)';
        }, 50);

        chatInput.value = '';
        chatArea.scrollTop = chatArea.scrollHeight;

        // Simulate assistant response
        setTimeout(() => {
            const responses = [
                'Ótima ideia! Vou ajudar você a organizar isso na sua rotina.',
                'Entendi! Posso sugerir alguns horários disponíveis para essa atividade.',
                'Vou analisar sua rotina e encontrar o melhor momento para isso.',
                'Perfeito! Que tal dividir essa tarefa em blocos menores?',
                'Boa! Vou verificar sua disponibilidade e sugerir um planejamento.'
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];

            const botMsg = document.createElement('div');
            botMsg.className = 'chat-message assistant-message';
            botMsg.style.flexDirection = 'row';
            botMsg.innerHTML = `
                <div class="chat-bubble">${response}</div>
            `;
            botMsg.style.opacity = '0';
            botMsg.style.transform = 'translateY(10px)';
            chatArea.appendChild(botMsg);

            setTimeout(() => {
                botMsg.style.transition = 'all 0.3s ease';
                botMsg.style.opacity = '1';
                botMsg.style.transform = 'translateY(0)';
                chatArea.scrollTop = chatArea.scrollHeight;
            }, 50);
        }, 800 + Math.random() * 600);
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Suggestion buttons
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.querySelector('span:nth-child(2)').textContent;
            chatInput.value = text;
            sendMessage();
        });
    });

    // Close button
    const closeBtn = document.getElementById('assistant-close-btn');
    const assistantPanel = document.getElementById('assistant-panel');
    const aiToggleBtn = document.getElementById('topbar-ai-btn');

    closeBtn.addEventListener('click', () => {
        assistantPanel.style.transition = 'all 0.3s ease';
        assistantPanel.style.opacity = '0';
        assistantPanel.style.transform = 'translateX(30px)';
        setTimeout(() => {
            assistantPanel.style.display = 'none';
        }, 300);
        // Show the AI toggle button in topbar
        aiToggleBtn.classList.remove('hidden');
    });

    // Open assistant from topbar button
    aiToggleBtn.addEventListener('click', () => {
        assistantPanel.style.display = 'flex';
        // Force reflow before animating
        assistantPanel.offsetHeight;
        assistantPanel.style.transition = 'all 0.3s ease';
        assistantPanel.style.opacity = '1';
        assistantPanel.style.transform = 'translateX(0)';
        // Hide the toggle button
        aiToggleBtn.classList.add('hidden');
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===========================
// SIDEBAR INTERACTIONS
// ===========================

function initSidebarInteractions() {
    // Calendar dropdown toggle animation
    const dropdownBtn = document.getElementById('calendar-dropdown-btn');
    let isExpanded = true;
    const calendarGrid = document.getElementById('calendar-grid');

    dropdownBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        const arrow = dropdownBtn.querySelector('.material-icons-round');
        arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(-180deg)';
        calendarGrid.style.transition = 'all 0.3s ease';
        calendarGrid.style.maxHeight = isExpanded ? '300px' : '0';
        calendarGrid.style.overflow = 'hidden';
        calendarGrid.style.opacity = isExpanded ? '1' : '0';
    });

    // New routine button
    const newRoutineBtn = document.getElementById('new-routine-btn');
    newRoutineBtn.addEventListener('click', () => {
        newRoutineBtn.style.borderColor = 'var(--primary-400)';
        newRoutineBtn.style.color = 'var(--primary-500)';
        setTimeout(() => {
            newRoutineBtn.style.borderColor = '';
            newRoutineBtn.style.color = '';
        }, 500);
    });

    // Settings button hover effect
    const settingsBtn = document.getElementById('settings-btn');
    settingsBtn.addEventListener('click', () => {
        settingsBtn.style.transform = 'scale(0.97)';
        setTimeout(() => {
            settingsBtn.style.transform = '';
        }, 150);
    });
}
