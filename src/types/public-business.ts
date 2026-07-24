/** Public business overlay view model (mapped, cache-safe). */
export type PublicBusinessView = {
  id: string;
  businessName: string;
  description: string;
  coverPhoto: string;
  dateEstablishment: string;
  companyName: string;
  branches: Array<{ id: string; label: string }>;
  menu: Array<{
    id: string;
    itemName: string;
    description?: string;
    priceLabel: string;
    categoryLabel: string;
    isAvailable: boolean;
  }>;
};
