function fmtDate(d){
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
}

const datePicker = document.getElementById('datePicker');
const messagesEl = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const selectedDateEl = document.getElementById('selectedDate');

let selectedDate = null;

function loadSelectedDate(d){
    selectedDate = d;
    datePicker.value = d;
    selectedDateEl.textContent = `Showing messages for ${d}`;
    renderMessages();
}

function getStorage(){
    try{
        return JSON.parse(localStorage.getItem('lockdsync_messages')||'{}');
    }catch(e){return {}}
}

function saveStorage(obj){
    localStorage.setItem('lockdsync_messages', JSON.stringify(obj));
}

function renderMessages(){
    messagesEl.innerHTML = '';
    const store = getStorage();
    const arr = store[selectedDate] || [];
    if(arr.length === 0){
        messagesEl.innerHTML = '<div class="message">No messages for this date.</div>';
        return;
    }
    arr.forEach(m=>{
        const div = document.createElement('div');
        div.className = 'message';
        div.textContent = `${m.time} — ${m.text}`;
        messagesEl.appendChild(div);
    });
}

function sendMessage(){
    const text = messageInput.value.trim();
    if(!text) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const store = getStorage();
    store[selectedDate] = store[selectedDate] || [];
    store[selectedDate].push({text, time});
    saveStorage(store);
    messageInput.value = '';
    renderMessages();
}

datePicker.addEventListener('change', e=>{
    if(e.target.value) loadSelectedDate(e.target.value);
});

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', e=>{ if(e.key === 'Enter') sendMessage(); });

// initialize to today
const today = fmtDate(new Date());
if(!datePicker.value) loadSelectedDate(today);
