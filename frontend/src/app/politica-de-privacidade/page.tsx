import DocumentoLegal from '@/components/DocumentoLegal';
import documentos from '@/conteudo/documentos-legais.json';
import { privacidade } from '@/conteudo/textosLegais';
export const metadata = { title: 'Política de Privacidade | Eloserv' };
export default function Pagina() { return <DocumentoLegal titulo="Política de Privacidade" versao={documentos.versao_privacidade} secoes={privacidade} />; }
