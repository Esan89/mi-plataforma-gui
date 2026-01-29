<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Configuración del Sistema</div>

    <q-card class="my-card q-mb-md">
      <q-card-section>
        <div class="text-h6">Credenciales de Ferrovalle</div>
        <div class="text-subtitle2">Estas credenciales son utilizadas por el scraper.</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="saveSettings" class="q-gutter-md">
          <q-input
            filled
            v-model="ferrovalleUser"
            label="Usuario Ferrovalle"
            hint="Usuario para acceder al portal SLI"
            lazy-rules
            autocomplete="off"
            :rules="[val => val && val.length > 0 || 'Por favor ingresa el usuario']"
          />

          <q-input
            filled
            :type="showPassword ? 'text' : 'password'"
            v-model="ferrovallePassword"
            label="Contraseña Ferrovalle"
            hint="Contraseña para acceder al portal SLI"
            lazy-rules
            autocomplete="new-password"
            :rules="[val => val && val.length > 0 || 'Por favor ingresa la contraseña']"
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div>
            <q-btn label="Guardar Cambios" type="submit" color="primary" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';

interface Setting {
  key: string;
  value: string;
  description?: string;
}

const $q = useQuasar();
const ferrovalleUser = ref('');
const ferrovallePassword = ref('');
const loading = ref(false);
const showPassword = ref(false); // Toggle visibility

const loadSettings = async () => {
  try {
    loading.value = true;
    const response = await api.get<Setting[]>('/settings');
    const settings = response.data;
    
    console.log('Settings loaded:', settings); // Debug log

    const userSetting = settings.find((s) => s.key === 'FERROVALLE_USER');
    const passSetting = settings.find((s) => s.key === 'FERROVALLE_PASSWORD');

    if (userSetting) ferrovalleUser.value = userSetting.value;
    if (passSetting) ferrovallePassword.value = passSetting.value;

  } catch (error) {
    console.error('Error loading settings:', error);
    $q.notify({
      color: 'negative',
      message: 'Error al cargar la configuración',
      icon: 'report_problem'
    });
  } finally {
    loading.value = false;
  }
};

const saveSettings = async () => {
  try {
    loading.value = true;
    
    await api.post('/settings', {
      key: 'FERROVALLE_USER',
      value: ferrovalleUser.value,
      description: 'Usuario para el scraper de Ferrovalle'
    });

    await api.post('/settings', {
      key: 'FERROVALLE_PASSWORD',
      value: ferrovallePassword.value,
      description: 'Contraseña para el scraper de Ferrovalle'
    });

    $q.notify({
      color: 'positive',
      message: 'Configuración guardada correctamente',
      icon: 'check'
    });

  } catch (error) {
    console.error('Error saving settings:', error);
    $q.notify({
      color: 'negative',
      message: 'Error al guardar la configuración',
      icon: 'report_problem'
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void loadSettings();
});
</script>
