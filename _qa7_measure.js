({
  scrollY: Math.round(window.scrollY),
  hash: location.hash,
  worksTop: Math.round(document.querySelector('#works').getBoundingClientRect().top),
  headerBottom: Math.round(document.querySelector('header').getBoundingClientRect().bottom),
  bodyOverflow: document.body.style.overflow
})
