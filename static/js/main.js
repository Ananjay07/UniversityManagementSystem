// ============================================
// Main JavaScript for UMS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeAlerts();
    initializeNavigation();
    initializeEventListeners();
});

/**
 * Initialize alert close functionality
 */
function initializeAlerts() {
    const closeButtons = document.querySelectorAll('.close-alert');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const alert = this.closest('.alert');
            if (alert) {
                alert.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => {
                    alert.remove();
                }, 300);
            }
        });
    });
}

/**
 * Initialize navigation active state
 */
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

/**
 * Initialize form event listeners
 */
function initializeEventListeners() {
    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });

    // Table sorting
    const sortableHeaders = document.querySelectorAll('[data-sortable]');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', handleTableSort);
    });

    // Delete confirmation
    const deleteButtons = document.querySelectorAll('[data-action="delete"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleDeleteConfirmation);
    });
}

/**
 * Handle form submission with validation
 */
function handleFormSubmit(e) {
    const requiredFields = this.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            field.focus();
        } else {
            field.classList.remove('error');
        }
    });

    if (!isValid) {
        e.preventDefault();
        showNotification('Please fill all required fields', 'warning');
    }
}

/**
 * Handle table sorting
 */
function handleTableSort(e) {
    const table = e.target.closest('table');
    const columnIndex = Array.from(e.target.parentNode.children).indexOf(e.target);
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const isAscending = !e.target.classList.contains('ascending');

    rows.sort((a, b) => {
        const aValue = a.children[columnIndex].textContent.trim();
        const bValue = b.children[columnIndex].textContent.trim();

        if (!isNaN(aValue) && !isNaN(bValue)) {
            return isAscending ? aValue - bValue : bValue - aValue;
        }

        return isAscending 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
    });

    const tbody = table.querySelector('tbody');
    rows.forEach(row => tbody.appendChild(row));

    // Update sort indicators
    table.querySelectorAll('th').forEach(th => {
        th.classList.remove('ascending', 'descending');
    });
    e.target.classList.add(isAscending ? 'ascending' : 'descending');
}

/**
 * Handle delete confirmation
 */
function handleDeleteConfirmation(e) {
    e.preventDefault();
    const message = this.getAttribute('data-confirm') || 'Are you sure you want to delete this item?';
    
    if (confirm(message)) {
        const form = this.closest('form');
        if (form) {
            form.submit();
        } else {
            window.location.href = this.href;
        }
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        ${message}
        <button class="close-alert">&times;</button>
    `;

    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        const closeButton = alertDiv.querySelector('.close-alert');
        closeButton.addEventListener('click', function() {
            alertDiv.remove();
        });

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Format percentage
 */
function formatPercentage(value, total) {
    if (total === 0) return '0%';
    return Math.round((value / total) * 100) + '%';
}

/**
 * Calculate average
 */
function calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    return (numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2);
}

/**
 * Toggle visibility of elements
 */
function toggleElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * Get query parameter from URL
 */
function getQueryParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Export table to CSV
 */
function exportTableToCSV(tableId, filename = 'export.csv') {
    const table = document.getElementById(tableId);
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const rowData = [];
        cols.forEach(col => {
            rowData.push(col.textContent.trim());
        });
        csv.push(rowData.join(','));
    });

    downloadCSV(csv.join('\n'), filename);
}

/**
 * Download CSV file
 */
function downloadCSV(data, filename) {
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(data);
    link.download = filename;
    link.click();
}

/**
 * Print page
 */
function printPage(elementId = null) {
    if (elementId) {
        const element = document.getElementById(elementId);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(element.innerHTML);
        printWindow.document.close();
        printWindow.print();
    } else {
        window.print();
    }
}

/**
 * Add animation when elements appear
 */
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .stat-card').forEach(el => {
        observer.observe(el);
    });
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .error {
        border-color: var(--danger-color) !important;
        background-color: rgba(231, 76, 60, 0.05) !important;
    }

    [data-sortable] {
        cursor: pointer;
        user-select: none;
    }

    [data-sortable].ascending::after {
        content: ' ↑';
    }

    [data-sortable].descending::after {
        content: ' ↓';
    }

    .fade-in {
        animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideOut {
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }

    .active {
        background: rgba(255, 255, 255, 0.2) !important;
        border-bottom: 3px solid white !important;
    }
`;
document.head.appendChild(style);

// Initialize animations on page load
observeElements();
