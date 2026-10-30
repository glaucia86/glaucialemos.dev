import { z } from 'zod';

// Run before constructing schemas: avoid both JIT and its CSP-violating eval probe.
z.config({ jitless: true });
