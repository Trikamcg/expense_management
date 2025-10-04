let currentUser = null;
let currentRole = "employee"; // "employee", "manager", "admin"
let expenses = [];

// Dark mode toggle setup
const modeToggle = document.getElementById('mode-toggle');
const modeIcon = document.getElementById('mode-icon');

modeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    modeIcon.classList.replace('fa-moon', 'fa-sun');
    modeToggle.innerHTML = '<i class="fa-solid fa-sun"></i> Light Mode';
  } else {
    modeIcon.classList.replace('fa-sun', 'fa-moon');
    modeToggle.innerHTML = '<i class="fa-solid fa-moon"></i> Dark Mode';
  }
});

// Login form submit handler
document.getElementById("authForm").onsubmit = function(e) {
  e.preventDefault();
  currentUser = document.getElementById("auth-username").value.trim();
  if (!currentUser) {
    alert('Please enter username');
    return;
  }
  document.getElementById("display-username").textContent = currentUser;
  document.getElementById("role-display").textContent = currentRole;
  document.getElementById("dashboard-section").style.display = "block";
  document.getElementById("auth-section").style.display = "none";
  updateHistory();
  updateSummary();
  if (["manager", "admin"].includes(currentRole)) {
    document.getElementById("approval-section").style.display = "block";
    updateApprovals();
  } else {
    document.getElementById("approval-section").style.display = "none";
  }
};

// Logout function
function logout() {
  document.getElementById("dashboard-section").style.display = "none";
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("authForm").reset();
  currentUser = null;
}

// Expense form submit handler
document.getElementById("expense-form").onsubmit = function(e) {
  e.preventDefault();
  let desc = document.getElementById("exp-desc").value.trim();
  let amt = parseFloat(document.getElementById("exp-amount").value);
  let cat = document.getElementById("exp-category").value;
  let date = document.getElementById("exp-date").value;
  if (!desc || isNaN(amt) || amt <= 0 || !cat || !date) {
    alert("Please fill all fields correctly!");
    return;
  }
  expenses.push({
    id: Date.now(),
    user: currentUser,
    desc,
    amount: amt,
    category: cat,
    date,
    status: currentRole === "employee" ? "Pending" : "Approved"
  });
  updateHistory();
  updateSummary();
  if (["manager", "admin"].includes(currentRole)) updateApprovals();
  e.target.reset();
};

// Update expense history table
function updateHistory() {
  let history = expenses.filter(e => e.user === currentUser);
  let tbody = document.getElementById("history-list");
  tbody.innerHTML = "";
  history.forEach(exp => {
    let row = document.createElement("tr");
    row.innerHTML = `<td>${exp.desc}</td><td>${exp.category}</td><td>₹${exp.amount.toFixed(2)}</td><td>${exp.date}</td><td>${exp.status}</td>`;
    tbody.appendChild(row);
  });
}

// Update summary info cards
function updateSummary() {
  let history = expenses.filter(e => e.user === currentUser);
  let total = history.reduce((acc, ex) => acc + ex.amount, 0);
  let approved = history.filter(e => e.status === "Approved").reduce((acc, ex) => acc + ex.amount, 0);
  let rejected = history.filter(e => e.status === "Rejected").reduce((acc, ex) => acc + ex.amount, 0);
  document.getElementById("sum-total").textContent = "₹" + total.toFixed(2);
  document.getElementById("sum-approved").textContent = "₹" + approved.toFixed(2);
  document.getElementById("sum-rejected").textContent = "₹" + rejected.toFixed(2);
}

// Update approvals table
function updateApprovals() {
  let pending = expenses.filter(e => e.status === "Pending");
  let tbody = document.getElementById("approval-list");
  tbody.innerHTML = "";
  pending.forEach(exp => {
    let row = document.createElement("tr");
    row.innerHTML = `<td>${exp.desc}</td>
      <td>${exp.category}</td>
      <td>₹${exp.amount.toFixed(2)}</td>
      <td>${exp.date}</td>
      <td>${exp.user}</td>
      <td>${exp.status}</td>
      <td>
        <button class='btn btn-success btn-sm' onclick='approveExpense(${exp.id})'>Approve</button>
        <button class='btn btn-danger btn-sm' onclick='rejectExpense(${exp.id})'>Reject</button>
      </td>`;
    tbody.appendChild(row);
  });
}

window.approveExpense = function(id) {
  expenses = expenses.map(e => (e.id === id ? { ...e, status: "Approved" } : e));
  updateHistory();
  updateSummary();
  updateApprovals();
};

window.rejectExpense = function(id) {
  expenses = expenses.map(e => (e.id === id ? { ...e, status: "Rejected" } : e));
  updateHistory();
  updateSummary();
  updateApprovals();
};
