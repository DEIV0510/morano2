/* Pantalla de carga solo la primera vez por sesión (se ejecuta antes del primer pintado). */
try {
  if (sessionStorage.getItem('mg_intro')) document.documentElement.classList.add('intro-seen');
  else {
    sessionStorage.setItem('mg_intro', '1');
    document.documentElement.classList.add('has-loader');
  }
} catch (e) {
  document.documentElement.classList.add('intro-seen');
}
