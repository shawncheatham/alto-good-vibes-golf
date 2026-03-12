// Modal controls
const signUpBtn = document.getElementById('signUpBtn');
const loginBtn = document.getElementById('loginBtn');
const signUpModal = document.getElementById('signUpModal');
const loginModal = document.getElementById('loginModal');
const signUpClose = document.getElementById('signUpClose');
const loginClose = document.getElementById('loginClose');
const signUpOverlay = document.getElementById('signUpOverlay');
const loginOverlay = document.getElementById('loginOverlay');

// Open modals
signUpBtn.addEventListener('click', () => {
  signUpModal.classList.add('active');
});

loginBtn.addEventListener('click', () => {
  loginModal.classList.add('active');
});

// Close modals
signUpClose.addEventListener('click', () => {
  signUpModal.classList.remove('active');
});

loginClose.addEventListener('click', () => {
  loginModal.classList.remove('active');
});

signUpOverlay.addEventListener('click', () => {
  signUpModal.classList.remove('active');
});

loginOverlay.addEventListener('click', () => {
  loginModal.classList.remove('active');
});

// ESC key to close modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    signUpModal.classList.remove('active');
    loginModal.classList.remove('active');
  }
});
