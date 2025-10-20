import {z} from "zod";

export enum ResponseStatus {
    SUCCESS = "success",
    ERROR = "error",
    FAIL = "fail"
}

export class ServiceResponse<T = null> {
    success: boolean;
    message: string;
    responseObject: T | null;
    statusCode: number;

    constructor(status: ResponseStatus, message: string, responseObject: T | null = null, statusCode: number) {
        this.success = status === ResponseStatus.SUCCESS;
        this.message = message;
        this.responseObject = responseObject;
        this.statusCode = statusCode;
    }
}

export const ServiceResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
    success: z.boolean(),
    message: z.string(),
    responseObject: dataSchema.optional(),
    statusCode: z.number()
    });
