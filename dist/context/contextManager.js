// The context object — just a plain JavaScript object
const context = {};
export function setContext(key, value) {
    context[key] = value;
}
export function getContext(key) {
    return context[key];
}
export function getAllContext() {
    return { ...context };
}
