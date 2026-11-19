(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ObsSocialAnimations = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var EASING_MAP = {
    spring: 'cubic-bezier(0.22, 1.28, 0.36, 1)',
    smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
    expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'cubic-bezier(0.34, 1.48, 0.64, 1)',
    silk: 'cubic-bezier(0.4, 0, 0.2, 1)'
  };

  var EXIT_EASING = 'cubic-bezier(0.38, 0, 0.72, 0.2)';

  function getEasing(name) {
    return EASING_MAP[name] || EASING_MAP.smooth;
  }

  function directionVector(direction, dist) {
    var d = typeof dist === 'number' ? dist : 48;
    switch (direction) {
      case 'right': return { x: d, y: 0 };
      case 'top': return { x: 0, y: -d };
      case 'bottom': return { x: 0, y: d };
      case 'left':
      default: return { x: -d, y: 0 };
    }
  }

  function oppositeVector(direction, dist) {
    var v = directionVector(direction, dist);
    return { x: -v.x, y: -v.y };
  }

  function clipInsetClosed(direction, radiusPx) {
    var r = Math.min(Number(radiusPx) || 0, 48);
    var roundSuffix = r > 0 ? ' round ' + r + 'px' : '';
    switch (direction) {
      case 'right': return 'inset(0% 0% 0% 100%' + roundSuffix + ')';
      case 'top': return 'inset(0% 0% 100% 0%' + roundSuffix + ')';
      case 'bottom': return 'inset(100% 0% 0% 0%' + roundSuffix + ')';
      case 'left':
      default: return 'inset(0% 100% 0% 0%' + roundSuffix + ')';
    }
  }

  function clipInsetOpen(radiusPx) {
    var r = Math.min(Number(radiusPx) || 0, 48);
    var roundSuffix = r > 0 ? ' round ' + r + 'px' : '';
    return 'inset(0% 0% 0% 0%' + roundSuffix + ')';
  }

  function buildEnterPlan(config) {
    var anim = (config && config.animation) || {};
    var pb = (config && config.playback) || {};
    var ap = (config && config.appearance) || {};
    var style = anim.style || 'expand-pill';
    var dir = anim.direction || 'left';
    var dur = Math.max(0, Number(pb.enterDurationMs != null ? pb.enterDurationMs : 650));
    var easing = getEasing(anim.easing);
    var dist = Number(anim.distancePx || 48);
    var stagger = Math.max(0, Number(anim.staggerMs != null ? anim.staggerMs : 65));
    var radius = Number(ap.borderRadiusPx != null ? ap.borderRadiusPx : 18);

    if (style === 'instant' || dur === 0) {
      return { instant: true, steps: [] };
    }

    var vec = directionVector(dir, dist);
    var steps = [];

    switch (style) {
      case 'expand-pill': {
        var openClip = clipInsetOpen(radius);
        var closedClip = clipInsetClosed(dir, radius);
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 0, transform: 'scale(0.94)' },
            { opacity: 1, transform: 'scale(1)' }
          ],
          options: { duration: Math.round(dur * 0.55), easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' }
        });
        steps.push({
          target: 'surface',
          keyframes: [
            { clipPath: closedClip, opacity: 0.4 },
            { clipPath: openClip, opacity: 1 }
          ],
          options: { duration: dur, delay: Math.round(stagger * 0.4), easing: easing, fill: 'both' }
        });
        steps.push({
          target: 'icon',
          keyframes: [
            { opacity: 0, transform: 'scale(0.35) rotate(-14deg)' },
            { opacity: 1, transform: 'scale(1.06) rotate(2deg)', offset: 0.7 },
            { opacity: 1, transform: 'scale(1) rotate(0deg)' }
          ],
          options: { duration: Math.round(dur * 0.78), easing: 'cubic-bezier(0.22, 1.28, 0.36, 1)', fill: 'both' }
        });
        steps.push({
          target: 'text',
          keyframes: [
            { opacity: 0, transform: 'translate3d(' + Math.round(vec.x * 0.45) + 'px,' + Math.round(vec.y * 0.3) + 'px,0)' },
            { opacity: 1, transform: 'translate3d(0,0,0)' }
          ],
          options: { duration: Math.round(dur * 0.85), delay: stagger, easing: easing, fill: 'both' }
        });
        steps.push({
          target: 'qr',
          keyframes: [
            { opacity: 0, transform: 'scale(0.75)' },
            { opacity: 1, transform: 'scale(1)' }
          ],
          options: { duration: Math.round(dur * 0.75), delay: Math.round(stagger * 1.5), easing: easing, fill: 'both' }
        });
        break;
      }

      case 'spring-pop': {
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 0, transform: 'translate3d(' + Math.round(vec.x * 0.4) + 'px,' + Math.round(vec.y * 0.4) + 'px,0) scale(0.72)' },
            { opacity: 1, transform: 'translate3d(0,0,0) scale(1.04)', offset: 0.68 },
            { opacity: 1, transform: 'translate3d(0,0,0) scale(0.99)', offset: 0.86 },
            { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' }
          ],
          options: { duration: dur, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' }
        });
        steps.push({
          target: 'icon',
          keyframes: [
            { opacity: 0, transform: 'scale(0.4)' },
            { opacity: 1, transform: 'scale(1.12)', offset: 0.65 },
            { opacity: 1, transform: 'scale(1)' }
          ],
          options: { duration: Math.round(dur * 0.85), delay: Math.round(stagger * 0.5), easing: 'cubic-bezier(0.22, 1.28, 0.36, 1)', fill: 'both' }
        });
        steps.push({
          target: 'text',
          keyframes: [
            { opacity: 0, transform: 'translate3d(0,10px,0)' },
            { opacity: 1, transform: 'translate3d(0,0,0)' }
          ],
          options: { duration: Math.round(dur * 0.75), delay: stagger, easing: easing, fill: 'both' }
        });
        break;
      }

      case 'blur-morph': {
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 0, filter: 'blur(14px)', transform: 'translate3d(' + Math.round(vec.x * 0.25) + 'px,' + Math.round(vec.y * 0.25) + 'px,0) scale(0.93)' },
            { opacity: 1, filter: 'blur(0px)', transform: 'translate3d(0,0,0) scale(1)' }
          ],
          options: { duration: dur, easing: easing, fill: 'both' }
        });
        steps.push({
          target: 'icon',
          keyframes: [
            { opacity: 0, transform: 'scale(0.82)' },
            { opacity: 1, transform: 'scale(1)' }
          ],
          options: { duration: Math.round(dur * 0.85), delay: Math.round(stagger * 0.5), easing: easing, fill: 'both' }
        });
        steps.push({
          target: 'text',
          keyframes: [
            { opacity: 0, filter: 'blur(6px)' },
            { opacity: 1, filter: 'blur(0px)' }
          ],
          options: { duration: Math.round(dur * 0.85), delay: stagger, easing: easing, fill: 'both' }
        });
        break;
      }

      case 'flip-3d': {
        var rotAxis = dir === 'top' || dir === 'bottom'
          ? 'rotateX(' + (dir === 'top' ? '-72deg' : '72deg') + ')'
          : 'rotateY(' + (dir === 'left' ? '-72deg' : '72deg') + ')';
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 0, transform: 'perspective(950px) ' + rotAxis + ' translateZ(-40px) scale(0.9)' },
            { opacity: 1, transform: 'perspective(950px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)' }
          ],
          options: { duration: dur, easing: easing, fill: 'both' }
        });
        steps.push({
          target: 'text',
          keyframes: [
            { opacity: 0, transform: 'translate3d(0,6px,0)' },
            { opacity: 1, transform: 'translate3d(0,0,0)' }
          ],
          options: { duration: Math.round(dur * 0.65), delay: Math.round(dur * 0.22 + stagger * 0.5), easing: easing, fill: 'both' }
        });
        break;
      }

      case 'kinetic-wipe': {
        var openWipe = clipInsetOpen(radius);
        var closedWipe = clipInsetClosed(dir, radius);
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 0.9, clipPath: closedWipe, transform: 'translate3d(' + Math.round(vec.x * 0.25) + 'px,' + Math.round(vec.y * 0.25) + 'px,0)' },
            { opacity: 1, clipPath: openWipe, transform: 'translate3d(0,0,0)' }
          ],
          options: { duration: dur, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' }
        });
        steps.push({
          target: 'icon',
          keyframes: [
            { opacity: 0, transform: 'scale(0.6) translate3d(' + Math.round(vec.x * 0.3) + 'px,0,0)' },
            { opacity: 1, transform: 'scale(1) translate3d(0,0,0)' }
          ],
          options: { duration: Math.round(dur * 0.75), delay: Math.round(stagger * 0.6), easing: easing, fill: 'both' }
        });
        steps.push({
          target: 'text',
          keyframes: [
            { opacity: 0, transform: 'translate3d(' + Math.round(vec.x * 0.5) + 'px,0,0)' },
            { opacity: 1, transform: 'translate3d(0,0,0)' }
          ],
          options: { duration: Math.round(dur * 0.75), delay: stagger, easing: easing, fill: 'both' }
        });
        steps.push({
          target: 'shimmer',
          keyframes: [
            { opacity: 0.9, transform: 'translateX(-120%) skewX(-20deg)' },
            { opacity: 0, transform: 'translateX(220%) skewX(-20deg)' }
          ],
          options: { duration: Math.round(dur * 1.15), delay: Math.round(dur * 0.1), easing: 'ease-out', fill: 'both' }
        });
        break;
      }

      case 'drop-settle': {
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 0, transform: 'translate3d(' + vec.x + 'px,' + (vec.y || -dist) + 'px,0) scale(0.95, 1.06)' },
            { opacity: 1, transform: 'translate3d(0,0,0) scale(1.03, 0.96)', offset: 0.72 },
            { opacity: 1, transform: 'translate3d(0,0,0) scale(1, 1)' }
          ],
          options: { duration: dur, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' }
        });
        steps.push({
          target: 'icon',
          keyframes: [
            { transform: 'translateY(-6px) scale(0.85)', opacity: 0 },
            { transform: 'translateY(0) scale(1)', opacity: 1 }
          ],
          options: { duration: Math.round(dur * 0.75), delay: Math.round(stagger * 0.5), easing: easing, fill: 'both' }
        });
        break;
      }

      case 'elastic-swing': {
        var tilt = dir === 'right' ? 6 : -6;
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 0, transform: 'translate3d(' + vec.x + 'px,' + vec.y + 'px,0) rotate(' + tilt + 'deg) scale(0.94)' },
            { opacity: 1, transform: 'translate3d(0,0,0) rotate(' + (tilt * -0.25) + 'deg) scale(1.01)', offset: 0.74 },
            { opacity: 1, transform: 'translate3d(0,0,0) rotate(0deg) scale(1)' }
          ],
          options: { duration: dur, easing: easing, fill: 'both' }
        });
        steps.push({
          target: 'icon',
          keyframes: [
            { opacity: 0, transform: 'rotate(' + (tilt * 2) + 'deg) scale(0.7)' },
            { opacity: 1, transform: 'rotate(0deg) scale(1)' }
          ],
          options: { duration: Math.round(dur * 0.8), delay: Math.round(stagger * 0.5), easing: easing, fill: 'both' }
        });
        break;
      }

      case 'slide-fade':
      default: {
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 0, filter: 'blur(4px)', transform: 'translate3d(' + vec.x + 'px,' + vec.y + 'px,0) scale(0.96)' },
            { opacity: 1, filter: 'blur(0px)', transform: 'translate3d(0,0,0) scale(1)' }
          ],
          options: { duration: dur, easing: easing, fill: 'both' }
        });
        steps.push({
          target: 'icon',
          keyframes: [
            { opacity: 0, transform: 'scale(0.75)' },
            { opacity: 1, transform: 'scale(1)' }
          ],
          options: { duration: Math.round(dur * 0.8), delay: Math.round(stagger * 0.4), easing: easing, fill: 'both' }
        });
        steps.push({
          target: 'text',
          keyframes: [
            { opacity: 0, transform: 'translate3d(' + Math.round(vec.x * 0.35) + 'px,' + Math.round(vec.y * 0.35) + 'px,0)' },
            { opacity: 1, transform: 'translate3d(0,0,0)' }
          ],
          options: { duration: Math.round(dur * 0.82), delay: stagger, easing: easing, fill: 'both' }
        });
        break;
      }
    }

    return { instant: false, steps: steps };
  }

  function buildExitPlan(config) {
    var anim = (config && config.animation) || {};
    var pb = (config && config.playback) || {};
    var ap = (config && config.appearance) || {};
    var style = anim.style || 'expand-pill';
    var dir = anim.direction || 'left';
    var dur = Math.max(0, Number(pb.exitDurationMs != null ? pb.exitDurationMs : 480));
    var dist = Number(anim.distancePx || 48);
    var radius = Number(ap.borderRadiusPx != null ? ap.borderRadiusPx : 18);

    if (style === 'instant' || dur === 0) {
      return { instant: true, steps: [] };
    }

    var vec = directionVector(dir, dist);
    var opp = oppositeVector(dir, dist);
    var steps = [];

    switch (style) {
      case 'expand-pill': {
        steps.push({
          target: 'text',
          keyframes: [
            { opacity: 1, transform: 'translate3d(0,0,0)' },
            { opacity: 0, transform: 'translate3d(' + Math.round(vec.x * 0.35) + 'px,0,0)' }
          ],
          options: { duration: Math.round(dur * 0.65), easing: EXIT_EASING, fill: 'both' }
        });
        steps.push({
          target: 'surface',
          keyframes: [
            { clipPath: clipInsetOpen(radius), opacity: 1 },
            { clipPath: clipInsetClosed(dir, radius), opacity: 0.25 }
          ],
          options: { duration: dur, delay: Math.round(dur * 0.08), easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'both' }
        });
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.92)' }
          ],
          options: { duration: Math.round(dur * 0.55), delay: Math.round(dur * 0.45), easing: 'ease-in', fill: 'both' }
        });
        break;
      }

      case 'spring-pop': {
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.78) translate3d(' + Math.round(opp.x * 0.35) + 'px,' + Math.round(opp.y * 0.35) + 'px,0)' }
          ],
          options: { duration: dur, easing: 'cubic-bezier(0.45, -0.35, 0.85, 0.5)', fill: 'both' }
        });
        break;
      }

      case 'blur-morph': {
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' },
            { opacity: 0, filter: 'blur(14px)', transform: 'scale(1.04)' }
          ],
          options: { duration: dur, easing: EXIT_EASING, fill: 'both' }
        });
        break;
      }

      case 'flip-3d': {
        var rotAxis = dir === 'top' || dir === 'bottom'
          ? 'rotateX(' + (dir === 'top' ? '72deg' : '-72deg') + ')'
          : 'rotateY(' + (dir === 'left' ? '72deg' : '-72deg') + ')';
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 1, transform: 'perspective(950px) rotateX(0deg) rotateY(0deg) scale(1)' },
            { opacity: 0, transform: 'perspective(950px) ' + rotAxis + ' translateZ(-30px) scale(0.9)' }
          ],
          options: { duration: dur, easing: EXIT_EASING, fill: 'both' }
        });
        break;
      }

      case 'kinetic-wipe': {
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 1, clipPath: clipInsetOpen(radius), transform: 'translate3d(0,0,0)' },
            { opacity: 0.2, clipPath: clipInsetClosed(dir === 'left' ? 'right' : dir === 'right' ? 'left' : dir, radius), transform: 'translate3d(' + Math.round(opp.x * 0.25) + 'px,' + Math.round(opp.y * 0.25) + 'px,0)' }
          ],
          options: { duration: dur, easing: 'cubic-bezier(0.6, 0, 0.8, 0.2)', fill: 'both' }
        });
        break;
      }

      case 'drop-settle': {
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' },
            { opacity: 0, transform: 'translate3d(0,28px,0) scale(0.95)' }
          ],
          options: { duration: dur, easing: EXIT_EASING, fill: 'both' }
        });
        break;
      }

      case 'elastic-swing': {
        var tilt = dir === 'right' ? -5 : 5;
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 1, transform: 'translate3d(0,0,0) rotate(0deg) scale(1)' },
            { opacity: 0, transform: 'translate3d(' + Math.round(opp.x * 0.7) + 'px,' + Math.round(opp.y * 0.7) + 'px,0) rotate(' + tilt + 'deg) scale(0.94)' }
          ],
          options: { duration: dur, easing: EXIT_EASING, fill: 'both' }
        });
        break;
      }

      case 'slide-fade':
      default: {
        steps.push({
          target: 'card',
          keyframes: [
            { opacity: 1, filter: 'blur(0px)', transform: 'translate3d(0,0,0) scale(1)' },
            { opacity: 0, filter: 'blur(4px)', transform: 'translate3d(' + Math.round(opp.x * 0.7) + 'px,' + Math.round(opp.y * 0.7) + 'px,0) scale(0.97)' }
          ],
          options: { duration: dur, easing: EXIT_EASING, fill: 'both' }
        });
        break;
      }
    }

    return { instant: false, steps: steps };
  }

  function createAnimationController() {
    var active = [];
    var idleAnims = [];
    var paused = false;

    function resolveTarget(cardEl, name) {
      if (!cardEl) return null;
      switch (name) {
        case 'card': return cardEl;
        case 'surface': return cardEl.querySelector('.card-surface');
        case 'icon': return cardEl.querySelector('.card-icon-wrap');
        case 'text': return cardEl.querySelector('.card-text');
        case 'qr': return cardEl.querySelector('.card-qr-wrap');
        case 'shimmer': return cardEl.querySelector('.card-shimmer');
        default: return null;
      }
    }

    function runSteps(plan, cardEl, clearOnFinish) {
      cancelPhase();
      if (!cardEl || !plan || plan.instant || !plan.steps.length || typeof cardEl.animate !== 'function') {
        return Promise.resolve();
      }
      var promises = [];
      var stepAnims = [];
      plan.steps.forEach(function (step) {
        var el = resolveTarget(cardEl, step.target);
        if (!el) return;
        try {
          var a = el.animate(step.keyframes, step.options);
          if (paused) a.pause();
          active.push(a);
          stepAnims.push(a);
          promises.push(
            a.finished.catch(function () {
              // Cancelled or aborted
            })
          );
        } catch (_err) {
          // Ignore unsupported keyframe fallback
        }
      });
      if (!promises.length) return Promise.resolve();
      return Promise.all(promises).then(function () {
        if (clearOnFinish && active.length) {
          var sameRun = stepAnims.every(function (a) { return active.indexOf(a) !== -1; });
          if (sameRun) {
            cancelPhase();
          }
        }
      });
    }

    function cancelPhase() {
      active.forEach(function (a) {
        try {
          a.cancel();
        } catch (_e) {}
      });
      active = [];
    }

    function cancelIdle() {
      idleAnims.forEach(function (a) {
        try {
          a.cancel();
        } catch (_e) {}
      });
      idleAnims = [];
    }

    function cancelAll() {
      cancelPhase();
      cancelIdle();
    }

    function playEnter(cardEl, config) {
      cancelAll();
      return runSteps(buildEnterPlan(config), cardEl, true);
    }

    function playExit(cardEl, config) {
      cancelIdle();
      return runSteps(buildExitPlan(config), cardEl, false);
    }

    function startHoldEffects(cardEl, config, holdMs) {
      cancelIdle();
      if (!cardEl || typeof cardEl.animate !== 'function') return;
      var anim = (config && config.animation) || {};

      // Progress bar / ring animation
      var progressStyle = anim.progressStyle || 'bottom-bar';
      if (progressStyle === 'bottom-bar' || progressStyle === 'top-line') {
        var bar = cardEl.querySelector('.card-progress-fill');
        if (bar && holdMs > 0) {
          try {
            var barAnim = bar.animate(
              [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
              { duration: holdMs, easing: 'linear', fill: 'forwards' }
            );
            if (paused) barAnim.pause();
            idleAnims.push(barAnim);
          } catch (_e) {}
        }
      } else if (progressStyle === 'icon-ring') {
        var ring = cardEl.querySelector('.card-ring-circle');
        if (ring && holdMs > 0) {
          var len = Number(ring.getAttribute('data-circumference')) || 125.6;
          try {
            var ringAnim = ring.animate(
              [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
              { duration: holdMs, easing: 'linear', fill: 'forwards' }
            );
            if (paused) ringAnim.pause();
            idleAnims.push(ringAnim);
          } catch (_e2) {}
        }
      }

      // Idle motion on icon
      var iconEl = cardEl.querySelector('.card-icon');
      if (iconEl) {
        if (anim.idleMotion === 'float') {
          try {
            var fAnim = iconEl.animate(
              [
                { transform: 'translateY(0px)' },
                { transform: 'translateY(-3.5px)' },
                { transform: 'translateY(0px)' }
              ],
              { duration: 2400, iterations: Infinity, easing: 'ease-in-out' }
            );
            if (paused) fAnim.pause();
            idleAnims.push(fAnim);
          } catch (_e3) {}
        } else if (anim.idleMotion === 'pulse-glow') {
          try {
            var pAnim = iconEl.animate(
              [
                { transform: 'scale(1)', filter: 'brightness(1)' },
                { transform: 'scale(1.09)', filter: 'brightness(1.22)' },
                { transform: 'scale(1)', filter: 'brightness(1)' }
              ],
              { duration: 2000, iterations: Infinity, easing: 'ease-in-out' }
            );
            if (paused) pAnim.pause();
            idleAnims.push(pAnim);
          } catch (_e4) {}
        } else if (anim.idleMotion === 'tilt') {
          try {
            var tAnim = iconEl.animate(
              [
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(-6deg)' },
                { transform: 'rotate(5deg)' },
                { transform: 'rotate(0deg)' }
              ],
              { duration: 2800, iterations: Infinity, easing: 'ease-in-out' }
            );
            if (paused) tAnim.pause();
            idleAnims.push(tAnim);
          } catch (_e5) {}
        }
      }

      // Optional subtle shimmer sweep mid-hold
      if (anim.shimmerSweep && anim.style !== 'kinetic-wipe') {
        var shimmer = cardEl.querySelector('.card-shimmer');
        if (shimmer) {
          try {
            var sAnim = shimmer.animate(
              [
                { opacity: 0, transform: 'translateX(-120%) skewX(-20deg)' },
                { opacity: 0.55, transform: 'translateX(40%) skewX(-20deg)', offset: 0.45 },
                { opacity: 0, transform: 'translateX(230%) skewX(-20deg)' }
              ],
              { duration: 1100, delay: Math.min(900, Math.round(holdMs * 0.25)), easing: 'ease-in-out', fill: 'both' }
            );
            if (paused) sAnim.pause();
            idleAnims.push(sAnim);
          } catch (_e6) {}
        }
      }
    }

    function setPaused(isPaused) {
      paused = Boolean(isPaused);
      active.concat(idleAnims).forEach(function (a) {
        try {
          if (paused) a.pause();
          else a.play();
        } catch (_e) {}
      });
    }

    return {
      playEnter: playEnter,
      startHoldEffects: startHoldEffects,
      playExit: playExit,
      setPaused: setPaused,
      cancelAll: cancelAll
    };
  }

  return {
    EASING_MAP: EASING_MAP,
    getEasing: getEasing,
    buildEnterPlan: buildEnterPlan,
    buildExitPlan: buildExitPlan,
    createAnimationController: createAnimationController
  };
});
