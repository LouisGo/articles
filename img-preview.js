// const Viewer = require('viewerjs')
// require('viewerjs/dist/viewer.css')
let $modal = null;
console.log('excute!!!!!!!');
if (typeof window !== 'undefined') {
  // window.Viewer = Viewer;
  window.addEventListener('click', function (e) {
    console.log(e);
    if (e.target && e.target.tagName === 'IMG' && !$modal) {
      if (e.target.alt === 'LouisGo logo') {
        return;
      }
      const $img = e.target.cloneNode();
      const bodyWidth = document.body.offsetWidth;
      const bodyHeight = document.body.offsetHeight;
      const naturalWidth = $img.naturalWidth;
      const naturalHeight = $img.naturalHeight;
      let width = naturalWidth;
      let height = naturalHeight;
      // $img.style.width = width + 'px';
      // $img.style.height = height + 'px';
      if (naturalWidth > bodyWidth) {
        $img.style.width = width + 'px';
      } else if (naturalHeight > bodyHeight) {
        $img.style.height = height + 'px';
      }
      if (width < bodyWidth / 2 && height < bodyHeight / 2) {
        $img.style.width = width * 2 + 'px';
        $img.style.height = height * 2 + 'px';
      }
      $modal = document.createElement('div');
      $modal.className = 'image-preview-modal';
      const $wrapper = document.createElement('div');
      $wrapper.className = 'image-preview-wrapper';
      $wrapper.appendChild($img)
      $modal.appendChild($wrapper);
      // View an image.
      /* viewer = new Viewer($img, {
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
      viewer.show(); */
      function onClose(e) {
        e.stopPropagation();
        $modal.classList.add('hiding');
        setTimeout(() => {
          $modal && $modal.removeEventListener('click', onClose);
          $wrapper.remove();
          document.body.removeChild($modal);
          $modal = null;
        }, 350);
      }
      $modal.addEventListener('click', onClose);
      document.body.appendChild($modal);
    }
  });
}
