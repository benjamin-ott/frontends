import { Product } from "@shopware-pwa/types";

/**
 * Get product rating average property
 *
 * @public
 */
export function getProductRatingAverage(product: Product): number | null {
  return product?.ratingAverage;
}
