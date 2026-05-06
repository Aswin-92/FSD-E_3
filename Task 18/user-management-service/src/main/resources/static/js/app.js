const API_BASE_URL = '/api/users';

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');

// Check for saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.checked = true;
    if (themeLabel) themeLabel.textContent = 'Light Mode';
}

// Theme toggle event
if (themeToggle) {
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            if (themeLabel) themeLabel.textContent = 'Light Mode';
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            if (themeLabel) themeLabel.textContent = 'Dark Mode';
        }
    });
}

// Load users when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleAddUser);
    }
    
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', loadUsers);
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
});

function loadUsers() {
    fetch(API_BASE_URL)
        .then(response => response.json())
        .then(users => {
            displayUsers(users);
        })
        .catch(error => {
            console.error('Error:', error);
            const tbody = document.getElementById('usersTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="7" class="loading">Error loading users</td></tr>';
            }
        });
}

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (!tbody) return;
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No users found</td></tr>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        html += '<tr>';
        html += '<td>' + user.id + '</td>';
        html += '<td>' + escapeHtml(user.firstName) + '</td>';
        html += '<td>' + escapeHtml(user.lastName) + '</td>';
        html += '<td>' + escapeHtml(user.email) + '</td>';
        html += '<td>' + escapeHtml(user.phoneNumber) + '</td>';
        html += '<td>' + escapeHtml(user.department) + '</td>';
        html += '<td class="action-buttons">';
        html += '<button onclick="editUser(' + user.id + ')" class="btn btn-secondary">Edit</button>';
        html += '<button onclick="deleteUser(' + user.id + ')" class="btn btn-danger">Delete</button>';
        html += '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

function handleAddUser(event) {
    event.preventDefault();
    
    const userData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        department: document.getElementById('department').value
    };
    
    fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(() => {
        document.getElementById('userForm').reset();
        loadUsers();
        showMessage('User created successfully!', 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error creating user', 'error');
    });
}

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(API_BASE_URL + '/' + id, {
            method: 'DELETE'
        })
        .then(() => {
            loadUsers();
            showMessage('User deleted successfully!', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error deleting user', 'error');
        });
    }
}

function editUser(id) {
    fetch(API_BASE_URL + '/' + id)
        .then(response => response.json())
        .then(user => {
            const newFirstName = prompt('Enter new first name:', user.firstName);
            if (newFirstName && newFirstName !== user.firstName) user.firstName = newFirstName;
            
            const newLastName = prompt('Enter new last name:', user.lastName);
            if (newLastName && newLastName !== user.lastName) user.lastName = newLastName;
            
            const newEmail = prompt('Enter new email:', user.email);
            if (newEmail && newEmail !== user.email) user.email = newEmail;
            
            const newPhone = prompt('Enter new phone number:', user.phoneNumber);
            if (newPhone && newPhone !== user.phoneNumber) user.phoneNumber = newPhone;
            
            const newDept = prompt('Enter new department:', user.department);
            if (newDept && newDept !== user.department) user.department = newDept;
            
            const updatedUser = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                department: user.department
            };
            
            fetch(API_BASE_URL + '/' + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedUser)
            })
            .then(() => {
                loadUsers();
                showMessage('User updated successfully!', 'success');
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('Error updating user', 'error');
            });
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error fetching user', 'error');
        });
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    
    if (!searchTerm) {
        loadUsers();
        return;
    }
    
    fetch(API_BASE_URL + '/department/' + encodeURIComponent(searchTerm))
        .then(response => response.json())
        .then(users => {
            displayUsers(users);
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error searching users', 'error');
        });
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        border-radius: 6px;
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
    `;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}