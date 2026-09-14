export const logger = {
  info: (msg: string, ...args: any[]) => console.log(`ℹ️ [INFO] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`⚠️ [WARN] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`❌ [ERROR] ${msg}`, ...args),
  success: (msg: string, ...args: any[]) => console.log(`✅ [SUCCESS] ${msg}`, ...args)
};

export default logger;
