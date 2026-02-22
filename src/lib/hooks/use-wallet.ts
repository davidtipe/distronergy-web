import useSWR from "swr";
import { api } from "../api";

function fetcher<T>(path: string) {
  return api.get<T>(path).then((res) => res.data);
}

export function useWallet() {
  return useSWR("/wallet", fetcher);
}

export function useWalletTransactions(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR(`/wallet/transactions${query}`, fetcher);
}
