/**
 * Sahayi - Study Companion
 * Data-driven navigation: Departments → Semesters → Google Drive Resources
 */

class SahayiNavigator {
  constructor(dataUrl = '/assets/data/sahayi.json') {
    this.dataUrl = dataUrl;
    this.data = null;
    this.currentDept = null;
    this.currentSemester = null;
  }

  async init() {
    try {
      const response = await fetch(this.dataUrl);
      if (!response.ok) throw new Error(`Failed to load Sahayi data: ${response.status}`);
      this.data = await response.json();
    } catch (error) {
      console.error('Sahayi init error:', error);
      this.data = { departments: [], semesters: [], resources: { notes: [], qnpapers: [], scholarships: [] } };
    }
  }

  renderDepartmentCards(container, resourceType = 'notes') {
    if (!this.data || !container) return;

    container.innerHTML = '';
    const depts = this.data.departments;

    depts.forEach(dept => {
      const card = document.createElement('div');
      card.className = 'col-md-6 col-lg-4 mb-4';
      card.innerHTML = `
        <div class="card sahayi-dept-card h-100 shadow-sm hover-lift" role="button" tabindex="0">
          <div class="card-body text-center">
            <i class="bi ${dept.icon} text-primary" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
            <h5 class="card-title">${dept.name}</h5>
            <p class="card-text text-muted small">Select to view semesters</p>
            <button class="btn btn-sm btn-outline-primary" data-dept-id="${dept.id}" data-resource-type="${resourceType}">
              Select Department
            </button>
          </div>
        </div>
      `;

      card.addEventListener('click', () => this.selectDepartment(dept.id, resourceType));
      card.querySelector('button').addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectDepartment(dept.id, resourceType);
      });

      container.appendChild(card);
    });
  }

  selectDepartment(deptId, resourceType) {
    this.currentDept = deptId;
    const deptName = this.data.departments.find(d => d.id === deptId)?.name || deptId;
    
    sessionStorage.setItem('sahayiDept', deptId);
    sessionStorage.setItem('sahayiDeptName', deptName);
    sessionStorage.setItem('sahayiResourceType', resourceType);

    const typeMap = { 'notes': 'notes', 'qnpapers': 'qnpapers', 'scholarships': 'scholarships' };
    const page = typeMap[resourceType] || 'notes';
    window.location.href = `/sahayi/${page}.html?dept=${deptId}`;
  }

  renderSemesterSelection(container, resourceType) {
    if (!this.data || !container) return;

    const deptId = new URLSearchParams(window.location.search).get('dept') || sessionStorage.getItem('sahayiDept');
    const deptName = this.data.departments.find(d => d.id === deptId)?.name || 'Department';

    container.innerHTML = `
      <div class="row mb-4">
        <div class="col-12">
          <h3 class="mb-3">
            <a href="/sahayi/index.html" class="btn btn-link text-decoration-none p-0 me-2">
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
        <div class="card sahayi-sem-card h-100 shadow-sm hover-lift" style="cursor: pointer;">
          <div class="card-body text-center">
            <h5 class="card-title">${sem}</h5>
            <button class="btn btn-primary btn-sm" data-semester="${sem}" data-dept="${deptId}">
              View Resources
            </button>
          </div>
        </div>
      `;

      const btn = card.querySelector('button');
      btn.addEventListener('click', () => {
        this.selectSemester(sem, deptId, resourceType);
      });

      semesterGrid.appendChild(card);
    });
  }

  selectSemester(semester, deptId, resourceType) {
    const resourcesOfType = this.data.resources[resourceType] || [];
    const filtered = resourcesOfType.filter(r => r.semester === semester && r.department === deptId);

    if (filtered.length === 0) {
      alert(`No ${resourceType} available for ${deptId.toUpperCase()} ${semester}`);
      return;
    }

    if (filtered[0].gdrive_url) {
      window.open(filtered[0].gdrive_url, '_blank', 'noopener,noreferrer');
    }
  }

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
            <a href="${res.gdrive_url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">
              Open on Google Drive
            </a>
          </div>
        </div>
      `;
      resourceGrid.appendChild(card);
    });

    container.appendChild(resourceGrid);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const navigator = new SahayiNavigator('/assets/data/sahayi.json');
  await navigator.init();
  window.sahayiNavigator = navigator;
});
