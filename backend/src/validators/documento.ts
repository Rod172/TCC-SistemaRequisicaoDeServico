/** Validação local de CPF/CNPJ numéricos, sem consultas externas nem dependências adicionais. */
export function normalizarDocumento(valor: unknown): string {
  if (typeof valor !== 'string' || !/^[0-9.\/\s-]+$/.test(valor)) {
    throw Object.assign(new Error('Documento inválido: informe CPF ou CNPJ numérico.'), { status: 400 });
  }
  return valor.replace(/\D/g, '');
}

function digito(base: string, pesos: number[]): number {
  const resto = [...base].reduce((soma, numero, indice) => soma + Number(numero) * pesos[indice], 0) % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function validarCPF(valor: unknown): boolean {
  try {
    const cpf = normalizarDocumento(valor);
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    const primeiro = digito(cpf.slice(0, 9), [10,9,8,7,6,5,4,3,2]);
    const segundo = digito(cpf.slice(0, 9) + primeiro, [11,10,9,8,7,6,5,4,3,2]);
    return cpf.endsWith(`${primeiro}${segundo}`);
  } catch { return false; }
}

export function validarCNPJ(valor: unknown): boolean {
  try {
    const cnpj = normalizarDocumento(valor);
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
    const primeiro = digito(cnpj.slice(0, 12), [5,4,3,2,9,8,7,6,5,4,3,2]);
    const segundo = digito(cnpj.slice(0, 12) + primeiro, [6,5,4,3,2,9,8,7,6,5,4,3,2]);
    return cnpj.endsWith(`${primeiro}${segundo}`);
  } catch { return false; }
}

export function validarDocumento(valor: unknown, aceitarCnpj = false): string {
  const documento = normalizarDocumento(valor);
  if (!validarCPF(documento) && !(aceitarCnpj && validarCNPJ(documento))) {
    throw Object.assign(new Error(aceitarCnpj ? 'CPF/CNPJ inválido.' : 'CPF inválido.'), { status: 400 });
  }
  return documento;
}
