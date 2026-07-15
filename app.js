// 1. Initialize Supabase
const SUPABASE_URL = 'https://culmoystfpiyiudtfpzw.supabase.co';
const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bG1veXN0ZnBpeWl1ZHRmcHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDU2NzIsImV4cCI6MjA5OTI4MTY3Mn0.JedwAdBLb23BUc4Xecs_UXh01Jo6cxsaHw55PSQIe80';

var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- GLOBAL AUTHENTICATION CHECK ---
const activeUserString = localStorage.getItem('lockdsync_user');
const activeUser = activeUserString ? JSON.parse(activeUserString) : null;
const currentPage = window.location.pathname.toLowerCase();
const isPublicPage =
    currentPage.includes('login') ||
    currentPage.includes('landingpage') ||
    currentPage === '/';

if (!activeUser && !isPublicPage) {
    window.location.href = 'login.html';
}

// Helper function to generate clean, readable 6-character unique codes (Format: XXX-XXX)
function generateUniqueCode() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // Avoids ambiguous characters like O, I, 1, 0
    let part1 = '';
    let part2 = '';
    for (let i = 0; i < 3; i++) {
        part1 += chars.charAt(Math.floor(Math.random() * chars.length));
        part2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${part1}-${part2}`;
}

// --- LOAD HANGOUTS (HOMEPAGE LOGIC) ---
async function loadHangouts() {
    const container = document.getElementById('hangouts-container');
    if (!container || !activeUser) return;

    // Fetch hangouts including the code
    const { data: hangouts, error } = await supabase
        .from('hangouts')
        .select('id, hangout_name, average_price, hangout_date, hangout_code')
        .eq('user_id', activeUser.username);

    if (error) {
        console.error('Error fetching hangouts:', error);
        container.innerHTML =
            '<p class="text-center mt-10">Error loading hangouts.</p>';
        return;
    }

    const emptyState = document.getElementById('empty-state');
    if (hangouts.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    } else {
        if (emptyState) emptyState.classList.add('hidden');
    }

    // Render modern cards matching your exact UI layout
    container.innerHTML = '';
    hangouts.forEach((hangout) => {
        const codeDisplay = hangout.hangout_code || 'N/A';
        const cardHTML = `
      <a href="hangouthome.html?id=${hangout.id}" class="block border border-gray-200 rounded-2xl p-5 mb-1 hover:shadow-md transition bg-white shrink-0">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-base font-bold text-black">${hangout.hangout_name}</h2>
            <span class="text-xs text-gray-400 font-medium">${hangout.hangout_date}</span>
          </div>
          <span class="text-xs font-semibold tracking-wider text-gray-700 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg">
            ${codeDisplay}
          </span>
        </div>
        <div class="flex justify-between items-center border-t border-gray-100 pt-4">
          <span class="text-xs font-medium text-gray-500">Est. Price: <strong class="text-black">$${parseFloat(hangout.average_price).toFixed(2)}</strong></span>
          <span class="text-xs font-bold text-black flex items-center gap-1">
            Open Hub
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </span>
        </div>
      </a>
    `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}
loadHangouts();

// --- CREATE HANGOUT LOGIC ---
const createForm = document.getElementById('create-hangout-form');
if (createForm) {
    createForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        const errorText = document.getElementById('form-error');
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        errorText.classList.add('hidden');

        const nameValue = document.getElementById('hangout-name').value;
        const priceValue = document.getElementById('hangout-price').value;
        const dateValue = document.getElementById('hangout-date').value;

        if (!activeUser) {
            errorText.textContent =
                'You must be logged in to create a hangout.';
            errorText.classList.remove('hidden');
            submitBtn.textContent = 'Create Hangout';
            submitBtn.disabled = false;
            return;
        }

        // Generate the unique hangout code directly on creation
        const uniqueCode = generateUniqueCode();

        const { error } = await supabase.from('hangouts').insert([
            {
                hangout_name: nameValue,
                average_price: parseFloat(priceValue),
                hangout_date: dateValue,
                user_id: activeUser.username,
                hangout_code: uniqueCode, // This now works beautifully after SQL update!
            },
        ]);

        if (error) {
            console.error('Error inserting data:', error);
            errorText.textContent = 'Failed to save hangout. Please try again.';
            errorText.classList.remove('hidden');
            submitBtn.textContent = 'Create Hangout';
            submitBtn.disabled = false;
        } else {
            window.location.href = 'index.html';
        }
    });
}

// --- HANGOUT HOME PAGE LOGIC ---
const hangoutTitleDisplay = document.getElementById('hangout-title');
const leaveHangoutBtn = document.getElementById('leave-hangout-btn');
const hangoutCodeDisplay = document.getElementById('hangout-code-box');

if (hangoutTitleDisplay) {
    const urlParams = new URLSearchParams(window.location.search);
    const currentHangoutId = urlParams.get('id');

    if (!currentHangoutId) {
        hangoutTitleDisplay.textContent = 'Hangout Not Found';
    } else {
        supabase
            .from('hangouts')
            .select('hangout_name, hangout_code')
            .eq('id', currentHangoutId)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    console.error('Failed to load info:', error);
                    hangoutTitleDisplay.textContent = 'Error Loading Info';
                } else if (data) {
                    hangoutTitleDisplay.textContent = data.hangout_name;
                    if (hangoutCodeDisplay) {
                        hangoutCodeDisplay.textContent =
                            data.hangout_code || '---';
                    }
                    const scheduleLink =
                        document.getElementById('schedule-link');
                    const messageLink = document.getElementById('message-link');
                    if (scheduleLink)
                        scheduleLink.href = `schedule.html?id=${currentHangoutId}`;
                    if (messageLink)
                        messageLink.href = `chat.html?id=${currentHangoutId}`;
                }
            });

        if (leaveHangoutBtn) {
            leaveHangoutBtn.addEventListener('click', async () => {
                const confirmDelete = confirm(
                    'Are you sure you want to leave? This will permanently delete the hangout.',
                );
                if (confirmDelete) {
                    leaveHangoutBtn.textContent = 'Leaving...';
                    leaveHangoutBtn.disabled = true;
                    const { error } = await supabase
                        .from('hangouts')
                        .delete()
                        .eq('id', currentHangoutId);

                    if (error) {
                        console.error('Error deleting hangout:', error);
                        alert('Could not remove hangout. Please try again.');
                        leaveHangoutBtn.textContent = 'Leave Hangout';
                        leaveHangoutBtn.disabled = false;
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            });
        }
    }
}

// Copy-to-Clipboard Code Helper
window.copyHangoutCode = function () {
    const codeText = document.getElementById('hangout-code-box')?.textContent;
    if (codeText && codeText !== '---') {
        navigator.clipboard
            .writeText(codeText)
            .then(() => {
                alert('Hangout Code copied to clipboard: ' + codeText);
            })
            .catch((err) => {
                console.error('Could not copy text: ', err);
            });
    }
};

// --- REST OF ACTIVITIES / SCHEDULE LOGIC ---
const scheduleDateDisplay = document.getElementById('schedule-date');
if (scheduleDateDisplay) {
    const urlParams = new URLSearchParams(window.location.search);
    const hangoutId = urlParams.get('id');

    if (!hangoutId) {
        scheduleDateDisplay.textContent = 'Date Not Found';
    } else {
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.href = `hangouthome.html?id=${hangoutId}`;
        }
        supabase
            .from('hangouts')
            .select('hangout_date')
            .eq('id', hangoutId)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    console.error('Failed to load date:', error);
                    scheduleDateDisplay.textContent = 'Error';
                } else if (data) {
                    const rawDate = new Date(data.hangout_date);
                    const options = {
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'UTC',
                    };
                    scheduleDateDisplay.textContent =
                        rawDate.toLocaleDateString('en-US', options);
                }
            });
    }
}

const createActivityForm = document.getElementById('create-activity-form');
if (createActivityForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const hangoutId = urlParams.get('id');
    const backToScheduleBtn = document.getElementById('back-to-schedule-btn');

    if (backToScheduleBtn) {
        backToScheduleBtn.href = `schedule.html?id=${hangoutId}`;
    }

    createActivityForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const submitBtn = document.getElementById('submit-activity-btn');
        const errorText = document.getElementById('act-form-error');
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        errorText.classList.add('hidden');

        const actTime = document.getElementById('act-time').value;
        const actName = document.getElementById('act-name').value;
        const actPrice = document.getElementById('act-price').value;
        const actLocation = document.getElementById('act-location').value;

        const { error } = await supabase.from('activities').insert([
            {
                hangout_id: hangoutId,
                activity_time: actTime,
                activity_name: actName,
                price: parseFloat(actPrice),
                location: actLocation,
            },
        ]);

        if (error) {
            console.error('Error adding activity:', error);
            errorText.textContent = 'Failed to save activity.';
            errorText.classList.remove('hidden');
            submitBtn.textContent = 'Add to Schedule';
            submitBtn.disabled = false;
        } else {
            window.location.href = `schedule.html?id=${hangoutId}`;
        }
    });
}

const activitiesContainer = document.getElementById('activities-container');
if (activitiesContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const hangoutId = urlParams.get('id');
    const addActivityBtn = document.getElementById('add-activity-btn');

    if (addActivityBtn) {
        // ROUTING MATCH FIXED: Points to 'createactivities.html' to match your file's exact name
        addActivityBtn.onclick = () =>
            (window.location.href = `createactivities.html?id=${hangoutId}`);
    }

    async function loadActivities() {
        if (!hangoutId) return;
        const { data: activities, error } = await supabase
            .from('activities')
            .select('*')
            .eq('hangout_id', hangoutId)
            .order('activity_time', { ascending: true });

        if (error) {
            console.error('Error fetching activities:', error);
            return;
        }

        activitiesContainer.innerHTML = '';
        if (activities.length === 0) {
            activitiesContainer.innerHTML =
                '<p class="text-center text-gray-500 mt-10">No activities scheduled yet.</p>';
            return;
        }

        activities.forEach((act) => {
            const [hours, minutes] = act.activity_time.split(':');
            let h = parseInt(hours);
            const ampm = h >= 12 ? 'pm' : 'am';
            h = h % 12 || 12;
            const displayTime = `${h}:${minutes} ${ampm}`;
            const cardHTML = `
        <div class="border border-gray-300 rounded-xl p-4 bg-white shadow-sm mb-4">
          <div class="flex justify-between items-center mb-6">
            <span class="text-lg text-gray-900">${act.activity_name}</span>
            <span class="text-lg text-gray-900">$${act.price}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-base text-gray-900">${displayTime}</span>
            <span class="text-sm text-gray-900 underline decoration-solid underline-offset-2 cursor-pointer">${act.location}</span>
          </div>
        </div>
      `;
            activitiesContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    }
    loadActivities();
}
