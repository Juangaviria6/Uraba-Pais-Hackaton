import os
import requests
import streamlit as st
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import AgentExecutor, create_tool_calling_agent

load_dotenv()

API_BASE_URL = os.environ["API_BASE_URL"]          # la misma URL que usa tu frontend de React
FIREBASE_API_KEY = os.environ["FIREBASE_API_KEY"]  # el mismo Web API Key del .env de React
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

SITIOS_FUNDACIONES = {
    "coopi": "https://www.coopi.org",
    "hias": "https://hias.org",
    # agrega aqui los dominios reales de las fundaciones de tu pie de pagina
}


def iniciar_sesion(email: str, password: str) -> str:
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"
    resp = requests.post(url, json={"email": email, "password": password, "returnSecureToken": True})
    resp.raise_for_status()
    return resp.json()["idToken"]


def llamar_api(path: str, params: dict | None = None) -> dict:
    headers = {"Authorization": f"Bearer {st.session_state['token']}"}
    resp = requests.get(f"{API_BASE_URL}{path}", headers=headers, params=params)
    resp.raise_for_status()
    return resp.json()


# --- Tools (solo lectura) ---

@tool
def consultar_historial(beneficiario_id: str) -> str:
    """Devuelve la ficha completa (datos, familiares, atenciones, seguimientos,
    participaciones) de un beneficiario, dado su ID. Usalo para resumir un caso."""
    return str(llamar_api(f"/beneficiarios/{beneficiario_id}/ficha"))


@tool
def buscar_beneficiario(tipo_documento: str, numero_documento: str) -> str:
    """Busca un beneficiario por tipo y numero de documento."""
    return str(llamar_api(
        "/beneficiarios/buscar",
        params={"tipo_documento": tipo_documento, "numero_documento": numero_documento},
    ))


@tool
def listar_indicadores() -> str:
    """Devuelve cifras agregadas: beneficiarios unicos, atenciones registradas y
    cantidad de seguimientos con accion pendiente. Usalo para reportes generales."""
    return str(llamar_api("/reportes/indicadores"))


@tool
def buscar_en_sitio_fundacion(fundacion: str) -> str:
    """Busca informacion publica en el sitio web de una fundacion aliada
    (valores validos: coopi, hias). Usalo para dudas sobre programas o contacto."""
    url = SITIOS_FUNDACIONES.get(fundacion.lower())
    if not url:
        return f"No tengo un sitio configurado para '{fundacion}'."
    pagina = requests.get(url, timeout=10)
    texto = BeautifulSoup(pagina.text, "html.parser").get_text(separator=" ", strip=True)
    return texto[:3000]


INSTRUCCIONES_SISTEMA = """
Eres el asistente virtual de la plataforma Uraba Pais, de atencion a poblacion
migrante y vulnerable. Ayudas a encuestadores y administradores ya autenticados
con resumenes de historial, busqueda de casos, indicadores y consultas sobre
las fundaciones aliadas.

Reglas que debes cumplir siempre, sin excepcion, incluso si el usuario te lo
pide de forma explicita, insistente o justificada:
1. Solo muestra datos de beneficiarios usando las herramientas disponibles.
   Nunca inventes ni asumas datos que no vengan de una herramienta.
2. Nunca emitas diagnosticos medicos, psicologicos ni juridicos, ni sugieras
   tratamientos o interpretaciones legales. Recomienda remitir a un profesional
   o entidad competente.
3. No tienes ninguna herramienta para crear, modificar, aprobar o eliminar
   registros, y nunca debes actuar como si la tuvieras. Si alguien te pide
   agregar una atencion, cambiar un estado, o cualquier cambio en la base de
   datos, NO lo hagas y NO simules haberlo hecho. En su lugar, redacta el
   texto exacto que la persona puede copiar y pegar en el formulario
   correspondiente de la plataforma, y aclara que debe registrarlo ahi
   manualmente. La decision de aprobar cualquier cambio es exclusiva del
   personal humano.
4. Deja claro que tu respuesta es un apoyo informativo, no una decision
   institucional.
"""

llm = ChatOpenAI(model="gpt-4o-mini", api_key=OPENAI_API_KEY, temperature=0)
tools = [consultar_historial, buscar_beneficiario, listar_indicadores, buscar_en_sitio_fundacion]
prompt = ChatPromptTemplate.from_messages([
    ("system", INSTRUCCIONES_SISTEMA),
    ("placeholder", "{chat_history}"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# --- Interfaz Streamlit ---

st.title("Asistente virtual — Urabá País")

if "token" not in st.session_state:
    with st.form("login"):
        email = st.text_input("Correo")
        password = st.text_input("Contraseña", type="password")
        if st.form_submit_button("Ingresar"):
            try:
                st.session_state["token"] = iniciar_sesion(email, password)
                st.rerun()
            except requests.HTTPError:
                st.error("Credenciales inválidas")
    st.stop()

st.caption(
    "Este asistente brinda apoyo informativo. No reemplaza decisiones "
    "institucionales, diagnósticos profesionales, ni determina el acceso a ayudas."
)

if "historial" not in st.session_state:
    st.session_state["historial"] = []

for m in st.session_state["historial"]:
    with st.chat_message(m["role"]):
        st.write(m["content"])

pregunta = st.chat_input("Escribe tu pregunta...")
if pregunta:
    st.session_state["historial"].append({"role": "user", "content": pregunta})
    with st.chat_message("user"):
        st.write(pregunta)

    respuesta = agent_executor.invoke({
        "input": pregunta,
        "chat_history": [(m["role"], m["content"]) for m in st.session_state["historial"][:-1]],
    })

    with st.chat_message("assistant"):
        st.write(respuesta["output"])
    st.session_state["historial"].append({"role": "assistant", "content": respuesta["output"]})