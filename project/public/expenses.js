export function handleExpenseForm(expenseForm, currentUser, currentRole, expenses, updateHistory, updateSummary, updateApprovals, showAlert) {
  expenseForm.addEventListener('submit', e => {
    e.preventDefault();
    const desc = expenseForm.querySelector('#exp-desc').value.trim();
    const amount = parseFloat(expenseForm.querySelector('#exp-amount').value);
    const category = expenseForm.querySelector('#exp-category').value;
    const date = expenseForm.querySelector('#exp-date').value;

    if (!desc || isNaN(amount) || amount <= 0 || !category || !date) {
      alert('Please fill all fields correctly!');
      return;
    }

    expenses.push({
      id: Date.now(),
      user: currentUser,
      desc,
      amount,
      category,
      date,
      status: currentRole === "employee" ? "Pending" : "Approved"
    });

    showAlert("Expense added successfully");
    updateHistory();
    updateSummary();

    if (["manager", "admin"].includes(currentRole)) updateApprovals();
    expenseForm.reset();
  });
}

export function updateHistory(expenses, currentUser, historyList) {
  const history = expenses.filter(e => e.user === currentUser);
  historyList.innerHTML = "";
  history.forEach(exp => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${exp.desc}</td><td>${exp.category}</td><td>₹${exp.amount.toFixed(2)}</td><td>${exp.date}</td><td>${exp.status}</td>`;
    historyList.appendChild(row);
  });
}

export function updateSummary(expenses, currentUser, sumTotal, sumApproved, sumRejected) {
  const history = expenses.filter(e => e.user === currentUser);
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
      <td>${exp.desc}</td>
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
