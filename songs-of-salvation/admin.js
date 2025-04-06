// Admin credentials
const ADMIN_EMAIL = 'maxyrocs01@gmail.com';
const ADMIN_PASSWORD = 'maxyrocs01@gmail.com';

// DOM Elements
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLoginModal = document.getElementById('adminLoginModal');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminDashboardModal = document.getElementById('adminDashboardModal');
const songUploadForm = document.getElementById('songUploadForm');
const manageSongsList = document.getElementById('manageSongsList');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize songs from localStorage
let songs = JSON.parse(localStorage.getItem('songs')) || [];

// Admin Login
adminLoginBtn.addEventListener('click', () => {
    adminLoginModal.classList.remove('hidden');
});

adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        adminLoginModal.classList.add('hidden');
        adminDashboardModal.classList.remove('hidden');
        window.renderManageSongs(); // Show songs list immediately after login
    } else {
        alert('Invalid credentials. Please try again.');
    }
});

// Tab Switching
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Show corresponding tab content
        const tabName = button.dataset.tab;
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });

        if (tabName === 'manage') {
            window.renderManageSongs(); // Refresh songs list when switching to manage tab
        }
    });
});

// Convert audio file to base64
function convertAudioToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Song Upload
songUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const songName = document.getElementById('songName').value;
    const composer = document.getElementById('composer').value;
    const lyrics = document.getElementById('lyrics').value;
    const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const audioFile = document.getElementById('audioFile').files[0];
    const favorite = document.getElementById('favorite').checked;

    try {
        let audioUrl = '';
        if (audioFile) {
            if (!['audio/mp3', 'audio/mpeg', 'audio/wav'].includes(audioFile.type)) {
                alert('Please upload only MP3 or WAV files.');
                return;
            }
            audioUrl = await convertAudioToBase64(audioFile);
        }

        const newSong = {
            id: Date.now().toString(),
            name: songName,
            composer: composer,
            lyrics: lyrics,
            tags: tags,
            audioUrl: audioUrl,
            favorite: favorite,
            date: new Date().toISOString()
        };

        // Add new song to array and save
        songs.push(newSong);
        localStorage.setItem('songs', JSON.stringify(songs));

        // Reset form
        songUploadForm.reset();
        alert('Song uploaded successfully!');

        // Switch to manage tab to show the newly added song
        document.querySelector('[data-tab="manage"]').click();

    } catch (error) {
        console.error('Error uploading song:', error);
        alert('Error uploading song. Please try again.');
    }
});

// Delete Song
window.deleteSong = function(songId) {
    if (confirm('Are you sure you want to delete this song?')) {
        songs = songs.filter(song => song.id !== songId);
        localStorage.setItem('songs', JSON.stringify(songs));
        window.renderManageSongs();
    }
};

// Edit Song
window.editSong = function(songId) {
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    // Create edit form HTML
    const editFormHTML = `
        <div class="edit-form space-y-4 bg-white p-6 rounded-lg">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold">Edit Song</h3>
                <button onclick="window.renderManageSongs()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div>
                <label class="block mb-1">Song Name</label>
                <input type="text" id="editSongName" value="${song.name}" class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary" required>
            </div>
            <div>
                <label class="block mb-1">Composer</label>
                <input type="text" id="editComposer" value="${song.composer}" class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary" required>
            </div>
            <div>
                <label class="block mb-1">Lyrics</label>
                <textarea id="editLyrics" class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary" rows="4" required>${song.lyrics}</textarea>
            </div>
            <div>
                <label class="block mb-1">Tags (comma separated)</label>
                <input type="text" id="editTags" value="${song.tags.join(', ')}" class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary">
            </div>
            <div>
                <label class="block mb-1">New Audio File (optional)</label>
                <input type="file" id="editAudioFile" accept=".mp3,.wav" class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary">
                ${song.audioUrl ? '<p class="text-sm text-gray-500 mt-1">Current audio file will be kept if no new file is selected</p>' : ''}
            </div>
            <div class="flex items-center">
                <input type="checkbox" id="editFavorite" ${song.favorite ? 'checked' : ''} class="mr-2">
                <label for="editFavorite">Mark as Favorite</label>
            </div>
            <div class="flex gap-2 mt-6">
                <button onclick="window.updateSong('${songId}')" class="btn-primary flex-1">Save Changes</button>
                <button onclick="window.renderManageSongs()" class="btn-secondary">Cancel</button>
            </div>
        </div>
    `;

    // Replace the manage songs list with the edit form
    manageSongsList.innerHTML = editFormHTML;
};

// Update Song
window.updateSong = async function(songId) {
    const songIndex = songs.findIndex(s => s.id === songId);
    if (songIndex === -1) return;

    const editedSong = { ...songs[songIndex] };
    const audioFile = document.getElementById('editAudioFile').files[0];

    try {
        // Update audio if new file is selected
        if (audioFile) {
            if (!['audio/mp3', 'audio/mpeg', 'audio/wav'].includes(audioFile.type)) {
                alert('Please upload only MP3 or WAV files.');
                return;
            }
            editedSong.audioUrl = await convertAudioToBase64(audioFile);
        }

        // Update other fields
        editedSong.name = document.getElementById('editSongName').value;
        editedSong.composer = document.getElementById('editComposer').value;
        editedSong.lyrics = document.getElementById('editLyrics').value;
        editedSong.tags = document.getElementById('editTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        editedSong.favorite = document.getElementById('editFavorite').checked;

        // Update songs array and save
        songs[songIndex] = editedSong;
        localStorage.setItem('songs', JSON.stringify(songs));

        alert('Song updated successfully!');
        window.renderManageSongs();

    } catch (error) {
        console.error('Error updating song:', error);
        alert('Error updating song. Please try again.');
    }
};

// Render Manage Songs List
window.renderManageSongs = function() {
    if (songs.length === 0) {
        manageSongsList.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                No songs have been uploaded yet.
            </div>
        `;
        return;
    }
    
    manageSongsList.innerHTML = songs.map(song => `
        <div class="song-item p-4 bg-white rounded-lg shadow-sm mb-4">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold">${song.name}</h3>
                    <p class="text-sm text-gray-600">${song.composer}</p>
                    <p class="text-sm text-gray-500 mt-1">Uploaded: ${new Date(song.date).toLocaleDateString()}</p>
                    <div class="mt-2">
                        <p class="text-sm text-gray-600">Lyrics:</p>
                        <p class="text-sm mt-1">${song.lyrics}</p>
                    </div>
                    <div class="tags mt-2">
                        ${song.tags.map(tag => `
                            <span class="tag">${tag}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="flex gap-2 ml-4">
                    <button onclick="window.editSong('${song.id}')" class="btn-secondary px-3 py-1">
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                    <button onclick="window.deleteSong('${song.id}')" class="btn-secondary bg-red-500 px-3 py-1">
                        <i class="fas fa-trash mr-1"></i> Delete
                    </button>
                </div>
            </div>
            ${song.audioUrl ? `
                <div class="mt-3">
                    <p class="text-sm text-gray-600 mb-1">Audio Preview:</p>
                    <audio controls class="w-full">
                        <source src="${song.audioUrl}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            ` : ''}
        </div>
    `).join('');
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load songs from localStorage
    songs = JSON.parse(localStorage.getItem('songs')) || [];
});
