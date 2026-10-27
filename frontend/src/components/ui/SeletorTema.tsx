'use client';

/**
 * @file SeletorTema.tsx
 * @description Seletor de tema (US42): Automático, Claro ou Escuro, no menu da conta, no rodapé e no
 * login. São botões de rádio de verdade, então o teclado funciona como em qualquer grupo de opções
 * (Tab entra no grupo, as setas trocam a opção). Os ícones têm o nome escondido para leitores de
 * tela, e o tema escolhido aparece por extenso ao lado de "Tema", sem depender só do ícone.
 * A variante `compacto` (rodapé e login) põe o rótulo e os botões na mesma linha.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. React (^18.3.1): estado da opção marcada e ouvinte do evento de troca.
 *    Doc Oficial: https://react.dev/
 * 2. Lucide React (^0.383.0): ícones de monitor, sol e lua.
 *    Doc Oficial: https://lucide.dev/
 */

import React, { useEffect, useId, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { EVENTO_TEMA, escolherTema, lerPreferencia, type PreferenciaTema } from '@/utils/tema';

const OPCOES: { valor: PreferenciaTema; rotulo: string; Icone: typeof Sun }[] = [
  { valor: 'automatico', rotulo: 'Automático', Icone: Monitor },
  { valor: 'claro', rotulo: 'Claro', Icone: Sun },
  { valor: 'escuro', rotulo: 'Escuro', Icone: Moon },
];

export default function SeletorTema({ compacto = false }: { compacto?: boolean }) {
  const nomeGrupo = useId();
  // Começa em "Automático" no servidor e lê a escolha salva ao montar, sem divergir na hidratação.
  const [preferencia, setPreferencia] = useState<PreferenciaTema>('automatico');

  useEffect(() => {
    setPreferencia(lerPreferencia());
    function mudou(e: Event) {
      setPreferencia((e as CustomEvent<PreferenciaTema>).detail);
    }
    window.addEventListener(EVENTO_TEMA, mudou);
    return () => window.removeEventListener(EVENTO_TEMA, mudou);
  }, []);

  const atual = OPCOES.find((o) => o.valor === preferencia) ?? OPCOES[0];

  return (
    <fieldset className={compacto ? 'seletor-tema compacto' : 'seletor-tema'}>
      <legend className="sr-only">Tema da interface</legend>
      <span className="seletor-tema-legenda" aria-hidden="true">
        Tema: <strong>{atual.rotulo}</strong>{preferencia === 'automatico' && !compacto && ' (segue o sistema)'}
      </span>
      <div className="seletor-tema-opcoes">
        {OPCOES.map(({ valor, rotulo, Icone }) => {
          const nome = valor === 'automatico' ? 'Automático, segue o sistema' : rotulo;
          return (
            <label key={valor} className="seletor-tema-opcao" title={nome}>
              {/* aria-label garante o nome falado, sem depender do texto escondido do rótulo. */}
              <input
                type="radio" name={nomeGrupo} value={valor} className="sr-only" aria-label={nome}
                checked={preferencia === valor}
                onChange={() => { setPreferencia(valor); escolherTema(valor); }}
              />
              <Icone size={16} aria-hidden="true" />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
