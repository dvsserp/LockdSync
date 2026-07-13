// 1. Initialize Supabase
const SUPABASE_URL = 'https://culmoystfpiyiudtfpzw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bG1veXN0ZnBpeWl1ZHRmcHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDU2NzIsImV4cCI6MjA5OTI4MTY3Mn0.JedwAdBLb23BUc4Xecs_UXh01Jo6cxsaHw55PSQIe80';

// Initialize the client using the window.supabase object from the CDN
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Function to fetch and display data
async function loadHangouts() {
    const container = document.getElementById('hangouts-container');
    
    // Fetch the hangouts from your table
    const { data: hangouts, error } = await supabase
        .from('hangouts')
        .select('hangout_name, average_price, hangout_date');

    if (error) {
        console.error('Error fetching hangouts:', error);
        container.innerHTML = '<p>Error loading hangouts.</p>';
        return;
    }

    // 3. Generate HTML for each hangout and inject it into the container
    hangouts.forEach(hangout => {
        // Create the card HTML, inserting the dynamic data
        const cardHTML = `
        <a href="hangouthome.html?id=${hangout.id}" class="block border border-gray-200 rounded-xl p-5 mb-4 hover:shadow-md transition bg-white">
            <div class="flex justify-between items-start mb-6">
                <h2 class="text-base font-semibold text-black">${hangout.hangout_name}</h2>
                <span class="text-xs font-medium text-gray-500">$${hangout.average_price}</span>
            </div>

            <div class="flex justify-between items-center">
                <!-- Overlapping Avatars matching Figma -->
                <div class="flex -space-x-2">
                    <img class="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=11" alt="User">
                    <img class="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=12" alt="User">
                    <img class="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=13" alt="User">
                    <div class="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[9px] font-medium text-gray-500">
                        +1
                    </div>
                </div>
                <!-- Date -->
                <span class="text-[10px] font-medium text-gray-400">${hangout.hangout_date}</span>
            </div>
        </a>
        `;
        
        // Add the new card to the container
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// 4. Run the function when the page loads
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
    // --- HANGOUT HOME PAGE LOGIC ---

// Find the title element to confirm we are on the right page
const hangoutTitleDisplay = document.getElementById('hangout-title');

if (hangoutTitleDisplay) {
    async function setupHangoutPage() {
        // 1. Check the URL for the ID (e.g., hangouthome.html?id=5)
        const urlParams = new URLSearchParams(window.location.search);
        const currentHangoutId = urlParams.get('id');

        // If someone visits the page without clicking a card, stop them.
        if (!currentHangoutId) {
            hangoutTitleDisplay.textContent = 'Hangout Not Found';
            return;
        }

        // 2. Fetch the hangout name from Supabase using that ID
        const { data, error } = await supabase
            .from('hangouts')
            .select('hangout_name')
            .eq('id', currentHangoutId)
            .single(); 

        if (error) {
            console.error('Error fetching hangout data:', error);
            hangoutTitleDisplay.textContent = 'Error Loading Data';
        } else if (data) {
            // 3. Change the <h1> text to match the database
            hangoutTitleDisplay.textContent = data.hangout_name;
            
            // 4. Inject the ID into the Schedule and Message buttons
            // Now clicking schedule goes to "schedule.html?id=5"
            document.getElementById('schedule-link').href = `schedule.html?id=${currentHangoutId}`;
            document.getElementById('message-link').href = `chat.html?id=${currentHangoutId}`;
        }
    }
    
    // Execute the function
    setupHangoutPage();
}
}