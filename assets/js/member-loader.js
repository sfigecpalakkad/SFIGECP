/**
 * SFI GECP - Member Loader
 * Dynamically renders Unit Committee and Contact cards
 */

/**
 * Transformer for Member CSV Data
 */
function transformMemberData(csvData) {
    if (!Array.isArray(csvData)) return csvData;
    
    // If it's already in the correct JSON format (fallback), return as is
    if (csvData.length > 0 && Array.isArray(csvData[0].committee)) {
        return csvData[0];
    }
    
    // Transform flat CSV rows into the committee structure
    return {
        committee: csvData.map(row => ({
            name: row.name || row.Name || '',
            position: row.position || row.Position || '',
            image: row.image || row.Image || '',
            phone: row.phone || row.Phone || '',
            whatsapp: row.whatsapp || row.WhatsApp || '',
            order: parseInt(row.order || row.Order || '99'),
            showInContact: (row.showInContact || row.ShowInContact || 'true').toLowerCase() === 'true'
        }))
    };
}

async function loadMembers() {
    try {
        const data = await window.dataController.fetchData('MEMBERS', transformMemberData);
        if (!data || !data.committee) return;

        renderUnitCommittee(data.committee);
        renderContactCards(data.committee);
    } catch (error) {
        console.error('[MemberLoader] Failed to load members:', error);
    }
}

/**
 * Render Unit Committee (Secretary & President)
 */
function renderUnitCommittee(members) {
    const container = document.getElementById('unit-committee-cards');
    if (!container) return;

    const committeeMembers = members
        .filter(member => (member.position === 'Secretary' || member.position === 'President'))
        .sort((a, b) => a.order - b.order);

    container.innerHTML = ''; // Clear placeholders
    committeeMembers.forEach((member, index) => {
        const card = createMemberCard(member, index, 'col-lg-6 col-md-6 col-sm-12');
        container.innerHTML += card;
    });
}

/**
 * Render Contact Cards (Other members marked for contact)
 */
function renderContactCards(members) {
    const container = document.getElementById('contact-cards-container');
    if (!container) return;

    const contactMembers = members
        .filter(member => member.showInContact && member.position !== 'Secretary' && member.position !== 'President')
        .sort((a, b) => a.order - b.order);

    container.innerHTML = ''; // Clear placeholders
    contactMembers.forEach((member, index) => {
        const card = createContactCard(member, index);
        container.innerHTML += card;
    });
}

/**
 * Helper: Create Unit Committee Card HTML
 */
function createMemberCard(member, index, bootstrapClass) {
    return `
        <div class="${bootstrapClass}" data-aos="fade-up" data-aos-delay="${100 + (index * 50)}">
            <div class="member-card">
                <div class="member-image">
                    ${member.image ? `<img src="${member.image}" alt="Portrait of ${member.name}">` : `<i class="bi bi-person-circle" style="font-size: 3rem; color: white !important;"></i>`}
                </div>
                <p class="member-position">${member.position}</p>
                <h3 class="member-name">${member.name}</h3>
                <div class="member-contact-links">
                    ${member.phone ? `<a href="tel:${member.phone}" class="contact-link" title="Call"><i class="bi bi-telephone"></i></a>` : ''}
                    ${member.whatsapp ? `
                        <a href="https://wa.me/${member.whatsapp.replace(/[^0-9]/g, '')}" class="contact-link" title="WhatsApp" target="_blank">
                            <i class="bi bi-whatsapp"></i>
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

/**
 * Helper: Create Contact Card HTML
 */
function createContactCard(member, index) {
    return `
        <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="${100 + (index * 100)}">
            <div class="contact-card">
                <div class="contact-icon">
                    ${member.image ? `<img src="${member.image}" alt="${member.name}" class="contact-image">` : `<i class="bi bi-person-circle" style="font-size: 3rem; color: white !important;"></i>`}
                </div>
                <h4>${member.name}</h4>
                <p class="position">${member.position}</p>
                ${member.phone ? `
                    <a href="tel:${member.phone}" class="contact-phone">
                        <i class="bi bi-telephone"></i> ${member.phone}
                    </a>
                ` : ''}
                ${member.whatsapp ? `
                    <a href="https://wa.me/${member.whatsapp.replace(/[^0-9]/g, '')}" class="contact-whatsapp" target="_blank">
                        <i class="bi bi-whatsapp"></i> WhatsApp
                    </a>
                ` : ''}
            </div>
        </div>
    `;
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', loadMembers);
