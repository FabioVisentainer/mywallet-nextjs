import { currencyRates, type CurrencyRate } from "@/mocks/external/rates";
import { getQuote } from "@/mocks/external/quotes";
import { months, series, benchSeries } from "@/mocks/external/performance";
import { analystCalls } from "@/mocks/external/analystCalls";
import { getAssetReference, type AssetReference } from "@/mocks/external/assetReference";
import { getPendingBrokerSwaps, getBrokerSwapById, type BrokerSwap } from "@/mocks/external/brokerFeed";
import { getUpcomingActions, type CorporateAction } from "@/mocks/external/corporateActions";
import { economicEvents, type EconomicEvent } from "@/mocks/external/economicCalendar";

export interface MarketSeriesData {
  months: string[];
  series: number[];
  benchSeries: number[];
}

/**
 * SINGLETON (exemplo 2 de 2)
 *
 * Ponto único de acesso aos dados de mercado que vêm de fora: cotações, câmbio,
 * histórico de performance, recomendações de analistas, dados de referência
 * dos ativos, feed de swaps da corretora, proventos e calendário econômico.
 *
 * Por que existe: antes, cada rota de API importava o seu mock direto. Quando
 * esses mocks virarem chamadas para APIs reais (com autenticação, limite de
 * chamadas, cache e nova tentativa), tudo isso entra só aqui, sem precisar
 * procurar imports espalhados pelo código. Ter uma única instância também
 * permite criar um cache em memória compartilhado por todas as rotas.
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

  getAssetReference(ticker: string): AssetReference {
    return getAssetReference(ticker);
  }

  getPendingBrokerSwaps(importedIds: string[]): BrokerSwap[] {
    return getPendingBrokerSwaps(importedIds);
  }

  getBrokerSwapById(id: string): BrokerSwap | undefined {
    return getBrokerSwapById(id);
  }

  getUpcomingActions(tickers: string[]): CorporateAction[] {
    return getUpcomingActions(tickers);
  }

  getEconomicCalendar(): EconomicEvent[] {
    return economicEvents;
  }
}
