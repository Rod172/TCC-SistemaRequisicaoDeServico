import DocumentoLegal from '@/components/DocumentoLegal';
import documentos from '@/conteudo/documentos-legais.json';
import { termos } from '@/conteudo/textosLegais';
export const metadata = { title: 'Termos de Uso | Eloserv' };
export default function Pagina() { return <DocumentoLegal titulo="Termos de Uso" versao={documentos.versao_termos} secoes={termos} />; }
