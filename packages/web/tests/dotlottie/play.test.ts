/**
 * Copyright 2023 Design Barn Inc.
 */

import { describe, afterEach, beforeEach, test, expect, vi } from 'vitest';

import { DotLottie } from '../../src';
import { sleep } from '../../test-utils';

// to use the local wasm file
DotLottie.setWasmUrl('src/renderer-wasm/bin/renderer.wasm');

describe('play animation', () => {
  let canvas: HTMLCanvasElement;
  let dotLottie: DotLottie;
  const src = 'https://lottie.host/66096915-99e9-472d-ad95-591372738141/7p6YR50Nfv.lottie';

  beforeEach(() => {
    canvas = document.createElement('canvas');

    canvas.style.width = '300px';
    canvas.style.height = '300px';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.right = '0';

    document.body.appendChild(canvas);
  });

  afterEach(() => {
    dotLottie.destroy();
    document.body.removeChild(canvas);
  });

  test('automatically play animation with `autoplay` set to true', async () => {
    dotLottie = new DotLottie({
      canvas,
      autoplay: true,
      src,
    });

    const onLoad = vi.fn();

    dotLottie.addEventListener('load', onLoad);

    const onPlay = vi.fn();

    dotLottie.addEventListener('play', onPlay);

    const onFrame = vi.fn();

    dotLottie.addEventListener('frame', onFrame);

    const onCompleted = vi.fn();

    dotLottie.addEventListener('complete', onCompleted);

    // verify the animation is not playing initially
    expect(onPlay).not.toHaveBeenCalled();
    expect(onFrame).not.toHaveBeenCalled();
    expect(onLoad).not.toHaveBeenCalled();
    expect(onCompleted).not.toHaveBeenCalled();

    expect(dotLottie.isPlaying).toBe(false);
    expect(dotLottie.isPaused).toBe(false);
    expect(dotLottie.isStopped).toBe(true);
    expect(dotLottie.isFrozen).toBe(false);

    // wait for the animation to load
    await vi.waitFor(
      () => {
        expect(onLoad).toHaveBeenCalledTimes(1);
      },
      {
        timeout: 2000,
      },
    );

    // wait for the animation to start playing
    await vi.waitFor(() => {
      expect(onPlay).toHaveBeenCalledTimes(1);
    });

    // verify the animation is playing
    expect(dotLottie.isPlaying).toBe(true);
    expect(dotLottie.isPaused).toBe(false);
    expect(dotLottie.isStopped).toBe(false);
    expect(dotLottie.isFrozen).toBe(false);

    // wait for the animation to complete
    expect(onCompleted).not.toHaveBeenCalled();

    await vi.waitFor(
      () => {
        expect(onCompleted).toHaveBeenCalledTimes(1);
      },
      {
        // wait for the animation duration + 250ms (to account for retry interval)
        timeout: dotLottie.duration * 1000 + 250,
      },
    );

    // verify the animation stopped playing
    expect(dotLottie.isPlaying).toBe(false);
    expect(dotLottie.isPaused).toBe(false);
    expect(dotLottie.isStopped).toBe(true);
    expect(dotLottie.isFrozen).toBe(false);

    // verify the animation rendered the last frame
    expect(onFrame).toHaveBeenLastCalledWith({
      type: 'frame',
      currentFrame: dotLottie.totalFrames - 1,
    });
  });

  test('play animation with `autoplay` set to false, verify it does not play', async () => {
    dotLottie = new DotLottie({
      canvas,
      autoplay: false,
      src,
    });

    const onLoad = vi.fn();

    dotLottie.addEventListener('load', onLoad);

    const onPlay = vi.fn();

    dotLottie.addEventListener('play', onPlay);

    await vi.waitFor(
      () => {
        expect(onLoad).toHaveBeenCalledTimes(1);
      },
      {
        timeout: 2000,
      },
    );

    // wait briefly to see if the animation starts
    await sleep(500);

    expect(onPlay).not.toHaveBeenCalled();
    expect(dotLottie.isPlaying).toBe(false);
  });

  test('manually play animation using `play()` method', async () => {
    dotLottie = new DotLottie({
      canvas,
      autoplay: false,
      src,
    });

    const onLoad = vi.fn();

    dotLottie.addEventListener('load', onLoad);

    const onPlay = vi.fn();

    dotLottie.addEventListener('play', onPlay);

    await vi.waitFor(
      () => {
        expect(onLoad).toHaveBeenCalledTimes(1);
      },
      {
        timeout: 2000,
      },
    );

    dotLottie.play();

    await vi.waitFor(() => {
      expect(onPlay).toHaveBeenCalledTimes(1);
    });

    expect(dotLottie.isPlaying).toBe(true);
  });

  test('manually play animation using `play()` method, verify it does not restart if already playing', async () => {
    dotLottie = new DotLottie({
      canvas,
      autoplay: false,
      src,
    });

    const onLoad = vi.fn();

    dotLottie.addEventListener('load', onLoad);

    const onPlay = vi.fn();

    dotLottie.addEventListener('play', onPlay);

    await vi.waitFor(
      () => {
        expect(onLoad).toHaveBeenCalledTimes(1);
      },
      {
        timeout: 2000,
      },
    );

    dotLottie.play();

    expect(onPlay).toHaveBeenCalledTimes(1);

    expect(dotLottie.isPlaying).toBe(true);

    dotLottie.play();

    // wait to verify if the animation restarts
    await sleep(100);

    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  test('play animation using `play()` and pause using `pause()` method and verify it resumes when played again', async () => {
    dotLottie = new DotLottie({
      canvas,
      autoplay: false,
      src,
    });

    const onLoad = vi.fn();

    dotLottie.addEventListener('load', onLoad);

    const onPause = vi.fn();

    dotLottie.addEventListener('pause', onPause);

    const onPlay = vi.fn();

    dotLottie.addEventListener('play', onPlay);

    await vi.waitFor(
      () => {
        expect(onLoad).toHaveBeenCalledTimes(1);
      },
      {
        timeout: 2000,
      },
    );

    dotLottie.play();

    expect(onPlay).toHaveBeenCalledTimes(1);

    dotLottie.pause();

    expect(onPause).toHaveBeenCalledTimes(1);

    expect(dotLottie.isPlaying).toBe(false);
    expect(dotLottie.isPaused).toBe(true);
    expect(dotLottie.isStopped).toBe(false);
    expect(dotLottie.isFrozen).toBe(false);

    dotLottie.play();

    expect(onPlay).toHaveBeenCalledTimes(2);

    expect(dotLottie.isPlaying).toBe(true);
    expect(dotLottie.isPaused).toBe(false);
    expect(dotLottie.isStopped).toBe(false);
    expect(dotLottie.isFrozen).toBe(false);
  });

  test('play animation using `play()` and stop using `stop()`', async () => {
    dotLottie = new DotLottie({
      canvas,
      autoplay: false,
      src,
    });

    const onLoad = vi.fn();

    dotLottie.addEventListener('load', onLoad);

    const onStop = vi.fn();

    dotLottie.addEventListener('stop', onStop);

    const onPlay = vi.fn();

    dotLottie.addEventListener('play', onPlay);

    await vi.waitFor(
      () => {
        expect(onLoad).toHaveBeenCalledTimes(1);
      },
      {
        timeout: 2000,
      },
    );

    dotLottie.play();

    expect(onPlay).toHaveBeenCalledTimes(1);

    dotLottie.stop();

    expect(onStop).toHaveBeenCalledTimes(1);

    expect(dotLottie.isPlaying).toBe(false);
    expect(dotLottie.isPaused).toBe(false);
    expect(dotLottie.isStopped).toBe(true);
    expect(dotLottie.isFrozen).toBe(false);
  });
});