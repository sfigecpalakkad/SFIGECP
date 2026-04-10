/**
 * SFI GECP - Sahayi Resource Loader
 * Handles rendering for Notes, Question Papers, and Scholarships
 */

let selectedDept = null;
let allData = null;
let resourceType = 'notes'; // Default

/**
 * Initialize the page based on the current context
 */
async function initSahayiPage(type) {
    resourceType = type;
    try {
        toggleState('loading', true);

        // Fetch using global DataController
        // Special case for Sahayi: We always need the departments/semesters from local JSON
        const localData = await window.dataController.fetchFromJSON(CONFIG.DATA_SOURCES.SAHAYI_RESOURCES.fallbackUrl);
        allData = localData;

        // Try to fetch live resources from Sheets
        try {
            const liveResources = await window.dataController.fetchData('SAHAYI_RESOURCES');
            if (liveResources && Array.isArray(liveResources)) {
                // If the Sheet returns a flat list, we assume it's the current resource type or a mixed list
                // For 'future-ready', we assume the Sheet has all resource types with a 'type' column
                allData.resources[resourceType] = liveResources.filter(r => !r.type || r.type === resourceType);
            }
        } catch (e) {
            console.warn('[SahayiLoader] Live resources fetch failed, using fallback.', e);
        }
        
        toggleState('loading', false);
        
        if (resourceType === 'scholarships') {
            showElement('resourcesContainer');
            const titleEl = document.getElementById('resourcesTitle');
            if (titleEl) titleEl.textContent = 'Available Scholarships';
            renderGlobalScholarships();
        } else {
            renderDepartments();
        }

    } catch (error) {
        toggleState('loading', false);
        toggleState('error', true, error.message || 'Failed to load study resources');
    }
}

/**
 * Render Department Cards
 */
function renderDepartments() {
    const container = document.getElementById('departmentCards');
    if (!container || !allData.departments) return;

    container.innerHTML = '';
    allData.departments.forEach(dept => {
        const card = document.createElement('div');
        card.className = 'dept-card';
        card.onclick = () => selectDepartment(dept.id, dept.name);
        card.innerHTML = `
            <div class="dept-card-icon">
                <i class="bi ${dept.icon || 'bi-book'}"></i>
            </div>
            <div class="dept-card-name">${dept.name}</div>
        `;
        container.appendChild(card);
    });
}

/**
 * Handle Department Selection
 */
function selectDepartment(deptId, deptName) {
    selectedDept = { id: deptId, name: deptName };

    // View Switching
    hideElement('deptContainer');
    showElement('semesterContainer');

    const titleEl = document.getElementById('semesterTitle');
    if (titleEl) titleEl.textContent = `${deptName} - Select Semester`;
    
    renderSemesters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Render Semester Selection
 */
function renderSemesters() {
    const container = document.getElementById('semesterCards');
    if (!container || !allData.semesters) return;

    container.innerHTML = '';
    allData.semesters.forEach(sem => {
        const card = document.createElement('button');
        card.className = 'semester-card';
        card.textContent = sem;
        card.onclick = () => selectSemester(sem);
        container.appendChild(card);
    });
}

/**
 * Handle Semester Selection
 */
function selectSemester(semester) {
    hideElement('semesterContainer');
    showElement('resourcesContainer');

    const titleEl = document.getElementById('resourcesTitle');
    if (titleEl) titleEl.textContent = `${selectedDept.name} - ${semester} Resources`;
    
    renderResources(semester);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Render Final Resources
 */
function renderResources(semester) {
    const container = document.getElementById('resourcesList');
    if (!container || !allData.resources) return;

    container.innerHTML = '';
    const resources = (allData.resources[resourceType] || []).filter(r =>
        r.department === selectedDept.id && r.semester === semester
    );

    if (resources.length === 0) {
        container.innerHTML = '<p class="text-center text-muted my-5">No resources available for this selection yet. Please check back later!</p>';
        return;
    }

    resources.forEach(res => {
        const card = document.createElement('a');
        card.href = res.gdrive_url || res.link || '#';
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'resource-item-link'; // We'll add this to main.css or leave as is
        
        card.innerHTML = `
            <div class="resource-card-modern">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">${res.title}</h5>
                        <p class="text-muted small mb-0">Open in Google Drive</p>
                    </div>
                    <i class="bi bi-box-arrow-up-right text-danger"></i>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Render Global Scholarships (No Dept/Sem selection)
 */
function renderGlobalScholarships() {
    const container = document.getElementById('resourcesList');
    if (!container || !allData.resources || !allData.resources.scholarships) return;

    container.innerHTML = '';
    
    if (allData.resources.scholarships.length === 0) {
        container.innerHTML = '<p class="text-center text-muted my-5">No scholarships available at the moment. Please check back later!</p>';
        return;
    }

    allData.resources.scholarships.forEach(s => {
        const card = document.createElement('a');
        card.href = s.link || '#';
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'resource-item-link';
        
        card.innerHTML = `
            <div class="resource-card-modern">
                <div class="resource-title mb-2">${s.title}</div>
                <p class="text-muted small mb-3">${s.description || ''}</p>
                <div class="d-flex align-items-center text-danger fw-bold">
                    <i class="bi bi-link-45deg me-1"></i> Learn More
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Navigation Helpers
function backToSemesters() {
    hideElement('resourcesContainer');
    showElement('semesterContainer');
}

function resetSelection() {
    selectedDept = null;
    showElement('deptContainer');
    hideElement('semesterContainer');
    hideElement('resourcesContainer');
}

// UI Utilities
function toggleState(state, show, message = '') {
    const el = document.getElementById(state + 'State');
    if (!el) return;
    
    if (show) {
        el.classList.remove('hidden-container');
        if (state === 'error') {
            const msgEl = document.getElementById('errorMessage');
            if (msgEl) msgEl.textContent = message;
        }
    } else {
        el.classList.add('hidden-container');
    }
}

function showElement(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('d-none');
        el.classList.add('visible-container');
    }
}

function hideElement(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('d-none');
        el.classList.remove('visible-container');
    }
}
