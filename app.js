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