import { apiFetch } from "@/lib/apiClient";

/**
 * TEMPLATE METHOD — exemplo 1 de 3.
 *
 * Define o esqueleto fixo do carregamento de um recurso
 * vindo de uma API (buscar → extrair a parte relevante da resposta), deixando
 * cada subclasse decidir apenas o "onde" (endpoint) e o "o quê" (como extrair
 * os dados da resposta).
 *
 * Por quê: useCurrencyRates, useMarketSeries e useAnalystCalls tinham o
 * mesmo useEffect praticamente idêntico (fetch → setState → setLoading(false))
 * repetido três vezes, mudando apenas a URL e o formato da resposta. Duplicar
 * esse esqueleto é duplicar um algoritmo qualquer ajuste futuro (tratamento
 * de erro, retry, log) precisaria ser copiado nos três lugares.
 */
export abstract class ApiResourceLoader<T> {
  /** Passo variável 1: qual endpoint chamar. */
  protected abstract endpoint(): string;

  /** Passo variável 2: como extrair o dado útil da resposta JSON crua. */
  protected abstract extract(raw: unknown): T;

  /** Método-modelo: a ordem dos passos é fixa e não é alterada pelas subclasses. */
  async load(): Promise<T> {
    const raw = await apiFetch<unknown>(this.endpoint());
    return this.extract(raw);
  }
}
