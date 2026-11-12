'use client';

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

const INTERACTIVE = 'a,button,input,select,textarea,summary,[role="slider"],[contenteditable="true"],.remotion-preview,dialog';
const WHEEL_THRESHOLD = 100;
const SWIPE_THRESHOLD = 64;
const GESTURE_GAP = 200;
const EXIT_MS = 380;
const ENTER_MS = 900;

function scrollsWithin(target: HTMLElement, stage: HTMLElement, direction: number) {
  for (let element: HTMLElement | null = target; element; element = element.parentElement) {
    if ((element === stage || /auto|scroll/.test(getComputedStyle(element).overflowY)) && element.scrollHeight > element.clientHeight + 3) {
      const remaining = element.scrollHeight - element.clientHeight - element.scrollTop;
      if (direction > 0 ? remaining > 3 : element.scrollTop > 3) return true;
    }
    if (element === stage) break;
  }
  return false;
}

/** One deliberate gesture changes one chapter; readable content and controls keep native scrolling. */
export function useChapterGestures({ stageRef, index, count, disabled, onNavigate }: {
  stageRef: RefObject<HTMLElement | null>;
  index: number;
  count: number;
  disabled: boolean;
  onNavigate: (index: number) => void;
}) {
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('in');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const current = useRef({ index, count, disabled, onNavigate });
  current.current = { index, count, disabled, onNavigate };
  const previous = useRef(index);
  const navigating = useRef(false);
  const fromGesture = useRef(false);
  const lockUntil = useRef(0);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const recoveryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useLayoutEffect(() => {
    if (previous.current === index) return;
    setDirection(index > previous.current ? 'forward' : 'backward');
    previous.current = index;
    clearTimeout(exitTimer.current);
    clearTimeout(enterTimer.current);
    clearTimeout(recoveryTimer.current);
    navigating.current = false;
    const stage = stageRef.current;
    if (stage) {
      delete stage.dataset.gesture;
      stage.scrollTop = 0;
      if (fromGesture.current) stage.focus({ preventScroll: true });
    }
    fromGesture.current = false;
    setPhase('in');
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ENTER_MS;
    enterTimer.current = setTimeout(() => setPhase('idle'), duration);
  }, [index, stageRef]);

  useEffect(() => {
    if (!disabled) return;
    clearTimeout(exitTimer.current);
    clearTimeout(enterTimer.current);
    clearTimeout(recoveryTimer.current);
    navigating.current = false;
    fromGesture.current = false;
    setPhase('idle');
    if (stageRef.current) delete stageRef.current.dataset.gesture;
  }, [disabled, stageRef]);

  useEffect(() => {
    const mounted = stageRef.current;
    if (!mounted) return;
    const stage: HTMLElement = mounted;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lastWheel = 0;
    let wheelTotal = 0;
    let wheelAction: 'native' | 'chapter' | null = null;
    let pullFrame: number | undefined;
    let pullTimer: ReturnType<typeof setTimeout> | undefined;
    let touch: { x: number; y: number; target: HTMLElement; native: boolean; axis: 'x' | 'y' | null; dx: number; dy: number } | null = null;

    const blocked = (target: EventTarget | null) => !(target instanceof HTMLElement) || !!target.closest(INTERACTIVE);
    const resetPull = () => {
      if (pullFrame !== undefined) cancelAnimationFrame(pullFrame);
      pullFrame = undefined;
      delete stage.dataset.gesture;
    };
    function pull(dx: number, dy: number) {
      if (reduced.matches) return;
      if (pullFrame !== undefined) cancelAnimationFrame(pullFrame);
      pullFrame = requestAnimationFrame(() => {
        pullFrame = undefined;
        if (navigating.current || current.current.disabled) return;
        stage.dataset.gesture = 'pulling';
        stage.style.setProperty('--journey-drag-x', `${Math.max(-42, Math.min(42, dx * .35))}px`);
        stage.style.setProperty('--journey-drag-y', `${Math.max(-42, Math.min(42, dy * .35))}px`);
        stage.style.setProperty('--journey-tilt-x', `${Math.max(-5, Math.min(5, -dy / 20))}deg`);
        stage.style.setProperty('--journey-tilt-y', `${Math.max(-5, Math.min(5, dx / 20))}deg`);
      });
    }
    function navigate(delta: number) {
      const state = current.current;
      const next = state.index + delta;
      if (state.disabled || navigating.current || performance.now() < lockUntil.current || next < 0 || next >= state.count) return;
      resetPull();
      clearTimeout(enterTimer.current);
      navigating.current = true;
      fromGesture.current = true;
      setDirection(delta > 0 ? 'forward' : 'backward');
      setPhase(reduced.matches ? 'idle' : 'out');
      lockUntil.current = performance.now() + (reduced.matches ? 320 : EXIT_MS + ENTER_MS);
      exitTimer.current = setTimeout(() => current.current.onNavigate(next), reduced.matches ? 0 : EXIT_MS);
      recoveryTimer.current = setTimeout(() => { navigating.current = false; setPhase('idle'); }, EXIT_MS + ENTER_MS + 2000);
    }
    function wheel(event: WheelEvent) {
      if (event.ctrlKey || event.metaKey || current.current.disabled || blocked(event.target) || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1);
      if (!delta) return;
      const now = performance.now();
      if (now - lastWheel > GESTURE_GAP) { wheelTotal = 0; wheelAction = null; }
      lastWheel = now;
      if (navigating.current || now < lockUntil.current || wheelAction === 'chapter') { event.preventDefault(); return; }
      if (wheelAction === 'native') return;
      const step = Math.sign(delta);
      if (scrollsWithin(event.target as HTMLElement, stage, step)) { wheelAction = 'native'; wheelTotal = 0; return; }
      if (current.current.index + step < 0 || current.current.index + step >= current.current.count) return;
      event.preventDefault();
      if (Math.sign(wheelTotal) !== step) wheelTotal = 0;
      wheelTotal += delta;
      pull(0, -wheelTotal * .25);
      clearTimeout(pullTimer);
      pullTimer = setTimeout(resetPull, GESTURE_GAP);
      if (Math.abs(wheelTotal) >= WHEEL_THRESHOLD) { wheelAction = 'chapter'; navigate(step); }
    }
    function start(event: TouchEvent) {
      resetPull();
      touch = null;
      if (event.touches.length !== 1 || current.current.disabled || blocked(event.target) || navigating.current || performance.now() < lockUntil.current) return;
      const point = event.touches[0];
      touch = { x: point.clientX, y: point.clientY, target: event.target as HTMLElement, native: false, axis: null, dx: 0, dy: 0 };
    }
    function move(event: TouchEvent) {
      if (!touch || event.touches.length !== 1) { touch = null; resetPull(); return; }
      touch.dx = event.touches[0].clientX - touch.x;
      touch.dy = event.touches[0].clientY - touch.y;
      if (!touch.axis && Math.max(Math.abs(touch.dx), Math.abs(touch.dy)) > 12) {
        if (Math.abs(touch.dx) > Math.abs(touch.dy) * 1.2) touch.axis = 'x';
        else if (Math.abs(touch.dy) > Math.abs(touch.dx) * 1.2) touch.axis = 'y';
        if (touch.axis === 'y') touch.native = scrollsWithin(touch.target, stage, -Math.sign(touch.dy));
      }
      if (!touch.axis || touch.native) return;
      const delta = touch.axis === 'x' ? touch.dx : touch.dy;
      const next = current.current.index - Math.sign(delta);
      if (next < 0 || next >= current.current.count) return;
      if (event.cancelable) event.preventDefault();
      pull(touch.axis === 'x' ? touch.dx : 0, touch.axis === 'y' ? touch.dy : 0);
    }
    function end() {
      const gesture = touch;
      touch = null;
      resetPull();
      if (!gesture || gesture.native || !gesture.axis) return;
      const delta = gesture.axis === 'x' ? gesture.dx : gesture.dy;
      if (Math.abs(delta) >= SWIPE_THRESHOLD) navigate(-Math.sign(delta));
    }
    function cancel() { touch = null; resetPull(); }
    enterTimer.current = setTimeout(() => setPhase('idle'), reduced.matches ? 0 : ENTER_MS);
    stage.addEventListener('wheel', wheel, { passive: false });
    stage.addEventListener('touchstart', start, { passive: true });
    stage.addEventListener('touchmove', move, { passive: false });
    stage.addEventListener('touchend', end);
    stage.addEventListener('touchcancel', cancel);
    return () => {
      stage.removeEventListener('wheel', wheel);
      stage.removeEventListener('touchstart', start);
      stage.removeEventListener('touchmove', move);
      stage.removeEventListener('touchend', end);
      stage.removeEventListener('touchcancel', cancel);
      clearTimeout(pullTimer);
      clearTimeout(exitTimer.current);
      clearTimeout(enterTimer.current);
      clearTimeout(recoveryTimer.current);
      resetPull();
    };
  }, [stageRef]);

  return { phase, direction };
}
