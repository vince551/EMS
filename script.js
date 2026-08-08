/* ==========================================================================
   ENTERPRISE EMS - ALL-IN-ONE APPLICATION SCRIPT (script.js)
   ========================================================================== */

// 1. GLOBAL STATE MANAGEMENT
let state = {
  currentUser: { name: 'John Doe', role: 'Admin', email: 'admin@company.com' },
  isClockedIn: false,
  clockInTime: null,

  employees: [
    { id: 'EMP101', name: 'John Doe', email: 'john@company.com', phone: '+1 555-0192', dept: 'Engineering', role: 'Senior Developer', salary: 75000, status: 'Active' },
    { id: 'EMP102', name: 'Sarah Jenkins', email: 'sarah@company.com', phone: '+1 555-0184', dept: 'Human Resources', role: 'HR Manager', salary: 68000, status: 'Active' },
    { id: 'EMP103', name: 'Michael Scott', email: 'michael@company.com', phone: '+1 555-0147', dept: 'Sales', role: 'Regional Manager', salary: 82000, status: 'Active' },
    { id: 'EMP104', name: 'Emily Watson', email: 'emily@company.com', phone: '+1 555-0133', dept: 'Engineering', role: 'UI/UX Designer', salary: 62000, status: 'On Leave' }
  ],

  departments: [
    { id: 'DEP1', name: 'Engineering', manager: 'John Doe', count: 2, budget: 150000 },
    { id: 'DEP2', name: 'Human Resources', manager: 'Sarah Jenkins', count: 1, budget: 90000 },
    { id: 'DEP3', name: 'Sales', manager: 'Michael Scott', count: 1, budget: 120000 }
  ],

  attendanceLogs: [
    { date: '2026-08-06', checkIn: '08:55 AM', checkOut: '05:00 PM', hours: '8.1 hrs', status: 'On Time' },
    { date: '2026-08-05', checkIn: '09:15 AM', checkOut: '05:10 PM', hours: '7.9 hrs', status: 'Late' }
  ],

  leaveRequests: [
    { id: 1, empName: 'Emily Watson', type: 'Casual Leave', start: '2026-08-06', end: '2026-08-08', reason: 'Personal work', status: 'Approved' },
    { id: 2, empName: 'John Doe', type: 'Sick Leave', start: '2026-08-10', end: '2026-08-11', reason: 'Fever', status: 'Pending' }
  ],

  reviews: [
    { empName: 'Sarah Jenkins', reviewer: 'John Doe', rating: '5 ⭐', goal: 'Expand HR Team', feedback: 'Excellent leadership skills.' }
  ],

  activities: [
    { text: 'System initialized successfully', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]
};

// HELPER: Activity Log
function logActivity(text) {
  state.activities.push({
    text: text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
}

// 2. AUTHENTICATION & ACCESS CONTROL
function handleLogin(e) {
  e.preventDefault();
  const role = document.getElementById('roleSelect').value;
  const email = document.getElementById('loginEmail').value;

  state.currentUser = { name: email.split('@')[0], role: role, email: email };

  const nameDisp = document.getElementById('user-name-display');
  const roleDisp = document.getElementById('user-role-display');
  if (nameDisp) nameDisp.textContent = state.currentUser.name;
  if (roleDisp) roleDisp.textContent = state.currentUser.role;

  applyRoleAccess();
  
  const authOverlay = document.getElementById('auth-screen');
  if (authOverlay) authOverlay.style.display = 'none';

  showTab('dashboard');
  logActivity(`User ${state.currentUser.name} logged in as ${state.currentUser.role}`);
  renderAll();
  showToast(`Welcome back, ${state.currentUser.name}!`, 'success');
}

function handleLogout() {
  const authOverlay = document.getElementById('auth-screen');
  if (authOverlay) authOverlay.style.display = 'flex';
  showToast('Logged out successfully', 'primary');
}

function applyRoleAccess() {
  const adminHrElements = document.querySelectorAll('.admin-hr-only');
  const adminElements = document.querySelectorAll('.admin-only');

  adminHrElements.forEach(el => {
    el.style.display = (state.currentUser.role === 'Admin' || state.currentUser.role === 'HR Manager') ? '' : 'none';
  });

  adminElements.forEach(el => {
    el.style.display = (state.currentUser.role === 'Admin') ? '' : 'none';
  });
}

// 3. TAB NAVIGATION
function showTab(tabId, event) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

  const targetTab = document.getElementById(`${tabId}-tab`);
  if (targetTab) targetTab.classList.add('active');

  if (event) {
    event.currentTarget.classList.add('active');
  } else {
    const defaultNavBtn = document.querySelector(`.nav-item[onclick*="'${tabId}'"]`) || document.querySelector(`.nav-item[onclick*="${tabId}"]`);
    if (defaultNavBtn) defaultNavBtn.classList.add('active');
  }
}

// 4. UI FEEDBACK & TOASTS
function showToast(message, type = 'primary') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  const btn = document.getElementById('themeToggleBtn');
  if (btn) btn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function dismissNotification() {
  const banner = document.getElementById('notification-banner');
  if (banner) banner.style.display = 'none';
}

// 5. DASHBOARD RENDERING
function renderDashboard() {
  const totEmp = document.getElementById('dash-total-emp');
  const presEmp = document.getElementById('dash-present-emp');
  const presRate = document.getElementById('dash-present-rate');
  const leaveEmp = document.getElementById('dash-leave-emp');
  const pendLeave = document.getElementById('dash-pending-leave');
  const payTot = document.getElementById('dash-payroll-total');

  if (totEmp) totEmp.textContent = state.employees.length;
  if (presEmp) presEmp.textContent = state.isClockedIn ? state.employees.length : state.employees.length - 1;
  if (presRate) presRate.textContent = `${Math.round((state.isClockedIn ? 100 : 80))}% rate`;

  const pending = state.leaveRequests.filter(l => l.status === 'Pending').length;
  if (leaveEmp) leaveEmp.textContent = state.leaveRequests.filter(l => l.status === 'Approved').length;
  if (pendLeave) pendLeave.textContent = `${pending} Pending`;

  const totalPayroll = state.employees.reduce((acc, curr) => acc + (curr.salary / 12), 0);
  if (payTot) payTot.textContent = `$${Math.round(totalPayroll).toLocaleString()}`;

  // Department Stats Bar
  const deptList = document.getElementById('departmentStatsList');
  if (deptList) {
    deptList.innerHTML = '';
    state.departments.forEach(dept => {
      const empCount = state.employees.filter(e => e.dept === dept.name).length;
      deptList.innerHTML += `
        <div style="margin-bottom: 0.75rem;">
          <div class="flex-between" style="font-size: 0.85rem; margin-bottom: 4px;">
            <span><strong>${dept.name}</strong></span>
            <span>${empCount} Members</span>
          </div>
          <div style="width: 100%; height: 6px; background: var(--border); border-radius: 3px;">
            <div style="width: ${(empCount / (state.employees.length || 1)) * 100}%; height: 100%; background: var(--primary); border-radius: 3px;"></div>
          </div>
        </div>
      `;
    });
  }

  // Activity Feed
  const actList = document.getElementById('activityFeedList');
  if (actList) {
    actList.innerHTML = '';
    state.activities.slice(-4).reverse().forEach(act => {
      actList.innerHTML += `
        <div class="leave-item flex-between" style="padding: 8px 0; border-bottom: 1px dashed var(--border);">
          <div><p style="font-size: 0.85rem;">${act.text}</p></div>
          <span class="text-muted" style="font-size: 0.75rem;">${act.time}</span>
        </div>
      `;
    });
  }
}

// 6. EMPLOYEE MANAGEMENT
function renderEmployees(data = state.employees) {
  const grid = document.getElementById('employeeGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (data.length === 0) {
    grid.innerHTML = `
      <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
        <h3>No Employees Found</h3>
        <p class="text-muted" style="font-size: 0.875rem;">Try adjusting your search query or department filters.</p>
      </div>
    `;
    return;
  }

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
        <p style="font-size: 0.85rem; font-weight: 700; margin-top: 6px;">💵 $${emp.salary.toLocaleString()}/yr</p>
        <div class="flex-end admin-hr-only" style="gap: 8px; margin-top: 1rem;">
          <button class="btn btn-secondary btn-sm" onclick="editEmployee('${emp.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteEmployee('${emp.id}')">Delete</button>
        </div>
      </div>
    `;
  });
  applyRoleAccess();
}

function filterEmployees() {
  const search = document.getElementById('empSearch')?.value.toLowerCase() || '';
  const dept = document.getElementById('empDeptFilter')?.value || 'All';

  const filtered = state.employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search) || emp.role.toLowerCase().includes(search);
    const matchesDept = dept === 'All' || emp.dept === dept;
    return matchesSearch && matchesDept;
  });

  renderEmployees(filtered);
}

function saveEmployee(e) {
  e.preventDefault();
  const editId = document.getElementById('empEditId').value;

  const empData = {
    id: editId || `EMP${100 + state.employees.length + 1}`,
    name: document.getElementById('empName').value,
    email: document.getElementById('empEmail').value,
    phone: document.getElementById('empPhone').value,
    dept: document.getElementById('empDept').value,
    role: document.getElementById('empRole').value,
    salary: Number(document.getElementById('empSalary').value),
    status: 'Active'
  };

  if (editId) {
    const idx = state.employees.findIndex(emp => emp.id === editId);
    if (idx !== -1) state.employees[idx] = empData;
    logActivity(`Updated record for ${empData.name}`);
    showToast(`Updated ${empData.name}`, 'success');
  } else {
    state.employees.push(empData);
    logActivity(`Added new employee: ${empData.name}`);
    showToast(`Added ${empData.name}`, 'success');
  }

  toggleEmpModal(false);
  renderAll();
}

function editEmployee(id) {
  const emp = state.employees.find(e => e.id === id);
  if (!emp) return;

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
    state.employees = state.employees.filter(e => e.id !== id);
    logActivity(`Deleted employee record ${id}`);
    showToast(`Employee ${id} removed`, 'danger');
    renderAll();
  }
}

function toggleEmpModal(show) {
  if (!show) {
    document.getElementById('empForm')?.reset();
    document.getElementById('empEditId').value = '';
    document.getElementById('empModalTitle').textContent = 'Add New Employee';
  }
  document.getElementById('empModal').style.display = show ? 'flex' : 'none';
}

// 7. DEPARTMENTS
function renderDepartments() {
  const tbody = document.getElementById('departmentsTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  state.departments.forEach(dept => {
    const empCount = state.employees.filter(e => e.dept === dept.name).length;
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
  applyRoleAccess();
}

function saveDepartment(e) {
  e.preventDefault();
  const newDept = {
    id: `DEP${state.departments.length + 1}`,
    name: document.getElementById('deptName').value,
    manager: document.getElementById('deptManager').value,
    budget: Number(document.getElementById('deptBudget').value)
  };

  state.departments.push(newDept);
  logActivity(`Created department: ${newDept.name}`);
  showToast(`Department ${newDept.name} created`, 'success');
  toggleDeptModal(false);
  renderAll();
}

function deleteDepartment(id) {
  if (confirm('Delete this department?')) {
    state.departments = state.departments.filter(d => d.id !== id);
    logActivity(`Deleted department ${id}`);
    showToast('Department removed', 'danger');
    renderAll();
  }
}

function toggleDeptModal(show) {
  if (!show) document.getElementById('deptForm')?.reset();
  document.getElementById('deptModal').style.display = show ? 'flex' : 'none';
}

// 8. ATTENDANCE & LEAVE MANAGEMENT
function toggleClock() {
  const btn = document.getElementById('clockBtn');
  const status = document.getElementById('clockStatus');
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!state.isClockedIn) {
    state.isClockedIn = true;
    state.clockInTime = now;
    btn.textContent = '⏱️ Clock Out';
    btn.className = 'btn btn-danger';
    status.textContent = `Clocked in at ${now}`;
    logActivity(`Clocked IN at ${now}`);
    showToast('Clocked In', 'success');
  } else {
    state.isClockedIn = false;
    btn.textContent = '⏱️ Clock In';
    btn.className = 'btn btn-success';
    status.textContent = 'Not Clocked In';

    state.attendanceLogs.unshift({
      date: new Date().toISOString().split('T')[0],
      checkIn: state.clockInTime,
      checkOut: now,
      hours: '8.0 hrs',
      status: 'On Time'
    });

    logActivity(`Clocked OUT at ${now}`);
    showToast('Clocked Out', 'primary');
  }
  renderAttendance();
  renderDashboard();
}

function renderAttendance() {
  const tbody = document.getElementById('attendanceTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  state.attendanceLogs.forEach(log => {
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

function applyLeave(e) {
  e.preventDefault();
  const newLeave = {
    id: state.leaveRequests.length + 1,
    empName: state.currentUser.name,
    type: document.getElementById('leaveType').value,
    start: document.getElementById('leaveStart').value,
    end: document.getElementById('leaveEnd').value,
    reason: document.getElementById('leaveReason').value,
    status: 'Pending'
  };

  state.leaveRequests.push(newLeave);
  logActivity(`Leave applied by ${newLeave.empName}`);
  showToast('Leave request submitted', 'success');
  toggleLeaveModal(false);
  renderLeaves();
  renderDashboard();
}

function updateLeaveStatus(id, status) {
  const leave = state.leaveRequests.find(l => l.id === id);
  if (leave) {
    leave.status = status;
    logActivity(`Leave ID ${id} set to ${status}`);
    showToast(`Leave request ${status.toLowerCase()}`, status === 'Approved' ? 'success' : 'danger');
    renderLeaves();
    renderDashboard();
  }
}

function renderLeaves() {
  const container = document.getElementById('leaveRequestsList');
  if (!container) return;
  container.innerHTML = '';

  state.leaveRequests.forEach(req => {
    container.innerHTML += `
      <div class="card flex-between" style="margin-bottom: 1rem;">
        <div>
          <h3>${req.empName} — <span class="text-muted" style="font-size:0.9rem">${req.type}</span></h3>
          <p style="font-size: 0.85rem; margin-top: 4px;">📅 ${req.start} to ${req.end}</p>
          <p class="text-muted" style="font-size: 0.85rem;">Reason: "${req.reason}"</p>
        </div>
        <div style="text-align: right;">
          <span class="badge ${req.status === 'Approved' ? 'badge-success' : req.status === 'Pending' ? 'badge-warning' : 'badge-danger'}">${req.status}</span>
          ${req.status === 'Pending' ? `
            <div class="admin-hr-only" style="margin-top: 10px; display: flex; gap: 6px;">
              <button class="btn btn-success btn-sm" onclick="updateLeaveStatus(${req.id}, 'Approved')">Approve</button>
              <button class="btn btn-danger btn-sm" onclick="updateLeaveStatus(${req.id}, 'Rejected')">Reject</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });
  applyRoleAccess();
}

function toggleLeaveModal(show) {
  if (!show) document.getElementById('leaveForm')?.reset();
  document.getElementById('leaveModal').style.display = show ? 'flex' : 'none';
}

// 9. PAYROLL & PERFORMANCE
function renderPayroll() {
  const tbody = document.getElementById('payrollTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  state.employees.forEach(emp => {
    const monthlyBasic = Math.round(emp.salary / 12);
    const allowance = 500;
    const tax = Math.round(monthlyBasic * 0.15);
    const net = monthlyBasic + allowance - tax;

    tbody.innerHTML += `
      <tr>
        <td><strong>${emp.name}</strong><br><small class="text-muted">${emp.role}</small></td>
        <td>$${monthlyBasic.toLocaleString()}</td>
        <td>+$${allowance}</td>
        <td>-$${tax}</td>
        <td><strong>$${net.toLocaleString()}</strong></td>
        <td><span class="badge badge-success">Processed</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="downloadPayslip('${emp.name}', ${monthlyBasic}, ${allowance}, ${tax}, ${net})">📄 Slip</button>
        </td>
      </tr>
    `;
  });
}

function processPayroll() {
  logActivity('Batch payroll executed');
  showToast('Monthly Payroll processed successfully!', 'success');
}

function saveReview(e) {
  e.preventDefault();
  const newRev = {
    empName: document.getElementById('reviewEmpSelect').value,
    reviewer: state.currentUser.name,
    rating: `${document.getElementById('reviewRating').value} ⭐`,
    goal: document.getElementById('reviewGoal').value,
    feedback: document.getElementById('reviewFeedback').value
  };

  state.reviews.push(newRev);
  logActivity(`Performance review filed for ${newRev.empName}`);
  showToast('Performance review submitted', 'success');
  toggleReviewModal(false);
  renderPerformance();
}

function renderPerformance() {
  const container = document.getElementById('performanceList');
  if (!container) return;
  container.innerHTML = '';

  state.reviews.forEach(rev => {
    container.innerHTML += `
      <div class="card" style="margin-bottom: 1rem;">
        <div class="flex-between">
          <h3>${rev.empName}</h3>
          <span style="font-weight: 700; color: var(--warning);">${rev.rating}</span>
        </div>
        <p style="font-size: 0.875rem; margin-top: 6px;"><strong>Target Goal:</strong> ${rev.goal}</p>
        <p class="text-muted" style="font-size: 0.85rem; margin-top: 4px;">Feedback: "${rev.feedback}"</p>
        <small class="text-muted" style="display: block; margin-top: 8px;">Reviewed by: ${rev.reviewer}</small>
      </div>
    `;
  });
}

function toggleReviewModal(show) {
  if (!show) document.getElementById('reviewForm')?.reset();
  document.getElementById('reviewModal').style.display = show ? 'flex' : 'none';
}

// 10. EXPORTS (CSV & PAYSLIP)
function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);

  const csvContent =
    keys.join(separator) + '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k].toString();
        cell = cell.replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
        return cell;
      }).join(separator);
    }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportEmployeesCSV() {
  exportToCSV('employees_report.csv', state.employees);
  logActivity('Exported employee directory to CSV');
  showToast('Employees exported to CSV', 'success');
}

function exportPayrollCSV() {
  const payrollData = state.employees.map(emp => ({
    EmployeeID: emp.id,
    Name: emp.name,
    Department: emp.dept,
    AnnualSalary: emp.salary,
    MonthlyGross: (emp.salary / 12).toFixed(2),
    TaxDeduction: ((emp.salary / 12) * 0.15).toFixed(2),
    NetPay: ((emp.salary / 12) * 0.95).toFixed(2)
  }));
  exportToCSV('payroll_report.csv', payrollData);
  logActivity('Exported payroll report to CSV');
  showToast('Payroll report exported', 'success');
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
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Payslip_${name.replace(/\s+/g, '_')}.txt`;
  link.click();
  logActivity(`Downloaded payslip for ${name}`);
  showToast(`Downloaded payslip for ${name}`, 'primary');
}

// 11. DROPDOWN POPULATION & RENDER ALL
function populateDropdowns() {
  const deptSelect = document.getElementById('empDept');
  const deptFilter = document.getElementById('empDeptFilter');
  const reviewEmpSelect = document.getElementById('reviewEmpSelect');

  if (deptSelect) deptSelect.innerHTML = '';
  if (deptFilter) deptFilter.innerHTML = '<option value="All">All Departments</option>';
  if (reviewEmpSelect) reviewEmpSelect.innerHTML = '';

  state.departments.forEach(d => {
    if (deptSelect) deptSelect.innerHTML += `<option value="${d.name}">${d.name}</option>`;
    if (deptFilter) deptFilter.innerHTML += `<option value="${d.name}">${d.name}</option>`;
  });

  state.employees.forEach(e => {
    if (reviewEmpSelect) reviewEmpSelect.innerHTML += `<option value="${e.name}">${e.name}</option>`;
  });
}

function renderAll() {
  renderDashboard();
  renderEmployees();
  renderDepartments();
  renderAttendance();
  renderLeaves();
  renderPayroll();
  renderPerformance();
  populateDropdowns();
  applyRoleAccess();
}

// INITIALIZATION & EVENT BINDINGS
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Initial render call
  renderAll();

  // Close modals on overlay backdrop click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') && e.target.id !== 'auth-screen') {
      e.target.style.display = 'none';
    }
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(modal => {
        if (modal.id !== 'auth-screen') modal.style.display = 'none';
      });
    }
  });
});

// Auto-close sidebar on mobile view when clicking outside
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.querySelector('.mobile-nav-toggle');

  if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('mobile-open')) {
    if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
  }
});
