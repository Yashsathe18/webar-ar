window.addEventListener('DOMContentLoaded', () => {

  const status = document.getElementById('ui');
  const scene = document.querySelector('a-scene');

  if (!scene.hasLoaded) {
    scene.addEventListener('loaded', () => initAR());
  } else {
    initAR();
  }

  function initAR() {
    const marker = document.querySelector('a-marker');
    const model = document.querySelector('#model');

    // Optional: Rotate model continuously
    model.setAttribute('animation', {
      property: 'rotation',
      to: '0 360 0',
      loop: true,
      dur: 10000,
      easing: 'linear'
    });

    // Marker found / lost events
    marker.addEventListener('markerFound', () => {
      status.innerHTML = "Marker detected! Model is visible.";
    });

    marker.addEventListener('markerLost', () => {
      status.innerHTML = "Move your camera back to the marker to see the model.";
    });
  }

});
