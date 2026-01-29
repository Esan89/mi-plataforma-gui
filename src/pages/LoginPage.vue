<template>
  <!-- 1. Añadimos el Layout como contenedor principal -->
  <q-layout>
    <!-- 2. Añadimos el Page Container -->
    <q-page-container>
      <!-- 3. Nuestra página ahora vive felizmente dentro del layout -->
      <q-page class="flex flex-center bg-grey-2">
        <q-card class="q-pa-md shadow-2" style="width: 400px;">
          <q-card-section class="text-center">
            <div class="text-grey-9 text-h5 text-weight-bold">Iniciar Sesión</div>
            <div class="text-grey-8">Ingresa a tu cuenta</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="handleLogin">
              <q-input
                v-model="email"
                label="Correo Electrónico"
                type="email"
                lazy-rules
                :rules="[(val: string) => (val && val.length > 0) || 'El correo es requerido']"
                outlined
                class="q-mb-md"
              />
              <q-input
                v-model="password"
                label="Contraseña"
                type="password"
                lazy-rules
                :rules="[(val: string) => (val && val.length > 0) || 'La contraseña es requerida']"
                outlined
                class="q-mb-md"
              />
              <q-btn label="Login" type="submit" color="primary" class="full-width" />
            </q-form>
          </q-card-section>

          <q-card-section v-if="errorMessage" class="text-center">
             <q-banner inline-actions class="text-white bg-red rounded-borders">
                {{ errorMessage }}
             </q-banner>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from 'src/services/api';

const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

async function handleLogin() {
  errorMessage.value = ''; // Limpiar errores previos
  try {
    const response = await api.login(email.value, password.value);
    const { accessToken } = response.data;
    localStorage.setItem('accessToken', accessToken);

    // Redirigir al perfil
    void router.push('/profile');

  } catch (error) {
    console.error('Error en el login:', error);
    errorMessage.value = 'Credenciales incorrectas. Por favor, inténtalo de nuevo.';
    localStorage.removeItem('accessToken');
  }
}
</script>

