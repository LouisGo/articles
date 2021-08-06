class ImageViewer {
  $target = null;
  $modal = null;
  $wrapper = null;
  $modalImg = null;
  bodyWidth = 1920;
  bodyHeight = 1080;
  constructor() {
    this.globalClickHandler = this.globalClickHandler.bind(this);
    this.globalResizeHandler = this.globalResizeHandler.bind(this);
    this.modalClickHandler = this.modalClickHandler.bind(this);
    this.setModalImgSize = this.setModalImgSize.bind(this);
    this.init();
  }
  init() {
    this.bodyWidth = document.body.offsetWidth;
    this.bodyHeight = document.body.offsetHeight;
    this.initEvents();
  }
  initEvents() {
    window.addEventListener('click', this.globalClickHandler);
    window.addEventListener('resize', this.globalResizeHandler);
  }
  globalClickHandler(e) {
    if (e.target && e.target.tagName === 'IMG' && !this.$modal) {
      if (e.target.alt === 'LouisGo logo') {
        return;
      }
      this.$target = e.target;
      this.show();
    }
  }
  globalResizeHandler(e) {
    if (!this.$modal) return;
    this.bodyWidth = e.target.innerWidth;
    this.bodyHeight = e.target.innerHeight;
    this.setModalImgSize();
  }
  modalClickHandler(e) {
    if (!this.$modal) return;
    e.stopPropagation();
    this.$modal.classList.add('hiding');
    setTimeout(() => {
      this.hide();
    }, 350);
  }
  show() {
    if (!this.$target) return;
    this.createModal();
  }
  createModal() {
    const $modal = document.createElement('div');
    $modal.className = 'image-preview-modal';
    this.createModalImg();
    this.createWrapper();
    this.$wrapper.appendChild(this.$modalImg);
    this.$modal = $modal;
    this.$modal.appendChild(this.$wrapper);
    this.$modal.addEventListener('click', this.modalClickHandler);
    document.body.appendChild(this.$modal);
  }
  createWrapper() {
    const $wrapper = document.createElement('div');
    $wrapper.className = 'image-preview-wrapper';
    this.$wrapper = $wrapper;
  }
  createModalImg() {
    this.$modalImg = this.$target.cloneNode();
    this.setModalImgSize();
  }
  setModalImgSize() {
    const naturalWidth = this.$modalImg.naturalWidth;
    const naturalHeight = this.$modalImg.naturalHeight;
    let width = naturalWidth;
    let height = naturalHeight;
    if (
      naturalWidth < this.bodyWidth / 1.5 &&
      naturalHeight < this.bodyHeight / 1.5
    ) {
      width = naturalWidth * 1.5;
      height = naturalHeight * 1.5;
    }
    // 自然宽度超过页面宽度
    if (naturalWidth > this.bodyWidth || naturalHeight > this.bodyHeight) {
      width = this.bodyWidth;
      height = naturalHeight * (this.bodyWidth / naturalWidth);
    }
    const x = Math.floor((this.bodyWidth - width) / 2);
    const y =
      height > this.bodyHeight ? 0 : Math.floor((this.bodyHeight - height) / 2);
    this.$modalImg.style.width = `${width}px`;
    this.$modalImg.style.height = `${height}px`;
    this.$modalImg.style.transform = `translate(${x}px, ${y}px)`;
  }
  hide() {
    if (!this.$modal) return;
    this.$modal.removeEventListener('click', this.modalClickHandler);
    this.$wrapper.remove();
    document.body.removeChild(this.$modal);
    this.$modalImg = null;
    this.$modal = null;
    this.$wrapper = null;
  }
}
if (typeof window !== 'undefined') {
  console.log('excute!!!!!!!');
  const viewer = new ImageViewer();
  window._ImageViewer = viewer;
}
