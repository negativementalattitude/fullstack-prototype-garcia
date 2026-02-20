(function initializeSystem() {
    // 1. FORCE WIPE ALL DATA ON REFRESH
    localStorage.removeItem('users'); 
    localStorage.removeItem('employees'); 
    localStorage.removeItem('requests');
    localStorage.removeItem('departments');
    localStorage.removeItem('unverified_email');
    
    // 2. RE-CREATE ADMIN ACCOUNT
    const users = [];
    const adminUser = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'admin123', 
        role: 'admin',       
        verified: true
    };
    users.push(adminUser);
    localStorage.setItem('users', JSON.stringify(users));

    // 3. RE-CREATE DEFAULT DEPARTMENTS
    const defaultDepts = [
        { name: 'Engineering', desc: 'Software and Hardware Team' },
        { name: 'HR', desc: 'Human Resources' },
        { name: 'CCS', desc: 'College of Computer Studies' },
        { name: 'Business', desc: 'Business & Accountancy' }
    ];
    localStorage.setItem('departments', JSON.stringify(defaultDepts));
    
    console.log("System Reset: All data erased. Admin & Default Departments restored.");
})();

let currentUser = null; 
let editingEmail = null; 
let editingEmployeeId = null;
let editingDeptName = null;
let editingRequestId = null; 

function navigateTo(hash) {
    window.location.hash = hash; 
}

function updateNavbar() {
    const publicNav = document.getElementById('nav-public');
    const adminNav = document.getElementById('nav-admin');
    const userNav = document.getElementById('nav-user');

    publicNav.classList.add('d-none');
    adminNav.classList.add('d-none');
    if(userNav) userNav.classList.add('d-none');

    if (!currentUser) {
        publicNav.classList.remove('d-none');
    } else if (currentUser.role === 'admin') {
        adminNav.classList.remove('d-none');
    } else {
        if(userNav) userNav.classList.remove('d-none');
    }
}

function checkLoginNotification() {
    const alertBox = document.getElementById('login-alert');
    if (!alertBox) return;

    if (localStorage.getItem('show_login_message') === 'true') {
        alertBox.textContent = "✅ Email verified! You can now log in.";
        alertBox.classList.remove('d-none');
        localStorage.removeItem('show_login_message');
    } else {
        alertBox.classList.add('d-none');
    }
}

function handleRouting() {
    const hash = window.location.hash || '#/home'; 

    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none'; 
    });

    let pageId = 'home-page';

    switch(hash) {
        case '#/home':
            pageId = 'home-page';
            const warningBox = document.getElementById('storage-warning');
            if (warningBox) {
                if (currentUser && currentUser.role === 'admin') {
                    warningBox.classList.add('d-none'); 
                } else {
                    warningBox.classList.remove('d-none'); 
                }
            }
            break;

        case '#/register':
            pageId = 'register-page';
            document.getElementById('register-form').reset();
            break;

        case '#/login':
            pageId = 'login-page';
            checkLoginNotification(); 
            document.getElementById('login-form').reset(); 
            break;

        case '#/verify-email':
            pageId = 'verify-page';
            setupVerifyPage(); 
            break;
        
        case '#/admin-dashboard':
            if (!currentUser || currentUser.role !== 'admin') {
                alert("Admin access only.");
                if (currentUser) window.location.hash = '#/dashboard';
                else window.location.hash = '#/login';
                return;
            }
            pageId = 'admin-dashboard-page';
            document.getElementById('admin-name-display').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
            document.getElementById('admin-email-display').textContent = currentUser.email;
            break;

        case '#/admin-employees':
            if (!currentUser || currentUser.role !== 'admin') {
                alert("Admin access only.");
                if (currentUser) window.location.hash = '#/dashboard';
                else window.location.hash = '#/login';
                return;
            }
            pageId = 'admin-employees-page';
            renderEmployeesTable(); 
            break;

        case '#/admin-accounts':
            if (!currentUser || currentUser.role !== 'admin') {
                alert("Admin access only.");
                if (currentUser) window.location.hash = '#/dashboard';
                else window.location.hash = '#/login';
                return;
            }
            pageId = 'admin-accounts-page';
            renderAccountsTable(); 
            break;

        case '#/dashboard':
            if (!currentUser) {
                window.location.hash = '#/login'; 
                return;
            }
            pageId = 'welcome-page';
            document.getElementById('user-name-display').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
            document.getElementById('user-email-display').textContent = currentUser.email;
            break;

        case '#/admin-departments':
            if (!currentUser || currentUser.role !== 'admin') {
                alert("Admin access only.");
                if (currentUser) window.location.hash = '#/dashboard';
                else window.location.hash = '#/login';
                return;
            }
            pageId = 'admin-departments-page';
            renderDepartmentsTable(); 
            break;
        
        case '#/my-requests':
            if (!currentUser) {
                window.location.hash = '#/login';
                return;
            }
            pageId = 'admin-requests-page';
            renderRequestsTable();
            break;

        default:
            pageId = 'home-page';
    }

    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
        activePage.style.display = 'block';
    }
    
    updateNavbar();
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);

function logout() {
    currentUser = null;
    updateNavbar(); 
    window.location.hash = '#/login';
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            if (user.verified) {
                currentUser = user; 
                if (user.role === 'admin') {
                    window.location.hash = '#/admin-dashboard';
                } else {
                    window.location.hash = '#/dashboard';
                }
            } else {
                alert("Please verify your email first.");
                localStorage.setItem('unverified_email', email);
                navigateTo('#/verify-email');
            }
        } else {
            alert("Invalid email or password.");
        }
    });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        const firstName = document.getElementById('reg-firstname').value;
        const lastName = document.getElementById('reg-lastname').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        if (password.length < 6) { alert("Password must be at least 6 characters."); return; }
        const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
        if (existingUsers.find(u => u.email === email)) { alert("Email already registered!"); return; }

        const newUser = { firstName, lastName, email, password, role: 'user', verified: false };
        existingUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(existingUsers));
        localStorage.setItem('unverified_email', email);
        navigateTo('#/verify-email');
        registerForm.reset();
    });
}

function setupVerifyPage() {
    const email = localStorage.getItem('unverified_email');
    if(email) document.getElementById('display-verify-email').textContent = email;
}
const btnVerify = document.getElementById('btn-simulate-verify');
if(btnVerify) {
    btnVerify.addEventListener('click', function() {
        const email = localStorage.getItem('unverified_email');
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
            users[userIndex].verified = true;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('show_login_message', 'true');
            navigateTo('#/login');
        }
    });
}

function renderAccountsTable() {
    const tbody = document.getElementById('accounts-table-body');
    const msg = document.getElementById('no-accounts-msg');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    tbody.innerHTML = '';

    if (users.length === 0) {
        msg.classList.remove('d-none');
    } else {
        msg.classList.add('d-none');

        users.forEach(user => {
            const isMe = currentUser && user.email === currentUser.email;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="ps-4 align-middle fw-bold">${user.firstName} ${user.lastName}</td>
                <td class="align-middle">${user.email}</td>
                <td class="align-middle">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
                <td class="align-middle">
                    ${user.verified ? '<span class="badge bg-success">✔</span>' : '<span class="badge bg-warning text-dark">Pending</span>'}
                </td>
                <td class="align-middle text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editAccount('${user.email}')">Edit</button>
                    <button class="btn btn-sm btn-outline-warning me-1" onclick="resetPassword('${user.email}')">Reset Password</button>
                    ${isMe ? '' : `<button class="btn btn-sm btn-outline-danger" onclick="deleteAccount('${user.email}')">Delete</button>`}
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

function toggleAccountForm() {
    const formCard = document.getElementById('account-form-card');
    
    if (formCard.classList.contains('d-none')) {
        resetAccountFormUI();
    }
    formCard.classList.toggle('d-none');
}

function resetAccountFormUI() {
    document.getElementById('admin-add-account-form').reset();
    editingEmail = null; 
    document.querySelector('#account-form-card .card-header').textContent = "Add Account";
    document.querySelector('#admin-add-account-form button[type="submit"]').textContent = "Save";
    document.getElementById('acc-email').disabled = false; 
}

const adminAddForm = document.getElementById('admin-add-account-form');
if (adminAddForm) {
    adminAddForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const firstName = document.getElementById('acc-firstname').value;
        const lastName = document.getElementById('acc-lastname').value;
        const email = document.getElementById('acc-email').value;
        const password = document.getElementById('acc-password').value;
        const role = document.getElementById('acc-role').value;
        let verified = document.getElementById('acc-verified').checked; 

        if (!email.includes('@')) {
            verified = false;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];

        if (editingEmail) {
            const index = users.findIndex(u => u.email === editingEmail);
            if (index !== -1) {
                users[index].firstName = firstName;
                users[index].lastName = lastName;
                users[index].password = password;
                users[index].role = role;
                users[index].verified = verified;
                alert("Account updated successfully!");
            }
        } else {
            if (users.find(u => u.email === email)) {
                alert("User with this email already exists!");
                return;
            }
            const newUser = { firstName, lastName, email, password, role, verified };
            users.push(newUser);
            alert("Account created successfully!");
        }

        localStorage.setItem('users', JSON.stringify(users));
        toggleAccountForm(); 
        renderAccountsTable();
    });
}

window.editAccount = function(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    
    if (!user) return;

    const formCard = document.getElementById('account-form-card');
    formCard.classList.remove('d-none');

    document.getElementById('acc-firstname').value = user.firstName;
    document.getElementById('acc-lastname').value = user.lastName;
    document.getElementById('acc-email').value = user.email;
    document.getElementById('acc-password').value = user.password;
    document.getElementById('acc-role').value = user.role;
    document.getElementById('acc-verified').checked = user.verified;

    editingEmail = user.email;
    document.getElementById('acc-email').disabled = true; 
    document.querySelector('#account-form-card .card-header').textContent = "Edit Account";
    document.querySelector('#admin-add-account-form button[type="submit"]').textContent = "Update";
    
    formCard.scrollIntoView({ behavior: 'smooth' });
};

window.resetPassword = function(email) {
    const newPw = prompt(`Enter new password for ${email}:`);
    
    if (newPw) {
        if (newPw.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const index = users.findIndex(u => u.email === email);
        
        if (index !== -1) {
            users[index].password = newPw;
            localStorage.setItem('users', JSON.stringify(users));
            alert("Password updated successfully.");
        }
    }
};

window.deleteAccount = function(emailToDelete) {
    if(!confirm(`Are you sure you want to delete ${emailToDelete}?`)) return;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.filter(u => u.email !== emailToDelete);
    
    localStorage.setItem('users', JSON.stringify(users));
    renderAccountsTable(); 
};

// ==========================================
// PHASE 5: ADMIN EMPLOYEES MANAGEMENT
// ==========================================

// NEW FUNCTION: Populates the dropdown based on LocalStorage
function populateDepartmentDropdown() {
    const selectEl = document.getElementById('emp-dept');
    if (!selectEl) return;
    
    selectEl.innerHTML = ''; // Wipe old options completely

    let departments = JSON.parse(localStorage.getItem('departments')) || [];

    if (departments.length === 0) {
        const opt = document.createElement('option');
        opt.value = "";
        opt.textContent = "-- Please create a Department first --";
        opt.disabled = true;
        opt.selected = true;
        selectEl.appendChild(opt);
    } else {
        departments.forEach(dept => {
            const opt = document.createElement('option');
            opt.value = dept.name; 
            opt.textContent = dept.name;
            selectEl.appendChild(opt);
        });
    }
}

function renderEmployeesTable() {
    // FORCE DROPDOWN REFRESH EVERY TIME PAGE LOADS
    populateDepartmentDropdown(); 

    const tbody = document.getElementById('employees-table-body');
    const msg = document.getElementById('no-employees-msg');
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    tbody.innerHTML = '';

    if (employees.length === 0) {
        msg.classList.remove('d-none');
    } else {
        msg.classList.add('d-none');
        employees.forEach(emp => {
            const userAccount = users.find(u => u.email === emp.email);
            const displayName = userAccount ? `${userAccount.firstName} ${userAccount.lastName}` : `<span class="text-muted">${emp.email}</span>`;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="ps-4 align-middle fw-bold">${emp.id}</td>
                <td class="align-middle">${displayName}</td>
                <td class="align-middle">${emp.position}</td>
                <td class="align-middle"><span class="badge bg-secondary">${emp.department}</span></td>
                <td class="text-center align-middle">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editEmployee('${emp.id}')">Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee('${emp.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

function toggleEmployeeForm() {
    const formCard = document.getElementById('employee-form-card');
    if (formCard.classList.contains('d-none')) {
        resetEmployeeFormUI();
    }
    formCard.classList.toggle('d-none');
}

function resetEmployeeFormUI() {
    document.getElementById('admin-add-employee-form').reset();
    editingEmployeeId = null;
    document.querySelector('#employee-form-card .card-header').textContent = "Add Employee";
    document.querySelector('#admin-add-employee-form button[type="submit"]').textContent = "Save";
    document.getElementById('emp-id').disabled = false;
}

const adminEmpForm = document.getElementById('admin-add-employee-form');
if (adminEmpForm) {
    adminEmpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('emp-id').value;
        const email = document.getElementById('emp-email').value;
        const position = document.getElementById('emp-position').value;
        const department = document.getElementById('emp-dept').value;
        const hireDate = document.getElementById('emp-date').value;

        let employees = JSON.parse(localStorage.getItem('employees')) || [];

        if (editingEmployeeId) {
            const index = employees.findIndex(e => e.id === editingEmployeeId);
            if (index !== -1) {
                employees[index].email = email;
                employees[index].position = position;
                employees[index].department = department;
                employees[index].hireDate = hireDate;
                alert("Employee updated successfully!");
            }
        } else {
            if (employees.find(e => e.id === id)) { 
                alert("Employee ID already exists!"); 
                return; 
            }
            const newEmp = { id, email, position, department, hireDate };
            employees.push(newEmp);
            alert("Employee added successfully!");
        }

        localStorage.setItem('employees', JSON.stringify(employees));
        adminEmpForm.reset();
        toggleEmployeeForm();
        renderEmployeesTable();
    });
}

window.editEmployee = function(id) {
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    const formCard = document.getElementById('employee-form-card');
    formCard.classList.remove('d-none');

    document.getElementById('emp-id').value = emp.id;
    document.getElementById('emp-email').value = emp.email;
    document.getElementById('emp-position').value = emp.position;
    document.getElementById('emp-dept').value = emp.department;
    document.getElementById('emp-date').value = emp.hireDate;

    editingEmployeeId = emp.id;
    document.getElementById('emp-id').disabled = true; 
    document.querySelector('#employee-form-card .card-header').textContent = "Edit Employee";
    document.querySelector('#admin-add-employee-form button[type="submit"]').textContent = "Update";
    
    formCard.scrollIntoView({ behavior: 'smooth' });
};

window.deleteEmployee = function(idToDelete) {
    if(!confirm(`Delete Employee ID: ${idToDelete}?`)) return;
    let employees = JSON.parse(localStorage.getItem('employees')) || [];
    employees = employees.filter(e => e.id !== idToDelete);
    localStorage.setItem('employees', JSON.stringify(employees));
    renderEmployeesTable();
};

// ==========================================
// PHASE 6: ADMIN DEPARTMENTS MANAGEMENT 
// ==========================================

function renderDepartmentsTable() {
    const tbody = document.getElementById('departments-table-body');
    const msg = document.getElementById('no-departments-msg');
    
    let departments = JSON.parse(localStorage.getItem('departments')) || [];

    tbody.innerHTML = '';

    if (departments.length === 0) {
        msg.classList.remove('d-none');
    } else {
        msg.classList.add('d-none');

        departments.forEach(dept => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="ps-4 align-middle fw-bold">${dept.name}</td>
                <td class="align-middle">${dept.desc}</td>
                <td class="align-middle text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editDepartment('${dept.name}')">Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteDepartment('${dept.name}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

function toggleDepartmentForm() {
    const formCard = document.getElementById('department-form-card');
    
    if (formCard.classList.contains('d-none')) {
        resetDepartmentFormUI();
    }
    formCard.classList.toggle('d-none');
}

function resetDepartmentFormUI() {
    document.getElementById('admin-add-department-form').reset();
    editingDeptName = null;
    document.querySelector('#department-form-card .card-header').textContent = "Add Department";
    document.querySelector('#admin-add-department-form button[type="submit"]').textContent = "Save";
    document.getElementById('dept-name').disabled = false;
}

const adminDeptForm = document.getElementById('admin-add-department-form');
if (adminDeptForm) {
    adminDeptForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('dept-name').value;
        const desc = document.getElementById('dept-desc').value;

        let departments = JSON.parse(localStorage.getItem('departments')) || [];

        if (editingDeptName) {
            const index = departments.findIndex(d => d.name === editingDeptName);
            if (index !== -1) {
                departments[index].desc = desc; 
                alert("Department updated successfully!");
            }
        } else {
            if (departments.find(d => d.name === name)) { 
                alert("Department already exists!"); 
                return; 
            }
            departments.push({ name, desc });
            alert("Department added successfully!");
        }

        localStorage.setItem('departments', JSON.stringify(departments));
        adminDeptForm.reset();
        toggleDepartmentForm();
        renderDepartmentsTable();
    });
}

window.editDepartment = function(name) {
    const departments = JSON.parse(localStorage.getItem('departments')) || [];
    const dept = departments.find(d => d.name === name);
    if (!dept) return;

    const formCard = document.getElementById('department-form-card');
    formCard.classList.remove('d-none');

    document.getElementById('dept-name').value = dept.name;
    document.getElementById('dept-desc').value = dept.desc;

    editingDeptName = dept.name;
    document.getElementById('dept-name').disabled = true; 
    document.querySelector('#department-form-card .card-header').textContent = "Edit Department";
    document.querySelector('#admin-add-department-form button[type="submit"]').textContent = "Update";
    
    formCard.scrollIntoView({ behavior: 'smooth' });
};

window.deleteDepartment = function(nameToDelete) {
    if(!confirm(`Delete Department: ${nameToDelete}?`)) return;
    let departments = JSON.parse(localStorage.getItem('departments')) || [];
    departments = departments.filter(d => d.name !== nameToDelete);
    localStorage.setItem('departments', JSON.stringify(departments));
    renderDepartmentsTable();
};

function renderRequestsTable() {
    const emptyState = document.getElementById('requests-empty-state');
    const tableContainer = document.getElementById('requests-table-container');
    const tbody = document.getElementById('requests-table-body');
    
    let requests = JSON.parse(localStorage.getItem('requests')) || [];

    if (currentUser && currentUser.role !== 'admin') {
        requests = requests.filter(r => r.ownerEmail === currentUser.email);
    }

    if (requests.length === 0) {
        emptyState.classList.remove('d-none');
        tableContainer.classList.add('d-none');
    } else {
        emptyState.classList.add('d-none');
        tableContainer.classList.remove('d-none');
        
        tbody.innerHTML = '';
        requests.forEach(req => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="ps-4 align-middle fw-bold">REQ-${req.id}</td>
                <td class="align-middle">${req.type}</td>
                <td class="align-middle">${req.items.length} items</td>
                <td class="align-middle"><span class="badge bg-warning text-dark">Pending</span></td>
                <td class="align-middle text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editRequest('${req.id}')">Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteRequest(${req.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

window.openNewRequestModal = function() {
    editingRequestId = null;
    document.getElementById('request-form').reset();
    document.querySelector('#requestModal .modal-title').textContent = "New Request";
    document.querySelector('#request-form button[type="submit"]').textContent = "Submit Request";
    
    document.getElementById('req-items-container').innerHTML = `
        <div class="row g-2 mb-2 item-row">
            <div class="col-8"><input type="text" class="form-control item-name" placeholder="Item name" required></div>
            <div class="col-2"><input type="number" class="form-control item-qty" value="1" min="1" required></div>
            <div class="col-2"><button type="button" class="btn btn-outline-secondary w-100" onclick="addItemRow()">+</button></div>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('requestModal'));
    modal.show();
};

window.editRequest = function(id) {
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    const req = requests.find(r => r.id == id); 
    if (!req) return;

    editingRequestId = req.id;
    document.querySelector('#requestModal .modal-title').textContent = "Edit Request";
    document.querySelector('#request-form button[type="submit"]').textContent = "Update Request";

    document.getElementById('req-type').value = req.type;

    const container = document.getElementById('req-items-container');
    container.innerHTML = ''; 

    req.items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'row g-2 mb-2 item-row';
        
        const isLast = index === req.items.length - 1;
        const btnHtml = isLast 
            ? `<button type="button" class="btn btn-outline-secondary w-100" onclick="addItemRow()">+</button>`
            : `<button type="button" class="btn btn-outline-danger w-100" onclick="this.closest('.item-row').remove()">×</button>`;

        div.innerHTML = `
            <div class="col-8"><input type="text" class="form-control item-name" value="${item.name}" required></div>
            <div class="col-2"><input type="number" class="form-control item-qty" value="${item.qty}" min="1" required></div>
            <div class="col-2">${btnHtml}</div>
        `;
        container.appendChild(div);
    });

    const modal = new bootstrap.Modal(document.getElementById('requestModal'));
    modal.show();
};

window.addItemRow = function() {
    const container = document.getElementById('req-items-container');
    
    // Change the button of the previous last row to "x"
    const rows = container.getElementsByClassName('item-row');
    if (rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        // Select ALL columns with size 2 in this row
        const cols = lastRow.querySelectorAll('.col-2');
        
        // The button is in the SECOND '.col-2' (index 1). The first (index 0) is the quantity.
        if (cols.length > 1) {
            cols[1].innerHTML = `<button type="button" class="btn btn-outline-danger w-100" onclick="this.closest('.item-row').remove()">×</button>`;
        }
    }

    // Add new row with "+"
    const div = document.createElement('div');
    div.className = 'row g-2 mb-2 item-row';
    div.innerHTML = `
        <div class="col-8">
            <input type="text" class="form-control item-name" placeholder="Item name" required>
        </div>
        <div class="col-2">
            <input type="number" class="form-control item-qty" value="1" min="1" required>
        </div>
        <div class="col-2">
            <button type="button" class="btn btn-outline-secondary w-100" onclick="addItemRow()">+</button>
        </div>
    `;
    container.appendChild(div);
};

const requestForm = document.getElementById('request-form');
if (requestForm) {
    requestForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const itemRows = document.querySelectorAll('.item-row');
        const items = [];
        itemRows.forEach(row => {
            const name = row.querySelector('.item-name').value;
            const qty = row.querySelector('.item-qty').value;
            if(name) items.push({ name, qty });
        });

        const type = document.getElementById('req-type').value;
        let requests = JSON.parse(localStorage.getItem('requests')) || [];
        
        if (editingRequestId) {
            const index = requests.findIndex(r => r.id == editingRequestId);
            if (index !== -1) {
                requests[index].type = type;
                requests[index].items = items;
                alert("Request updated successfully!");
            }
        } else {
            const newReq = {
                id: Date.now().toString().slice(-4), 
                type,
                items,
                date: new Date().toISOString().split('T')[0],
                status: 'Pending',
                ownerEmail: currentUser.email 
            };
            requests.push(newReq);
            alert("Request submitted successfully!");
        }

        localStorage.setItem('requests', JSON.stringify(requests));
        
        const modalEl = document.getElementById('requestModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl); 
        if(modalInstance) modalInstance.hide();

        renderRequestsTable();
    });
}

window.deleteRequest = function(id) {
    if(!confirm("Delete this request?")) return;
    let requests = JSON.parse(localStorage.getItem('requests')) || [];
    requests = requests.filter(r => r.id != id);
    localStorage.setItem('requests', JSON.stringify(requests));
    renderRequestsTable();
};