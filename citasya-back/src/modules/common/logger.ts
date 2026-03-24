// Simple logger class
export class Logger {
  constructor(private context: string) {}
  
  log(message: string) {
    console.log(`[${this.context}] ${message}`);
  }
  
  error(message: string) {
    console.error(`[${this.context}] ERROR: ${message}`);
  }
  
  debug(message: string) {
    console.debug(`[${this.context}] DEBUG: ${message}`);
  }
}
