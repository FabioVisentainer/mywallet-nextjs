import { currencyRates, type CurrencyRate } from "@/mocks/external/rates";
import { getQuote } from "@/mocks/external/quotes";
import { months, series, benchSeries } from "@/mocks/external/performance";
import { analystCalls } from "@/mocks/external/analystCalls";

export interface MarketSeriesData {
  months: string[];
  series: number[];
  benchSeries: number[];
}

/**
 * SINGLETON — exemplo 2 de 2.
 *
 * Ponto único de acesso aos provedores externos de dados de mercado
 * (cotações, taxas de câmbio, histórico de performance e recomendações de analistas).
 *
 * Por quê: antes deste gateway, cada rota de API importava um mock diferente
 * diretamente (@/mocks/external/quotes, /rates, /performance, /analystCalls).
 * Quando esses mocks forem substituídos por chamadas reais a APIs externas
 * (autenticação, rate limit, cache, retry), existe agora UM único lugar para
 * adicionar isso em vez de caçar todo import espalhado pelo código. Uma
 * única instância também permite introduzir cache em memória no futuro sem
 * duplicar estado entre os pontos de uso.
 */
export class MarketDataGateway {
  private static instance: MarketDataGateway;

  private constructor() {}

  static getInstance(): MarketDataGateway {
    if (!MarketDataGateway.instance) {
      MarketDataGateway.instance = new MarketDataGateway();
    }
    return MarketDataGateway.instance;
  }

  getQuote(ticker: string, avgCost: number): number {
    return getQuote(ticker, avgCost);
  }

  getCurrencyRates(): CurrencyRate[] {
    return currencyRates;
  }

  getMarketSeries(): MarketSeriesData {
    return { months, series, benchSeries };
  }

  getAnalystCalls(): typeof analystCalls {
    return analystCalls;
  }
}
