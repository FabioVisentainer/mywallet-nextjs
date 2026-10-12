/**
 * TEMPLATE METHOD (exemplo 3 de 3)
 *
 * Classe base para o envio de formulários na tela. O processo é sempre o
 * mesmo: validar (se a subclasse quiser), marcar o botão como salvando, chamar
 * a API, transformar um possível erro em algo que a tela consiga mostrar e, no
 * fim, desmarcar o salvando. Essa ordem fica fixa no método submit(). Cada
 * subclasse só informa o que validar, como salvar e como mostrar o erro.
 *
 * Por que existe: GoalFormModal e WalletFormModal repetiam o mesmo try, catch
 * e finally em volta do onSave, mudando só se tinha validação na tela e o
 * formato do erro (um erro por campo ou uma mensagem única). É um caso
 * diferente dos outros dois exemplos: aqui o foco é o ciclo de um formulário
 * no navegador.
 */
export abstract class FormSubmitTemplate<TInput, TError> {
  /** Hook (opcional): validação na tela. Por padrão devolve null, ou seja, não valida nada. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected validate(input: TInput): TError | null {
    return null;
  }

  /** Passo variável: como salvar de fato (normalmente chama a prop onSave). */
  protected abstract save(input: TInput): Promise<void>;

  /** Passo variável: como transformar um erro do save em algo que a tela mostra. */
  protected abstract mapError(err: unknown): TError;

  /** Método-modelo: valida, marca salvando, salva, trata o erro e desmarca salvando, sempre nessa ordem. */
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

