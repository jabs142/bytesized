// Home Page JavaScript
// Load and display statistics from the pattern mining results

let statsData = null;

// Load stats on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data/stats.json');
        statsData = await response.json();

        displayStats();
        displayTopSymptoms();
    } catch (error) {
        console.error('Error loading data:', error);
    }
});

function displayStats() {
    if (!statsData) return;

    // Update stat cards
    document.getElementById('stat-posts').textContent = statsData.total_posts.toLocaleString();
    document.getElementById('stat-symptoms').textContent = statsData.posts_with_symptoms.toLocaleString();
    document.getElementById('stat-patterns').textContent = statsData.total_rules_found.toLocaleString();

    // Category stats removed - those sections were deleted from the HTML
}

function displayTopSymptoms() {
    if (!statsData || !statsData.top_symptoms) return;

    const container = document.getElementById('top-symptoms-list');
    const topSymptoms = Object.entries(statsData.top_symptoms).slice(0, 10);

    container.innerHTML = topSymptoms.map(([symptom, count]) => {
        const percentage = ((count / statsData.posts_with_symptoms) * 100).toFixed(1);
        const barWidth = percentage;

        return `
            <div class="flex items-center">
                <div class="w-32 text-sm font-medium text-gray-700 capitalize">
                    ${symptom.replace(/_/g, ' ')}
                </div>
                <div class="flex-1 mx-4">
                    <div class="bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div class="h-4 transition-all duration-500"
                             style="width: ${barWidth}%; background-color: #8bac0f;"></div>
                    </div>
                </div>
                <div class="w-24 text-right">
                    <span class="text-sm font-semibold text-gray-900">${count}</span>
                    <span class="text-xs text-gray-500">(${percentage}%)</span>
                </div>
            </div>
        `;
    }).join('');
}
