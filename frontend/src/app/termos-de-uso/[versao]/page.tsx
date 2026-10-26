/** Next.js 14: rota estática por versão; nunca substitui silenciosamente um documento aceito.
 * https://nextjs.org/docs/14/app/api-reference/functions/generate-static-params */
import { notFound } from 'next/navigation';
import DocumentoLegal from '@/components/DocumentoLegal';
import { publicacoes } from '@/conteudo/textosLegais';
export const dynamicParams = false;
export function generateStaticParams() {return Object.keys(publicacoes).map(versao=>({versao}));}
export default function Pagina({params}:{params:{versao:string}}) {
 const publicado=publicacoes[params.versao];if(!publicado) notFound();
 return <DocumentoLegal titulo="Termos de Uso" versao={params.versao} secoes={publicado.termos} dadosPublicacao={publicado.documentos}/>;
}
