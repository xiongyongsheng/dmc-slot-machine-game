import { isNumber, merge } from 'lodash';

class SlotMachineGame {
  #config = {
    containerElClassName: 'c-slot-machine-container',
    rollerGroupElClassName: 'c-slot-machine-roller-group',
    rollerElClassName: 'c-slot-machine-roller',
    rollerWrapperElClassName: 'c-slot-machine-roller-wrapper',
    rollerChildElClassName: 'c-slot-machine-roller-child',
    rollerChildImgElClassName: 'c-slot-machine-roller-child-img',
    rollerMainElClassName: 'c-slot-machine-roller-main',
    rollerStoppingElClassName: 'c-slot-machine-roller-stopping',
    rollerTargetPreClassName: 'c-slot-machine-roller-target-pre',
    rollerTargetNextClassName: 'c-slot-machine-roller-target-next'
  };
  #options = {
    speed: 0.005,
    maxSpeed: 20,
    randomMaxSpeed: true,
    delay: 1,
    stopSpeed: 10,
    rollerNum: 4,
    rollerType: 'number',
    rollerMaxNumber: 9,
    stopTimeout: 1500
  };
  set status(status) {
    this.containerEl.setAttribute('data-status', status);
  }
  get status() {
    return this.containerEl.getAttribute('data-status');
  }
  constructor(options) {
    this.options = merge(this.#options, options);
    this.init();
  }
  init() {
    this.initDom();
    this.status = 'await';
  }
  initDom() {
    this.containerEl = document.querySelector(this.options.container);
    this.containerEl.classList.add(this.#config.containerElClassName);
    this.containerEl.style.setProperty('--stopTimeout', `${this.#options.stopTimeout}ms`);
    while (this.containerEl.firstChild) {
      this.containerEl.removeChild(this.containerEl.firstChild);
    }
    this.rollerGroupEl = document.createElement('section');
    this.rollerGroupEl.classList.add(this.#config.rollerGroupElClassName);
    this.containerEl.appendChild(this.rollerGroupEl);
    this.rollerEls = Array.from({ length: this.options.rollerNum }).map(
      this.handleRollerEl.bind(this)
    );
    this.rollerEls.forEach((item) => {
      this.rollerGroupEl.appendChild(item);
      setTimeout(() => {
        item._rollerMainEl._translateY =
          (item._rollerMainChild.length - item._mainTarget) * item._rollerMainChild[0].clientHeight;
        this.handleTranslateY(item);
      }, 1000);
    });
  }
  handleRollerEl(item, index) {
    const rollerEl = document.createElement('article');
    rollerEl.classList.add(this.#config.rollerElClassName);
    const rollerWrapperEl = document.createElement('section');
    rollerWrapperEl.classList.add(this.#config.rollerWrapperElClassName);
    const rollerMainEl = document.createElement('div');
    rollerMainEl.classList.add(this.#config.rollerMainElClassName);
    let i = 0;
    switch (this.options.rollerType) {
      case 'number':
        while (i <= this.options.rollerMaxNumber) {
          const rollerChildEl = document.createElement('div');
          rollerChildEl.classList.add(this.#config.rollerChildElClassName);
          rollerChildEl.setAttribute('data-col', index);
          rollerChildEl.setAttribute('data-row', i);
          rollerChildEl.classList.add(`c-slot-machine-roller-${index}-${i}`);
          rollerChildEl.textContent = i;
          rollerMainEl.appendChild(rollerChildEl);
          i++;
        }
        break;
      case 'image':
        this.#options.images.forEach((item) => {
          const rollerChildEl = document.createElement('div');
          rollerChildEl.classList.add(this.#config.rollerChildElClassName);
          rollerChildEl.setAttribute('data-col', index);
          rollerChildEl.setAttribute('data-row', item.id);
          rollerChildEl.classList.add(`c-slot-machine-roller-${index}-${item.id}`);
          const imgEl = document.createElement('img');
          imgEl.classList.add(this.#config.rollerChildImgElClassName);
          imgEl.src = item.url;
          if (item.width) imgEl.style.setProperty('--width', item.width);
          rollerChildEl.appendChild(imgEl);
          rollerMainEl.appendChild(rollerChildEl);
        });
        break;
    }
    rollerWrapperEl.appendChild(rollerMainEl);
    rollerEl.appendChild(rollerWrapperEl);
    rollerEl._rollerWrapperEl = rollerWrapperEl;
    rollerEl._rollerMainEl = rollerMainEl;
    rollerEl._rollerMainChild = rollerEl._rollerMainEl.getElementsByClassName(
      this.#config.rollerChildElClassName
    );
    const firstEl = rollerEl._rollerMainChild[0];
    const firstCloneEl = firstEl.cloneNode(true);
    const lastEl = rollerEl._rollerMainChild[rollerEl._rollerMainChild.length - 1];
    const lastCloneEl = lastEl.cloneNode(true);
    rollerMainEl.insertBefore(lastCloneEl, firstEl);
    rollerMainEl.appendChild(firstCloneEl);
    this.handleRemoveTargetClassName(rollerEl);
    this.handleTarget(rollerEl, this.#options.start[index]);
    this.handleAddTargetClassName(rollerEl);
    return rollerEl;
  }
  start() {
    this.nowTime = this.startTime = new Date().getTime();
    this.runningTime = 0;
    if (this.runningRAFId) {
      cancelAnimationFrame(this.runningRAFId);
      this.runningRAFId = null;
    }
    this.status = 'start';
    this.runningRequestAnimationFrame();
  }
  runningRequestAnimationFrame() {
    const nowTime = new Date().getTime();
    this.runningTime = nowTime - this.startTime;
    this.rollerEls.forEach((item, index) => {
      const delay = index * this.#options.delay * 1000;
      if (delay > this.runningTime) return;
      this.handleRemoveTargetClassName(item);
      if (!item._maxSpeed && this.options.randomMaxSpeed) {
        item._maxSpeed = (Math.random() + 0.5) * this.#options.maxSpeed;
      }
      item._speed = Math.min(
        (item._speed || 0) + this.#options.speed * (nowTime - this.nowTime),
        item._maxSpeed || this.#options.maxSpeed
      );
      this.handleTranslateY(item);
    });
    this.nowTime = nowTime;

    this.runningRAFId = requestAnimationFrame(this.runningRequestAnimationFrame.bind(this));
  }
  stop(array) {
    if (this.runningRAFId) {
      cancelAnimationFrame(this.runningRAFId);
      this.runningRAFId = null;
    }
    this.rollerEls.forEach((item, index) => {
      this.handleTarget(item, array[index]);
      this.handleAddTargetClassName(item);
      item._stopTimeTranslateY = item._rollerMainEl._translateY;
      item._rollerMainEl._stopTranslateY =
        (item._rollerMainChild.length - item._mainTarget) * item._rollerMainChild[0].clientHeight;
      item._loopNum = 0;
    });
    this.nowTime = this.stopTime = new Date().getTime();
    const delay = (this.rollerEls.length - 1) * this.#options.delay * 1000;
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
    }
    this.stopTimeout = setTimeout(() => {
      if (this.stopRAFId) {
        cancelAnimationFrame(this.stopRAFId);
        this.stopRAFId = null;
      }
      this.status = 'stop';
    }, delay + this.#options.stopTimeout);
    this.stopRequestAnimationFrame();
  }
  handleTarget(item, target) {
    item._mainTarget = Number(
      Array.prototype.indexOf.call(
        Array.prototype.map.call(item._rollerMainChild, (item) => item.getAttribute('data-row')),
        `${target}`
      )
    );
  }
  stopRequestAnimationFrame() {
    const nowTime = new Date().getTime();
    this.stoppingTime = nowTime - this.stopTime;
    this.rollerEls.forEach((item, index) => {
      const delay = index * this.#options.delay * 1000;
      if (delay < this.stoppingTime) {
        item.setAttribute('data-status', 'stopping');
        const mainFlag =
          Math.abs(item._rollerMainEl._translateY - item._rollerMainEl._stopTranslateY) <
          this.#options.stopSpeed;
        if (mainFlag) {
          item._rollerMainEl._flag = false;
          item._speed = 0;
          item._rollerWrapperEl.classList.add(this.#config.rollerStoppingElClassName);
          item._rollerMainEl._translateY = item._rollerMainEl._stopTranslateY;
        } else {
          item._speed = Math.max(
            item._speed - this.#options.speed * (nowTime - this.nowTime),
            this.#options.stopSpeed
          );
        }
      }
      this.handleTranslateY(item);
    });
    this.nowTime = nowTime;
    if (this.status !== 'stop') {
      this.stopRAFId = requestAnimationFrame(this.stopRequestAnimationFrame.bind(this));
    }
  }
  handleTranslateY(item) {
    if (item._rollerMainEl._flag) {
      item._rollerMainEl._translateY = 0;
      //   item._rollerMainEl.style.top = `${-item._rollerMainEl.clientHeight}px`;
      item._rollerMainEl._flag = false;
      item._loopNum = item._loopNum++;
    }
    item._rollerMainEl._translateY = (item._rollerMainEl._translateY || 0) + (item._speed || 0);
    item._rollerMainEl.style.transform = `translateY(${item._rollerMainEl._translateY}px)`;
    item._rollerMainEl._flag = item._rollerMainEl.clientHeight <= item._rollerMainEl._translateY;
  }
  handleRemoveTargetClassName(item) {
    Array.prototype.forEach.call(
      item.getElementsByClassName(this.#config.rollerTargetPreClassName),
      (el) => {
        el.classList.remove(this.#config.rollerTargetPreClassName);
      }
    );
    Array.prototype.forEach.call(
      item.getElementsByClassName(this.#config.rollerTargetNextClassName),
      (el) => {
        el.classList.remove(this.#config.rollerTargetNextClassName);
      }
    );
  }
  handleAddTargetClassName(item) {
    if (item._rollerMainChild[item._mainTarget + 1]) {
      item._rollerMainChild[item._mainTarget + 1].classList.add(
        this.#config.rollerTargetNextClassName
      );
    }
    if (item._rollerMainChild[item._mainTarget - 1]) {
      item._rollerMainChild[item._mainTarget - 1].classList.add(
        this.#config.rollerTargetPreClassName
      );
    }
  }
}
export default SlotMachineGame;
