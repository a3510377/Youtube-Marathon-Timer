declare module "string-math" {
  export default function (
    expression: string,
    callback?: (error: Error | null, result: number) => void
  ): number;
}
