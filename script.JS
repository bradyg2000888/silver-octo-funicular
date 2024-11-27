let selectedItems = []; // Store selected items
let totalCost = 0; // Track total cost
let userName = ''; // Store user name
let selectedUsers = {}; // Store selected users and their items

const discountPerItem = 3.5; // Discount per item selected

// List of available teams (add all available options here)
const availableItems = [
  { name: 'Team 1', price: 10 },
  { name: 'Team 2', price: 12 },
  { name: 'Team 3', price: 8 },
  { name: 'Team 4', price: 15 },
  { name: 'Team 5', price: 14 },
  { name: 'Team 6', price: 9 },
  { name: 'Team 7', price: 11 },
  // Add more teams as needed
];

// Check if there's a stored user in localStorage and populate if exists
window.addEventListener('load', function() {
  const storedUserName = localStorage.getItem('userName');
  if (storedUserName) {
    document.getElementById('userName').value = storedUserName;
    userName = storedUserName;
    updateUserSelectionsTable();
  }

  populateDropdown();
  loadPersistedSelections();
});

// Save user name to localStorage
document.getElementById('saveName').addEventListener('click', function() {
  userName = document.getElementById('userName').value.trim();
  if (userName) {
    localStorage.setItem('userName', userName);
    updateUserSelectionsTable();
  }
});

// Function to update the table displaying user selections
function updateUserSelectionsTable() {
  const userList = document.getElementById('userList');
  userList.innerHTML = ''; // Clear the list

  // Add current user to the list
  const userItem = document.createElement('li');
  userItem.textContent = `${userName} has selected: ${selectedItems.map(item => item.itemName).join(', ')}`;
  userList.appendChild(userItem);

  // Display all selected users and their items
  for (const [user, items] of Object.entries(selectedUsers)) {
    if (user !== userName) {
      const userRow = document.createElement('li');
      userRow.textContent = `${user} has selected: ${items.join(', ')}`;
      userList.appendChild(userRow);
    }
  }
}

// Populate dropdown with available items
function populateDropdown() {
  const group1Dropdown = document.getElementById('group1');

  availableItems.forEach(item => {
    const option = document.createElement('option');
    option.value = item.name;
    option.textContent = `${item.name} - $${item.price}`;
    option.setAttribute('data-price', item.price);

    // Disable the item if it has already been selected
    if (isItemAlreadySelected(item.name)) {
      option.disabled = true;
      option.textContent += " (Already selected)";
    }

    group1Dropdown.appendChild(option);
  });
}

// Function to check if an item has already been selected
function isItemAlreadySelected(itemName) {
  return Object.values(selectedUsers).some(userItems => userItems.includes(itemName));
}

// Function to update the selected items list and total cost
function updateSelection(itemName, price) {
  // If this is not the first item selected, apply the discount
  if (selectedItems.length > 0) {
    totalCost += price - discountPerItem; // Apply discount for subsequent items
  } else {
    totalCost += price; // No discount for the first item
  }

  // Add item to the selectedItems array
  selectedItems.push({ itemName, price });

  // Save to localStorage for persistence
  if (!selectedUsers[userName]) {
    selectedUsers[userName] = [];
  }
  selectedUsers[userName].push(itemName);
  localStorage.setItem('selectedUsers', JSON.stringify(selectedUsers));

  // Update the selected teams list and total cost
  const selectedTeamsList = document.getElementById('selected-teams');
  const totalCostElement = document.getElementById('total-cost');
  const listItem = document.createElement('li');

  // Display the item with discount if applicable
  if (selectedItems.length > 1) {
    listItem.textContent = `${itemName} - $${price} (Discount: -$${discountPerItem})`;
  } else {
    listItem.textContent = `${itemName} - $${price}`;
  }

  selectedTeamsList.appendChild(listItem);
  totalCostElement.textContent = `Total Cost: $${totalCost.toFixed(2)}`; // Show total with discount applied (if any)
  updateUserSelectionsTable();
}

// Function to open the modal with confirmation
function openConfirmationModal(itemName, price, optionElement) {
  const confirmationModal = document.getElementById('confirmationModal');
  const confirmationMessage = document.getElementById('confirmationMessage');

  confirmationMessage.textContent = `Are you sure you want to add the ${itemName}?`;

  confirmationModal.style.display = "block";

  // If Yes is clicked, proceed with selection and strikeout the item
  document.getElementById('confirmYes').onclick = function() {
    updateSelection(itemName, price);
    optionElement.style.textDecoration = "line-through"; // Strikeout the item
    optionElement.disabled = true; // Disable the item
    confirmationModal.style.display = "none"; // Close confirmation modal
  };

  // If No is clicked, cancel selection
  document.getElementById('confirmNo').onclick = function() {
    confirmationModal.style.display = "none"; // Close confirmation modal
  };
}

// Event listener for selecting an item from Group 1
document.getElementById('group1').addEventListener('change', function() {
  const selectedOption = this.options[this.selectedIndex];
  const itemName = selectedOption.text;
  const price = parseFloat(selectedOption.getAttribute('data-price'));

  // If the item is already selected, don't do anything
  if (selectedOption.disabled) {
    alert('This item has already been selected.');
    return;
  }

  // Open confirmation modal for new selection
  openConfirmationModal(itemName, price, selectedOption);
});

// PayPal button logic
document.querySelectorAll('.paypal-button').forEach((button) => {
  button.addEventListener('click', () => {
    const paymentMessage = `Please send $${totalCost.toFixed(2)} for the selected teams.`;
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=Bradygoulden@gmail.com&item_name=${encodeURIComponent(selectedItems.map(item => item.itemName).join(", "))}&amount=${totalCost.toFixed(2)}&currency_code=USD&return=https://yourwebsite.com/success&cancel_return=https://yourwebsite.com/cancel`;
    
    const paymentModal = document.getElementById('paymentModal');
    const paymentLink = document.getElementById('paymentLink');
    paymentLink.href = paypalUrl;
    paymentLink.textContent = "Proceed to PayPal";

    document.getElementById('paymentMessage').textContent = paymentMessage;

    // Show the payment modal
    paymentModal.style.display = "block";
  });
});

// Venmo button logic
document.querySelectorAll('.venmo-button').forEach((button) => {
  button.addEventListener('click', () => {
    const paymentMessage = `Please send $${totalCost.toFixed(2)} for the selected teams via Venmo (@Brady-Goulden) with the note: Payment for ${selectedItems.map(item => item.itemName).join(", ")}.`;
    const venmoUrl = `https://venmo.com/?txn=pay&recipients=brady-goulden&amount=${totalCost.toFixed(2)}&note=Payment+for+${encodeURIComponent(selectedItems.map(item => item.itemName).join(", "))}`;

    const paymentModal = document.getElementById('paymentModal');
    const paymentLink = document.getElementById('paymentLink');
    paymentLink.href = venmoUrl;
    paymentLink.textContent = "Proceed to Venmo";

    document.getElementById('paymentMessage').textContent = paymentMessage;

    // Show the payment modal
    paymentModal.style.display = "block";
  });
});

// Close modals
document.querySelectorAll(".close").forEach(closeButton => {
  closeButton.addEventListener("click", function() {
    document.getElementById("paymentModal").style.display = "none";
    document.getElementById("confirmationModal").style.display = "none";
  });
});

// Close modal if the user clicks outside of it
window.addEventListener("click", function(event) {
  if (event.target === document.getElementById("paymentModal") || event.target === document.getElementById("confirmationModal")) {
    document.getElementById("paymentModal").style.display = "none";
    document.getElementById("confirmationModal").style.display = "none";
  }
});
