/**
 * TEMPLATE METHOD — exemplo 2 de 3.
 *
 * Define o esqueleto fixo de uma rota POST de criação:
 * ler o corpo da requisição → validar → (se inválido) responder 400 →
 * persistir → responder com a entidade criada. A ordem desses passos é
 * sempre a mesma; cada subclasse só diz **como** interpretar o corpo,
 * **quais** regras validar e **como** persistir.
 *
 * Por quê: as rotas POST de `goals` e `team` tinham o mesmo formato
 * montar um objeto de erros por campo, devolver 400 se houver algum, senão
 * criar via Prisma e devolver a entidade copiado à mão em cada arquivo.
 * Domínio diferente do `ApiResourceLoader` (que é sobre LER dados vindos de
 * fora): aqui o passo fixo é "validar antes de gravar".
 */
export abstract class ValidatedCreateHandler<TInput, TEntity> {
  /** Passo variável 1: como interpretar o corpo bruto da requisição. */
  protected abstract parse(body: Record<string, unknown>): TInput;

  /** Passo variável 2: quais regras de negócio validar; chave do campo → mensagem. */
  protected abstract validate(input: TInput): Record<string, string>;

  /** Passo variável 3: como persistir o recurso já validado. */
  protected abstract persist(input: TInput): Promise<TEntity>;

  /** Passo variável 4: sob qual chave a entidade criada volta no JSON (`{ goal: ... }`, `{ member: ... }`). */
  protected abstract entityKey(): string;

  /** Método-modelo: a sequência parse → validate → persist → respond não muda entre subclasses. */
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
