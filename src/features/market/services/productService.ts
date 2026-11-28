import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { uploadImages } from '../../../lib/firebase/storageService';
import { enrichLocationWithGeohash } from '../../../lib/location/locationService';
import { CreateProductInput, Product, User } from '../../../types';

const PRODUCTS_COLLECTION = 'products';

const mapProductDoc = (
  id: string,
  rawData: Omit<Product, 'productId'> & { productId?: string }
): Product => ({
  ...rawData,
  productId: rawData.productId || id,
});

/**
 * Lắng nghe realtime danh sách đồ cũ đang bán/tặng (status == 'available').
 * Sắp xếp giảm dần theo createdAt ở client để tránh phụ thuộc composite index.
 */
export const subscribeAvailableProducts = (
  onData: (products: Product[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where('status', '==', 'available')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const products: Product[] = snapshot.docs.map((docSnap) =>
        mapProductDoc(
          docSnap.id,
          docSnap.data() as Omit<Product, 'productId'> & { productId?: string }
        )
      );

      products.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      onData(products);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
};

/**
 * Lắng nghe realtime danh sách đồ pass của một người bán (sellerId == uid).
 */
export const subscribeUserProducts = (
  sellerId: string,
  onData: (products: Product[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where('sellerId', '==', sellerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const products: Product[] = snapshot.docs.map((docSnap) =>
        mapProductDoc(
          docSnap.id,
          docSnap.data() as Omit<Product, 'productId'> & { productId?: string }
        )
      );

      products.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      onData(products);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
};

/**
 * Lắng nghe realtime chi tiết một sản phẩm theo productId.
 */
export const subscribeProductById = (
  productId: string,
  onData: (product: Product | null) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);

  return onSnapshot(
    productRef,
    (docSnap) => {
      if (!docSnap.exists()) {
        onData(null);
        return;
      }
      onData(
        mapProductDoc(
          docSnap.id,
          docSnap.data() as Omit<Product, 'productId'> & { productId?: string }
        )
      );
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
};

/**
 * Đăng bán / tặng đồ cũ mới:
 * - Upload ảnh lên Firebase Storage (lưu mảng imageUrls)
 * - Sinh trường geohash cho tọa độ location bằng geofire-common
 * - Lưu kèm sellerName, sellerAvatar, sellerTrustScore (Denormalization)
 */
export const createProduct = async (
  input: CreateProductInput,
  seller: User
): Promise<string> => {
  const uploadedUrls = await uploadImages(
    input.imageUrls ?? [],
    'products',
    seller.uid
  );

  const location = enrichLocationWithGeohash(input.location);
  const productRef = doc(collection(db, PRODUCTS_COLLECTION));
  const now = Date.now();

  const newProduct: Product = {
    productId: productRef.id,
    title: input.title.trim(),
    description: input.description.trim(),
    price: input.isFree ? 0 : input.price,
    isFree: input.isFree,
    category: input.category,
    condition: input.condition,
    imageUrls: uploadedUrls,
    sellerId: seller.uid,
    sellerName: seller.displayName || seller.email,
    sellerAvatar: seller.avatarUrl ?? null,
    sellerTrustScore:
      typeof seller.trustScore === 'number' && seller.trustScore > 0
        ? seller.trustScore
        : 5.0,
    location,
    status: 'available',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(productRef, newProduct);
  return productRef.id;
};
