export function PieInstitucional() {
  return (
    <footer className="pie-institucional">
      <div className="pie-institucional__contenido">
        <div className="pie-institucional__grupo">
          <div className="pie-institucional__etiqueta">Financiado por</div>
          <div className="pie-institucional__logos">
            <img src="/logos/aics.png" alt="Agenzia Italiana per la Cooperazione allo Sviluppo" />
            <img src="/logos/ambasciata.jpg" alt="Ambasciata d'Italia" />
          </div>
        </div>

        <div className="pie-institucional__grupo">
          <div className="pie-institucional__etiqueta">Ejecutado por</div>
          <div className="pie-institucional__logos">
            <img src="/logos/coopi.png" alt="COOPI - Cooperazione Internazionale" />
            <img src="/logos/albero-della-vita.png" alt="l'Albero della Vita" />
            <img src="/logos/hias.png" alt="HIAS Colombia" />
            <img src="/logos/humanity-inclusion.png" alt="Humanity & Inclusion" />
          </div>
        </div>
      </div>
    </footer>
  );
}
