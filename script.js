/* MAISON ÉCLAT — configuration de démonstration.
   Remplacez le numéro ci-dessous par le numéro WhatsApp professionnel du client,
   au format international, sans +, espace ni tiret. Exemple tunisien : 216XXXXXXXX.
*/
const WHATSAPP_NUMBER = "95482389"; // À CONFIGURER AVANT TOUTE PRÉSENTATION CLIENT

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const bookingForm = document.querySelector('#booking-form');
const serviceSelect = document.querySelector('#service-select');
const dateInput = document.querySelector('#booking-date');
const daySelect = document.querySelector('#booking-day');
const monthSelect = document.querySelector('#booking-month');
const yearSelect = document.querySelector('#booking-year');
const formError = document.querySelector('#form-error');
const toast = document.querySelector('#toast');

// Sélecteurs de date en français : Jour, Mois, Année.
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString().slice(0, 10);
const currentYear = today.getFullYear();

if (yearSelect) {
  for (let year = currentYear; year <= currentYear + 2; year++) {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.appendChild(option);
  }
}

function updateDayOptions() {
  if (!daySelect || !monthSelect || !yearSelect) return;
  const previousDay = daySelect.value;
  const month = Number(monthSelect.value);
  const year = Number(yearSelect.value);
  const daysInMonth = month && year ? new Date(year, month, 0).getDate() : 31;
  daySelect.replaceChildren(new Option('Jour', ''));
  for (let day = 1; day <= daysInMonth; day++) {
    daySelect.appendChild(new Option(String(day).padStart(2, '0'), String(day).padStart(2, '0')));
  }
  if (previousDay && Number(previousDay) <= daysInMonth) daySelect.value = previousDay;
  updateCombinedDate();
}

function updateCombinedDate() {
  if (!dateInput || !daySelect || !monthSelect || !yearSelect) return;
  const day = daySelect.value;
  const month = monthSelect.value;
  const year = yearSelect.value;
  dateInput.value = day && month && year ? `${year}-${month}-${day}` : '';
}

[daySelect, monthSelect, yearSelect].forEach(select => {
  select?.addEventListener('change', () => {
    if (select === monthSelect || select === yearSelect) updateDayOptions();
    else updateCombinedDate();
  });
});
updateDayOptions();

// Menu mobile accessible.
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    mainNav.classList.toggle('is-open', !isOpen);
    menuToggle.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
  });
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
    });
  });
}

// Pré-sélection du soin depuis les cartes de prestations.
document.querySelectorAll('[data-service]').forEach(link => {
  link.addEventListener('click', () => {
    if (serviceSelect) serviceSelect.value = link.dataset.service;
  });
});

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

bookingForm?.addEventListener('submit', event => {
  event.preventDefault();
  formError.hidden = true;

  if (!bookingForm.reportValidity()) return;

  updateCombinedDate();
  const data = new FormData(bookingForm);
  const name = String(data.get('name') || '').trim();
  const phone = String(data.get('phone') || '').trim();
  const service = String(data.get('service') || '').trim();
  const date = String(data.get('date') || '').trim();
  const time = String(data.get('time') || '').trim();
  const message = String(data.get('message') || '').trim();

  if (!name || !phone || !service || !date || !time) {
    showError('Merci de compléter tous les champs obligatoires.');
    return;
  }
  if (dateInput.min && date < dateInput.min) {
    showError('Veuillez choisir une date à partir d’aujourd’hui.');
    return;
  }
  if (!/^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
    showError('La réservation de démonstration n’est pas encore configurée. Ajoutez le numéro WhatsApp du salon dans script.js.');
    return;
  }

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${date}T12:00:00Z`));

  const text = [
    'Bonjour Maison Éclat, je souhaite demander un rendez-vous.',
    '',
    `Nom : ${name}`,
    `Téléphone : ${phone}`,
    `Prestation : ${service}`,
    `Date souhaitée : ${formattedDate}`,
    `Heure souhaitée : ${time}`,
    message ? `Précisions : ${message}` : '',
    '',
    'Merci de me confirmer si ce créneau est disponible.'
  ].filter(Boolean).join('\n');

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  if (!newWindow) {
    // Solution de secours si le navigateur bloque l’ouverture d’un nouvel onglet.
    window.location.href = whatsappUrl;
  }
});

// Liens de démonstration : affichage d'une indication plutôt qu'une fausse information.
document.querySelectorAll('a[href="#contact"]').forEach(link => {
  link.addEventListener('click', () => {
    if (toast) {
      toast.textContent = 'Pensez à remplacer les coordonnées de démonstration par les informations réelles du salon.';
      toast.classList.add('show');
      window.setTimeout(() => toast.classList.remove('show'), 3600);
    }
  });
});

const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Marque la page active dans le menu.
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.main-nav a[data-page]').forEach(link => {
  if (link.dataset.page === currentPage) link.setAttribute('aria-current', 'page');
});

// Pré-sélectionne la prestation demandée depuis un lien de carte.
if (serviceSelect) {
  const requestedService = new URLSearchParams(window.location.search).get('service');
  if (requestedService) {
    const option = [...serviceSelect.options].find(item => item.value === requestedService || item.textContent.trim() === requestedService);
    if (option) serviceSelect.value = option.value || option.textContent.trim();
  }
}
