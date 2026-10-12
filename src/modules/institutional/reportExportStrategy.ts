export interface ReportRow {
  wallet: string;
  value: number;
  cost: number;
  pnl: number;
}

/**
 * STRATEGY (exemplo 3 de 3)
 *
 * Define como o relatório consolidado institucional é montado para exportação.
 * Hoje a escolha vem dos botões Export CSV e Export PDF da tela de relatórios.
 *
 * Por que existe: antes, os dois botões chamavam a mesma função exportFacade,
 * que só trocava a palavra na mensagem. Não existia nenhuma lógica por formato.
 * Como cada formato monta o conteúdo de um jeito (CSV separado por vírgula e
 * PDF em texto corrido), cada um ganhou sua própria classe com a mesma
 * interface. É um caso diferente dos outros dois Strategies: aqui a variação é
 * como montar um relatório.
 */
export interface ReportExportStrategy {
  readonly label: "CSV" | "PDF";
  build(rows: ReportRow[]): string;
}

class CsvReportExportStrategy implements ReportExportStrategy {
  readonly label = "CSV" as const;
  build(rows: ReportRow[]): string {
    const header = "wallet,value,cost,pnl";
    const lines = rows.map((r) => `${r.wallet},${r.value.toFixed(2)},${r.cost.toFixed(2)},${r.pnl.toFixed(1)}`);
    return [header, ...lines].join("\n");
  }
}

class PdfReportExportStrategy implements ReportExportStrategy {
  readonly label = "PDF" as const;
  build(rows: ReportRow[]): string {
    const lines = rows.map((r) => `${r.wallet}: value ${r.value.toFixed(2)}, cost ${r.cost.toFixed(2)}, P&L ${r.pnl.toFixed(1)}%`);
    return ["MyWallet — consolidated report", "", ...lines].join("\n");
  }
}

const REPORT_EXPORT_STRATEGIES: Record<"CSV" | "PDF", ReportExportStrategy> = {
  CSV: new CsvReportExportStrategy(),
  PDF: new PdfReportExportStrategy(),
};

export function getReportExportStrategy(kind: "CSV" | "PDF"): ReportExportStrategy {
  return REPORT_EXPORT_STRATEGIES[kind];
}
