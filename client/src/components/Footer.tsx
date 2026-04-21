import { useTheme } from '../config/theme';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  if (!theme) {
    return null;
  }

  return (
    <footer className="bg-gray-900  text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de la empresa */}
          <div className="flex flex-col justify-center text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">{theme.companyName}</h3>
            <p className="text-gray-300 mb-4">
              {theme.description}
            </p>
          </div>
          <div className="flex flex-row justify-between ">
            {/* Contacto */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a
                    href={`mailto:${theme.contact.email}`}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {theme.contact.email}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a
                    href={`tel:${theme.contact.phone}`}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {theme.contact.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Enlaces rápidos */}
            <div >
              <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="text-gray-300 hover:text-white transition-colors">
                    Catálogo
                  </a>
                </li>
                <li>
                  <a href="/cart" className="text-gray-300 hover:text-white transition-colors">
                    Carrito
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-gray-300 hover:text-white transition-colors">
                    Preguntas Frecuentes
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {currentYear} {theme.companyName}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
