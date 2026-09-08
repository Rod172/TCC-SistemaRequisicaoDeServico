"""
Importa Épicos e Histórias de Usuário do historia.md para o Jira Cloud.

Lê as credenciais de scripts/jira/.jira-credentials.json (arquivo local, fora do
git — ver .gitignore) e cria no Jira um Épico (se ainda não existir um com o
mesmo título) e as Histórias de Usuário informadas, extraindo o conteúdo
(Como/Quero/Para que, Critérios de Aceite, Tarefas Técnicas e Story Points da
Matriz MoSCoW) diretamente do historia.md.

Uso:
    python3 importar_historia.py "Épico 10: Administração e Gestão da Plataforma" US27

BIBLIOTECAS UTILIZADAS:
1. urllib (Python nativo): Requisições HTTP para a API REST do Jira Cloud.
   Doc Oficial: https://docs.python.org/3/library/urllib.request.html
2. Jira Cloud REST API v2: Criação de issues (Épico/História).
   Doc Oficial: https://developer.atlassian.com/cloud/jira/platform/rest/v2/
"""

import base64
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent.parent
HISTORIA_MD = RAIZ / "historia.md"
CREDENCIAIS = Path(__file__).resolve().parent / ".jira-credentials.json"


def carregar_credenciais():
    if not CREDENCIAIS.exists():
        sys.exit(
            f"Arquivo de credenciais não encontrado: {CREDENCIAIS}\n"
            "Crie um scripts/jira/.jira-credentials.json com base_url, email, api_token e project_key."
        )
    return json.loads(CREDENCIAIS.read_text(encoding="utf-8"))


def requisitar(creds, metodo, caminho, corpo=None, versao="2"):
    auth = base64.b64encode(f"{creds['email']}:{creds['api_token']}".encode()).decode()
    url = f"{creds['base_url']}/rest/api/{versao}{caminho}"
    dados = json.dumps(corpo).encode("utf-8") if corpo is not None else None
    req = urllib.request.Request(url, data=dados, method=metodo, headers={
        "Authorization": f"Basic {auth}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def extrair_secao(titulo_regex, texto):
    m = re.search(titulo_regex, texto)
    return m.group(0) if m else None


def parsear_historia(codigo_us, texto_historia):
    """Extrai o bloco de uma US (### US27 - Título ... até o próximo --- ou ##)."""
    padrao = rf"### {codigo_us} - (.+?)\n(.*?)(?=\n---|\n## )"
    m = re.search(padrao, texto_historia, re.S)
    if not m:
        sys.exit(f"Não encontrei {codigo_us} no historia.md.")
    titulo = m.group(1).strip()
    corpo = m.group(2)

    como_quero_para = re.search(r"\*\*Como\*\*(.+?)\*\*Para que\*\*(.+?)\.", corpo, re.S)
    descricao_narrativa = corpo.split("#### Critérios de Aceite:")[0].strip()

    criterios = re.findall(r"- \[ \] (.+)", corpo)
    tarefas = re.findall(r"- \*\*(.+?)\*\*: (.+)", corpo)

    linha_moscow_m = re.search(rf"\| US{codigo_us[2:]} \|(.+)\|", texto_historia)
    prioridade, story_points = None, None
    if linha_moscow_m:
        celulas = [c.strip() for c in linha_moscow_m.group(1).split("|")]
        # célula[0]=título, célula[1]=prioridade MoSCoW, célula[2]=story points
        if len(celulas) >= 3:
            prioridade = celulas[1]
            try:
                story_points = int(celulas[2])
            except ValueError:
                story_points = None

    return {
        "codigo": codigo_us,
        "titulo": titulo,
        "descricao_narrativa": descricao_narrativa,
        "criterios": criterios,
        "tarefas": tarefas,
        "prioridade": prioridade,
        "story_points": story_points,
    }


def montar_descricao_jira(historia):
    linhas = []
    if historia["prioridade"]:
        linhas.append(f"*Prioridade MoSCoW*: {historia['prioridade']}")
    if historia["story_points"] is not None:
        linhas.append(f"*Estimativa*: {historia['story_points']} Story Points")
    if linhas:
        linhas.append("")

    linhas += [historia["descricao_narrativa"], "", "*Critérios de Aceite:*"]
    linhas += [f"* {c}" for c in historia["criterios"]]
    linhas += ["", "*Tarefas Técnicas:*"]
    linhas += [f"* *{camada}*: {tarefa}" for camada, tarefa in historia["tarefas"]]
    return "\n".join(linhas)


def buscar_epico_existente(creds, titulo_epico):
    """Usa a API de busca atual (POST /rest/api/3/search/jql) — a antiga
    GET /rest/api/2/search foi descontinuada pela Atlassian e retorna 410 Gone."""
    jql = f'project = {creds["project_key"]} AND issuetype = Epic AND summary ~ "{titulo_epico}"'
    try:
        resultado = requisitar(creds, "POST", "/search/jql", {"jql": jql, "maxResults": 1}, versao="3")
    except urllib.error.HTTPError:
        return None
    issues = resultado.get("issues", [])
    return issues[0]["key"] if issues else None


def criar_epico(creds, titulo_epico):
    corpo = {
        "fields": {
            "project": {"key": creds["project_key"]},
            "summary": titulo_epico,
            "issuetype": {"name": "Epic"},
        }
    }
    criado = requisitar(creds, "POST", "/issue", corpo)
    return criado["key"]


def criar_historia(creds, epico_key, historia):
    corpo = {
        "fields": {
            "project": {"key": creds["project_key"]},
            "summary": f"{historia['codigo']} - {historia['titulo']}",
            "description": montar_descricao_jira(historia),
            "issuetype": {"name": "História"},
            # Projeto "team-managed": o vínculo com o Épico é feito via "parent", não via
            # campo customizado "Epic Link" (confirmado via GET /rest/api/2/field neste Jira).
            "parent": {"key": epico_key},
        }
    }
    if historia["story_points"] is not None:
        corpo["fields"]["customfield_10016"] = historia["story_points"]  # "Story point estimate"

    criado = requisitar(creds, "POST", "/issue", corpo)
    return criado["key"]


def main():
    if len(sys.argv) < 3:
        sys.exit('Uso: python3 importar_historia.py "Título do Épico" US27 [US28 ...]')

    titulo_epico = sys.argv[1]
    codigos_us = sys.argv[2:]

    creds = carregar_credenciais()
    texto_historia = HISTORIA_MD.read_text(encoding="utf-8")

    epico_key = buscar_epico_existente(creds, titulo_epico)
    if epico_key:
        print(f"Épico já existe: [{epico_key}] {titulo_epico}")
    else:
        epico_key = criar_epico(creds, titulo_epico)
        print(f"Épico criado: [{epico_key}] {titulo_epico}")

    for codigo in codigos_us:
        historia = parsear_historia(codigo, texto_historia)
        chave = criar_historia(creds, epico_key, historia)
        pts = f"{historia['story_points']} pts" if historia["story_points"] else "sem pts"
        print(f"  -> [{chave}] {historia['codigo']} - {historia['titulo']} ({pts})")


if __name__ == "__main__":
    main()
