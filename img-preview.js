const Viewer = require('viewerjs')
let viewer = null;
console.log('excute!!!!!!!')
if (typeof window !== 'undefined') {
  window.addEventListener('click', function (e) {
    console.log(e);
    if (e.target && e.target.tagName === 'IMG' && !viewer) {
      const $img = e.target.cloneNode();
      // const $modal = document.createElement('div');
      // $modal.className = 'image-preview-modal';
      // $modal.appendChild($img)
  
      // View an image.
      viewer = new Viewer($img, {
        container: document.querySelector('#__docusaurus'),
        loop: false,
        toolbar: {
          zoomIn: {
            show: 4,
            size: 'large'
          },
          zoomOut: {
            show: 4,
            size: 'large'
          },
          oneToOne: {
            show: 4,
            size: 'large'
          },
          reset: {
            show: 4,
            size: 'large'
          },
          rotateLeft: {
            show: 4,
            size: 'large'
          },
          rotateRight: {
            show: 4,
            size: 'large'
          },
          flipHorizontal: {
            show: 4,
            size: 'large'
          },
          flipVertical: {
            show: 4,
            size: 'large'
          },
          play: 0,
          prev: 0,
          next: 0,
        },
      });
      viewer.show();
      function onClose() {
        $img.removeEventListener('hidden', onClose);
        $img.remove();
        viewer.destroy();
        viewer = null;
      }
      $img.addEventListener('hidden', onClose);
      // document.body.appendChild($modal);
    }
  });
}
