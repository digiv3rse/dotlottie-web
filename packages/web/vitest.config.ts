/**
 * Copyright 2023 Design Barn Inc.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chrome',
    },
    coverage: {
      provider: 'istanbul',
      include: ['src/**/*.ts'],
    },
    testTimeout: 10000,
    cache: false,
  },
});
