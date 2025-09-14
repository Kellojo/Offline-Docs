#!/usr/bin/env node

const args = process.argv.slice(2);

if (args[0] === "start") {
    require("./server");
} else if (args[0] === "build") {
    require("./build");
} else {
  console.log("❓ Unknown command. Use: start | build");
}
