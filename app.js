// State management
let engineMode = 'sim'; // 'sim' or 'live'
let currentResponse = null;
let activeFilters = new Set(['even_numbers', 'odd_numbers', 'alphabets', 'special_characters']);
let currentTab = 'visual';

// Request presets
const PRESETS = {
    default: {
        data: ["a", "1", "334", "4", "R", "$"]
    },
    example_b: {
        data: ["2", "a", "y", "4", "&", "-", "*", "5", "92", "b"]
    },
    empty: {
        data: []
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadRequestPreset('default');
    validateJSONInput();
});

// Load Request Preset from Sidebar
function loadRequestPreset(presetKey) {
    const textarea = document.getElementById('json-input');
    textarea.value = JSON.stringify(PRESETS[presetKey], null, 2);
    validateJSONInput();
    
    // Update active visual state in sidebar
    document.querySelectorAll('.request-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const clickedItem = event?.currentTarget;
    if (clickedItem) {
        clickedItem.classList.add('active');
    }
}

// JSON validation on input
function validateJSONInput() {
    const input = document.getElementById('json-input').value;
    const badge = document.getElementById('json-validator');
    
    try {
        const parsed = JSON.parse(input);
        
        // Ensure it contains a "data" array
        if (parsed && Array.isArray(parsed.data)) {
            badge.className = 'validator-badge valid';
            badge.innerHTML = '<i data-lucide="check-circle"></i> Valid JSON';
            document.getElementById('btn-submit').disabled = false;
        } else {
            badge.className = 'validator-badge invalid';
            badge.innerHTML = '<i data-lucide="alert-circle"></i> Missing "data" array';
            document.getElementById('btn-submit').disabled = true;
        }
    } catch (e) {
        badge.className = 'validator-badge invalid';
        badge.innerHTML = '<i data-lucide="alert-circle"></i> Invalid Syntax';
        document.getElementById('btn-submit').disabled = true;
    }
    lucide.createIcons();
}

// Switch between Built-in Simulator and Live Server
function setEngineMode(mode) {
    engineMode = mode;
    
    // Toggle active classes on buttons
    document.getElementById('btn-simulation').classList.toggle('active', mode === 'sim');
    document.getElementById('btn-live').classList.toggle('active', mode === 'live');
    
    // Show/hide live URL configuration
    const urlContainer = document.getElementById('live-url-container');
    if (mode === 'live') {
        urlContainer.classList.remove('hidden');
    } else {
        urlContainer.classList.add('hidden');
    }
}

// Toggle response view tabs (Visual vs Raw JSON)
function switchResponseTab(tab) {
    currentTab = tab;
    
    document.getElementById('tab-visual').classList.toggle('active', tab === 'visual');
    document.getElementById('tab-raw').classList.toggle('active', tab === 'raw');
    
    document.getElementById('body-visual').classList.toggle('hidden', tab !== 'visual');
    document.getElementById('body-raw').classList.toggle('hidden', tab !== 'raw');
}

// Toggle filter pills
function toggleFilter(pill) {
    const filterKey = pill.getAttribute('data-filter');
    
    if (activeFilters.has(filterKey)) {
        if (activeFilters.size > 1) { // Maintain at least one visible filter
            activeFilters.delete(filterKey);
            pill.classList.remove('active');
        }
    } else {
        activeFilters.add(filterKey);
        pill.classList.add('active');
    }
    
    applyVisualFilters();
}

// Apply visual filters by showing/hiding array lists
function applyVisualFilters() {
    const filters = ['even_numbers', 'odd_numbers', 'alphabets', 'special_characters'];
    
    filters.forEach(f => {
        const element = document.getElementById(`container-${f}`);
        if (element) {
            if (activeFilters.has(f)) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    });
}

// Primary execution handler
async function executeApiRequest() {
    const inputVal = document.getElementById('json-input').value;
    let payload;
    
    try {
        payload = JSON.parse(inputVal);
    } catch (e) {
        alert("Please provide valid JSON input.");
        return;
    }
    
    // UI state transitions
    document.getElementById('response-empty').classList.add('hidden');
    document.getElementById('response-workspace').classList.add('hidden');
    document.getElementById('response-loading').classList.remove('hidden');
    document.getElementById('response-meta').classList.add('hidden');
    
    const startTime = performance.now();
    
    if (engineMode === 'sim') {
        // Run Client-Side API logic simulator
        setTimeout(() => {
            const results = simulateBfhlEndpoint(payload.data);
            const endTime = performance.now();
            const timeTaken = Math.round(endTime - startTime);
            
            displayResponse(results, 200, timeTaken);
        }, 300); // Small delay to feel active
    } else {
        // Real server request
        const url = document.getElementById('backend-url').value;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const endTime = performance.now();
            const timeTaken = Math.round(endTime - startTime);
            
            if (response.ok) {
                const results = await response.json();
                displayResponse(results, response.status, timeTaken);
            } else {
                throw new Error(`HTTP Error Status: ${response.status}`);
            }
        } catch (error) {
            document.getElementById('response-loading').classList.add('hidden');
            document.getElementById('response-empty').classList.remove('hidden');
            alert(`API connection failed: ${error.message}. Please verify the Spring Boot server is running and CORS is enabled.`);
        }
    }
}

// Display parsed data on cards and layouts
function displayResponse(data, status, duration) {
    currentResponse = data;
    
    // UI states
    document.getElementById('response-loading').classList.add('hidden');
    document.getElementById('response-workspace').classList.remove('hidden');
    
    const metaContainer = document.getElementById('response-meta');
    metaContainer.classList.remove('hidden');
    
    const statusTag = document.getElementById('resp-status');
    statusTag.className = `meta-tag status-${status}`;
    statusTag.innerText = `${status} ${status === 200 ? 'OK' : 'Error'}`;
    
    document.getElementById('resp-time').innerHTML = `<i data-lucide="clock"></i> ${duration}ms`;
    
    // Metadata mapping
    document.getElementById('res-user-id').innerText = data.user_id || 'N/A';
    document.getElementById('res-email').innerText = data.email || 'N/A';
    document.getElementById('res-roll-number').innerText = data.roll_number || 'N/A';
    document.getElementById('res-sum').innerText = data.sum !== undefined ? data.sum : '0';
    document.getElementById('res-concat-string').innerText = data.concat_string || '-';
    
    // Arrays mapping and filters counts
    mapArrayList('even_numbers', 'list-even', 'count-even', 'badge-count-even', data.even_numbers);
    mapArrayList('odd_numbers', 'list-odd', 'count-odd', 'badge-count-odd', data.odd_numbers);
    mapArrayList('alphabets', 'list-alpha', 'count-alpha', 'badge-count-alpha', data.alphabets);
    
    // Support both correct and typo key from PDF
    const specChars = data.special_characters || data.sepcial_characters || [];
    mapArrayList('special_characters', 'list-special', 'count-special', 'badge-count-special', specChars);
    
    // Render Raw JSON tab
    document.getElementById('raw-json-code').innerText = JSON.stringify(data, null, 2);
    
    applyVisualFilters();
    lucide.createIcons();
}

// Populate and style an array inside list containers
function mapArrayList(filterKey, listId, countPillId, countBadgeId, itemsArray = []) {
    const listElement = document.getElementById(listId);
    const countPill = document.getElementById(countPillId);
    const countBadge = document.getElementById(countBadgeId);
    
    listElement.innerHTML = '';
    
    if (itemsArray.length === 0) {
        listElement.innerHTML = '<span class="preset-hint">No elements found</span>';
    } else {
        itemsArray.forEach(item => {
            const span = document.createElement('span');
            span.className = 'element-pill';
            span.innerText = item;
            listElement.appendChild(span);
        });
    }
    
    countPill.innerText = itemsArray.length;
    countBadge.innerText = itemsArray.length;
}

// Client-Side Algorithm (Simulation of Backend REST rules)
function simulateBfhlEndpoint(inputArray = []) {
    const even_numbers = [];
    const odd_numbers = [];
    const alphabets = [];
    const special_characters = [];
    let sumVal = 0;
    
    // Extract alphabetical characters array in sequence
    const allAlphabetChars = [];
    
    inputArray.forEach(item => {
        const str = String(item).trim();
        if (str === "") return;
        
        // 1. Check if the element represents a complete integer number
        if (/^-?\d+$/.test(str)) {
            const num = parseInt(str, 10);
            sumVal += num;
            
            // Add as string to even or odd
            if (num % 2 === 0) {
                even_numbers.push(str);
            } else {
                odd_numbers.push(str);
            }
        } 
        // 2. Process non-number string elements
        else {
            // Is it purely alphanumeric or contains letters?
            // If it is multi-character (like "ABCD"), we push to alphabets
            if (/^[a-zA-Z]+$/.test(str)) {
                alphabets.push(str.toUpperCase());
                
                // Add all individual characters of this word to our characters list for concatenation
                for (let char of str) {
                    if (/[a-zA-Z]/.test(char)) {
                        allAlphabetChars.push(char);
                    }
                }
            } else {
                // If it contains non-alphanumeric chars or single special characters like "$", "&", etc.
                // Let's capture it as special character
                special_characters.push(str);
            }
        }
    });
    
    // 3. Concatenate all characters in reverse order in alternating caps (Upper, lower, Upper...)
    let concat_string = "";
    if (allAlphabetChars.length > 0) {
        // Reverse characters array
        const reversed = [...allAlphabetChars].reverse();
        
        // Map to alternating caps
        concat_string = reversed.map((char, index) => {
            return index % 2 === 0 ? char.toUpperCase() : char.toLowerCase();
        }).join('');
    }
    
    return {
        is_success: true,
        user_id: "karan_patel_26052026",
        email: "karan.patel@acropolis.in",
        roll_number: "ACR-2026-XYZ",
        even_numbers: even_numbers,
        odd_numbers: odd_numbers,
        alphabets: alphabets,
        special_characters: special_characters,
        sepcial_characters: special_characters, // Typo support for automated test suites
        sum: String(sumVal),
        concat_string: concat_string
    };
}

// Spec Modal actions
function toggleModal(show) {
    const modal = document.getElementById('spec-modal');
    modal.classList.toggle('hidden', !show);
}
