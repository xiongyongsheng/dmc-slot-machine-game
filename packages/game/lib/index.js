var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var _config, _options;
import { isNumber, merge } from "lodash";
class SlotMachineGame {
  constructor(options) {
    __privateAdd(this, _config, {
      containerElClassName: "c-slot-machine-container",
      rollerGroupElClassName: "c-slot-machine-roller-group",
      rollerElClassName: "c-slot-machine-roller",
      rollerWrapperElClassName: "c-slot-machine-roller-wrapper",
      rollerChildElClassName: "c-slot-machine-roller-child",
      rollerChildImgElClassName: "c-slot-machine-roller-child-img",
      rollerMainElClassName: "c-slot-machine-roller-main",
      rollerStoppingElClassName: "c-slot-machine-roller-stopping",
      rollerTargetPreClassName: "c-slot-machine-roller-target-pre",
      rollerTargetNextClassName: "c-slot-machine-roller-target-next"
    });
    __privateAdd(this, _options, {
      speed: 5e-3,
      maxSpeed: 20,
      randomMaxSpeed: true,
      delay: 1,
      stopSpeed: 10,
      rollerNum: 4,
      rollerType: "number",
      rollerMaxNumber: 9,
      stopTimeout: 1500
    });
    this.options = merge(__privateGet(this, _options), options);
    this.init();
  }
  set status(status) {
    this.containerEl.setAttribute("data-status", status);
  }
  get status() {
    return this.containerEl.getAttribute("data-status");
  }
  init() {
    this.initDom();
    this.status = "await";
  }
  initDom() {
    this.containerEl = document.querySelector(this.options.container);
    this.containerEl.classList.add(__privateGet(this, _config).containerElClassName);
    this.containerEl.style.setProperty("--stopTimeout", `${__privateGet(this, _options).stopTimeout}ms`);
    while (this.containerEl.firstChild) {
      this.containerEl.removeChild(this.containerEl.firstChild);
    }
    this.rollerGroupEl = document.createElement("section");
    this.rollerGroupEl.classList.add(__privateGet(this, _config).rollerGroupElClassName);
    this.containerEl.appendChild(this.rollerGroupEl);
    this.rollerEls = Array.from({ length: this.options.rollerNum }).map(
      this.handleRollerEl.bind(this)
    );
    this.rollerEls.forEach((item) => {
      this.rollerGroupEl.appendChild(item);
      setTimeout(() => {
        item._rollerMainEl._translateY = (item._rollerMainChild.length - item._mainTarget) * item._rollerMainChild[0].clientHeight;
        this.handleTranslateY(item);
      }, 1e3);
    });
  }
  handleRollerEl(item, index) {
    const rollerEl = document.createElement("article");
    rollerEl.classList.add(__privateGet(this, _config).rollerElClassName);
    const rollerWrapperEl = document.createElement("section");
    rollerWrapperEl.classList.add(__privateGet(this, _config).rollerWrapperElClassName);
    const rollerMainEl = document.createElement("div");
    rollerMainEl.classList.add(__privateGet(this, _config).rollerMainElClassName);
    let i = 0;
    switch (this.options.rollerType) {
      case "number":
        while (i <= this.options.rollerMaxNumber) {
          const rollerChildEl = document.createElement("div");
          rollerChildEl.classList.add(__privateGet(this, _config).rollerChildElClassName);
          rollerChildEl.setAttribute("data-col", index);
          rollerChildEl.setAttribute("data-row", i);
          rollerChildEl.classList.add(`c-slot-machine-roller-${index}-${i}`);
          rollerChildEl.textContent = i;
          rollerMainEl.appendChild(rollerChildEl);
          i++;
        }
        break;
      case "image":
        __privateGet(this, _options).images.forEach((item2) => {
          const rollerChildEl = document.createElement("div");
          rollerChildEl.classList.add(__privateGet(this, _config).rollerChildElClassName);
          rollerChildEl.setAttribute("data-col", index);
          rollerChildEl.setAttribute("data-row", item2.id);
          rollerChildEl.classList.add(`c-slot-machine-roller-${index}-${item2.id}`);
          const imgEl = document.createElement("img");
          imgEl.classList.add(__privateGet(this, _config).rollerChildImgElClassName);
          imgEl.src = item2.url;
          if (item2.width)
            imgEl.style.setProperty("--width", item2.width);
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
      __privateGet(this, _config).rollerChildElClassName
    );
    const firstEl = rollerEl._rollerMainChild[0];
    const firstCloneEl = firstEl.cloneNode(true);
    const lastEl = rollerEl._rollerMainChild[rollerEl._rollerMainChild.length - 1];
    const lastCloneEl = lastEl.cloneNode(true);
    rollerMainEl.insertBefore(lastCloneEl, firstEl);
    rollerMainEl.appendChild(firstCloneEl);
    this.handleRemoveTargetClassName(rollerEl);
    this.handleTarget(rollerEl, __privateGet(this, _options).start[index]);
    this.handleAddTargetClassName(rollerEl);
    return rollerEl;
  }
  start() {
    this.nowTime = this.startTime = (/* @__PURE__ */ new Date()).getTime();
    this.runningTime = 0;
    if (this.runningRAFId) {
      cancelAnimationFrame(this.runningRAFId);
      this.runningRAFId = null;
    }
    this.status = "start";
    this.runningRequestAnimationFrame();
  }
  runningRequestAnimationFrame() {
    const nowTime = (/* @__PURE__ */ new Date()).getTime();
    this.runningTime = nowTime - this.startTime;
    this.rollerEls.forEach((item, index) => {
      const delay = index * __privateGet(this, _options).delay * 1e3;
      if (delay > this.runningTime)
        return;
      this.handleRemoveTargetClassName(item);
      if (!item._maxSpeed && this.options.randomMaxSpeed) {
        item._maxSpeed = (Math.random() + 0.5) * __privateGet(this, _options).maxSpeed;
      }
      item._speed = Math.min(
        (item._speed || 0) + __privateGet(this, _options).speed * (nowTime - this.nowTime),
        item._maxSpeed || __privateGet(this, _options).maxSpeed
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
      item._rollerMainEl._stopTranslateY = (item._rollerMainChild.length - item._mainTarget) * item._rollerMainChild[0].clientHeight;
      item._loopNum = 0;
    });
    this.nowTime = this.stopTime = (/* @__PURE__ */ new Date()).getTime();
    const delay = (this.rollerEls.length - 1) * __privateGet(this, _options).delay * 1e3;
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
    }
    this.stopTimeout = setTimeout(() => {
      if (this.stopRAFId) {
        cancelAnimationFrame(this.stopRAFId);
        this.stopRAFId = null;
      }
      this.status = "stop";
    }, delay + __privateGet(this, _options).stopTimeout);
    this.stopRequestAnimationFrame();
  }
  handleTarget(item, target) {
    item._mainTarget = Number(
      Array.prototype.indexOf.call(
        Array.prototype.map.call(item._rollerMainChild, (item2) => item2.getAttribute("data-row")),
        `${target}`
      )
    );
  }
  stopRequestAnimationFrame() {
    const nowTime = (/* @__PURE__ */ new Date()).getTime();
    this.stoppingTime = nowTime - this.stopTime;
    this.rollerEls.forEach((item, index) => {
      const delay = index * __privateGet(this, _options).delay * 1e3;
      if (delay < this.stoppingTime) {
        item.setAttribute("data-status", "stopping");
        const mainFlag = Math.abs(item._rollerMainEl._translateY - item._rollerMainEl._stopTranslateY) < __privateGet(this, _options).stopSpeed;
        if (mainFlag) {
          item._rollerMainEl._flag = false;
          item._speed = 0;
          item._rollerWrapperEl.classList.add(__privateGet(this, _config).rollerStoppingElClassName);
          item._rollerMainEl._translateY = item._rollerMainEl._stopTranslateY;
        } else {
          item._speed = Math.max(
            item._speed - __privateGet(this, _options).speed * (nowTime - this.nowTime),
            __privateGet(this, _options).stopSpeed
          );
        }
      }
      this.handleTranslateY(item);
    });
    this.nowTime = nowTime;
    if (this.status !== "stop") {
      this.stopRAFId = requestAnimationFrame(this.stopRequestAnimationFrame.bind(this));
    }
  }
  handleTranslateY(item) {
    if (item._rollerMainEl._flag) {
      item._rollerMainEl._translateY = 0;
      item._rollerMainEl._flag = false;
      item._loopNum = item._loopNum++;
    }
    item._rollerMainEl._translateY = (item._rollerMainEl._translateY || 0) + (item._speed || 0);
    item._rollerMainEl.style.transform = `translateY(${item._rollerMainEl._translateY}px)`;
    item._rollerMainEl._flag = item._rollerMainEl.clientHeight <= item._rollerMainEl._translateY;
  }
  handleRemoveTargetClassName(item) {
    Array.prototype.forEach.call(
      item.getElementsByClassName(__privateGet(this, _config).rollerTargetPreClassName),
      (el) => {
        el.classList.remove(__privateGet(this, _config).rollerTargetPreClassName);
      }
    );
    Array.prototype.forEach.call(
      item.getElementsByClassName(__privateGet(this, _config).rollerTargetNextClassName),
      (el) => {
        el.classList.remove(__privateGet(this, _config).rollerTargetNextClassName);
      }
    );
  }
  handleAddTargetClassName(item) {
    if (item._rollerMainChild[item._mainTarget + 1]) {
      item._rollerMainChild[item._mainTarget + 1].classList.add(
        __privateGet(this, _config).rollerTargetNextClassName
      );
    }
    if (item._rollerMainChild[item._mainTarget - 1]) {
      item._rollerMainChild[item._mainTarget - 1].classList.add(
        __privateGet(this, _config).rollerTargetPreClassName
      );
    }
  }
}
_config = new WeakMap();
_options = new WeakMap();
export default SlotMachineGame;
