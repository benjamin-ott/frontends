import { computed, ComputedRef, Ref, unref } from "vue";
import {
  removeCartItem,
  changeCartItemQuantity,
  getProduct,
} from "@shopware-pwa/api-client";
import {
  Product,
  LineItem,
  LineItemType,
  ClientApiError,
  PropertyGroupOptionCart,
  PropertyGroupOption,
  ProductResponse,
} from "@shopware-pwa/types";

import { getMainImageUrl } from "@shopware-pwa/helpers-next";
import { useShopwareContext, useCart } from ".";

export type UseCartItemReturn = {
  itemRegularPrice: ComputedRef<number | undefined>;
  itemSpecialPrice: ComputedRef<number | undefined>;
  itemImageThumbnailUrl: ComputedRef<string>;
  itemOptions: ComputedRef<PropertyGroupOption[] | PropertyGroupOptionCart[]>;
  itemType: ComputedRef<LineItemType | undefined>;
  isProduct: ComputedRef<boolean>;
  isPromotion: ComputedRef<boolean>;
  itemStock: ComputedRef<number | undefined>;

  itemQuantity: ComputedRef<number | undefined>;
  changeItemQuantity: (quantity: number) => Promise<void>;
  removeItem: () => Promise<void>;
  getProductItemSeoUrlData(): Promise<ProductResponse | undefined>;
};

export function useCartItem(cartItem: Ref<LineItem>): UseCartItemReturn {
  if (!cartItem) {
    throw new Error("[useCartItem] mandatory cartItem argument is missing.");
  }

  const { apiInstance } = useShopwareContext();
  const { refreshCart, changeProductQuantity } = useCart();

  const itemQuantity = computed(() => cartItem.value.quantity);
  const itemImageThumbnailUrl = computed(() => getMainImageUrl(cartItem.value));

  // TODO: use helper instead

  const itemRegularPrice = computed(() => cartItem.value.price?.unitPrice);

  const itemSpecialPrice = computed(
    () => cartItem.value.price?.listPrice && cartItem.value.price.unitPrice
  );

  const itemOptions = computed(
    () =>
      (cartItem.value.type === "product" &&
        (cartItem.value.payload as Product)?.options) ||
      []
  );

  const itemStock = computed(() => cartItem.value.deliveryInformation?.stock);

  const itemType = computed(() => cartItem.value.type);

  const isProduct = computed(() => cartItem.value.type === "product");

  const isPromotion = computed(() => cartItem.value.type === "promotion");

  async function removeItem() {
    const result = await removeCartItem(cartItem.value.id, apiInstance);
    // broadcastUpcomingErrors(result);
    await refreshCart();
  }

  async function changeItemQuantity(quantity: number): Promise<void> {
    await changeProductQuantity({
      id: cartItem.value.id,
      quantity: quantity,
    });
    // broadcastUpcomingErrors(result);
  }

  async function getProductItemSeoUrlData(): Promise<
    ProductResponse | undefined
  > {
    if (!cartItem.value.referencedId) {
      return;
    }

    try {
      const result = await getProduct(
        cartItem.value.referencedId,
        {
          // includes: (getDefaults() as any).getProductItemsSeoUrlsData.includes,
          // associations: (getDefaults() as any).getProductItemsSeoUrlsData
          //   .associations,
        },
        apiInstance
      );
      return result.product as unknown as ProductResponse;
    } catch (error) {
      console.error(
        "[useCart][getProductItemsSeoUrlsData]",
        (error as ClientApiError).messages
      );
    }

    return;
  }

  return {
    changeItemQuantity,
    removeItem,
    getProductItemSeoUrlData,
    itemRegularPrice,
    itemSpecialPrice,
    itemOptions,
    itemStock,
    itemQuantity,
    itemType,
    itemImageThumbnailUrl,
    isProduct,
    isPromotion,
  };
}
