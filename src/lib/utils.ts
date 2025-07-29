import { ZodError } from "zod";

export const getZodErrors = (
    err: ZodError,
): {
    message: string;
    field: string;
}[] => {
    if (err instanceof ZodError) {
        const parsed = JSON.parse(err.message) as any[];

        return parsed.map((er) => {
            return { message: er.message, field: er.path[0] };
        });
    }
    return [];
};
