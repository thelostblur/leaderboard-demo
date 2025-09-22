const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDiS3dDSmqU3Q7Y2l3XqNXB46neOHwJ-upgjQIN1Ql_nxXqQwwv_JPnA6vCia6Y6j3dK0f7M_u8e-R/pub?gid=0&single=true&output=csv';
const UPDATE_INTERVAL = 5000; // 5 seconds

async function fetchAndRenderLeaderboard() {
    try {
        const response = await fetch(CSV_URL);
        const data = await response.text();

        const rows = data.split('\n').slice(1).filter(row => row.length > 0);
        const allLapEntries = rows.map(row => {
            const [timestamp, name, lapTime] = row.split(',');
            return { name, lapTime: parseFloat(lapTime) };
        });

        // Find the single best time for each racer
        const fastestTimesPerRacer = new Map();
        allLapEntries.forEach(entry => {
            if (!fastestTimesPerRacer.has(entry.name) || entry.lapTime < fastestTimesPerRacer.get(entry.name)) {
                fastestTimesPerRacer.set(entry.name, entry.lapTime);
            }
        });

        // Convert to array and sort
        const uniqueRacers = Array.from(fastestTimesPerRacer, ([name, lapTime]) => ({ name, lapTime }));
        uniqueRacers.sort((a, b) => a.lapTime - b.lapTime);

        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';

        // Render the top 8 racers
        const topRacers = uniqueRacers.slice(0, 8);
        topRacers.forEach((racer, index) => {
            const listItem = document.createElement('li');
            const formattedTime = racer.lapTime.toFixed(3);
            listItem.textContent = `${index + 1}. ${racer.name} - ${formattedTime}s`;
            leaderboardList.appendChild(listItem);
        });

    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        document.getElementById('leaderboard-list').innerHTML = '<li>Error loading leaderboard.</li>';
    }
}

fetchAndRenderLeaderboard();
setInterval(fetchAndRenderLeaderboard, UPDATE_INTERVAL);