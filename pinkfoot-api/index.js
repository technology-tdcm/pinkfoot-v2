import("./src/server.js").catch((err) => {
  console.error("Failed to load src/server.js:", err);
  process.exit(1);
});
