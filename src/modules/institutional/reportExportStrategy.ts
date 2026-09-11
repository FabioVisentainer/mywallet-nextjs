export interface ReportRow {
  wallet: string;
  value: number;
  cost: number;
  pnl: number;
}

/**
 * STRATEGY — exemplo 3 de 3.
 *
 * Onde: como o relatório consolidado institucional é montado para exportação —
 * hoje escolhido pelos botões "Export CSV" / "Export PDF" da tela de relatórios.
 *
 * Por quê: antes, os dois botões chamavam a mesma função `exportFacade(kind)`
 * que só trocava a palavra no toast não existia, de fato, lógica por formato.
 * Cada formato de exportação é uma regra própria (like separado por vírgula vs.
 * um layout de texto corrido), então cada um ganha sua própria classe atrás da
 * mesma interface. Domínio diferente dos outros dois exemplos de Strategy: aqui
 * a variação é "como serializar um relatório", não sobre planos nem sobre
 * classificação de perfil.
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
