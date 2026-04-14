import { z } from "zod";
const receiptItemSchema = z.object({
    name: z.string().min(1),
    price: z.number().finite().nonnegative(),
});
const receiptSchema = z.object({
    merchant_name: z.string().nullable(),
    date: z
        .string()
        .nullable()
        .refine((v) => v === null || !Number.isNaN(Date.parse(v)), {
        message: "date must be valid",
    }),
    total_amount: z.number().finite().nonnegative().nullable(),
    items: z.array(receiptItemSchema),
    payment_method: z.string().nullable(),
});
export function validateReceiptPayload(payload) {
    return receiptSchema.parse(payload);
}
