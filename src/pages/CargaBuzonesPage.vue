<template>
  <q-page padding>
    <div class="q-pa-md">

      <!-- TARJETA DE CARGA -->
      <q-card class="my-card q-mb-lg">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Cargar Arribos Extemporáneos (Buzones)</div>
          <div class="text-subtitle2">Copia las celdas de Excel y pégalas aquí</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="textData"
            filled
            type="textarea"
            label="Pegar datos de Excel aquí"
            placeholder="Capturó   Folio   Fecha   ..."
            hint="Asegúrate de copiar todas las columnas en el orden correcto"
            rows="10"
            style="font-family: monospace"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            label="Limpiar"
            flat
            color="grey"
            @click="textData = ''"
          />
          <q-btn
            label="Procesar y Guardar"
            color="secondary"
            icon="save"
            :loading="loading"
            :disable="!textData.trim()"
            @click="guardarDatos"
          />
        </q-card-actions>
      </q-card>

      <!-- TABLA DE VISUALIZACIÓN -->
      <q-card class="my-card" :class="{ 'fixed-full': isFullscreen }">
        <q-card-section class="bg-secondary text-white row items-center justify-between">
          <div class="text-h6">Historial de Arribos (Buzones)</div>
          <div class="row q-gutter-sm items-center">
            <!-- BOTÓN PANTALLA COMPLETA -->
            <q-btn
              flat
              round
              dense
              :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
              @click="toggleFullscreen"
            >
              <q-tooltip>{{ isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa' }}</q-tooltip>
            </q-btn>

            <div v-if="selected.length > 0">
              <q-btn
                color="negative"
                icon="delete"
                label="Borrar"
                @click="borrarSeleccionados"
                :loading="deleting"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <!-- BUSCADOR -->
          <q-input
            v-model="filter"
            filled
            dense
            placeholder="Buscar por contenedor, patente, folio..."
            class="q-mb-md"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-table
            :rows="rows"
            :columns="columns"
            row-key="id"
            selection="multiple"
            v-model:selected="selected"
            :loading="loadingTable"
            :pagination="pagination"
            :filter="filter"
            class="sticky-header-table"
          >
            <!-- FORMATO FECHA -->
            <template v-slot:body-cell-fecha_recepcion="props">
              <q-td :props="props">
                {{ formatDate(props.row.fecha_recepcion) }}
              </q-td>
            </template>

            <!-- FORMATO ENLACE (ANEXO) -->
            <template v-slot:body-cell-anexo="props">
              <q-td :props="props">
                <div v-if="props.row.anexo">
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="picture_as_pdf"
                    type="a"
                    :href="props.row.anexo"
                    target="_blank"
                    dense
                  >
                    <q-tooltip>Ver PDF</q-tooltip>
                  </q-btn>
                </div>
                <div v-else>-</div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import api from 'src/services/api';

const $q = useQuasar();
const textData = ref('');
const loading = ref(false);

// --- TABLA ---
const rows = ref([]);
const selected = ref([]);
const loadingTable = ref(false);
const deleting = ref(false);
const filter = ref('');
const isFullscreen = ref(false);

const pagination = ref({
  sortBy: 'fecha_recepcion',
  descending: true,
  rowsPerPage: 10
});

const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'capturo', label: 'Capturó', field: 'capturo', sortable: true },
  { name: 'folio', label: 'Folio', field: 'folio', sortable: true },
  { name: 'fecha_recepcion', label: 'Fecha Recepción', field: 'fecha_recepcion', sortable: true },
  { name: 'no_pedimento', label: 'No. Pedimento', field: 'no_pedimento', sortable: true },
  { name: 'patente', label: 'Patente', field: 'patente', sortable: true },
  { name: 'clave_pedimento', label: 'Cve. Pedimento', field: 'clave_pedimento', sortable: true },
  { name: 'contenedor', label: 'Contenedor', field: 'contenedor', sortable: true },
  { name: 'anexo', label: 'Anexo', field: 'anexo', sortable: true },
  { name: 'observaciones', label: 'Observaciones', field: 'observaciones', sortable: true },
];

function formatDate(fecha: string) {
  if (!fecha) return '-';
  return date.formatDate(fecha, 'DD/MM/YYYY');
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
}

async function cargarTabla() {
  loadingTable.value = true;
  try {
    const res = await api.getBuzones();
    rows.value = res.data;
  } catch (error) {
    console.error('Error cargando tabla:', error);
    $q.notify({
      color: 'negative',
      message: 'Error al cargar el historial de buzones.',
      icon: 'report_problem',
      position: 'top'
    });
  } finally {
    loadingTable.value = false;
  }
}

async function guardarDatos() {
  if (!textData.value.trim()) return;

  loading.value = true;
  try {
    await api.guardarTextoBuzones({
      data: textData.value
    });

    textData.value = '';

    $q.notify({
      color: 'positive',
      message: '¡Buzones guardados y procesados exitosamente!',
      icon: 'cloud_done',
      position: 'top',
      timeout: 2500
    });

    // Recargar tabla
    await cargarTabla();

  } catch (error) {
    console.error(error);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;

    $q.notify({
      color: 'negative',
      message: err.response?.data?.message || 'Ocurrió un error al guardar.',
      icon: 'report_problem',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
}

function borrarSeleccionados() {
  if (selected.value.length === 0) return;

  $q.dialog({
    title: 'Confirmar Borrado',
    message: `¿Estás seguro de que deseas borrar ${selected.value.length} registros? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    // Llamamos a la función async pero NO retornamos la promesa al onOk
    void ejecutarBorrado();
  });
}

async function ejecutarBorrado() {
  deleting.value = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ids = selected.value.map((r: any) => r.id);
    await api.deleteBuzonesMultiples(ids);

    $q.notify({
      color: 'positive',
      message: 'Registros eliminados correctamente.',
      icon: 'delete',
      position: 'top'
    });

    selected.value = [];
    await cargarTabla();

  } catch (error) {
    console.error(error);
    $q.notify({
      color: 'negative',
      message: 'Error al eliminar registros.',
      icon: 'report_problem',
      position: 'top'
    });
  } finally {
    deleting.value = false;
  }
}

onMounted(async () => {
  await cargarTabla();
});
</script>

<style scoped>
.my-card {
  max-width: 1200px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.fixed-full {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100% !important;
  z-index: 9999;
  border-radius: 0;
  overflow: auto;
}

/* Para que el header de la tabla se quede fijo si hay mucho scroll */
.sticky-header-table {
  /* height: 100%; si quieres que ocupe todo el alto disponible en fullscreen */
}
</style>
