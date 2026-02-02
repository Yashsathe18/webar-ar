window.addEventListener('DOMContentLoaded', () => {

  const model = document.querySelector('#model1');
  const marker = document.querySelector('a-marker');
  const status = document.getElementById('ui');

  // Rotate model continuously
  model.setAttribute('animation', {
    property: 'rotation',
    to: '0 360 0',
    loop: true,
    dur: 10000,
    easing: 'linear'
  });

  // Toggle model visibility on tap
  model.addEventListener('click', () => {
    const visible = model.getAttribute('visible');
    model.setAttribute('visible', !visible);
  });

  // Status messages
  marker.addEventListener('markerFound', () => {
    status.innerHTML = "QR detected! Model is visible.";
  });

  marker.addEventListener('markerLost', () => {
    status.innerHTML = "Move your camera back to the QR.";
  });

});
