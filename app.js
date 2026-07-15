// 1. Initialize Supabase
const SUPABASE_URL = 'https://culmoystfpiyiudtfpzw.supabase.co';
const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bG1veXN0ZnBpeWl1ZHRmcHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDU2NzIsImV4cCI6MjA5OTI4MTY3Mn0.JedwAdBLb23BUc4Xecs_UXh01Jo6cxsaHw55PSQIe80';

// Initialize the client using the window.supabase object from the CDN
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- GLOBAL AUTHENTICATION CHECK (PUBLIC DB VERSION) ---
// 1. Grab the user from the browser's local memory
const activeUserString = localStorage.getItem('lockdsync_user');
const activeUser = activeUserString ? JSON.parse(activeUserString) : null;

// 2. Figure out what page we are currently on
const currentPage = window.location.pathname.toLowerCase();
const isPublicPage = currentPage.includes('login') || currentPage.includes('landingpage') || currentPage === '/';

// 3. If there is no active user, and they aren't on a public page, kick them to login
if (!activeUser && !isPublicPage) {
    window.location.href = 'login.html';
}

// --- LOAD HANGOUTS (HOMEPAGE LOGIC) ---
async function loadHangouts() {
    const container = document.getElementById('hangouts-container');

    // If the container doesn't exist on this page, stop immediately!
    if (!container || !activeUser) return;

    // Fetch ONLY the hangouts belonging to THIS username
    const { data: hangouts, error } = await supabase
        .from('hangouts')
        .select('id, hangout_name, average_price, hangout_date')
        .eq('user_id', activeUser.username); // Uses username instead of Supabase ID

    if (error) {
        console.error('Error fetching hangouts:', error);
        container.innerHTML = '<p class="text-center mt-10">Error loading hangouts.</p>';
        return;
    }

    // Handle the empty state UI
    const emptyState = document.getElementById('empty-state');
    
    if (hangouts.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    } else {
        if (emptyState) emptyState.classList.add('hidden');
    }

    // Generate HTML for each hangout and inject it into the container
    hangouts.forEach((hangout) => {
        const cardHTML = `
        <a href="hangouthome.html?id=${hangout.id}" class="block border border-gray-200 rounded-xl p-5 mb-4 hover:shadow-md transition bg-white shrink-0">
            <div class="flex justify-between items-start mb-6">
                <h2 class="text-base font-semibold text-black">${hangout.hangout_name}</h2>
                <span class="text-xs font-medium text-gray-500">$${hangout.average_price}</span>
            </div>
            
            <div class="flex justify-between items-center">
                <div class="flex -space-x-2">
                    <img class="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=11" alt="Avatar 1">
                </div>
                <span class="text-[10px] font-medium text-gray-400">${hangout.hangout_date}</span>
            </div>
        </a>
        `;

        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// Run the function when the page loads
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
            errorText.textContent = 'You must be logged in to create a hangout.';
            errorText.classList.remove('hidden');
            submitBtn.textContent = 'Create Hangout';
            submitBtn.disabled = false;
            return;
        }

        // Insert the new data, attaching the username to the hangout
        const { error } = await supabase.from('hangouts').insert([
            {
                hangout_name: nameValue,
                average_price: parseFloat(priceValue), 
                hangout_date: dateValue,
                user_id: activeUser.username // Saves the username directly
            },
        ]);

        if (error) {
            console.error('Error inserting data:', error);
            errorText.textContent = 'Failed to save hangout. Please try again.';
            errorText.classList.remove('hidden');
            submitBtn.textContent = 'Create Hangout';
            submitBtn.disabled = false;
        } else {
            // Success! Send the user straight back to the homepage
            window.location.href = 'index.html';
        }
    });
} 

// --- HANGOUT HOME PAGE LOGIC ---
const hangoutTitleDisplay = document.getElementById('hangout-title');
const leaveHangoutBtn = document.getElementById('leave-hangout-btn');

if (hangoutTitleDisplay) {
    const urlParams = new URLSearchParams(window.location.search);
    const currentHangoutId = urlParams.get('id');

    if (!currentHangoutId) {
        hangoutTitleDisplay.textContent = 'Hangout Not Found';
    } else {
        supabase
            .from('hangouts')
            .select('hangout_name')
            .eq('id', currentHangoutId)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    console.error('Failed to load title:', error);
                    hangoutTitleDisplay.textContent = 'Error Loading Title';
                } else if (data) {
                    hangoutTitleDisplay.textContent = data.hangout_name;

                    const scheduleLink = document.getElementById('schedule-link');
                    const messageLink = document.getElementById('message-link');
                    if (scheduleLink)
                        scheduleLink.href = `schedule.html?id=${currentHangoutId}`;
                    if (messageLink)
                        messageLink.href = `chat.html?id=${currentHangoutId}`;
                }
            });

        if (leaveHangoutBtn) {
            leaveHangoutBtn.addEventListener('click', async () => {
                const confirmDelete = confirm('Are you sure you want to leave? This will permanently delete the hangout.');

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

// --- SCHEDULE PAGE LOGIC ---
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
                    const options = { month: 'long', day: 'numeric', timeZone: 'UTC' };
                    scheduleDateDisplay.textContent = rawDate.toLocaleDateString('en-US', options);
                }
            });
    }
}

// --- CREATE ACTIVITY LOGIC ---
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

// --- UPDATE SCHEDULE LOGIC TO LOAD CARDS ---
const activitiesContainer = document.getElementById('activities-container');

if (activitiesContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const hangoutId = urlParams.get('id');

    const addActivityBtn = document.getElementById('add-activity-btn');
    if (addActivityBtn) {
        addActivityBtn.onclick = () => (window.location.href = `createactivity.html?id=${hangoutId}`);
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
            activitiesContainer.innerHTML = '<p class="text-center text-gray-500 mt-10">No activities scheduled yet.</p>';
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