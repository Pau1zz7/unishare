import { useCallback, useEffect, useState } from 'react';
import {
  subscribeAvailableProducts,
  subscribeProductById,
  subscribeUserProducts,
} from '../services/productService';
import { Product } from '../../../types';

/**
 * Hook lắng nghe realtime danh sách đồ cũ đang mở bán/tặng (status == 'available') từ Firestore.
 */
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribeVersion, setSubscribeVersion] = useState(0);

  useEffect(() => {
    setError(null);
    const unsubscribe = subscribeAvailableProducts(
      (data) => {
        setProducts(data);
        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        setError(err.message || 'Không thể tải danh sách đồ cũ.');
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [subscribeVersion]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setSubscribeVersion((v) => v + 1);
  }, []);

  return { products, loading, refreshing, error, refresh };
};

/**
 * Hook lắng nghe realtime danh sách đồ pass của một user (sellerId == uid).
 */
export const useUserProducts = (sellerId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!!sellerId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const unsubscribe = subscribeUserProducts(
      sellerId,
      (data) => {
        setProducts(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Không thể tải danh sách đồ pass.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [sellerId]);

  return { products, loading, error };
};

/**
 * Hook lắng nghe realtime chi tiết 1 sản phẩm chợ đồ cũ.
 */
export const useProductDetail = (
  productId?: string,
  initialProduct?: Product | null
) => {
  const [product, setProduct] = useState<Product | null>(initialProduct ?? null);
  const [loading, setLoading] = useState(!initialProduct && !!productId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolvedId = productId || initialProduct?.productId;
    if (!resolvedId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeProductById(
      resolvedId,
      (data) => {
        setProduct(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Không thể tải chi tiết sản phẩm.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [productId, initialProduct?.productId]);

  return { product, loading, error };
};
