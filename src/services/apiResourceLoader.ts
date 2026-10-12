import {apiFetch} from "@/services/apiClient";

/**
 * TEMPLATE METHOD (exemplo 1 de 3)
 *
 * Classe base para carregar dados de uma API. O processo é sempre o mesmo:
 * primeiro busca a URL, depois pega só a parte da resposta que interessa.
 * Essa ordem fica fixa no método load(). Cada subclasse só informa qual URL
 * chamar (endpoint) e o que tirar da resposta (extract).
 *
 * Por que existe: useCurrencyRates, useMarketSeries e useAnalystCalls tinham
 * o mesmo useEffect repetido (buscar os dados, salvar no estado e tirar o
 * loading), mudando só a URL e o formato da resposta. Com essa classe, uma
 * melhoria futura, como tratar erro, tentar de novo ou registrar log, é feita
 * em um lugar só e vale para todos os hooks.
 */
export abstract class ApiResourceLoader<T> {
  /** Passo variável 1: qual URL chamar. */
  protected abstract endpoint(): string;

  /** Passo variável 2: qual parte da resposta usar. */
  protected abstract extract(raw: unknown): T;

  /** Método-modelo: executa os passos sempre na mesma ordem. As subclasses não alteram essa ordem. */
  async load(): Promise<T> {
    const raw = await apiFetch<unknown>(this.endpoint());
    return this.extract(raw);
  }
}
