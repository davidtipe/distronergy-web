import useSWR from "swr";
import { api } from "../api";

function fetcher<T>(path: string) {
  return api.get<T>(path).then((res) => res.data);
}

export function useOrders(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR(`/orders${query}`, fetcher);
}

export function useOrder(id: string | null) {
  return useSWR(id ? `/orders/${id}` : null, fetcher);
}
