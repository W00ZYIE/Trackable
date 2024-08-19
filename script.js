let items = [];
let currentPage = 1;
const itemsPerPage = 10;
let editIndex = null;

document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    loadCharts();
    updatePaginationControls();
});

const loadItems = () => {
    const storedItems = JSON.parse(localStorage.getItem('items')) || [];
    items = storedItems;
    renderItems();
    updateAnalytics();
    updatePaginationControls();
};

const saveItems = () => {
    localStorage.setItem('items', JSON.stringify(items));
};

const renderItems = () => {
    const itemsTable = document.getElementById('items');
    itemsTable.innerHTML = `
        <thead>
            <tr>
                <th>Item Name</th>
                <th>Purchase Price</th>
                <th>Selling Price</th>
                <th>Purchase Date</th>
                <th>Profit</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => `
                <tr>
                    <td>${item.name || 'N/A'}</td>
                    <td>$${(item.purchasePrice || 0).toFixed(2)}</td>
                    <td>$${(item.sellingPrice || 0).toFixed(2)}</td>
                    <td>${item.purchaseDate || 'N/A'}</td>
                    <td>$${((item.sellingPrice || 0) - (item.purchasePrice || 0)).toFixed(2)}</td>
                    <td>
                        <button class="edit-btn" onclick="editItem(${(currentPage - 1) * itemsPerPage + index})"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" onclick="deleteItem(${(currentPage - 1) * itemsPerPage + index})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
};



const updateAnalytics = () => {
    const totalProfit = items.reduce((acc, item) => acc + (item.sellingPrice - item.purchasePrice), 0).toFixed(2);
    const totalInvestment = items.reduce((acc, item) => acc + item.purchasePrice, 0).toFixed(2);
    const averageProfit = items.length > 0 ? (totalProfit / items.length).toFixed(2) : '0.00';
    
    console.log('Total Profit:', totalProfit);
    console.log('Total Investment:', totalInvestment);

    // Update DOM
    document.getElementById('total-profit').innerText = `Total Profit: $${totalProfit}`;
    document.getElementById('total-investment').innerText = `Total Investment: $${totalInvestment}`;
    document.getElementById('total-cash').innerText = `Total Cash: $${totalProfit}`; // Corrected calculation
    document.getElementById('average-profit').innerText = `Average Profit per Item: $${averageProfit}`;
    
    // Ensure charts are updated
    loadCharts();
};


let profitOverviewChart, investmentDistributionChart, monthlyPerformanceChart, profitMarginChart, riskVsRewardChart;

const loadCharts = () => {
    const ctxProfitOverview = document.getElementById('profit-overview-chart').getContext('2d');
    const ctxInvestmentDistribution = document.getElementById('investment-distribution-chart').getContext('2d');
    const ctxMonthlyPerformance = document.getElementById('monthly-performance-chart').getContext('2d');
    const ctxProfitMarginChart = document.getElementById('profit-margin-chart').getContext('2d');
    const ctxRiskVsReward = document.getElementById('risk-vs-reward-chart').getContext('2d');
    
    // Chart Data
    const profitData = {
        labels: items.map(item => item.name),
        datasets: [{
            label: 'Profit',
            data: items.map(item => item.sellingPrice - item.purchasePrice),
            backgroundColor: items.map(() => `hsl(${Math.random() * 360}, 70%, 70%)`),
            borderColor: '#ffffff',
            borderWidth: 1
        }]
    };

    const investmentData = {
        labels: items.map(item => item.name),
        datasets: [{
            label: 'Investment',
            data: items.map(item => item.purchasePrice),
            backgroundColor: items.map(() => `hsl(${Math.random() * 360}, 70%, 70%)`),
            borderColor: '#ffffff',
            borderWidth: 1
        }]
    };

    const monthlyData = {
        labels: [...new Set(items.map(item => item.purchaseDate.split('-')[1]))].sort(),
        datasets: [{
            label: 'Monthly Performance',
            data: [...new Set(items.map(item => {
                const month = item.purchaseDate.split('-')[1];
                const monthTotal = items.filter(i => i.purchaseDate.split('-')[1] === month).reduce((acc, i) => acc + (i.sellingPrice - i.purchasePrice), 0);
                return monthTotal;
            }))],
            backgroundColor: 'rgba(255, 193, 7, 0.4)',
            borderColor: '#ffc107',
            borderWidth: 2,
            fill: true,
        }]
    };

    const profitMarginData = {
        labels: items.map(item => item.name),
        datasets: [{
            label: 'Profit Margin',
            data: items.map(item => ({
                x: item.purchasePrice,
                y: ((item.sellingPrice - item.purchasePrice) / item.purchasePrice * 100).toFixed(2),
                r: Math.max(((item.sellingPrice - item.purchasePrice) / 20), 5) // Adjust bubble size
            })),
            backgroundColor: '#007bff',
            borderColor: '#0056b3',
            borderWidth: 1
        }]
    };

    const riskVsRewardData = {
        labels: items.map(item => item.name),
        datasets: [{
            label: 'Risk vs Reward',
            data: items.map(item => ({
                x: item.purchasePrice,
                y: item.sellingPrice - item.purchasePrice,
                r: Math.max(((item.sellingPrice - item.purchasePrice) / 20), 5) // Adjust bubble size
            })),
            backgroundColor: '#dc3545',
            borderColor: '#c82333',
            borderWidth: 1
        }]
    };

    // Initialize or Update Charts
    if (profitOverviewChart) {
        profitOverviewChart.data = profitData;
        profitOverviewChart.update();
    } else {
        profitOverviewChart = createChart(ctxProfitOverview, 'pie', profitData);
    }

    if (investmentDistributionChart) {
        investmentDistributionChart.data = investmentData;
        investmentDistributionChart.update();
    } else {
        investmentDistributionChart = createChart(ctxInvestmentDistribution, 'pie', investmentData);
    }

    if (monthlyPerformanceChart) {
        monthlyPerformanceChart.data = monthlyData;
        monthlyPerformanceChart.update();
    } else {
        monthlyPerformanceChart = createChart(ctxMonthlyPerformance, 'line', monthlyData);
    }

    if (profitMarginChart) {
        profitMarginChart.data = profitMarginData;
        profitMarginChart.update();
    } else {
        profitMarginChart = createChart(ctxProfitMarginChart, 'bubble', profitMarginData);
    }

    if (riskVsRewardChart) {
        riskVsRewardChart.data = riskVsRewardData;
        riskVsRewardChart.update();
    } else {
        riskVsRewardChart = createChart(ctxRiskVsReward, 'bubble', riskVsRewardData);
    }
};

const createChart = (ctx, type, data) => {
    return new Chart(ctx, {
        type: type,
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: type !== 'pie' // Show legend only for non-pie charts
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            if (type === 'bubble') {
                                return `Purchase Price: $${tooltipItem.raw.x.toFixed(2)}, Value: ${tooltipItem.raw.y}%`;
                            }
                            if (type === 'scatter') {
                                return `Purchase Price: $${tooltipItem.raw.x.toFixed(2)}, Profit: $${tooltipItem.raw.y.toFixed(2)}`;
                            }
                            return `${tooltipItem.label}: $${tooltipItem.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: type === 'bubble' ? {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Purchase Price'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value (%)'
                    }
                }
            } : type === 'scatter' ? {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Purchase Price (Risk)'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Profit (Reward)'
                    }
                }
            } : {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

const editItem = (index) => {
    const item = items[index];
    document.getElementById('item-name').value = item.name;
    document.getElementById('purchase-price').value = item.purchasePrice;
    document.getElementById('selling-price').value = item.sellingPrice;
    document.getElementById('purchase-date').value = item.purchaseDate;
    document.getElementById('item-form').querySelector('button[type="submit"]').innerText = 'Update Item';
    editIndex = index;
    document.querySelector('button[type="submit"]').scrollIntoView({ behavior: 'smooth' });
    showMessage('Editing item: ' + item.name, 'info');
};

document.getElementById('item-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('item-name').value.trim();
    const purchasePrice = parseFloat(document.getElementById('purchase-price').value);
    const sellingPrice = parseFloat(document.getElementById('selling-price').value);
    const purchaseDate = document.getElementById('purchase-date').value;

    // Form validation
    if (!name || isNaN(purchasePrice) || isNaN(sellingPrice) || !purchaseDate) {
        showMessage('Please fill in all fields with valid data.', 'error');
        return;
    }

    if (editIndex !== null) {
        items[editIndex] = { name, purchasePrice, sellingPrice, purchaseDate };
        showMessage('Item updated successfully.', 'success');
        editIndex = null;
    } else {
        items.push({ name, purchasePrice, sellingPrice, purchaseDate });
        showMessage('Item added successfully.', 'success');
    }
    
    saveItems();
    loadItems();
    
    // Clear the form
    document.getElementById('item-form').reset();
    document.getElementById('item-form').querySelector('button[type="submit"]').innerText = 'Add Item';
    
    // Clear the success message after 3 seconds
    setTimeout(() => showMessage('', ''), 3000);

    // Refresh the page
    setTimeout(() => location.reload(), 3000); // Delay page refresh to allow message to display
});

const deleteItem = (index) => {
    if (confirm('Are you sure you want to delete this item?')) {
        items.splice(index, 1);
        saveItems();
        loadItems();
        showMessage('Item deleted successfully.', 'success');
    }
};

const showMessage = (message, type) => {
    const messageContainer = document.querySelector('.message');
    messageContainer.classList.remove('success', 'error', 'info');
    messageContainer.classList.add(type);
    messageContainer.innerText = message;
    setTimeout(() => {
        messageContainer.innerText = '';
    }, 3000);
};

const showTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = tab.id === tabId ? 'block' : 'none';
    });
    
    if (tabId === 'analytics') {
        loadItems(); // Refresh items data
        updateAnalytics(); // Update analytics data
    }
};


const changePage = (page) => {
    currentPage = page;
    renderItems();
    updatePaginationControls();
};

const updatePaginationControls = () => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">&laquo; Previous</button>
        ${Array.from({ length: totalPages }, (_, i) => `
            <button ${currentPage === i + 1 ? 'class="active"' : ''} onclick="changePage(${i + 1})">${i + 1}</button>
        `).join('')}
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next &raquo;</button>
    `;
};

// Event listeners for tab buttons
document.getElementById('tab-add-item').addEventListener('click', () => showTab('add-item'));
document.getElementById('tab-view-items').addEventListener('click', () => showTab('view-items'));

// Show default tab
showTab('view-items');

console.log('Item purchasePrice:', item.purchasePrice);
console.log('Item sellingPrice:', item.sellingPrice);
