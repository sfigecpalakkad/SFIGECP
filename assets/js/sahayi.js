/**
 * Enhanced Sahayi Navigator with comprehensive error handling
 * Fixes: Loading states, error UI, retry mechanism, network detection
 */

class SahayiNavigator {
  constructor(dataUrl = '../assets/data/sahayi.json') {
    this.dataUrl = dataUrl;
    this.data = null;
    this.currentDept = null;
    this.currentSemester = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  /**
   * Initialize with loading state and error handling
   */
  async init() {
    try {
      this.showLoading('Loading study resources...');

      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      const response = await fetch(this.dataUrl);

      if (!response.ok) {
        throw new Error(`Failed to load resources (HTTP ${response.status}). Please try again later.`);
      }

      this.data = await response.json();

      // Validate data structure
      if (!this.data || !this.data.departments || !this.data.semesters) {
        throw new Error('Invalid data format. Please contact support.');
      }

      this.hideLoading();
      return true;

    } catch (error) {
      this.hideLoading();

      // Retry logic for network errors
      if (this.retryCount < this.maxRetries && error.message.includes('fetch')) {
        this.retryCount++;
        this.showRetryMessage(`Retrying... (Attempt ${this.retryCount}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
        return this.init();
      }

      this.showError(error.message);

      // Fallback empty data
      this.data = {
        departments: [],
        semesters: [],
        resources: { notes: [], qnpapers: [], scholarships: [] }
      };

      return false;
    }
  }

  /**
   * Show loading spinner
   */
  showLoading(message = 'Loading...') {
    const existingLoader = document.getElementById('sahayi-loader');
    if (existingLoader) existingLoader.remove();

    const loader = document.createElement('div');
    loader.id = 'sahayi-loader';
    loader.className = 'fixed-top d-flex align-items-center justify-content-center bg-white bg-opacity-75';
    loader.style.cssText = 'height: 100vh; z-index: 9999;';
    loader.innerHTML = `
      <div class="text-center">
        <div class="spinner-border text-danger" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">${message}</p>
      </div>
    `;
    document.body.appendChild(loader);
  }

  /**
   * Hide loading spinner
   */
  hideLoading() {
    const loader = document.getElementById('sahayi-loader');
    if (loader) loader.remove();
  }

  /**
   * Show retry message
   */
  showRetryMessage(message) {
    const loader = document.getElementById('sahayi-loader');
    if (loader) {
      const messageEl = loader.querySelector('p');
      if (messageEl) messageEl.textContent = message;
    }
  }

  /**
   * Show error message with retry option
   */
  showError(message) {
    const existingError = document.getElementById('sahayi-error');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.id = 'sahayi-error';
    errorDiv.className = 'alert alert-danger alert-dismissible fade show m-4';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.innerHTML = `
      <h4 class="alert-heading"><i class="bi bi-exclamation-triangle-fill me-2"></i>Error Loading Resources</h4>
      <p class="mb-3">${message}</p>
      <div class="d-flex gap-2">
        <button class="btn btn-danger btn-sm" onclick="location.reload()">
          <i class="bi bi-arrow-clockwise me-1"></i>Retry
        </button>
        <button class="btn btn-outline-danger btn-sm" onclick="window.history.back()">
          <i class="bi bi-arrow-left me-1"></i>Go Back
        </button>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const container = document.querySelector('.container') || document.body;
    container.insertBefore(errorDiv, container.firstChild);
  }

  /**
   * Render department cards with error handling
   */
  renderDepartmentCards(container, resourceType = 'notes') {
    if (!this.data || !container) {
      this.showError('Unable to display departments. Please refresh the page.');
      return;
    }

    container.innerHTML = '';
    const depts = this.data.departments;

    if (!depts || depts.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning">
            <i class="bi bi-info-circle me-2"></i>
            No departments available at the moment. Please check back later.
          </div>
        </div>
      `;
      return;
    }

    depts.forEach(dept => {
      const card = document.createElement('div');
      card.className = 'col-md-6 col-lg-4 mb-4';
      card.innerHTML = `
        <div class="card sahayi-dept-card h-100 shadow-sm hover-lift" 
             role="button" 
             tabindex="0"
             aria-label="Select ${dept.name} department">
          <div class="card-body text-center">
            <i class="bi ${dept.icon} text-primary" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
            <h5 class="card-title">${dept.name}</h5>
            <p class="card-text text-muted small">Select to view semesters</p>
            <button class="btn btn-sm btn-outline-primary" 
                    data-dept-id="${dept.id}" 
                    data-resource-type="${resourceType}"
                    aria-label="Select ${dept.name}">
              Select Department
            </button>
          </div>
        </div>
      `;

      // Add click and keyboard handlers
      const cardEl = card.querySelector('.card');
      const btnEl = card.querySelector('button');

      cardEl.addEventListener('click', () => this.selectDepartment(dept.id, resourceType));
      cardEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectDepartment(dept.id, resourceType);
        }
      });

      btnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectDepartment(dept.id, resourceType);
      });

      container.appendChild(card);
    });
  }

  /**
   * Select department with validation
   */
  selectDepartment(deptId, resourceType) {
    const dept = this.data.departments.find(d => d.id === deptId);
    if (!dept) {
      this.showError(`Department "${deptId}" not found.`);
      return;
    }

    this.currentDept = deptId;
    const deptName = dept.name;

    sessionStorage.setItem('sahayiDept', deptId);
    sessionStorage.setItem('sahayiDeptName', deptName);
    sessionStorage.setItem('sahayiResourceType', resourceType);

    const typeMap = { 'notes': 'notes', 'qnpapers': 'qnpapers', 'scholarships': 'scholarship' };
    const page = typeMap[resourceType] || 'notes';

    // Use relative path to avoid subdirectory issues
    window.location.href = `${page}.html?dept=${encodeURIComponent(deptId)}`;
  }

  /**
   * Render semester selection with validation
   */
  renderSemesterSelection(container, resourceType) {
    if (!this.data || !container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const deptId = urlParams.get('dept') || sessionStorage.getItem('sahayiDept');

    if (!deptId) {
      this.showError('No department selected. Please go back and select a department.');
      return;
    }

    const dept = this.data.departments.find(d => d.id === deptId);
    const deptName = dept ? dept.name : 'Department';

    container.innerHTML = `
      <div class="row mb-4">
        <div class="col-12">
          <h3 class="mb-3">
            <a href="index.html" class="btn btn-link text-decoration-none p-0 me-2" aria-label="Go back to departments">
              <i class="bi bi-arrow-left"></i> Back
            </a>
            ${deptName} - Select Semester
          </h3>
        </div>
      </div>
      <div id="semester-grid" class="row"></div>
    `;

    const semesterGrid = container.querySelector('#semester-grid');
    this.data.semesters.forEach(sem => {
      const card = document.createElement('div');
      card.className = 'col-md-4 col-lg-3 mb-3';
      card.innerHTML = `
        <div class="card sahayi-sem-card h-100 shadow-sm hover-lift" style="cursor: pointer;" tabindex="0" role="button" aria-label="View ${sem} resources">
          <div class="card-body text-center">
            <h5 class="card-title">${sem}</h5>
            <button class="btn btn-primary btn-sm" 
                    data-semester="${sem}" 
                    data-dept="${deptId}"
                    aria-label="View ${sem} resources">
              View Resources
            </button>
          </div>
        </div>
      `;

      const cardEl = card.querySelector('.card');
      const btn = card.querySelector('button');

      cardEl.addEventListener('click', () => this.selectSemester(sem, deptId, resourceType));
      cardEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectSemester(sem, deptId, resourceType);
        }
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectSemester(sem, deptId, resourceType);
      });

      semesterGrid.appendChild(card);
    });
  }

  /**
   * Select semester and open Google Drive
   */
  selectSemester(semester, deptId, resourceType) {
    const resourcesOfType = this.data.resources[resourceType] || [];
    const filtered = resourcesOfType.filter(r => r.semester === semester && r.department === deptId);

    if (filtered.length === 0) {
      const dept = this.data.departments.find(d => d.id === deptId);
      const deptName = dept ? dept.name : deptId.toUpperCase();

      this.showError(`No ${resourceType} available for ${deptName} ${semester} yet. Please check back later or contact us if you have materials to share.`);
      return;
    }

    if (filtered[0].gdrive_url) {
      // Open in new tab with security attributes
      window.open(filtered[0].gdrive_url, '_blank', 'noopener,noreferrer');
    } else {
      this.showError('Resource link is missing. Please contact support.');
    }
  }

  /**
   * Render resource list (for future use)
   */
  renderResourceList(container, resourceType, deptId, semester) {
    if (!this.data || !container) return;

    const resourcesOfType = this.data.resources[resourceType] || [];
    const filtered = resourcesOfType.filter(r =>
      r.semester === semester && r.department === deptId
    );

    container.innerHTML = `
      <div class="row mb-4">
        <div class="col-12">
          <h4>${semester} - ${resourceType.toUpperCase()}</h4>
        </div>
      </div>
    `;

    if (filtered.length === 0) {
      container.innerHTML += '<p class="text-muted">No resources available.</p>';
      return;
    }

    const resourceGrid = document.createElement('div');
    resourceGrid.className = 'row';

    filtered.forEach(res => {
      const card = document.createElement('div');
      card.className = 'col-md-6 col-lg-4 mb-3';
      card.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h6 class="card-title">${res.title}</h6>
            <a href="${res.gdrive_url}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="btn btn-sm btn-primary"
               aria-label="Open ${res.title} on Google Drive">
              <i class="bi bi-box-arrow-up-right me-1"></i>Open on Google Drive
            </a>
          </div>
        </div>
      `;
      resourceGrid.appendChild(card);
    });

    container.appendChild(resourceGrid);
  }
}

// Network status monitoring
window.addEventListener('online', () => {
  const errorDiv = document.getElementById('sahayi-error');
  if (errorDiv && errorDiv.textContent.includes('internet connection')) {
    location.reload();
  }
});

window.addEventListener('offline', () => {
  if (window.sahayiNavigator) {
    window.sahayiNavigator.showError('Internet connection lost. Please check your network.');
  }
});

// Initialize on DOM load - only on Sahayi pages
document.addEventListener('DOMContentLoaded', async () => {
  // Check if we're on a Sahayi page by looking for specific elements
  const sahayiContainer = document.getElementById('deptContainer') ||
    document.querySelector('.hero-sahayi');

  if (!sahayiContainer) return; // Exit if not on a Sahayi page

  const navigator = new SahayiNavigator('../assets/data/sahayi.json');
  await navigator.init();
  window.sahayiNavigator = navigator;
});
