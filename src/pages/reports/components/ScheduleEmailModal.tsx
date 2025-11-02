
import { useState } from 'react';
import Button from '../../../components/base/Button';

interface ScheduleEmailModalProps {
  onClose: () => void;
  onSchedule: (config: any) => void;
}

export default function ScheduleEmailModal({ onClose, onSchedule }: ScheduleEmailModalProps) {
  const [frequency, setFrequency] = useState('semanal');
  const [day, setDay] = useState('lunes');
  const [time, setTime] = useState('09:00');
  const [format, setFormat] = useState('PDF');
  const [subject, setSubject] = useState('Reporte Semanal de Ventas');
  const [recipients, setRecipients] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(false);

  const handleSchedule = () => {
    const config = {
      frequency,
      day,
      time,
      format,
      subject,
      recipients: recipients.split(',').map(email => email.trim()),
      includeCharts,
      includeDetails
    };
    onSchedule(config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Programar Envío por Email
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-close-line text-xl"></i>
            </div>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Frecuencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Frecuencia
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['semanal', 'mensual'].map((freq) => (
                <label key={freq} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="frequency"
                    value={freq}
                    checked={frequency === freq}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-4 h-4 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:ring-black dark:focus:ring-white"
                  />
                  <span className="text-gray-900 dark:text-white capitalize">{freq}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Día y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {frequency === 'semanal' ? 'Día de la semana' : 'Día del mes'}
              </label>
              {frequency === 'semanal' ? (
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="lunes">Lunes</option>
                  <option value="martes">Martes</option>
                  <option value="miercoles">Miércoles</option>
                  <option value="jueves">Jueves</option>
                  <option value="viernes">Viernes</option>
                  <option value="sabado">Sábado</option>
                  <option value="domingo">Domingo</option>
                </select>
              ) : (
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d.toString()}>{d}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hora
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Formato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Formato
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['PDF', 'CSV'].map((fmt) => (
                <label key={fmt} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={fmt}
                    checked={format === fmt}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-4 h-4 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:ring-black dark:focus:ring-white"
                  />
                  <span className="text-gray-900 dark:text-white">{fmt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Incluir en el reporte
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="w-4 h-4 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:ring-black dark:focus:ring-white"
                />
                <span className="text-gray-900 dark:text-white">Gráficos y KPIs</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDetails}
                  onChange={(e) => setIncludeDetails(e.target.checked)}
                  className="w-4 h-4 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:ring-black dark:focus:ring-white"
                />
                <span className="text-gray-900 dark:text-white">Detalle de transacciones</span>
              </label>
            </div>
          </div>

          {/* Asunto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Asunto del email
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Reporte Semanal de Ventas"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Destinatarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Destinatarios
            </label>
            <textarea
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="email1@empresa.com, email2@empresa.com"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Separar múltiples emails con comas
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!recipients.trim()}
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-mail-send-line"></i>
            </div>
            Programar
          </Button>
        </div>
      </div>
    </div>
  );
}
