let history = [];

function searchQuery() {
    const query = document.getElementById('search-input').value.trim();
    if (query) {
        alert(`搜索结果：${query}`);
    } else {
        alert("请输入搜索内容！");
    }
}

function formatMessage(text) {
    if (!text) return '';
    return text.split('\n').map(line => `<p>${line}</p>`).join('');
}

function displayMessage(role, message) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    
    const avatar = createAvatar(role);
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = role === 'user' ? message : formatMessage(message);

    messageElement.appendChild(avatar);
    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);
    
    messageElement.scrollIntoView({ behavior: 'smooth' });
}

function createAvatar(role) {
    const avatar = document.createElement('img');
    avatar.src = role === 'user' ? 'user-avatar.png' : 'bot-avatar.png';
    avatar.alt = role === 'user' ? 'User' : 'Bot';
    return avatar;
}

function sendMessage() {
    const inputElement = document.getElementById('chat-input');
    const message = inputElement.value.trim();
    if (!message) return;

    displayMessage('user', message);
    inputElement.value = '';

    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }

    const apiKey = 'sk-d1c2d2f6803d41228ccbdce72459b418';
    const endpoint = 'https://api.deepseek.com/chat/completions';

    const payload = {
        model: "deepseek-chat",
        messages: [
            { role: "system", content: "You are a helpful assistant" },
            { role: "user", content: message }
        ],
        stream: false
    };

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        if (data.choices && data.choices.length > 0) {
            const botMessage = data.choices[0].message.content;
            displayMessage('bot', botMessage);

            // Save the conversation to history
            history.push({ user: message, bot: botMessage });
            updateHistory();
        } else {
            displayMessage('bot', '出错了，请稍后再试。');
        }
    })
    .catch(error => {
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        displayMessage('bot', '出错了，请稍后再试。');
        console.error('API调用错误:', error);
    });
}

function updateHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = ''; // Clear the list

    history.forEach((conversation, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `对话 ${index + 1}`;
        historyItem.onclick = () => loadHistory(index);
        historyList.appendChild(historyItem);
    });
}

function loadHistory(index) {
    const conversation = history[index];
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';

    displayMessage('user', conversation.user);
    displayMessage('bot', conversation.bot);
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

document.getElementById('chat-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

