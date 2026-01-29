import { boot } from 'quasar/wrappers';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({ router }) => {
  router.beforeEach((to, from, next) => {
    // Definimos las rutas que requieren autenticación
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const isAuthenticated = localStorage.getItem('accessToken') !== null;

    if (requiresAuth && !isAuthenticated) {
      // Si la ruta requiere autenticación y el usuario no está logueado,
      // lo redirigimos a la página de login.
      next({ path: '/' });
    } else {
      // De lo contrario, permitimos que continúe a la ruta solicitada.
      next();
    }
  });
});
