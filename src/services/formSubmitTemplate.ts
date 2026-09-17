/**
 * TEMPLATE METHOD — exemplo 3 de 3.
 *
 * Define o esqueleto fixo do envio de um formulário no
 * cliente: validar (opcional) → marcar "salvando" → chamar a API → se der
 * erro, traduzir esse erro para algo exibível na tela → desmarcar "salvando".
 * A ordem é sempre a mesma; cada subclasse só diz **o que** validar, **como**
 * salvar e **como** transformar uma falha em algo que o formulário mostra.
 *
 * Por quê: `GoalFormModal` e `WalletFormModal` repetiam o mesmo
 * `try { await onSave(...) } catch { ... } finally { setSaving(false) }`,
 * mudando apenas se havia validação client-side e o formato do erro (um
 * `Record` por campo vs. uma única mensagem). Domínio diferente dos outros
 * dois exemplos: este é sobre o ciclo de vida de um formulário no navegador,
 * não sobre ler dados externos nem sobre persistir no servidor.
 */
export abstract class FormSubmitTemplate<TInput, TError> {
  /** Passo variável opcional: validação client-side. `null` (padrão) = sem validação própria. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected validate(input: TInput): TError | null {
    return null;
  }

  /** Passo variável: como de fato salvar (normalmente delega para uma prop `onSave`). */
  protected abstract save(input: TInput): Promise<void>;

  /** Passo variável: como transformar uma falha de `save` em algo exibível. */
  protected abstract mapError(err: unknown): TError;

  /** Método-modelo: validate → onSaving(true) → save → mapError/finally. Ordem fixa. */
  async submit(input: TInput, onSaving: (saving: boolean) => void): Promise<TError | null> {
    const validationError = this.validate(input);
    if (validationError) return validationError;

    onSaving(true);
    try {
      await this.save(input);
      return null;
    } catch (err) {
      return this.mapError(err);
    } finally {
      onSaving(false);
    }
  }
}

