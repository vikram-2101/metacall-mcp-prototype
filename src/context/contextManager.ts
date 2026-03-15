
// The context object — just a plain JavaScript object
const context: Record<string, any> = {};


export function setContext(key: string, value: any): void {
  context[key] = value;
}


export function getContext(key: string): any {
  return context[key];
}

export function getAllContext(): Record<string, any> {
  return { ...context };
}
