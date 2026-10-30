#!/usr/bin/env node

import process from "node:process";

import { seedDemo } from "./demo-data.mjs";

seedDemo().catch((error) => {
  console.error(`Gagal seed demo: ${error.message}`);
  process.exitCode = 1;
});
