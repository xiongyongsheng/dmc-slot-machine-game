import { isNumber, last, merge } from 'lodash';

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
    rollerTargetNextClassName: 'c-slot-machine-roller-target-next',
    rollerFirstCloneElClassName: 'c-slot-machine-roller-first',
    rollerLastCloneElClassName: 'c-slot-machine-roller-last',
    rollerSvgBlurElClassName: 'c-slot-machine-svg-blur'
  };
  #options = {
    stopMode: 'fast',
    speed: 0.005,
    maxSpeed: 20,
    randomMaxSpeed: true,
    delay: 1,
    stopSpeed: 1,
    rollerNum: 4,
    rollerType: 'number',
    rollerMaxNumber: 9,
    stopTimeout: 1000,
    blur: 4
  };
  set status(status) {
    this.containerEl.setAttribute('data-status', status);
  }
  get status() {
    return this.containerEl.getAttribute('data-status');
  }
  set stopMode(stopMode) {
    this.containerEl.setAttribute('data-stop-mode', stopMode);
  }
  get stopMode() {
    return this.containerEl.getAttribute('data-stop-mode');
  }
  constructor(options) {
    this.options = merge(this.#options, options);
    this.init();
  }
  init() {
    this.initDom();
    this.status = 'await';
    this.stopMode = this.options.stopMode;
    this.delay = (this.rollerEls.length - 1) * this.options.delay * 1000;
  }
  initDom() {
    this.containerEl = document.querySelector(this.options.container);
    this.containerEl.classList.add(this.#config.containerElClassName);
    this.containerEl.style.setProperty('--stopTimeout', `${this.options.stopTimeout}ms`);
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
      item._rollerMainEl._translateY = -item._mainTarget * item._rollerMainChild[0].clientHeight;
      this.handleTranslateY(item);
    });

    this.svgEl = document.createElement('svg');
    this.filterEl = document.createElement('filter');
    this.filterEl.id = 'c-blur';
    // this.feGaussianBlurEl = document.createElement('feGaussianBlur');
    // this.feGaussianBlurEl.setAttribute('in', 'SourceGraphic');
    // this.feGaussianBlurEl.setAttribute('stdDeviation', `0 ${this.options.blur}`);
    // this.filterEl.appendChild(this.feGaussianBlurEl);
    this.filterEl.innerHTML = `<feGaussianBlur in="SourceGraphic" stdDeviation="0 ${this.options.blur}" />`;
    this.svgEl.appendChild(this.filterEl);
    this.containerEl.appendChild(this.svgEl);
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
        this.options.images.forEach((item) => {
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
    rollerEl._rollerMainChild = rollerMainEl.getElementsByClassName(
      this.#config.rollerChildElClassName
    );

    const firstEl = rollerEl._rollerMainChild[0];
    const firstCloneEl = firstEl.cloneNode(true);
    firstCloneEl.classList.replace(
      this.#config.rollerChildElClassName,
      this.#config.rollerLastCloneElClassName
    );
    const lastEl = rollerEl._rollerMainChild[rollerEl._rollerMainChild.length - 1];
    const lastCloneEl = lastEl.cloneNode(true);
    lastCloneEl.classList.replace(
      this.#config.rollerChildElClassName,
      this.#config.rollerFirstCloneElClassName
    );
    rollerMainEl.insertBefore(lastCloneEl, firstEl);
    rollerMainEl.appendChild(firstCloneEl);
    this.handleRemoveTargetClassName(rollerEl);
    this.handleTarget(rollerEl, this.options.start[index]);
    this.handleAddTargetClassName(rollerEl);
    return rollerEl;
  }
  start() {
    if (this.status === 'start') return;
    if (this.status === 'stop') {
      this.init();
    }
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
      const delay = index * this.options.delay * 1000;
      if (delay > this.runningTime) return;
      this.handleRemoveTargetClassName(item);
      this.handleAddSvgFilter(item);
      if (!item._maxSpeed && this.options.randomMaxSpeed) {
        item._maxSpeed = (Math.random() + 0.5) * this.options.maxSpeed;
      }
      item._speed = Math.min(
        (item._speed || 0) + this.options.speed * (nowTime - this.nowTime),
        item._maxSpeed || this.options.maxSpeed
      );
      this.handleTranslateY(item);
    });
    this.nowTime = nowTime;

    this.runningRAFId = requestAnimationFrame(this.runningRequestAnimationFrame.bind(this));
  }
  stop(array) {
    if (this.status === 'start' && this.delay < this.runningTime) {
      if (this.runningRAFId) {
        cancelAnimationFrame(this.runningRAFId);
        this.runningRAFId = null;
      }
      this.rollerEls.forEach((item, index) => {
        this.handleTarget(item, array[index]);
        this.handleAddTargetClassName(item);
        setTimeout(
          () => {
            this.handleRemoveSvgFilter(item);
          },
          index * this.options.delay * 1000
        );
        item._rollerMainEl._stopTranslateY =
          -item._mainTarget * item._rollerMainChild[0].clientHeight;
        item._loopNum = 0;
      });
      this.nowTime = this.stopTime = new Date().getTime();
      switch (this.options.stopMode) {
        case 'fast':
          this.handleFastStop();
          break;
        case 'slow':
          this.handleSlowStop();
          break;
      }
    }
  }
  handleFastStop() {
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
    }
    this.stopTimeout = setTimeout(() => {
      if (this.stopRAFId) {
        cancelAnimationFrame(this.stopRAFId);
        this.stopRAFId = null;
      }
      this.status = 'stop';
    }, this.delay + this.options.stopTimeout);
    this.handleFastStopRequestAnimationFrame();
  }
  handleFastStopRequestAnimationFrame() {
    const nowTime = new Date().getTime();
    this.stoppingTime = nowTime - this.stopTime;
    this.rollerEls.forEach((item, index) => {
      const delay = index * this.options.delay * 1000;
      if (delay < this.stoppingTime) {
        item.setAttribute('data-status', 'stopping');
        item.classList.add(this.#config.rollerStoppingElClassName);
        item._rollerMainEl._flag = false;
        item._speed = 0;
        item._rollerWrapperEl.style.setProperty('--translateFoldY', -1.5);
        item._rollerMainEl._translateY = item._rollerMainEl._stopTranslateY;
      }
      this.handleTranslateY(item);
    });
    this.nowTime = nowTime;
    if (this.status !== 'stop') {
      this.stopRAFId = requestAnimationFrame(this.handleFastStopRequestAnimationFrame.bind(this));
    }
  }
  handleSlowStop() {
    this.handleSlowStopRequestAnimationFrame();
  }
  handleSlowStopRequestAnimationFrame() {
    const nowTime = new Date().getTime();
    this.stoppingTime = nowTime - this.stopTime;
    this.rollerEls.forEach((item, index) => {
      const delay = index * this.options.delay * 1000;
      if (delay < this.stoppingTime) {
        item.setAttribute('data-status', 'stopping');
        if (item._speed === 0) return;
        item._speed = Math.max(
          item._speed - this.options.speed * (nowTime - this.nowTime),
          this.options.stopSpeed
        );
        if (this.options.stopSpeed === item._speed) {
          const mainFlag =
            Math.abs(
              Math.abs(item._rollerMainEl._translateY) -
                Math.abs(item._rollerMainEl._stopTranslateY)
            ) <
            item._rollerMainChild[0].clientHeight / 2;
          if (mainFlag) {
            item.classList.add(this.#config.rollerStoppingElClassName);
            item.style.setProperty('--translateFoldY', -0.5);
            item._rollerWrapperEl.style.setProperty('--translateFoldY', -0.8);
            item._rollerMainEl._flag = false;
            item._speed = 0;
            item._rollerMainEl._translateY = item._rollerMainEl._stopTranslateY;
          }
        }
      }
      this.handleTranslateY(item);
    });
    this.nowTime = nowTime;
    const flag = this.rollerEls.every((item) => item._speed === 0);
    if (flag) {
      if (this.stopTimeout) {
        clearTimeout(this.stopTimeout);
      }
      this.stopTimeout = setTimeout(() => {
        if (this.stopRAFId) {
          cancelAnimationFrame(this.stopRAFId);
          this.stopRAFId = null;
        }
        this.status = 'stop';
      }, this.options.stopTimeout);
    } else {
      this.stopRAFId = requestAnimationFrame(this.handleSlowStopRequestAnimationFrame.bind(this));
    }
  }
  handleTranslateY(item) {
    if (item._rollerMainEl._flag) {
      item._rollerMainEl._translateY = 0;
      item._rollerMainEl._flag = false;
      item._loopNum = item._loopNum++;
    }
    item._rollerMainEl._translateY = (item._rollerMainEl._translateY || 0) - (item._speed || 0);
    item._rollerMainEl.style.transform = `translateY(${item._rollerMainEl._translateY}px)`;
    item._rollerMainEl._flag = -item._rollerMainEl.clientHeight >= item._rollerMainEl._translateY;
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
  handleRemoveSvgFilter(item) {
    item._rollerMainEl.classList.remove(this.#config.rollerSvgBlurElClassName);
  }
  handleAddSvgFilter(item) {
    item._rollerMainEl.classList.add(this.#config.rollerSvgBlurElClassName);
  }
  handleTarget(item, target) {
    item._mainTarget = Number(
      Array.prototype.indexOf.call(
        Array.prototype.map.call(item._rollerMainChild, (item) => item.getAttribute('data-row')),
        `${target}`
      )
    );
  }
}
export default SlotMachineGame;
