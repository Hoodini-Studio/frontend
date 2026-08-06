import { z } from "zod";

type Translator = (key: string) => string;

export function createProductFormSchema(t: Translator) {
  return z.object({
    name: z.string().trim().min(1, t("nameRequired")),
    description_en: z.string().optional(),
    description_sq: z.string().optional(),
  });
}

export type ProductFormValues = z.infer<ReturnType<typeof createProductFormSchema>>;
