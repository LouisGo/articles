/**
 * 简易图片查看器
 */
class ImageViewer {
  $target = null;
  $modal = null;
  $wrapper = null;
  $modalImg = null;
  bodyWidth = 1920;
  bodyHeight = 1080;
  scrollTop = 0;
  scrollbarWidth = 16;
  constructor() {
    this.globalClickHandler = this.globalClickHandler.bind(this);
    this.globalResizeHandler = this.globalResizeHandler.bind(this);
    this.modalClickHandler = this.modalClickHandler.bind(this);
    this.setModalImgSize = this.setModalImgSize.bind(this);
    this.init();
  }
  init() {
    window.addEventListener(
      'load',
      () => {
        this.bodyWidth = document.body.offsetWidth;
        this.bodyHeight = document.body.offsetHeight;
        this.initEvents();
        this.scrollbarWidth = getScrollbarWidth();
      },
      {
        once: true,
      }
    );
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
    this.handleScrollContainer(true);
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
  handleScrollContainer(state = true) {
    if (state) {
      const scrollTop = document.body.getBoundingClientRect().y;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${this.scrollbarWidth}px`;
      this.scrollTop = scrollTop;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.scrollTo({
        y: this.scrollTop,
      });
    }
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
    this.handleScrollContainer(false);
    this.$modal.removeEventListener('click', this.modalClickHandler);
    this.$wrapper.remove();
    document.body.removeChild(this.$modal);
    this.$modalImg = null;
    this.$modal = null;
    this.$wrapper = null;
  }
}
if (typeof window !== 'undefined') {
  const viewer = new ImageViewer();
  window._ImageViewer = viewer;
}

/**
 * 获取当前浏览器滚动条宽度
 */
function getScrollbarWidth () {
  // 创建不可见的虚拟容器
  const container = document.createElement('div');
  container.style.visibility = 'hidden';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '100px';
  container.style.overflow = 'scroll'; // 强制展示滚动条

  document.body.append(container);

  // 获取外容器宽度
  const containerWidth = container.offsetWidth;

  // 创建内部容器
  const inner = document.createElement('div');
  inner.style.width = '100%';
  container.appendChild(inner);

  // 获取内部容器宽度
  const innerWidth = inner.offsetWidth;

  // 移除节点
  container.parentNode && container.parentNode.removeChild(container);

  // 获取实际滚动条宽度
  return containerWidth - innerWidth;
};
