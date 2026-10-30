#!/usr/bin/env node

import process from "node:process";

import { resetDemo } from "./demo-data.mjs";

resetDemo().catch((error) => {
  console.error(`Gagal reset demo: ${error.message}`);
  process.exitCode = 1;
});
