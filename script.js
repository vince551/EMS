// Initialize Lucide Icons
lucide.createIcons();

// STATE MANAGEMENT
let currentUser = { name: 'John Doe', role: 'Admin', email: 'admin@company.com' };
let isClockedIn = false;
let clockInTime = null;

// Initial Data Arrays
let employees = [
  { id: 'EMP101', name: 'John Doe', email: 'john@company.com', phone: '+1 555-0192', dept: 'Engineering', role: 'Senior Developer', salary: 75000, status: 'Active' },
  { id: 'EMP102', name: 'Sarah Jenkins', email: 'sarah@company.com', phone: '+1 555-0184', dept: 'Human Resources', role: 'HR Manager', salary: 68000, status: 'Active' },
  { id: 'EMP103', name: 'Michael Scott', email: 'michael@company.com', phone: '+1 555-0147', dept: 'Sales', role: 'Regional Manager', salary: 82000, status: 'Active' },
  { id: 'EMP104', name: 'Emily Watson', email: 'emily@company.com', phone: '+1 555-0133', dept: 'Engineering', role: 'UI/UX Designer', salary: 62000, status: 'On Leave' }
];

let departments = [
  { id: 'DEP1', name: 'Engineering', manager: 'John Doe', count: 2, budget: 150000 },
  { id: 'DEP2', name: 'Human Resources', manager: 'Sarah Jenkins', count: 1, budget: 90000 },
  { id: 'DEP3', name: 'Sales', manager: 'Michael Scott', count: 1, budget: 120000 }
];

let attendanceLogs = [
  { date: '2026-08-06', checkIn: '08:55 AM', checkOut: '05:00 PM', hours: '8.1 hrs', status: 'On Time' },
  { date: '2026-08-05', checkIn: '09:15 AM', checkOut: '05:10 PM', hours: '7.9 hrs', status: 'Late' }
];

let leaveRequests = [
  { id: 1, empName: 'Emily Watson', type: 'Casual Leave', start: '2026-08-06', end: '2026-08-08', reason: 'Family vacation', status: 'Approved' },
  { id: 2, empName: 'Michael Scott', type: 'Sick Leave', start: '2026-08-10', end: '2026-08-11', reason: 'Medical Checkup', status: 'Pending' }
];

let performanceReviews = [
  { empName: 'John Doe', reviewer: 'Sarah Jenkins', rating: 5, feedback: 'Exceptional code delivery and teamwork.', goal: 'Lead Cloud Migration' }
];

let activities = [
  { text: 'System Initialized', time: 'Just now' }
];

// AUTHENTICATION & ROLE MANAGEMENT
function handleLogin(e) {
  e.preventDefault();
  const role = document.getElementById('roleSelect').value;
  const email = document.getElementById('loginEmail').value;
  
  currentUser = { name: email.split('@')[0], role: role, email: email };
  document.getElementById('user-name-display').textContent = currentUser.name;
  document.getElementById('user-role-display').textContent = currentUser.role;

  applyRoleAccess();
  document.getElementById('auth-screen').style.display = 'none';
  logActivity(`User ${currentUser.name} logged in as ${currentUser.role}`);
  renderAll();
}

function handleLogout() {
  document.getElementById('auth-screen').style.display = 'flex';
}

function applyRoleAccess() {
  const adminHrElements = document.querySelectorAll('.admin-hr-only');
  const adminElements = document.querySelectorAll('.admin-only');

  adminHrElements.forEach(el => {
    el.style.display = (currentUser.role === 'Admin' || currentUser.role === 'HR Manager') ? '' : 'none';
  });

  adminElements.forEach(el => {
    el.style.display = (currentUser.role === 'Admin') ? '' : 'none';
  });
}

// TAB NAVIGATION
function showTab(tabId, event) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`${tabId}-tab`).classList.add('active');
  if (event) event.currentTarget.classList.add('active');
}

// RENDER ALL DATA MODULES
function renderAll() {
  renderDashboard();
  renderEmployees();
  renderDepartments();
  renderAttendance();
  renderLeaves();
  renderPayroll();
  renderPerformance();
  populateDropdowns();
}

// 1. DASHBOARD ENGINE
function renderDashboard() {
  document.getElementById('dash-total-emp').textContent = employees.length;
  document.getElementById('dash-present-emp').textContent = isClockedIn ? employees.length : employees.length - 1;
  document.getElementById('dash-present-rate').textContent = `${Math.round((isClockedIn ? 100 : 80))}% rate`;
  
  const pending = leaveRequests.filter(l => l.status === 'Pending').length;
  document.getElementById('dash-leave-emp').textContent = leaveRequests.filter(l => l.status === 'Approved').length;
  document.getElementById('dash-pending-leave').textContent = `${pending} Pending`;

  const totalPayroll = employees.reduce((acc, curr) => acc + (curr.salary / 12), 0);
  document.getElementById('dash-payroll-total').textContent = `$${Math.round(totalPayroll).toLocaleString()}`;

  // Render Department Stats List
  const deptList = document.getElementById('departmentStatsList');
  deptList.innerHTML = '';
  departments.forEach(dept => {
    const empCount = employees.filter(e => e.dept === dept.name).length;
    deptList.innerHTML += `
      <div style="margin-bottom: 0.75rem;">
        <div class="flex-between" style="font-size: 0.85rem; margin-bottom: 4px;">
          <span><strong>${dept.name}</strong></span>
          <span>${empCount} Members</span>
        </div>
        <div style="width: 100%; height: 6px; background: var(--border); border-radius: 3px;">
          <div style="width: ${(empCount / employees.length) * 100}%; height: 100%; background: var(--primary); border-radius: 3px;"></div>
        </div>
      </div>
    `;
  });

  // Render Activities Feed
  const actList = document.getElementById('activityFeedList');
  actList.innerHTML = '';
  activities.slice(-4).reverse().forEach(act => {
    actList.innerHTML += `
      <div class="leave-item flex-between">
        <div><p style="font-size: 0.85rem;">${act.text}</p></div>
        <span class="text-muted" style="font-size: 0.75rem;">${act.time}</span>
      </div>
    `;
  });
}

// 2. EMPLOYEE CRUD & SEARCH ENGINE
function renderEmployees(data = employees) {
  const grid = document.getElementById('employeeGrid');
  grid.innerHTML = '';

  data.forEach(emp => {
    grid.innerHTML += `
      <div class="card">
        <div class="flex-between">
          <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700;">${emp.id}</span>
          <span class="badge ${emp.status === 'Active' ? 'badge-success' : 'badge-warning'}">${emp.status}</span>
        </div>
        <h3 style="margin: 6px 0 2px 0;">${emp.name}</h3>
        <p class="text-muted" style="font-size: 0.85rem;">${emp.role}</p>
        <hr style="border: none; border-top: 1px solid var(--border); margin: 10px 0;" />
        <p style="font-size: 0.85rem;">🏢 ${emp.dept}</p>
        <p style="font-size: 0.85rem;" class="text-muted">✉️ ${emp.email}</p>
        <p style="font-size: 0.85rem;" class="text-muted">📞 ${emp.phone}</p>
        <p style="font-size: 0.85rem; font-weight: 600; margin-top: 4px;">💰 $${Number(emp.salary).toLocaleString()}/yr</p>
        ${(currentUser.role === 'Admin' || currentUser.role === 'HR Manager') ? `
          <div class="flex-end" style="gap: 8px; margin-top: 10px;">
            <button class="btn btn-secondary btn-sm" onclick="editEmployee('${emp.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteEmployee('${emp.id}')">Delete</button>
          </div>
        ` : ''}
      </div>
    `;
  });
}

function filterEmployees() {
  const term = document.getElementById('empSearchInput').value.toLowerCase();
  const dept = document.getElementById('empDeptFilter').value;

  const filtered = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(term) || e.email.toLowerCase().includes(term) || e.id.toLowerCase().includes(term);
    const matchesDept = (dept === 'All' || e.dept === dept);
    return matchesSearch && matchesDept;
  });
  renderEmployees(filtered);
}

function saveEmployee(e) {
  e.preventDefault();
  const editId = document.getElementById('empEditId').value;
  
  const empData = {
    id: editId || `EMP${100 + employees.length + 1}`,
    name: document.getElementById('empName').value,
    email: document.getElementById('empEmail').value,
    phone: document.getElementById('empPhone').value,
    dept: document.getElementById('empDept').value,
    role: document.getElementById('empRole').value,
    salary: Number(document.getElementById('empSalary').value),
    status: 'Active'
  };

  if (editId) {
    const index = employees.findIndex(e => e.id === editId);
    employees[index] = empData;
    logActivity(`Updated record for ${empData.name}`);
  } else {
    employees.push(empData);
    logActivity(`Added new employee: ${empData.name}`);
  }

  toggleEmpModal(false);
  renderAll();
}

function editEmployee(id) {
  const emp = employees.find(e => e.id === id);
  document.getElementById('empEditId').value = emp.id;
  document.getElementById('empName').value = emp.name;
  document.getElementById('empEmail').value = emp.email;
  document.getElementById('empPhone').value = emp.phone;
  document.getElementById('empDept').value = emp.dept;
  document.getElementById('empRole').value = emp.role;
  document.getElementById('empSalary').value = emp.salary;
  
  document.getElementById('empModalTitle').textContent = 'Edit Employee Record';
  toggleEmpModal(true);
}

function deleteEmployee(id) {
  if (confirm('Are you sure you want to remove this employee record?')) {
    employees = employees.filter(e => e.id !== id);
    logActivity(`Deleted employee record ${id}`);
    renderAll();
  }
}

// 3. DEPARTMENT ENGINE
function renderDepartments() {
  const tbody = document.getElementById('departmentsTable');
  tbody.innerHTML = '';

  departments.forEach(dept => {
    const empCount = employees.filter(e => e.dept === dept.name).length;
    tbody.innerHTML += `
      <tr>
        <td><strong>${dept.name}</strong></td>
        <td>${dept.manager}</td>
        <td>${empCount} Staff</td>
        <td>$${Number(dept.budget).toLocaleString()}</td>
        <td class="admin-only">
          <button class="btn btn-danger btn-sm" onclick="deleteDepartment('${dept.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

function saveDepartment(e) {
  e.preventDefault();
  const newDept = {
    id: `DEP${departments.length + 1}`,
    name: document.getElementById('deptName').value,
    manager: document.getElementById('deptManager').value,
    budget: Number(document.getElementById('deptBudget').value)
  };

  departments.push(newDept);
  logActivity(`Created department: ${newDept.name}`);
  toggleDeptModal(false);
  renderAll();
}

function deleteDepartment(id) {
  if (confirm('Delete this department?')) {
    departments = departments.filter(d => d.id !== id);
    renderAll();
  }
}

// 4. ATTENDANCE ENGINE (Mobile / GPS Simulated)
function toggleClock() {
  const btn = document.getElementById('clockBtn');
  const status = document.getElementById('clockStatus');
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!isClockedIn) {
    isClockedIn = true;
    clockInTime = timeStr;
    btn.textContent = 'Clock Out';
    btn.className = 'btn btn-danger';
    status.textContent = `Clocked in at ${timeStr} (GPS Location Verified)`;
    logActivity(`${currentUser.name} clocked in at ${timeStr}`);
  } else {
    isClockedIn = false;
    btn.textContent = 'Clock In';
    btn.className = 'btn btn-success';
    status.textContent = 'You are currently clocked out.';
    
    attendanceLogs.unshift({
      date: now.toISOString().split('T')[0],
      checkIn: clockInTime,
      checkOut: timeStr,
      hours: '8.0 hrs',
      status: 'On Time'
    });
    logActivity(`${currentUser.name} clocked out at ${timeStr}`);
    renderAttendance();
  }
  renderDashboard();
}

function renderAttendance() {
  const tbody = document.getElementById('attendanceTable');
  tbody.innerHTML = '';
  attendanceLogs.forEach(log => {
    tbody.innerHTML += `
      <tr>
        <td>${log.date}</td>
        <td>${log.checkIn}</td>
        <td>${log.checkOut}</td>
        <td>${log.hours}</td>
        <td><span class="badge ${log.status === 'On Time' ? 'badge-success' : 'badge-warning'}">${log.status}</span></td>
      </tr>
    `;
  });
}

// 5. LEAVE REQUEST ENGINE
function renderLeaves() {
  const list = document.getElementById('leaveList');
  list.innerHTML = '';

  leaveRequests.forEach(leave => {
    list.innerHTML += `
      <div class="leave-item flex-between">
        <div>
          <strong>${leave.type} - ${leave.empName}</strong>
          <p class="text-muted">${leave.start} to ${leave.end} • ${leave.reason}</p>
        </div>
        <div class="flex-between" style="gap: 10px;">
          <span class="badge ${leave.status === 'Approved' ? 'badge-success' : leave.status === 'Pending' ? 'badge-warning' : 'badge-danger'}">${leave.status}</span>
          ${(currentUser.role === 'Admin' || currentUser.role === 'HR Manager') && leave.status === 'Pending' ? `
            <button class="btn btn-success btn-sm" onclick="updateLeaveStatus(${leave.id}, 'Approved')">Approve</button>
            <button class="btn btn-danger btn-sm" onclick="updateLeaveStatus(${leave.id}, 'Rejected')">Reject</button>
          ` : ''}
        </div>
      </div>
    `;
  });
}

function applyLeave(e) {
  e.preventDefault();
  const newLeave = {
    id: Date.now(),
    empName: currentUser.name,
    type: document.getElementById('leaveType').value,
    start: document.getElementById('leaveStart').value,
    end: document.getElementById('leaveEnd').value,
    reason: document.getElementById('leaveReason').value,
    status: 'Pending'
  };

  leaveRequests.unshift(newLeave);
  logActivity(`Leave application submitted by ${currentUser.name}`);
  toggleLeaveModal(false);
  renderAll();
}

function updateLeaveStatus(id, newStatus) {
  const req = leaveRequests.find(l => l.id === id);
  req.status = newStatus;
  logActivity(`Leave application for ${req.empName} ${newStatus.toLowerCase()}`);
  renderAll();
}

// 6. PAYROLL AUTOMATION ENGINE
function renderPayroll() {
  const tbody = document.getElementById('payrollTable');
  tbody.innerHTML = '';

  employees.forEach(emp => {
    const monthlyBasic = Math.round(emp.salary / 12);
    const allowance = Math.round(monthlyBasic * 0.10); // 10% Allowance
    const tax = Math.round(monthlyBasic * 0.15); // 15% Tax Deduction
    const netSalary = monthlyBasic + allowance - tax;

    tbody.innerHTML += `
      <tr>
        <td><strong>${emp.name}</strong><br><span class="text-muted">${emp.role}</span></td>
        <td>$${monthlyBasic.toLocaleString()}</td>
        <td>$${allowance.toLocaleString()}</td>
        <td style="color: var(--danger);">$${tax.toLocaleString()}</td>
        <td><strong>$${netSalary.toLocaleString()}</strong></td>
        <td><span class="badge badge-success">Processed</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="downloadPayslip('${emp.name}', ${monthlyBasic}, ${allowance}, ${tax}, ${netSalary})">
            📄 Download Slip
          </button>
        </td>
      </tr>
    `;
  });
}

function processPayroll() {
  alert('Monthly Payroll Batch successfully processed and slips generated!');
  logActivity('Monthly Payroll processed by HR');
}

function downloadPayslip(name, basic, allowance, tax, net) {
  const slipContent = `
==============================================
            COMPANY SALARY SLIP               
==============================================
Employee Name  : ${name}
Pay Period     : Current Month
----------------------------------------------
Basic Salary   : $${basic.toLocaleString()}
Allowances     : +$${allowance.toLocaleString()}
Tax Deductions : -$${tax.toLocaleString()}
----------------------------------------------
NET PAYOUT     : $${net.toLocaleString()}
==============================================
Status         : PAID
  `;

  const blob = new Blob([slipContent], { type: 'text/plain' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `Payslip_${name.replace(/\s+/g, '_')}.txt`;
  anchor.click();
}

// 7. PERFORMANCE MANAGEMENT ENGINE
function renderPerformance() {
  const tbody = document.getElementById('performanceTable');
  tbody.innerHTML = '';

  performanceReviews.forEach(rev => {
    tbody.innerHTML += `
      <tr>
        <td><strong>${rev.empName}</strong></td>
        <td>${rev.reviewer}</td>
        <td>${'⭐'.repeat(rev.rating)} (${rev.rating}/5)</td>
        <td>${rev.feedback}</td>
        <td><span class="badge badge-success">${rev.goal}</span></td>
      </tr>
    `;
  });
}

function saveReview(e) {
  e.preventDefault();
  const rev = {
    empName: document.getElementById('reviewEmpSelect').value,
    reviewer: currentUser.name,
    rating: Number(document.getElementById('reviewRating').value),
    feedback: document.getElementById('reviewFeedback').value,
    goal: document.getElementById('reviewGoal').value
  };

  performanceReviews.push(rev);
  logActivity(`Performance review recorded for ${rev.empName}`);
  toggleReviewModal(false);
  renderAll();
}

// HELPERS & MODAL CONTROLS
function populateDropdowns() {
  const deptSelect = document.getElementById('empDept');
  const deptFilter = document.getElementById('empDeptFilter');
  const reviewEmpSelect = document.getElementById('reviewEmpSelect');

  deptSelect.innerHTML = '';
  deptFilter.innerHTML = '<option value="All">All Departments</option>';
  reviewEmpSelect.innerHTML = '';

  departments.forEach(d => {
    deptSelect.innerHTML += `<option value="${d.name}">${d.name}</option>`;
    deptFilter.innerHTML += `<option value="${d.name}">${d.name}</option>`;
  });

  employees.forEach(e => {
    reviewEmpSelect.innerHTML += `<option value="${e.name}">${e.name}</option>`;
  });
}

function logActivity(text) {
  activities.push({ text: text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  document.getElementById('themeToggleBtn').textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function dismissNotification() {
  document.getElementById('notification-banner').style.display = 'none';
}

function toggleEmpModal(show) { document.getElementById('empModal').style.display = show ? 'flex' : 'none'; }
function toggleDeptModal(show) { document.getElementById('deptModal').style.display = show ? 'flex' : 'none'; }
function toggleLeaveModal(show) { document.getElementById('leaveModal').style.display = show ? 'flex' : 'none'; }
function toggleReviewModal(show) { document.getElementById('reviewModal').style.display = show ? 'flex' : 'none'; }

// INITIAL STARTUP
renderAll();