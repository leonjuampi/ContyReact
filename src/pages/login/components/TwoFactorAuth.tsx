
import { useState, useRef, useEffect } from 'react';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';

interface TwoFactorAuthProps {
  onSubmit: (code: string) => void;
  onBack: () => void;
  loading?: boolean;
  error?: string;
}

export default function TwoFactorAuth({ onSubmit, onBack, loading = false, error }: TwoFactorAuthProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!useRecoveryCode && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [useRecoveryCode]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (useRecoveryCode) {
      if (recoveryCode.trim()) {
        onSubmit(recoveryCode.trim());
      }
    } else {
      const fullCode = code.join('');
      if (fullCode.length === 6) {
        onSubmit(fullCode);
      }
    }
  };

  const isFormValid = useRecoveryCode ? recoveryCode.trim().length > 0 : code.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-shield-check-line text-xl text-gray-600 dark:text-gray-400"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verificación en Dos Pasos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {useRecoveryCode 
                ? 'Ingresa tu código de recuperación'
                : 'Ingresa el código de 6 dígitos de tu aplicación de autenticación'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!useRecoveryCode ? (
              /* Inputs de 6 dígitos */
              <div className="flex space-x-3 justify-center">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                ))}
              </div>
            ) : (
              /* Input código de recuperación */
              <div>
                <label htmlFor="recovery-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código de Recuperación
                </label>
                <input
                  id="recovery-code"
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-sm"
                  placeholder="Ingresa tu código de recuperación"
                  autoFocus
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="text-center">
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="space-y-3">
              <Button
                type="submit"
                fullWidth
                disabled={!isFormValid || loading}
                className="py-3"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                    <span>Verificando...</span>
                  </div>
                ) : (
                  'Verificar'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setUseRecoveryCode(!useRecoveryCode)}
                className="py-3"
              >
                {useRecoveryCode ? 'Usar código de autenticación' : 'Usar código de recuperación'}
              </Button>

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={onBack}
                className="py-3"
              >
                Volver al login
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
