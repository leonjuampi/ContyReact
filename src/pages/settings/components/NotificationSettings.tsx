import { useState } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  channels: string[];
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  event: string;
}

export default function NotificationSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  
  const [notifications, setNotifications] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'Nueva venta',
      description: 'Notificar cuando se registre una nueva venta',
      enabled: true,
      channels: ['email', 'webhook']
    },
    {
      id: '2',
      name: 'Stock bajo',
      description: 'Alertar cuando un producto esté por debajo del mínimo',
      enabled: true,
      channels: ['email', 'push']
    },
    {
      id: '3',
      name: 'Presupuesto enviado',
      description: 'Confirmar cuando se envíe un presupuesto al cliente',
      enabled: false,
      channels: ['email']
    },
    {
      id: '4',
      name: 'Presupuesto visto',
      description: 'Notificar cuando el cliente abra el presupuesto',
      enabled: true,
      channels: ['email', 'push']
    },
    {
      id: '5',
      name: 'Presupuesto aceptado',
      description: 'Alertar cuando un cliente acepte un presupuesto',
      enabled: true,
      channels: ['email', 'webhook', 'push']
    }
  ]);

  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Presupuesto enviado',
      subject: 'Tu presupuesto #{{nro}} está listo',
      content: `Hola {{cliente}},

Te enviamos tu presupuesto #{{nro}} por un total de {{total}}.

Puedes revisarlo y aceptarlo desde el siguiente enlace:
{{enlace}}

¡Gracias por elegirnos!

Saludos,
Equipo de ventas`,
      event: 'presupuesto_enviado'
    },
    {
      id: '2',
      name: 'Venta confirmada',
      subject: 'Compra confirmada #{{nro}}',
      content: `Estimado/a {{cliente}},

Tu compra #{{nro}} por {{total}} ha sido confirmada exitosamente.

Detalles de la compra:
- Número: {{nro}}
- Total: {{total}}
- Fecha: {{fecha}}

Gracias por tu compra.

Atentamente,
Equipo de Conty`,
      event: 'venta_confirmada'
    }
  ]);

  const toggleNotification = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
    ));
  };

  const toggleChannel = (notifId: string, channel: string) => {
    setNotifications(prev => prev.map(notif => {
      if (notif.id === notifId) {
        const channels = notif.channels.includes(channel)
          ? notif.channels.filter(c => c !== channel)
          : [...notif.channels, channel];
        return { ...notif, channels };
      }
      return notif;
    }));
  };

  const updateTemplate = (id: string, field: string, value: string) => {
    setTemplates(prev => prev.map(template =>
      template.id === id ? { ...template, [field]: value } : template
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const testTemplate = (template: EmailTemplate) => {
    // Preview with sample data
    const sampleData = {
      cliente: 'Juan Pérez',
      nro: 'B-0001-00000123',
      total: '$15,750.00',
      fecha: new Date().toLocaleDateString(),
      enlace: 'https://conty.app/presupuesto/123'
    };
    
    let preview = template.content;
    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    alert(`Vista previa del template:\n\nAsunto: ${template.subject.replace(/{{nro}}/g, sampleData.nro)}\n\n${preview}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notificaciones & Plantillas</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configura alertas y mensajes automáticos</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="whitespace-nowrap"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-loader-4-line animate-spin"></i>
              </div>
              Guardando...
            </>
          ) : (
            <>
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-save-line"></i>
              </div>
              Guardar cambios
            </>
          )}
        </Button>
      </div>

      {/* Notification Rules */}
      <Card title="Reglas de Notificación" icon="ri-notification-3-line">
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <button
                    onClick={() => toggleNotification(notification.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                      notification.enabled ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform duration-200 ${
                        notification.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <h4 className="ml-3 font-medium text-gray-900 dark:text-white">{notification.name}</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{notification.description}</p>
                
                {notification.enabled && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Canales:</span>
                    {['email', 'push', 'webhook'].map((channel) => (
                      <button
                        key={channel}
                        onClick={() => toggleChannel(notification.id, channel)}
                        className={`px-2 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
                          notification.channels.includes(channel)
                            ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="w-3 h-3 flex items-center justify-center mr-1">
                          <i className={`ri-${channel === 'email' ? 'mail' : channel === 'push' ? 'notification' : 'webhook'}-line`}></i>
                        </div>
                        {channel}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Email Templates */}
      <Card title="Plantillas de Email" icon="ri-mail-line">
        <div className="space-y-6">
          {templates.map((template) => (
            <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testTemplate(template)}
                  >
                    <div className="w-4 h-4 flex items-center justify-center mr-1">
                      <i className="ri-eye-line"></i>
                    </div>
                    Vista previa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTemplate(activeTemplate === template.id ? null : template.id)}
                  >
                    <div className="w-4 h-4 flex items-center justify-center mr-1">
                      <i className={`ri-${activeTemplate === template.id ? 'arrow-up' : 'arrow-down'}-s-line`}></i>
                    </div>
                    {activeTemplate === template.id ? 'Contraer' : 'Editar'}
                  </Button>
                </div>
              </div>

              {activeTemplate === template.id && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Asunto
                    </label>
                    <input
                      type="text"
                      value={template.subject}
                      onChange={(e) => updateTemplate(template.id, 'subject', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Asunto del email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contenido
                    </label>
                    <textarea
                      value={template.content}
                      onChange={(e) => updateTemplate(template.id, 'content', e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                      placeholder="Contenido del email..."
                    />
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <strong>Placeholders disponibles:</strong> {{cliente}}, {{nro}}, {{total}}, {{fecha}}, {{enlace}}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}