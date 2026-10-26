'use client';

/**
 * Confirmações da aplicação (US23), sem bloquear a execução do JavaScript.
 * React 18: estado, referências e ciclo de vida do diálogo.
 * Documentação oficial: https://react.dev/reference/react
 * HTML dialog: modal no DOM, foco contido e conteúdo de fundo inativo.
 * Documentação: https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/dialog
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react';

type Opcoes = { mensagem: string; titulo?: string; confirmar?: string };

export default function useConfirmacao() {
  const [opcoes, setOpcoes] = useState<Opcoes | null>(null);
  const elemento = useRef<HTMLDialogElement>(null);
  const cancelar = useRef<HTMLButtonElement>(null);
  const resposta = useRef<((valor: boolean) => void) | null>(null);
  const focoAnterior = useRef<HTMLElement | null>(null);
  const tituloId = useId();
  const mensagemId = useId();

  const finalizar = useCallback((valor: boolean) => {
    const resolver = resposta.current;
    resposta.current = null;
    elemento.current?.close();
    setOpcoes(null);
    focoAnterior.current?.focus();
    resolver?.(valor);
  }, []);

  const confirmar = useCallback((dados: Opcoes): Promise<boolean> => {
    // Impede que um segundo pedido substitua uma confirmação ainda pendente.
    if (resposta.current) return Promise.resolve(false);
    focoAnterior.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return new Promise(resolve => {
      resposta.current = resolve;
      setOpcoes(dados);
    });
  }, []);

  useEffect(() => {
    if (opcoes && elemento.current && !elemento.current.open) {
      elemento.current.showModal();
      cancelar.current?.focus();
    }
  }, [opcoes]);

  useEffect(() => () => {
    resposta.current?.(false);
    resposta.current = null;
    focoAnterior.current?.focus();
  }, []);

  const dialogo = (
    <dialog ref={elemento} className="confirmacao-dialogo"
      aria-labelledby={tituloId} aria-describedby={mensagemId}
      onCancel={evento => { evento.preventDefault(); finalizar(false); }}
      onClose={() => { if (!elemento.current?.open && resposta.current) finalizar(false); }}>
      <h2 id={tituloId}>{opcoes?.titulo || 'Confirmar ação'}</h2>
      <p id={mensagemId}>{opcoes?.mensagem}</p>
      <div className="confirmacao-acoes">
        <button ref={cancelar} type="button" onClick={() => finalizar(false)}>Voltar sem alterar</button>
        <button type="button" className="confirmacao-principal" onClick={() => finalizar(true)}>
          {opcoes?.confirmar || 'Confirmar'}
        </button>
      </div>
    </dialog>
  );
  return { confirmar, dialogo };
}
