<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Mi Plataforma
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Módulos
        </q-item-label>

        <!-- ENLACE A TU PERFIL -->
        <q-item clickable to="/profile">
          <q-item-section avatar>
            <q-icon name="account_circle" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Perfil de Usuario</q-item-label>
          </q-item-section>
        </q-item>

        <!--============================================-->
        <!--=     NUEVO MENÚ DESPLEGABLE SCRAPERS      =-->
        <!--============================================-->
        <q-expansion-item
          icon="travel_explore"
          label="Scrapers"
          caption="Herramientas de extracción"
          group="modulos"
        >
          <!-- OPCIÓN 1: SCRAPER FERROVALLE -->
          <q-item clickable v-ripple class="q-pl-lg" to="/scraper-ferrovalle">
            <q-item-section avatar>
              <q-icon name="directions_boat" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Scraper Ferrovalle</q-item-label>
            </q-item-section>
          </q-item>

          <!-- OPCIÓN 2: CARGAR BUZONES (NUEVO) -->
          <q-item clickable v-ripple class="q-pl-lg" to="/carga-buzones">
            <q-item-section avatar>
              <q-icon name="upload_file" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Cargar Buzones</q-item-label>
              <q-item-label caption>Importar Excel</q-item-label>
            </q-item-section>
          </q-item>

        </q-expansion-item>

        
        <q-separator spaced />

        <q-item clickable to="/settings">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Configuración</q-item-label>
            <q-item-label caption>Credenciales y ajustes</q-item-label>
          </q-item-section>
        </q-item>

        <!--============================================-->

      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
