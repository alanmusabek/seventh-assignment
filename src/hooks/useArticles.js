import { useQuery } from "@tanstack/react-query";
import { getArticle, getArticles } from "../services/articlesApi";

export function useArticles() {
  return useQuery({ queryKey: ["articles", "list"], queryFn: getArticles });
}

export function useArticle(id) {
  return useQuery({
    queryKey: ["articles", "detail", String(id)],
    queryFn: () => getArticle(id),
    retry: (count, error) => !error.notFound && count < 1,
  });
}
