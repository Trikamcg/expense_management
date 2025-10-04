let currentUser = null;
let currentRole = "employee";
let expenses = [];

const modeToggle = document.getElementById('mode-toggle');
const modeIcon = document.getElementById('mode-icon');
const authForm = document.getElementById('authForm');
const dashboardSection = document.getElementById('dashboard-section');
const authSection = document.getElementById('auth-section');
const expenseForm = document.getElementById('expense-form');
const historyList = document.getElementById('history-list');
const approvalList = document.getElementById('approval-list');
const sumTotal = document.getElementById('sum-total');
const sumApproved = document.getElementById('sum-approved');
const sumRejected = document.getElementById('sum-rejected');
const displayUsername = document.getElementById('display-username');
const roleDisplay = document.getElementById('role-display');
const searchInput = document.getElementById('expense-search');
const paginationContainer = document.getElementById('pagination');

let currentPage = 1;
const itemsPerPage = 5;

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    modeIcon.classList.replace('fa-moon', 'fa-sun');
    modeToggle.innerHTML = '<i class="fa-solid fa-sun"></i> Light Mode';
  } else {
    modeIcon.classList.replace('fa-sun', 'fa-moon');
    modeToggle.innerHTML = '<i class="fa-solid fa-moon"></i> Dark Mode';
  }
}

modeToggle.addEventListener('click', toggleDarkMode);

function showAlert(message, type = 'success', timeout = 3000) {
  const alertPlaceholder = document.getElementById('alert-placeholder');
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
  alertPlaceholder.append(wrapper);
  setTimeout(() => wrapper.remove(), timeout);
}

function getFilteredExpenses() {
  const query = searchInput.value.toLowerCase();
  return expenses.filter(exp =>
    exp.user === currentUser &&
    (exp.desc.toLowerCase().includes(query) || exp.category.toLowerCase().includes(query))
  );
}

function renderExpensesPage(page) {
  currentPage = page;
  const filtered = getFilteredExpenses();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pagedExpenses = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  historyList.innerHTML = "";
  pagedExpenses.forEach(exp => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${exp.desc}</td>
      <td>${exp.category}</td>
      <td>₹${exp.amount.toFixed(2)}</td>
      <td>${exp.date}</td>
      <td>${exp.status}</td>`;
    historyList.appendChild(row);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  paginationContainer.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement('li');
    pageItem.className = 'page-item' + (i === currentPage ? ' active' : '');
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.addEventListener('click', e => {
      e.preventDefault();
      renderExpensesPage(i);
    });
    paginationContainer.appendChild(pageItem);
  }
}

searchInput.addEventListener('input', () => {
  renderExpensesPage(1);
});

async function loginAPI(username, password) {
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  return await response.json();
}

async function addExpenseAPI(expense) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(expense),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add expense');
  }
  return await response.json();
}

async function getExpensesAPI() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/expenses', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!response.ok) throw new Error('Failed to fetch expenses');
  return await response.json();
}

async function updateExpensesFromAPI() {
  try {
    expenses = await getExpensesAPI();
    renderExpensesPage(currentPage);
    updateSummary();
    if (['manager', 'admin'].includes(currentRole)) updateApprovals();
  } catch (error) {
    showAlert(error.message, 'danger');
  }
}

authForm.addEventListener('submit', async e => {
  e.preventDefault();
  const usernameInput = document.getElementById("auth-username");
  const passwordInput = document.getElementById("auth-password");

  if (!usernameInput.value.trim()) {
    showAlert('Please enter username', 'danger');
    usernameInput.focus();
    return;
  }
  if (!passwordInput.value) {
    showAlert('Please enter password', 'danger');
    passwordInput.focus();
    return;
  }

  try {
    const data = await loginAPI(usernameInput.value.trim(), passwordInput.value);
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);
    currentUser = data.username;
    currentRole = data.role;

    showAlert(`Welcome ${currentUser}`, 'success');
    displayUsername.textContent = currentUser;
    roleDisplay.textContent = currentRole;
    authSection.style.display = "none";
    dashboardSection.style.display = "block";

    updateExpensesFromAPI();
  } catch (error) {
    showAlert(error.message, 'danger');
  }
});

expenseForm.addEventListener('submit', async e => {
  e.preventDefault();
  const desc = document.getElementById("exp-desc").value.trim();
  const amount = parseFloat(document.getElementById("exp-amount").value);
  const category = document.getElementById("exp-category").value;
  const date = document.getElementById("exp-date").value;

  if (!desc) {
    showAlert("Please enter description", "danger");
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    showAlert("Please enter valid amount", "danger");
    return;
  }
  if (!category) {
    showAlert("Please select category", "danger");
    return;
  }
  if (!date) {
    showAlert("Please select date", "danger");
    return;
  }

  try {
    await addExpenseAPI({ desc, amount, category, date });
    showAlert("Expense added successfully");
    updateExpensesFromAPI();
    e.target.reset();
  } catch (error) {
    showAlert(error.message, "danger");
  }
});

function updateSummary() {
  const history = expenses.filter(e => e.user === currentUser);
  const total = history.reduce((acc, exp) => acc + exp.amount, 0);
  const approved = history.filter(e => e.status === "Approved").reduce((acc, exp) => acc + exp.amount, 0);
  const rejected = history.filter(e => e.status === "Rejected").reduce((acc, exp) => acc + exp.amount, 0);

  sumTotal.textContent = "₹" + total.toFixed(2);
  sumApproved.textContent = "₹" + approved.toFixed(2);
  sumRejected.textContent = "₹" + rejected.toFixed(2);
}

function updateApprovals() {
  const pending = expenses.filter(e => e.status === "Pending");
  approvalList.innerHTML = "";
  pending.forEach(exp => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${exp.desc}</td>
      <td>${exp.category}</td>
      <td>₹${exp.amount.toFixed(2)}</td>
      <td>${exp.date}</td>
      <td>${exp.user}</td>
      <td>${exp.status}</td>
      <td>
        <button class='btn btn-success btn-sm' data-id="${exp._id}" data-action="approve">Approve</button>
        <button class='btn btn-danger btn-sm' data-id="${exp._id}" data-action="reject">Reject</button>
      </td>`;
    approvalList.appendChild(row);
  });

  approvalList.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      if (action === 'approve') {
        approveExpense(id);
      } else {
        rejectExpense(id);
      }
    });
  });
}

async function approveExpense(id) {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`http://localhost:3000/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: "Approved" })
    });
    if (!res.ok) throw new Error('Failed to approve expense');
    await updateExpensesFromAPI();
  } catch (error) {
    showAlert(error.message, 'danger');
  }
}

async function rejectExpense(id) {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`http://localhost:3000/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: "Rejected" })
    });
    if (!res.ok) throw new Error('Failed to reject expense');
    await updateExpensesFromAPI();
  } catch (error) {
    showAlert(error.message, 'danger');
  }
}

// Logout function
function logout() {
  localStorage.clear();
  currentUser = null;
  currentRole = "employee";
  expenses = [];
  authForm.reset();
  authSection.style.display = "block";
  dashboardSection.style.display = "none";
  showAlert('Logged out successfully', 'info');
}
