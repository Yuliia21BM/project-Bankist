'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

updatedUserName(accounts);

// EVENTLISTENERS

btnLogin.addEventListener('click', onBtnLoginClick);
btnTransfer.addEventListener('click', onBtnTransferClick);
btnClose.addEventListener('click', onBtnCloseClick);
btnLoan.addEventListener('click', onBtnLoanClick);
btnSort.addEventListener('click', onBtnSortClick);

let currentAccount;

function onBtnLoginClick(e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginUsername.blur();
    inputLoginPin.blur();
    updateUI(currentAccount);
    containerApp.style.opacity = 100;
  }
}

function onBtnTransferClick(e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance > amount &&
    receiverAcc.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    updateUI(currentAccount);
  }
}

function onBtnCloseClick(e) {
  e.preventDefault();
  const pin = Number(inputClosePin.value);
  const name = inputCloseUsername.value;
  if (pin === currentAccount.pin && name === currentAccount.username) {
    const i = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(i, 1);
    containerApp.style.opacity = 0;
  }
  inputClosePin.value = inputCloseUsername.value = '';
}

function onBtnLoanClick(e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  const positiveMov = currentAccount.movements.some(mov => mov >= amount * 0.1);
  if (amount > 0 && positiveMov) {
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
}

let sorted = false;

function onBtnSortClick(e) {
  e.preventDefault();
  displayMovments(currentAccount.movements, !sorted);
  sorted = !sorted;
}

function updatedUserName(accs = []) {
  accs.forEach(
    acc =>
      (acc.username = acc.owner
        .toLowerCase()
        .split(' ')
        .map(word => word[0])
        .join(''))
  );
}

function displayMovments(movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  movs.map((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">3 days ago</div>
          <div class="movements__value">${mov}€</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

function calkDisplayBalanse(acc) {
  acc.balance = acc.movements.reduce(
    (acc, currentMov) => (acc += currentMov),
    0
  );
  labelBalance.textContent = `${acc.balance}€`;
}

function calkDisplaySummary(acc) {
  const incomes = acc.movements
    .filter(el => el > 0)
    .reduce((total, val) => total + val, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter(el => el < 0)
    .reduce((total, val) => total + val, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements
    .filter(el => el > 0)
    .map(el => (el * acc.interestRate) / 100)
    .filter(el => el >= 1)
    .reduce((total, el) => total + el);
  labelSumInterest.textContent = `${interest}€`;
}

function updateUI(acc) {
  displayMovments(acc.movements);
  calkDisplayBalanse(acc);
  calkDisplaySummary(acc);
}
