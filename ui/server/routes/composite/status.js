export function getStatus(_req, res, getMcpSharkProcess) {
  const currentServer = getMcpSharkProcess();
  res.json({
    running: currentServer !== null,
    pid: null, // No process PID when using library
  });
}
