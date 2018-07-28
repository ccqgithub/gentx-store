const NODE_ENV = process.env.NODE_ENV;

export function invariant(condition, message) {
  if (condition) return;
  throw new Error(message);
}

export function log(message) {
  if (NODE_ENV === 'production') return;
  console.log(message);
}