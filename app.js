// 1. Initialize Supabase
const SUPABASE_URL = 'https://culmoystfpiyiudtfpzw.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bG1veXN0ZnBpeWl1ZHRmcHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDU2NzIsImV4cCI6MjA5OTI4MTY3Mn0.JedwAdBLb23BUc4Xecs_UXh01Jo6cxsaHw55PSQIe80';

// Initialize the client using the window.supabase object from the CDN
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
        <a href="hangouthome.html" class="block border border-gray-200 rounded-2xl p-5 hover:shadow-md transition">
            <div class="flex justify-between items-start mb-6">
                <h2 class="text-lg font-semibold text-black">${hangout.hangout_name}</h2>
                <span class="text-sm font-medium text-gray-700">$${hangout.average_price}</span>
            </div>
            
            <div class="flex justify-between items-center">
                <!-- Avatars (Hardcoded for now) -->
                <div class="flex -space-x-2">
                    <img class="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=11" alt="Avatar 1">
                </div>
                <!-- Date -->
                <span class="text-xs font-medium text-gray-500">${hangout.hangout_date}</span>
            </div>
        </a>
        `;
        
        // Add the new card to the container
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// 4. Run the function when the page loads
loadHangouts();