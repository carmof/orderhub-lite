export const loadConfig = () => {
  return { port: Number(process.env['PORT']) || 3000 };
};
