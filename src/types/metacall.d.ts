// Custom type declarations for the 'metacall' npm package.
// TypeScript doesn't know about this package, so we declare its shape here.

declare module "metacall" {
  const pkg: {
    metacall: (func: string, ...args: any[]) => Promise<any>;

    metacall_load_from_file: (tag: string, paths: string[]) => void;

    metacall_inspect?: () => any;
  };

  export default pkg;
}
