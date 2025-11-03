import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import { useAuth } from '../../contexts/AuthContext'; // <-- Lógica de Auth

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // <-- Lógica de Auth

  const [formData, setFormData] = useState({
    username: '', // <-- Campo 'username' para el backend
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Validación para 'username'
  const validateUsername = (username: string) => {
    return username.trim().length > 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'username') {
      if (!validateUsername(value)) {
        setErrors((prev) => ({
          ...prev,
          username: 'El usuario es requerido',
        }));
      } else {
        setErrors((prev) => ({ ...prev, username: '' }));
      }
    }

    if (field === 'password') {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          password: 'La contraseña es requerida',
        }));
      } else {
        setErrors((prev) => ({ ...prev, password: '' }));
      }
    }
  };

  const isFormValid = () => {
    return (
      formData.username &&
      formData.password &&
      validateUsername(formData.username) &&
      !errors.username &&
      !errors.password
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    setGeneralError('');

    try {
      // --- CONEXIÓN AL BACKEND ---
      // Asegúrate de que tu backend esté corriendo y sea accesible
      // Si corre en otro puerto (ej. 3001), necesitarás configurar un proxy en Vite
      // o usar la URL completa (ej. 'http://localhost:3001/api/auth/login')
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Envía { username, password }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Usuario o contraseña incorrectos');
      }

      // Login exitoso: guardamos en el contexto
      login(data.token, data.user);
      navigate('/'); // Redirigimos al dashboard

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un problema inesperado';
      setGeneralError(message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Login con Google');
  };

  const handleForgotPassword = () => {
    console.log('Recuperar contraseña');
  };

  // --- ❗️ ESTE ES EL JSX ORIGINAL QUE DEBE ESTAR ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Toast de error */}
      {showToast && generalError && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <i className="ri-error-warning-line text-red-600 dark:text-red-400"></i>
            <span className="text-red-800 dark:text-red-200 text-sm font-medium">
              {generalError}
            </span>
          </div>
        </div>
      )}

      {/* Columna izquierda - Formulario */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card className="p-8">
            {/* Logo y subtítulo */}
            <div className="text-center mb-8">
              <h1
                className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                style={{ fontFamily: '"Pacifico", serif' }}
              >
                Conty
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Gestión Financiera Inteligente
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Usuario (Modificado de 'email' a 'username') */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-user-line text-gray-400 text-sm"></i>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-sm"
                    placeholder="tu_usuario"
                    aria-describedby={errors.username ? 'username-error' : undefined}
                  />
                </div>
                {errors.username && (
                  <p
                    id="username-error"
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-lock-line text-gray-400 text-sm"></i>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-sm"
                    placeholder="Tu contraseña"
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  >
                    <i
                      className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm`}
                    ></i>
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Recordarme */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-black dark:text-white border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Recordarme 30 días
                </label>
              </div>

              {/* Botón Ingresar */}
              <Button
                type="submit"
                fullWidth
                disabled={!isFormValid() || loading}
                className="py-3"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                    <span>Ingresando...</span>
                  </div>
                ) : (
                  'Ingresar'
                )}
              </Button>

              {/* Olvidé contraseña */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón Google */}
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={handleGoogleLogin}
                className="py-3"
              >
                <div className="flex items-center space-x-2">
                  <i className="ri-google-line text-sm"></i>
                  <span>Continuar con Google</span>
                </div>
              </Button>
            </form>
          </Card>

          {/* Footer con links */}
          <div className="mt-8 text-center space-x-4">
            <a
              href="#"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            >
              Términos de Servicio
            </a>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <a
              href="#"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            >
              Política de Privacidad
            </a>
          </div>
        </div>
      </div>

      {/* Columna derecha - Ilustración (solo desktop) */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gray-100 dark:bg-gray-800">
        <div className="max-w-md text-center">
          <img
            src="https://readdy.ai/api/search-image?query=Modern%20minimalist%20dashboard%20interface%20mockup%20on%20laptop%20screen%2C%20clean%20white%20and%20gray%20design%2C%20financial%20charts%20and%20metrics%2C%20professional%20business%20%20software%20interface%2C%20simple%20geometric%20shapes%2C%20high%20contrast%20black%20and%20white%20design%2C%20sleek%20modern%20aesthetic%2C%20technology%20and%20finance%20theme&width=600&height=400&seq=login-dashboard-mockup&orientation=landscape"
            alt="Dashboard Preview"
            className="rounded-lg shadow-lg mb-6 object-cover w-full h-64"
          />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Todo tu negocio en un solo lugar
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Gestiona ventas, stock, clientes y reportes con la plataforma más
            intuitiva para tu punto de venta.
          </p>
        </div>
      </div>
    </div>
  );
}