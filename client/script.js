// ===========================
// Rotina Fácil - Main Script
// ===========================

const URL = "http://localhost:3000";
const KEY = 321;
let VerificationToken = localStorage.getItem("VerificationToken");
let StoredTasks = [];

// Redireciona imediatamente se não houver token
if (!VerificationToken) {
    window.location.href = "./login";
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!VerificationToken) return;

    //Inicial JWT check & Reassign userName
    try {
        const res = await fetch(URL + "/api/checkToken", {
            headers: {
                'authorization': VerificationToken
            }
        });

        if (res.status === 401 || res.status === 403) {
            window.location.href = "./login";
            return;
        }

        const userName = await res.text();
        console.log("Resultado de checkToken():", userName);

        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.textContent = userName;
        }

    } catch (err) {
        console.error("Erro ao conectar na API:", err);
    }

    //Fetch tasks
    try {
        const res = await fetch(URL + "/api/queryTask", {
            method: 'POST',
            headers: {
                'authorization': VerificationToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jwt: VerificationToken
            })
        });

        if (res.status === 401 || res.status === 403) {
            window.location.href = "./login";
            return;
        }

        const tasks = await res.text();
        console.log("Resultado de queryTask():", tasks); //TEST LOG PORPUSE

        try {
            StoredTasks = JSON.parse(tasks);
        } catch (e) {
            console.log("Failed to parse tasks JSON or no tasks found.");
            StoredTasks = [];
        }

    } catch (err) {
        console.error("Erro ao conectar na API:", err);
    }

    if (Array.isArray(StoredTasks)) {
        loadTasks(StoredTasks);
    }

    initCalendar();
    initViewToggle();
    initTaskInteractions();
    initChatAssistant();
    initSidebarInteractions();
    initTaskModal();

    // Logout button
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            localStorage.removeItem("VerificationToken");
            window.location.href = "./login";
        });
    }

});

async function getUserData(userId) {
    try {
        const res = await fetch(URL + "/api/user/" + userId, {
            headers: {
                // Seu token de verificação injetado
                'authorization': VerificationToken
            }
        });

        if (res.status === 401 || res.status === 403) {
            window.location.href = "./login";
            return "Sessão expirada";
        }

        const data = await res.text();
        console.log("Resultado de getUser():", data);
        return data; // Retorna o texto formatado para o input
    } catch (err) {
        console.error("Erro ao conectar na API:", err);
        return "Falha na conexão: " + err.message;
    }
}

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

function loadTasks(tasks) {
    const pending = document.querySelector('#pending');
    const doing = document.querySelector('#doing');
    const done = document.querySelector('#done');
    if (!pending && !doing && !done) return;

    // Clear current loading or default tasks
    doing.innerHTML = '';
    pending.innerHTML = '';
    done.innerHTML = '';



    tasks.forEach(task => {
        const taskHTML = `
            <div class="task-card" id="task_${task.id || Math.random().toString(36).substring(2)}" data-status="in-progress">
                <div class="task-icon task-icon-blue">
                    <span class="material-icons-round">play_circle</span>
                </div>
                <div class="task-content">
                    <h3 class="task-title">${task.title || task.nome || 'Sem título'}</h3>
                    <div class="task-meta">
                        <span class="task-description">${task.description || task.descricao || 'Sem descrição'}</span>
                    </div>
                </div>
                <button class="task-arrow">
                    <span class="material-icons-round">chevron_right</span>
                </button>
            </div>
        `;

        if (task.state === 0) {
            pending.insertAdjacentHTML('beforeend', taskHTML);
        } else if (task.state === 1) {
            doing.insertAdjacentHTML('beforeend', taskHTML);
        } else if (task.state === 2) {
            done.insertAdjacentHTML('beforeend', taskHTML);
        }
    });
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

// ===========================
// TASK MODAL
// ===========================

function initTaskModal() {
    const overlay = document.getElementById('task-modal-overlay');
    const closeBtn = document.getElementById('task-modal-close-btn');
    const cancelBtn = document.getElementById('task-modal-cancel-btn');
    const saveBtn = document.getElementById('task-modal-save-btn');
    const AddTaskBtns = [
        document.getElementById('add-task-btn'),
        document.getElementById('topbar-add-btn')
    ];

    function openModal() {
        if (overlay) overlay.classList.add('active');
    }

    function closeModal() {
        if (overlay) overlay.classList.remove('active');
    }

    AddTaskBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', openModal);
        }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Fechar clicando fora do modal
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
    }

    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('task-title-input');
            const descInput = document.getElementById('task-desc-input');

            const title = titleInput ? titleInput.value.trim() : '';
            const desc = descInput ? descInput.value.trim() : '';

            if (!title) {
                alert('Por favor, informe o título da tarefa.');
                return;
            }

            console.log('Nova tarefa:', { title, desc });

            // Simulação de adicionar tarefa localmente
            // A integração com a API ficará para depois, 
            // mas o formulário já limpará seus dados.
            createTask(title, desc);
            if (titleInput) titleInput.value = '';
            if (descInput) descInput.value = '';
            closeModal();
            alert('Tarefa adicionada com sucesso (Simulação)!');
        });
    }
}

async function createTask(title, desc) {
    try {
        const res = await fetch(URL + "/api/createTask", {
            method: 'POST',
            headers: {
                'authorization': VerificationToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jwt: VerificationToken,
                title: title,
                description: desc
            })
        });

        if (res.status === 401 || res.status === 403) {
            window.location.href = "./login";
            return;
        }

        try {
            StoredTasks = JSON.parse(tasks);
        } catch (e) {
            console.log("Failed to parse tasks JSON or no tasks found.");
            StoredTasks = [];
        }

        //Fetch tasks
        try {
            const res = await fetch(URL + "/api/queryTask", {
                method: 'POST',
                headers: {
                    'authorization': VerificationToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jwt: VerificationToken
                })
            });

            if (res.status === 401 || res.status === 403) {
                window.location.href = "./login";
                return;
            }

            const tasks = await res.text();
            console.log("Resultado de queryTask():", tasks); //TEST LOG PORPUSE

            try {
                StoredTasks = JSON.parse(tasks);
            } catch (e) {
                console.log("Failed to parse tasks JSON or no tasks found.");
                StoredTasks = [];
            }

        } catch (err) {
            console.error("Erro ao conectar na API:", err);
        }

        if (Array.isArray(StoredTasks)) {
            loadTasks(StoredTasks);
        }

    } catch (err) {
        console.error("Erro ao conectar na API:", err);
    }
}
