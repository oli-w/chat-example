export const execLogError = <T>(fn: () => Promise<T>) => {
    fn().catch((e) => {
        console.error(e as Error);
        throw e;
    });
};
