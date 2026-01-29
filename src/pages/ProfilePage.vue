<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2">
        <q-card v-if="user" class="q-pa-md shadow-2" style="width: 400px;">
          <q-card-section class="text-center">
            <q-avatar size="100px" color="primary" text-color="white" icon="person" />
            <div class="text-grey-9 text-h5 text-weight-bold q-mt-md">Perfil de Usuario</div>
            <div class="text-grey-8">¡Bienvenido!</div>
          </q-card-section>

          <q-card-section>
            <q-list bordered separator>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="email" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Email</q-item-label>
                  <q-item-label caption>{{ user.email }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="today" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Miembro desde</q-item-label>
                  <q-item-label caption>{{ new Date(user.created_at).toLocaleDateString() }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <!-- SECCIÓN DEL BOTÓN DE LOGOUT AÑADIDA -->
          <q-card-actions align="center" class="q-px-md q-pb-md">
            <q-btn
              label="Cerrar Sesión"
              color="negative"
              icon-right="logout"
              @click="handleLogout"
              class="full-width"
            />
          </q-card-actions>
          <!-- FIN DE LA SECCIÓN AÑADIDA -->

          <q-card-section v-if="errorMessage" class="text-center">
            <q-banner inline-actions class="text-white bg-red rounded-borders">
              {{ errorMessage }}
            </q-banner>
          </q-card-section>
        </q-card>
        <!-- Muestra un spinner de carga mientras se obtienen los datos -->
        <div v-else>
            <q-spinner-dots color="primary" size="40px" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from 'src/services/api';

// Definimos la estructura del objeto de usuario para que TypeScript esté contento
interface UserProfile {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const router = useRouter();
const user = ref<UserProfile | null>(null);
const errorMessage = ref('');

// onMounted se ejecuta automáticamente cuando el componente se carga
onMounted(async () => {
  try {
    // El interceptor de Axios en api.ts añade el token JWT automáticamente
    const response = await api.getProfile();
    user.value = response.data;
  } catch (error) {
    console.error('No se pudo obtener el perfil', error);
    errorMessage.value = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';

    // Limpiamos el token y redirigimos si la petición falla por autenticación
    localStorage.removeItem('accessToken');
    setTimeout(() => {
      void router.push('/');
    }, 2500); // Esperamos 2.5 segundos para que el usuario lea el mensaje
  }
});

// FUNCIÓN DE LOGOUT AÑADIDA
function handleLogout() {
  // 1. Borramos el token del almacenamiento
  localStorage.removeItem('accessToken');

  // 2. Redirigimos al usuario a la página de login
  void router.push('/');
}
</script>

