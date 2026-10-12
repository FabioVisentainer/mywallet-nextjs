/**
 * TEMPLATE METHOD (exemplo 2 de 3)
 *
 * Classe base para as rotas POST que criam algo no banco. O processo é sempre
 * o mesmo: ler os dados enviados, validar, responder 400 se tiver erro, gravar
 * no banco e devolver o que foi criado. Essa ordem fica fixa no método
 * handle(). Cada subclasse só informa como ler os dados (parse), quais regras
 * validar (validate), como gravar (persist) e o nome usado na resposta
 * (entityKey).
 *
 * Por que existe: as rotas POST de goals e team repetiam esse mesmo processo,
 * copiado à mão em cada arquivo. É um caso diferente do ApiResourceLoader: lá
 * o objetivo é ler dados de fora, aqui é validar antes de gravar.
 */
export abstract class ValidatedCreateHandler<TInput, TEntity> {
  /** Passo variável 1: como ler os dados enviados na requisição. */
  protected abstract parse(body: Record<string, unknown>): TInput;

  /** Passo variável 2: quais regras validar. Devolve um objeto com o nome do campo e a mensagem de erro. */
  protected abstract validate(input: TInput): Record<string, string>;

  /** Passo variável 3: como gravar no banco depois de validado. */
  protected abstract persist(input: TInput): Promise<TEntity>;

  /** Passo variável 4: o nome da chave na resposta, por exemplo { goal: ... } ou { member: ... }. */
  protected abstract entityKey(): string;

  /** Método-modelo: lê, valida, grava e responde, sempre nessa ordem. */
  async handle(request: Request): Promise<Response> {
    const body = await request.json();
    const input = this.parse(body);

    const errors = this.validate(input);
    if (Object.keys(errors).length) {
      return Response.json({ errors }, { status: 400 });
    }

    const entity = await this.persist(input);
    return Response.json({ [this.entityKey()]: entity });
  }
}
