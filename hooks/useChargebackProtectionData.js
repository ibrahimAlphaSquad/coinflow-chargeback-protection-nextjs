/**
 * useChargebackProtectionData.js
 *
 * A small helper hook that builds the chargebackProtectionData array from
 * a cart of items. Adapt the field mapping to match your own product model.
 *
 * Usage:
 *   const chargebackProtectionData = useChargebackProtectionData(cartItems);
 */
export function useChargebackProtectionData(cartItems = []) {
  return cartItems.map((item) => ({
    // Required fields
    productName: item.name,
    productType: item.productType,   // Must be one of the PRODUCT_TYPES values
    quantity: item.quantity,

    // Optional — pass as much as possible for better authorization rates
    rawProductData: {
      productID: item.id,
      productDescription: item.description ?? '',
      productCategory: item.category ?? '',
      unitPrice: item.unitPrice ?? '',
      currency: item.currency ?? 'USD',
      imageUrl: item.imageUrl ?? '',
      // Add any extra fields your store can provide
      ...item.extraData,
    },
  }));
}
