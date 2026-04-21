import { useState } from 'react';
import { useTheme } from '../config/theme';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ = () => {
  const theme = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!theme) {
    return null;
  }

  const companyName = theme.companyName;
  const contactEmail = theme.contact.email;
  const contactPhone = theme.contact.phone;
  const primaryColor = theme.colors.primary;

  const faqItems: FAQItem[] = [
    {
      question: '¿Qué es Placetopay?',
      answer: `Placetopay es la plataforma de pagos electrónicos que usa ${companyName} para procesar en línea las transacciones generadas en la tienda virtual con las formas de pago habilitadas para tal fin.`,
    },
    {
      question: '¿Cómo puedo pagar?',
      answer: `En la tienda virtual de ${companyName} usted podrá realizar su pago con los medios habilitados para tal fin. Podrá pagar a través de tarjetas de crédito y débito.`,
    },
    {
      question: '¿Es seguro ingresar mis datos bancarios en este sitio web?',
      answer: `Para proteger tus datos, ${companyName} delega en Placetopay la captura de la información sensible. Nuestra plataforma de pagos cumple con los más altos estándares exigidos por la norma internacional PCI DSS de seguridad en transacciones con tarjeta de crédito. Además tiene certificado de seguridad SSL expedido por GeoTrust, una compañía Verisign, el cual garantiza comunicaciones seguras mediante la encriptación de todos los datos hacia y desde el sitio; de esta manera te podrás sentir seguro a la hora de ingresar la información de tu tarjeta.\n\nDurante el proceso de pago, en el navegador se muestra el nombre de la organización autenticada, la autoridad que lo certifica y la barra de dirección cambia a color verde. Estas características son visibles de inmediato y dan garantía y confianza para completar la transacción en Placetopay.\n\nPlacetopay también cuenta con el monitoreo constante de McAfee Secure y la firma de mensajes electrónicos con Certicámara.`,
    },
    {
      question: '¿Puedo realizar el pago cualquier día y a cualquier hora?',
      answer: `Sí, en ${companyName} podrás realizar tus compras en línea los 7 días de la semana, las 24 horas del día a sólo un clic de distancia.`,
    },
    {
      question: '¿Puedo cambiar la forma de pago?',
      answer: 'Si aún no has finalizado tu pago, podrás volver al paso inicial y elegir la forma de pago que prefieras. Una vez finalizada la compra no es posible cambiar la forma de pago.',
    },
    {
      question: '¿Pagar electrónicamente tiene algún valor adicional para mí como comprador?',
      answer: 'No, los pagos electrónicos realizados a través de Placetopay no generan costos adicionales para el comprador.',
    },
    {
      question: '¿Qué debo hacer si mi transacción no concluyó?',
      answer: `En primera instancia, revisá si llegó un email de confirmación de la transacción a la cuenta de correo electrónico inscrita en el momento de realizar el pago. En caso de no haberlo recibido, deberás contactarnos al correo electrónico ${contactEmail} o al teléfono ${contactPhone} para confirmar el estado de la transacción.`,
    },
    {
      question: '¿Qué debo hacer si no recibí el comprobante de pago?',
      answer: `Por cada transacción aprobada a través de Placetopay, recibirás un comprobante del pago con la referencia de compra en la dirección de correo electrónico que indicaste al momento de pagar.\n\nSi no lo recibís, podés contactarnos al correo electrónico ${contactEmail} o al teléfono ${contactPhone} para solicitar el reenvío del comprobante a la misma dirección de correo electrónico registrada al momento de pagar.`,
    },
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: primaryColor }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Preguntas Frecuentes</h1>
          <p className="mt-3 text-lg text-gray-500">Pagos electrónicos con Placetopay</p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-sm border transition-all duration-200 ${
                  isOpen ? 'border-gray-300 shadow-md' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between px-7 py-5 sm:px-8 sm:py-6 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl"
                >
                  <span className="text-base sm:text-lg font-semibold text-gray-900 pr-4">
                    {item.question}
                  </span>
                  <span
                    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 ${
                      isOpen ? 'text-white' : 'text-gray-400 bg-gray-100'
                    }`}
                    style={isOpen ? { backgroundColor: primaryColor } : undefined}
                  >
                    <svg
                      className={`w-4 h-4 transform transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-7 pb-6 sm:px-8 sm:pb-7 pt-0">
                    <div className="border-t border-gray-100 pt-5">
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer help text */}
        <div className="mt-12 text-center">
          <p className="text-gray-500">
            ¿Tenés otra consulta? Escribinos a{' '}
            <a
              href={`mailto:${contactEmail}`}
              className="font-medium hover:underline"
              style={{ color: primaryColor }}
            >
              {contactEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
