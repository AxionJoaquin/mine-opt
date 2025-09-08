function Header() {
  try {
    return (
      <header className="bg-[var(--surface-color)] border-b border-[var(--border-color)]" data-name="header" data-file="components/Header.js">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[var(--primary-color)] rounded-lg flex items-center justify-center">
                <div className="icon-truck text-xl text-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                  Optimización CMP Copiapó
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Sistema de optimización de transporte minero
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-[var(--text-secondary)]">
                  Modelo de Programación Lineal
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  © 2025 - Optimización Minera
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  } catch (error) {
    console.error('Header component error:', error);
    return null;
  }
}