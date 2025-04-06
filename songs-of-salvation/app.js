// Initialize songs from localStorage or set empty array if none exists
let songs = JSON.parse(localStorage.getItem('songs')) || [];
let currentView = localStorage.getItem('currentView') || 'grid'; // 'grid' or 'list'
let currentTheme = localStorage.getItem('currentTheme') || 'pastel';

// DOM Elements
const songsContainer = document.getElementById('songsContainer');
const searchInput = document.getElementById('searchInput');
const sortFilter = document.getElementById('sortFilter');
const viewToggle = document.getElementById('viewToggle');
const tagSearch = document.getElementById('tagSearch');
const songDetailModal = document.getElementById('songDetailModal');
const themeButtons = document.querySelectorAll('.theme-btn');

// Theme Management
function setTheme(themeName) {
    document.body.className = `theme-${themeName} font-['Poppins']`;
    localStorage.setItem('currentTheme', themeName);
    currentTheme = themeName;
    
    // Update theme buttons
    themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === themeName);
    });
}

// Initialize theme
setTheme(currentTheme);

// Theme button click handlers
themeButtons.forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme));
});

// View Toggle Management
function toggleView() {
    currentView = currentView === 'grid' ? 'list' : 'grid';
    localStorage.setItem('currentView', currentView);
    viewToggle.innerHTML = currentView === 'grid' ? 
        '<i class="fas fa-list"></i>' : 
        '<i class="fas fa-th-large"></i>';
    renderSongs(filterAndSortSongs());
}

viewToggle.addEventListener('click', toggleView);

// Song Filtering and Sorting
function filterAndSortSongs() {
    let filteredSongs = [...songs];
    const searchTerm = searchInput.value.toLowerCase();
    const tagSearchTerm = tagSearch.value.toLowerCase();

    // Apply search filter
    if (searchTerm) {
        filteredSongs = filteredSongs.filter(song => 
            song.name.toLowerCase().includes(searchTerm) ||
            song.composer.toLowerCase().includes(searchTerm)
        );
    }

    // Apply tag filter
    if (tagSearchTerm) {
        const searchTags = tagSearchTerm.split(',').map(tag => tag.trim());
        filteredSongs = filteredSongs.filter(song =>
            song.tags.some(tag => 
                searchTags.some(searchTag => 
                    tag.toLowerCase().includes(searchTag)
                )
            )
        );
    }

    // Apply sorting
    switch (sortFilter.value) {
        case 'za':
            filteredSongs.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'newest':
            filteredSongs.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            filteredSongs.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        default: // 'az'
            filteredSongs.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filteredSongs;
}

// Song Rendering
function renderSongs(songsToRender) {
    songsContainer.className = currentView === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
        : 'space-y-4';

    songsContainer.innerHTML = songsToRender.map(song => `
        <div class="song-card cursor-pointer" onclick="showSongDetail('${song.id}')">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-lg font-semibold">${song.name}</h3>
                    <p class="text-sm text-gray-600">${song.composer}</p>
                </div>
                ${song.favorite ? '<i class="fas fa-star text-yellow-400"></i>' : ''}
            </div>
            ${song.audioUrl ? '<div class="mt-2"><i class="fas fa-music text-primary"></i> Audio Available</div>' : ''}
            <div class="tags mt-3">
                ${song.tags.map(tag => `
                    <span class="tag">${tag}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Song Detail Modal
function showSongDetail(songId) {
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    const modalSongTitle = document.getElementById('modalSongTitle');
    const modalSongDetails = document.getElementById('modalSongDetails');

    modalSongTitle.textContent = song.name;
    modalSongDetails.innerHTML = `
        <div class="space-y-4">
            <div>
                <p class="text-gray-600">Composer</p>
                <p class="font-semibold">${song.composer}</p>
            </div>
            ${song.audioUrl ? `
                <div>
                    <p class="text-gray-600">Audio</p>
                    <audio controls class="w-full mt-2">
                        <source src="${song.audioUrl}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            ` : ''}
            <div>
                <p class="text-gray-600">Lyrics</p>
                <pre class="whitespace-pre-wrap font-sans mt-2">${song.lyrics}</pre>
            </div>
            <div>
                <p class="text-gray-600">Tags</p>
                <div class="tags mt-2">
                    ${song.tags.map(tag => `
                        <span class="tag">${tag}</span>
                    `).join('')}
                </div>
            </div>
            <div>
                <p class="text-gray-600">Upload Date</p>
                <p>${new Date(song.date).toLocaleDateString()}</p>
            </div>
        </div>
    `;

    songDetailModal.classList.remove('hidden');
}

// Close modals when clicking outside
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    });
});

// Close modals when clicking close button
document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeBtn.closest('.modal').classList.add('hidden');
    });
});

// Event Listeners
searchInput.addEventListener('input', () => renderSongs(filterAndSortSongs()));
sortFilter.addEventListener('change', () => renderSongs(filterAndSortSongs()));
tagSearch.addEventListener('input', () => renderSongs(filterAndSortSongs()));

// Initial render
renderSongs(filterAndSortSongs());

// Subscribe to storage changes
window.addEventListener('storage', (e) => {
    if (e.key === 'songs') {
        songs = JSON.parse(e.newValue) || [];
        renderSongs(filterAndSortSongs());
    }
});