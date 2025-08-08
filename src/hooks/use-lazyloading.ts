import { useEffect, useState, useCallback } from "react";
interface UseLazyLoadOptions {
    limit?: number
    enabled?: boolean
}

interface UseLazyLoadResult<T> {
    data: T[]
    loading: boolean
    loadingMore: boolean
    error: string | null
    hasMore: boolean
    total: number
    loadMore: () => void
    retry: () => void
    refresh: () => void
}

export function useLazyLoad<T>(
    fetchFunction: (limit: number, offset: number) => Promise<{
        items: T[]
        total: number
        has_more: boolean
        offset: number
    }>,
    options: UseLazyLoadOptions = {}
): UseLazyLoadResult<T> {
    const { limit = 10, enabled = true } = options;

    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (currentOffset: number, isLoadMore: boolean = false) => {
        if (!enabled) return;

        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await fetchFunction(limit, currentOffset);

            if (isLoadMore) {
                setData(prev => [...prev, ...response.items]);
            } else {
                setData(response.items);
            }

            setTotal(response.total);
            setHasMore(response.has_more);
            setOffset(response.offset + response.items.length);
            setError(null);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [fetchFunction, limit, enabled]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            fetchData(offset, true);
        }
    }, [fetchData, offset, loadingMore, hasMore]);

    const retry = useCallback(() => {
        setError(null);
        fetchData(0);
    }, [fetchData]);

    const refresh = useCallback(() => {
        setOffset(0);
        setData([]);
        setError(null);
        fetchData(0);
    }, [fetchData]);

    // Initial load
    useEffect(() => {
        if (enabled) {
            fetchData(0);
        }
    }, [fetchData, enabled]);

    return {
        data,
        loading,
        loadingMore,
        error,
        hasMore,
        total,
        loadMore,
        retry,
        refresh
    };
}