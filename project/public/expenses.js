// Requires: localStorage.getItem('userId') is set after login

export function handleExpenseForm(expenseForm, expenses, updateHistory, updateSummary, updateApprovals, showAlert) {
  expenseForm.addEventListener('submit', async e => {
    e.preventDefault();
    const title = expenseForm.querySelector('#exp-desc').value.trim();
    const amount = parseFloat(expenseForm.querySelector('#exp-amount').value);
    const category = expenseForm.querySelector('#exp-category').value;
    const date = expenseForm.querySelector('#exp-date').value;
    const userId = localStorage.getItem('userId');

    if (!title || isNaN(amount) || amount <= 0 || !category || !date) {
      alert('Please fill all fields correctly!');
      return;
    }
    if (!userId) {
      alert('User ID is missing. Please login again!');
      return;
    }

    // API call here instead of local push, OR if you keep local, add userId field
    try {
      // If using local for demo/mock:
      expenses.push({
        id: Date.now(),
        userId: userId,
        title,
        amount,
        category,
        date,
        status: "Pending"
      });

      showAlert("Expense added successfully");
      updateHistory();
      updateSummary();

      if (typeof updateApprovals === "function") updateApprovals();
      expenseForm.reset();
    } catch (err) {
      showAlert("Failed to add expense: " + err.message, "danger");
    }
  });
}

export function updateHistory(expenses, historyList) {
  const userId = localStorage.getItem('userId');
  const history = expenses.filter(e => e.userId === userId);
  historyList.innerHTML = "";
  history.forEach(exp => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${exp.title}</td><td>${exp.category}</td><td>₹${exp.amount.toFixed(2)}</td><td>${exp.date}</td><td>${exp.status}</td>`;
    historyList.appendChild(row);
  });
}

export function updateSummary(expenses, sumTotal, sumApproved, sumRejected) {
  const userId = localStorage.getItem('userId');
  const history = expenses.filter(e => e.userId === userId);
  const total = history.reduce((acc, exp) => acc + exp.amount, 0);
  const approved = history.filter(e => e.status === "Approved").reduce((acc, exp) => acc + exp.amount, 0);
  const rejected = history.filter(e => e.status === "Rejected").reduce((acc, exp) => acc + exp.amount, 0);

  sumTotal.textContent = "₹" + total.toFixed(2);
  sumApproved.textContent = "₹" + approved.toFixed(2);
  sumRejected.textContent = "₹" + rejected.toFixed(2);
}

export function updateApprovals(expenses, approvalList, approveExpense, rejectExpense) {
  const pending = expenses.filter(e => e.status === "Pending");
  approvalList.innerHTML = "";
  pending.forEach(exp => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${exp.title}</td>
      <td>${exp.category}</td>
      <td>₹${exp.amount.toFixed(2)}</td>
      <td>${exp.date}</td>
      <td>
        <button class="btn btn-success btn-sm" onclick="approveExpense(${exp.id})">Approve</button>
        <button class="btn btn-danger btn-sm" onclick="rejectExpense(${exp.id})">Reject</button>
      </td>`;
    approvalList.appendChild(row);
  });
}
