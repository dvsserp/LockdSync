// 1. Initialize Supabase
const SUPABASE_URL = 'https://culmoystfpiyiudtfpzw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bG1veXN0ZnBpeWl1ZHRmcHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDU2NzIsImV4cCI6MjA5OTI4MTY3Mn0.JedwAdBLb23BUc4Xecs_UXh01Jo6cxsaHw55PSQIe80';

// Initialize the client using the window.supabase object from the CDN
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Function to fetch and display data
async function loadHangouts() {
    const container = document.getElementById('hangouts-container');
    
    // THE FIX: If the container doesn't exist on this page, stop immediately!
    if (!container) {
        return; 
    }
    
    // Fetch the hangouts from your table
    const { data: hangouts, error } = await supabase
        .from('hangouts')
        .select('id, hangout_name, average_price, hangout_date');

    if (error) {
        console.error('Error fetching hangouts:', error);
        container.innerHTML = '<p>Error loading hangouts.</p>';
        return;
    }

    // Generate HTML for each hangout and inject it into the container
    hangouts.forEach(hangout => {
        const cardHTML = `
        <a href="hangouthome.html?id=${hangout.id}" class="block border border-gray-200 rounded-xl p-5 mb-4 hover:shadow-md transition bg-white">
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

// Find the form element by its ID
const createForm = document.getElementById('create-hangout-form');

// Only run this code if the form exists on the current page
if (createForm) {
    createForm.addEventListener('submit', async function(event) {
        // Prevent the browser's default form submission (which reloads the page)
        event.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        const errorText = document.getElementById('form-error');
        
        // Temporarily change the button state so the user knows it's loading
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        errorText.classList.add('hidden');
        
        // Grab the values typed into the inputs
        const nameValue = document.getElementById('hangout-name').value;
        const priceValue = document.getElementById('hangout-price').value;
        const dateValue = document.getElementById('hangout-date').value;
        
        // Insert the new data into the Supabase 'hangouts' table
        const { error } = await supabase
            .from('hangouts')
            .insert([
                { 
                    hangout_name: nameValue, 
                    average_price: parseFloat(priceValue), // Convert string to a decimal number
                    hangout_date: dateValue 
                }
            ]);
            
        if (error) {
            console.error('Error inserting data:', error);
            // Display the error text and reset the button
            errorText.textContent = 'Failed to save hangout. Please try again.';
            errorText.classList.remove('hidden');
            submitBtn.textContent = 'Create Hangout';
            submitBtn.disabled = false;
        } else {
            // Success! Send the user straight back to the homepage
            window.location.href = 'index.html';
        }
    });
} // <--- THIS BRACE MOVED HERE TO CLOSE THE FORM LOGIC!


// --- HANGOUT HOME PAGE LOGIC ---
const hangoutTitleDisplay = document.getElementById('hangout-title');
const leaveHangoutBtn = document.getElementById('leave-hangout-btn');

// Only run this if we are actually on the hangouthome.html page
if (hangoutTitleDisplay) {
    
    // 1. Get ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentHangoutId = urlParams.get('id');

    if (!currentHangoutId) {
        hangoutTitleDisplay.textContent = 'Hangout Not Found';
    } else {
        // 2. Fetch the title safely
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
                    // Update Title
                    hangoutTitleDisplay.textContent = data.hangout_name;
                    
                    // Update Links
                    const scheduleLink = document.getElementById('schedule-link');
                    const messageLink = document.getElementById('message-link');
                    if (scheduleLink) scheduleLink.href = `schedule.html?id=${currentHangoutId}`;
                    if (messageLink) messageLink.href = `chat.html?id=${currentHangoutId}`;
                }
            });

        // 3. Setup the Leave/Delete Button Logic
        if (leaveHangoutBtn) {
            leaveHangoutBtn.addEventListener('click', async () => {
                // Confirm with the user before deleting
                const confirmDelete = confirm("Are you sure you want to leave? This will permanently delete the hangout.");
                
                if (confirmDelete) {
                    leaveHangoutBtn.textContent = "Leaving...";
                    leaveHangoutBtn.disabled = true;

                    // Delete the specific row from Supabase
                    const { error } = await supabase
                        .from('hangouts')
                        .delete()
                        .eq('id', currentHangoutId);

                    if (error) {
                        console.error('Error deleting hangout:', error);
                        alert("Could not remove hangout. Please try again.");
                        leaveHangoutBtn.textContent = "Leave Hangout";
                        leaveHangoutBtn.disabled = false;
                    } else {
                        // Success! Redirect to the homepage
                        window.location.href = 'index.html';
                    }
                }
            });
        }
    }
}

// --- SCHEDULE PAGE LOGIC ---
const scheduleDateDisplay = document.getElementById('schedule-date');

// Only run if we are actually on the schedule.html page
if (scheduleDateDisplay) {
    const urlParams = new URLSearchParams(window.location.search);
    const hangoutId = urlParams.get('id');

    if (!hangoutId) {
        scheduleDateDisplay.textContent = 'Date Not Found';
    } else {
        // 1. Ensure the Back button remembers which hangout we came from
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.href = `hangouthome.html?id=${hangoutId}`;
        }

        // 2. Fetch the hangout date from Supabase
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
                    // 3. Format the date beautifully (e.g., "July 10")
                    const rawDate = new Date(data.hangout_date);
                    
                    // We use timeZone: 'UTC' to prevent the browser from accidentally showing the day before
                    const options = { month: 'long', day: 'numeric', timeZone: 'UTC' }; 
                    const formattedDate = rawDate.toLocaleDateString('en-US', options);
                    
                    scheduleDateDisplay.textContent = formattedDate;
                }
            });
    }
}

// --- CREATE ACTIVITY LOGIC ---
const createActivityForm = document.getElementById('create-activity-form');

if (createActivityForm) {
    // Ensure the back button remembers the hangout ID
    const urlParams = new URLSearchParams(window.location.search);
    const hangoutId = urlParams.get('id');
    document.getElementById('back-to-schedule-btn').href = `schedule.html?id=${hangoutId}`;

    createActivityForm.addEventListener('submit', async function(event) {
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
        
        const { error } = await supabase
            .from('activities')
            .insert([
                { 
                    hangout_id: hangoutId,
                    activity_time: actTime,
                    activity_name: actName, 
                    price: parseFloat(actPrice), 
                    location: actLocation 
                }
            ]);
            
        if (error) {
            console.error('Error adding activity:', error);
            errorText.textContent = 'Failed to save activity.';
            errorText.classList.remove('hidden');
            submitBtn.textContent = 'Add to Schedule';
            submitBtn.disabled = false;
        } else {
            // Success! Send back to schedule
            window.location.href = `schedule.html?id=${hangoutId}`;
        }
    });
}

// --- UPDATE SCHEDULE LOGIC TO LOAD CARDS ---
// We need to inject the fetch logic directly into the schedule.html code you already have.
const activitiesContainer = document.getElementById('activities-container');

if (activitiesContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const hangoutId = urlParams.get('id');

    // Make sure the "Add activity" button carries the ID to the form page
    const addActivityBtn = document.getElementById('add-activity-btn');
    if (addActivityBtn) {
        addActivityBtn.onclick = () => window.location.href = `createactivity.html?id=${hangoutId}`;
    }

    async function loadActivities() {
        if (!hangoutId) return;

        // Fetch activities matching the hangout ID, and order them by time ascending (earliest first)
        const { data: activities, error } = await supabase
            .from('activities')
            .select('*')
            .eq('hangout_id', hangoutId)
            .order('activity_time', { ascending: true });

        if (error) {
            console.error('Error fetching activities:', error);
            return;
        }

        // Clear out the hardcoded sample cards
        activitiesContainer.innerHTML = '';

        if (activities.length === 0) {
            activitiesContainer.innerHTML = '<p class="text-center text-gray-500 mt-10">No activities scheduled yet.</p>';
            return;
        }

        // Generate a card for each activity
        activities.forEach(act => {
            // Format time from 14:30:00 to 2:30 pm
            const [hours, minutes] = act.activity_time.split(':');
            let h = parseInt(hours);
            const ampm = h >= 12 ? 'pm' : 'am';
            h = h % 12 || 12; // Convert 0 to 12
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