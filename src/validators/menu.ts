import { z } from "zod";

const menuCategories = [
  "BEVERAGE",
  "PASTRY",
  "PASTA",
  "DESSERT",
  "BURGER",
  "PIZZA",
  "CHICKEN",
  "PORK",
] as const;

const menuItemFieldsSchema = z.object({
  itemName: z
    .string()
    .trim()
    .min(1, { message: "Item name is required." })
    .max(150, { message: "Item name must not exceed 150 characters." }),
  description: z
    .string()
    .trim()
    .max(1000, { message: "Description must not exceed 1000 characters." }),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number." })
    .finite({ message: "Price must be a valid number." })
    .positive({ message: "Price must be greater than 0." })
    .max(99999999.99, { message: "Price is too large." }),
  category: z.enum(menuCategories, {
    errorMap: () => ({ message: "Select a valid category." }),
  }),
  isAvailable: z.boolean(),
});

/** Create a menu item under a business. */
export const createMenuItemSchema = menuItemFieldsSchema.extend({
  businessId: z
    .string()
    .trim()
    .min(1, { message: "Business is required." }),
});

/** Update menu item fields (businessId stays the same). */
export const updateMenuItemSchema = menuItemFieldsSchema;

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
