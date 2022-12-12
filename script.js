'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

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

let currentAccount, timer;

function onBtnLoginClick(e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginUsername.blur();
    inputLoginPin.blur();
    containerApp.style.opacity = 100;

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    updateUI(currentAccount);
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

    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);

    clearInterval(timer);
    timer = startLogOutTimer();
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
  const amount = Math.floor(inputLoanAmount.value);
  const positiveMov = currentAccount.movements.some(mov => mov >= amount * 0.1);
  if (amount > 0 && positiveMov) {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';

  clearInterval(timer);
  timer = startLogOutTimer();
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

function formatMovementDate(date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  // else {
  //   const day = `${date.getDate()}`.padStart(2, 0);
  //   const month = `${date.getMonth()}`.padStart(2, 0);
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`;
  // }

  return new Intl.DateTimeFormat(locale).format(date);
}

function formatCur(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
}

function displayMovments(acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  movs.map((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const data = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(data, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMov}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

function calkDisplayBalanse(acc) {
  acc.balance = acc.movements.reduce(
    (acc, currentMov) => (acc += currentMov),
    0
  );

  labelBalance.textContent = `${formatCur(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
}

function calkDisplaySummary(acc) {
  const incomes = acc.movements
    .filter(el => el > 0)
    .reduce((total, val) => total + val, 0);
  labelSumIn.textContent = `${formatCur(incomes, acc.locale, acc.currency)}`;

  const out = acc.movements
    .filter(el => el < 0)
    .reduce((total, val) => total + val, 0);
  labelSumOut.textContent = `${formatCur(
    Math.abs(out),
    acc.locale,
    acc.currency
  )}`;

  const interest = acc.movements
    .filter(el => el > 0)
    .map(el => (el * acc.interestRate) / 100)
    .filter(el => el >= 1)
    .reduce((total, el) => total + el);
  labelSumInterest.textContent = `${formatCur(
    interest,
    acc.locale,
    acc.currency
  )}`;
}

function updateUI(acc) {
  displayMovments(acc);
  calkDisplayBalanse(acc);
  calkDisplaySummary(acc);
}

function startLogOutTimer() {
  let time = 120;
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    time -= 1;
  };

  tick();
  const timer = setInterval(tick, 1000);

  return timer;
}
