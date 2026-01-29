<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- TARJETA DE BÚSQUEDA INICIAL -->
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6">Consulta de Contenedores y Sellos</div>
          <div class="text-subtitle2">Ferrovalle SLI</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <p>Selecciona el tipo de evento a buscar y pega la lista de contenedores.</p>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-select filled v-model="searchType" :options="searchOptions" label="Tipo de Evento" emit-value map-options />
            </div>
            <div class="col-12 col-md-8">
               <q-input v-model="textData" filled type="textarea" label="Lista de Contenedores" placeholder="EITU909133..." style="min-height: 100px;" />
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <!-- Botón para recargar historial -->
          <q-btn flat label="Recargar Historial" icon="refresh" color="secondary" @click="cargarHistorialCompleto" :loading="loading" />
          <q-btn label="Consultar en Ferrovalle" color="primary" @click="handleConsultar" :loading="loading" icon="search" :disable="!textData.trim()" />
        </q-card-actions>
      </q-card>

      <!-- SECCIÓN DE RESULTADOS -->
      <q-card class="my-card q-mt-lg" v-if="results.length > 0">
        <q-card-section class="bg-grey-2">
          <div class="row items-center justify-between q-col-gutter-md">

            <!-- 1. FILTROS AVANZADOS -->
            <div class="col-12 col-md-5">
              <div class="text-subtitle2 q-mb-xs">Modo de Filtro:</div>
              <div class="row q-gutter-sm items-center">
                <q-btn-toggle
                  v-model="modoFiltro"
                  push
                  glossy
                  toggle-color="primary"
                  :options="[
                    {label: 'Hoy', value: 'hoy'},
                    {label: 'Rango', value: 'rango'},
                    {label: 'Todo', value: 'todo'}
                  ]"
                />
              </div>

              <!-- INPUTS DE RANGO (Solo visibles en modo 'rango') -->
              <div v-if="modoFiltro === 'rango'" class="row q-gutter-sm q-mt-sm">
                <q-input filled dense v-model="fechaInicio" label="Desde" class="col">
                  <template v-slot:prepend>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="fechaInicio" mask="YYYY-MM-DD HH:mm">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time v-model="fechaInicio" mask="YYYY-MM-DD HH:mm" format24h>
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>

                <q-input filled dense v-model="fechaFin" label="Hasta" class="col">
                  <template v-slot:prepend>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="fechaFin" mask="YYYY-MM-DD HH:mm">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time v-model="fechaFin" mask="YYYY-MM-DD HH:mm" format24h>
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- 2. BÚSQUEDA GENERAL -->
            <div class="col-12 col-md-4">
              <div class="text-subtitle2 q-mb-xs">Buscar en resultados:</div>
              <q-input filled dense v-model="filtroGeneral" placeholder="Ej. ROJO, TREN123, CMAU..." bg-color="white">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <!-- 3. FILTRO DE MARCADO RÁPIDO -->
            <div class="col-12 col-md-3">
              <div class="text-subtitle2 q-mb-xs">Marcado Rápido:</div>
              <q-input filled dense v-model="busquedaRapida" placeholder="Escribe y Enter..." @keyup.enter="marcarComoExtemporaneo" bg-color="white">
                <template v-slot:append>
                  <q-btn round dense flat icon="check_circle" color="orange" @click="marcarComoExtemporaneo" />
                </template>
              </q-input>
            </div>

            <!-- 4. BOTÓN DE CORREO -->
            <div class="col-12 col-md-2 text-right">
              <br/>
              <q-btn color="secondary" icon="mail" label="Correo" @click="prepararDatosCorreo" size="md" class="full-width" />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- TABLA DE RESULTADOS -->
        <q-table
          flat bordered
          :rows="resultadosFiltrados"
          :columns="columns"
          row-key="id"
          :filter="filtroGeneral"
          :pagination="{ rowsPerPage: 0 }"
          style="height: 600px"
          virtual-scroll
          no-data-label="No hay registros para la fecha seleccionada"
        >
          <template v-slot:body-cell-detalles="props">
            <q-td :props="props">
              <q-btn round :color="(props.row.buzonesManuales && props.row.buzonesManuales.length > 0) ? 'purple' : 'info'" :icon="(props.row.buzonesManuales && props.row.buzonesManuales.length > 0) ? 'mark_email_read' : 'inventory_2'" size="sm" @click="verDetallesBuzon(props.row)">
                <q-tooltip>{{ (props.row.buzonesManuales && props.row.buzonesManuales.length > 0) ? `${props.row.buzonesManuales.length} Seleccionados` : 'Ver Buzones' }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
          <template v-slot:body-cell-clasificacion="props">
            <q-td :props="props">
              <q-select dense filled options-dense v-model="props.row.clasificacion" :options="['Libre', 'Rojo', 'Extemporaneo']" :bg-color="getColorClass(props.row.clasificacion)" @update:model-value="(val) => actualizarEstatus(props.row, val)" style="min-width: 140px" />
            </q-td>
          </template>
          <template v-slot:body-cell-resultado="props">
            <q-td :props="props"><q-badge :color="getResultColor(props.row.resultado)">{{ props.row.resultado }}</q-badge></q-td>
          </template>
          <template v-slot:body-cell-bloqueado="props">
            <q-td :props="props">
              <q-badge v-if="isBlocked(props.row.bloqueado)" color="red" text-color="white">{{ props.row.bloqueado }}</q-badge>
              <span v-else>{{ props.row.bloqueado }}</span>
            </q-td>
          </template>

          <!-- FILA FINAL CON EL TOTAL -->
          <template v-slot:bottom-row>
            <q-tr class="bg-grey-3">
              <q-td colspan="100%">
                <div class="text-right text-subtitle2">
                  Total de Contenedores en Lista: <b>{{ resultadosFiltrados.length }}</b>
                </div>
              </q-td>
            </q-tr>
          </template>

        </q-table>
      </q-card>
    </div>

    <!-- MODAL DETALLES Y SELECCIÓN MÚLTIPLE -->
    <q-dialog v-model="showBuzonModal">
      <q-card style="width: 900px; max-width: 80vw;">
        <q-card-section><div class="text-h6">Detalles del Buzón - {{ contenedorEnEdicion?.contenedor }}</div></q-card-section>
        <q-card-section>
          <div class="text-caption text-grey-8 q-mb-sm">Selecciona uno o varios buzones para incluirlos en el correo.</div>
          <q-table flat bordered :rows="buzonesEncontrados" :columns="columnsBuzon" row-key="id" no-data-label="No encontrado en buzones">
            <template v-slot:body-cell-accion="props">
              <q-td :props="props">
                <q-checkbox :model-value="esBuzonSeleccionado(props.row)" @update:model-value="toggleBuzon(props.row)" color="purple" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
        <q-card-actions align="right"><q-btn flat label="Cerrar" color="primary" v-close-popup /></q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MODAL CONFIGURACIÓN -->
    <q-dialog v-model="showConfigModal" persistent>
      <q-card style="width: 1100px; max-width: 98vw;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Completar Datos Faltantes</div>
          <div class="text-caption">Ajusta fechas y resultado de semáforo antes de generar el texto.</div>
        </q-card-section>

        <q-card-section>
          <q-table
            flat bordered
            :rows="listaParaCorreo"
            :columns="columnsConfig"
            row-key="contenedor"
            hide-bottom
            :pagination="{ rowsPerPage: 0 }"
          >
            <template v-slot:body-cell-fechaModulacion="props">
              <q-td :props="props">
                <q-input dense filled type="date" v-model="props.row.fechaModulacion" @update:model-value="calcularFechaLimite(props.row)" />
              </q-td>
            </template>
            <template v-slot:body-cell-diasPlazo="props">
              <q-td :props="props">
                <q-input dense filled type="number" v-model.number="props.row.diasPlazo" style="width: 70px" @update:model-value="calcularFechaLimite(props.row)" />
              </q-td>
            </template>
            <template v-slot:body-cell-fechaLimite="props">
              <q-td :props="props">
                <q-input dense filled type="date" v-model="props.row.fechaLimite" />
              </q-td>
            </template>
            <template v-slot:body-cell-semaforoEmail="props">
              <q-td :props="props">
                <q-select dense filled options-dense v-model="props.row.semaforoEmail" :options="['LIBRE', 'ROJO']" :bg-color="props.row.semaforoEmail === 'LIBRE' ? 'green-1' : 'red-1'" style="min-width: 110px" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="positive" label="Generar Texto Final" icon="check" @click="generarTextoFinal" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MODAL CORREO -->
    <q-dialog v-model="showEmailModal">
      <q-card style="width: 800px; max-width: 90vw;">
        <q-card-section class="bg-secondary text-white">
          <div class="text-h6">Correo Generado</div>
          <div class="text-caption">Listo para copiar y pegar (con formato)</div>
        </q-card-section>

        <q-card-section class="q-pa-md scroll" style="max-height: 60vh;">
          <div class="email-preview q-pa-md bg-grey-1 rounded-borders" v-html="emailBody" style="font-family: Arial, sans-serif; font-size: 14px; border: 1px solid #ccc;"></div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Copiar Formato" color="primary" icon="content_copy" @click="copiarCorreoHTML" />
          <q-btn flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { QTableProps } from 'quasar';
import { useQuasar, date } from 'quasar';
import api from 'src/services/api';

interface IBuzon {
  id?: number;
  contenedor?: string;
  folio?: string;
  fecha_recepcion?: string;
  patente?: string;
  no_pedimento?: string;
}

interface IScrapeResult {
  id?: number;
  contenedor: string;
  sello_fisico_enviado: string;
  bloqueado: string;
  sello_fisico_pagina: string;
  sello_documentado_pagina: string;
  resultado: string;
  origen: string;
  agente_aduanal: string;
  pedimento_transito: string;
  pedimentos_definitivos: string;
  cliente: string;
  tren_arribo: string;
  descripcion_mercancia: string;
  clasificacion?: string;
  fecha_consulta?: string;
  buzonesManuales?: IBuzon[];
  fechaModulacion?: string;
  diasPlazo?: number;
  fechaLimite?: string;
  semaforoEmail?: 'LIBRE' | 'ROJO';
}

const $q = useQuasar();
const textData = ref('');
const busquedaRapida = ref('');
const loading = ref(false);
const results = ref<IScrapeResult[]>([]);
const searchType = ref('Fiscalizado');
const searchOptions = [{ label: 'Fiscalizado', value: 'Fiscalizado' }, { label: 'Salio de la terminal', value: 'Salio de la terminal' }];

// FILTROS AVANZADOS
const modoFiltro = ref('hoy'); // 'hoy', 'rango', 'todo'
const fechaInicio = ref(date.formatDate(new Date(), 'YYYY-MM-DD 00:00'));
const fechaFin = ref(date.formatDate(new Date(), 'YYYY-MM-DD 23:59'));

// VARIABLE PARA EL FILTRO GENERAL
const filtroGeneral = ref('');

const showBuzonModal = ref(false);
const showEmailModal = ref(false);
const showConfigModal = ref(false);
const contenedorEnEdicion = ref<IScrapeResult | null>(null);
const listaParaCorreo = ref<IScrapeResult[]>([]);
const buzonesEncontrados = ref<IBuzon[]>([]);
const emailBody = ref('');

// 🔥 COLUMNAS DE LA TABLA: SE AGREGÓ PEDIMENTO DEFINITIVO 🔥
const columns: QTableProps['columns'] = [
  { name: 'detalles', label: 'Buzón', align: 'center', field: 'detalles' },
  { name: 'clasificacion', label: 'Estatus', align: 'left', field: 'clasificacion', style: 'min-width: 160px' },
  { name: 'fecha_consulta', label: 'Fecha Consulta', align: 'left', field: 'fecha_consulta', sortable: true, format: (val) => val ? date.formatDate(val, 'DD/MM/YYYY HH:mm') : '-' },
  { name: 'contenedor', label: 'Contenedor', align: 'left', field: 'contenedor', sortable: true },
  { name: 'resultado', label: 'Resultado', field: 'resultado', align: 'left', sortable: true },
  { name: 'bloqueado', label: 'Bloqueado', field: 'bloqueado', align: 'center' },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left' },
  { name: 'tren_arribo', label: 'Tren', field: 'tren_arribo', align: 'left' },
  { name: 'descripcion_mercancia', label: 'Mercancía', field: 'descripcion_mercancia', align: 'left' },
  { name: 'sello_fisico_enviado', label: 'Sello Enviado', field: 'sello_fisico_enviado', align: 'left' },
  { name: 'sello_fisico_pagina', label: 'Sello Físico SLI', field: 'sello_fisico_pagina', align: 'left' },
  { name: 'sello_documentado_pagina', label: 'Sello Doc. SLI', field: 'sello_documentado_pagina', align: 'left' },
  { name: 'origen', label: 'Origen', field: 'origen', align: 'left' },
  { name: 'agente_aduanal', label: 'Agente Aduanal', field: 'agente_aduanal', align: 'left' },
  { name: 'pedimento_transito', label: 'Ped. Tránsito', field: 'pedimento_transito', align: 'left' },
  { name: 'pedimentos_definitivos', label: 'Ped. Definitivos', field: 'pedimentos_definitivos', align: 'left' },
];

const columnsConfig: QTableProps['columns'] = [
  { name: 'contenedor', label: 'Contenedor', field: 'contenedor', align: 'left' },
  { name: 'fechaModulacion', label: 'Fecha Modulación', field: 'fechaModulacion', align: 'left' },
  { name: 'diasPlazo', label: 'Días Plazo', field: 'diasPlazo', align: 'center' },
  { name: 'fechaLimite', label: 'Fecha Límite (Calc)', field: 'fechaLimite', align: 'left' },
  { name: 'semaforoEmail', label: 'Semáforo', field: 'semaforoEmail', align: 'center' },
];

const columnsBuzon: QTableProps['columns'] = [
  { name: 'accion', label: 'Incluir', field: 'accion', align: 'center' },
  { name: 'contenedor', label: 'Contenedor', field: 'contenedor', align: 'left' },
  { name: 'folio', label: 'Folio', field: 'folio', align: 'left' },
  { name: 'fecha_recepcion', label: 'Fecha Recep.', field: 'fecha_recepcion', align: 'left', format: (val: string) => val ? new Date(val).toLocaleDateString('es-MX') : '' },
  { name: 'patente', label: 'Patente', field: 'patente', align: 'left' },
  { name: 'no_pedimento', label: 'Pedimento', field: 'no_pedimento', align: 'left' },
];

const isBlocked = (s: string) => s?.toUpperCase().trim() === 'SI';

// FILTRO INTELIGENTE
const resultadosFiltrados = computed(() => {
  // 1. MODO TODO
  if (modoFiltro.value === 'todo') {
    return results.value;
  }

  // 2. MODO HOY
  if (modoFiltro.value === 'hoy') {
    const hoy = date.formatDate(new Date(), 'YYYY/MM/DD');
    return results.value.filter(item => {
      if (!item.fecha_consulta) return false;
      const fechaRegistro = date.formatDate(item.fecha_consulta, 'YYYY/MM/DD');
      return fechaRegistro === hoy;
    });
  }

  // 3. MODO RANGO
  if (modoFiltro.value === 'rango') {
    const start = new Date(fechaInicio.value).getTime();
    const end = new Date(fechaFin.value).getTime();

    return results.value.filter(item => {
      if (!item.fecha_consulta) return false;
      const itemTime = new Date(item.fecha_consulta).getTime();
      return itemTime >= start && itemTime <= end;
    });
  }

  return results.value;
});

// --- CARGA INICIAL DEL HISTORIAL ---
onMounted(() => {
  cargarHistorialCompleto().catch(err => console.error("Error cargando historial", err));
});

async function cargarHistorialCompleto() {
  loading.value = true;
  try {
    const response = await api.getHistorial();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    results.value = response.data.map((item: any) => procesarItem(item));
  } catch (e) {
    console.error("Error cargando historial:", e);
  } finally {
    loading.value = false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function procesarItem(item: any): IScrapeResult {
  return {
    ...item,
    clasificacion: item.clasificacion || 'Libre',
    buzonesManuales: [],
    diasPlazo: 15,
    fechaModulacion: '',
    fechaLimite: '',
    semaforoEmail: 'LIBRE'
  };
}

// --- CONSULTA NUEVA ---
async function handleConsultar() {
  loading.value = true;
  try {
    const response = await api.consultarFerrovalle(textData.value, searchType.value);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nuevosItems = response.data.map((item: any) => procesarItem(item));
    results.value = [...nuevosItems, ...results.value];
    modoFiltro.value = 'hoy'; // Resetear a hoy al consultar
    $q.notify({ color: 'positive', message: 'Consulta exitosa', icon: 'check' });
  } catch (e) { console.error(e); $q.notify({color:'negative', message:'Error al consultar'}); }
  finally { loading.value = false; }
}

async function actualizarEstatus(row: IScrapeResult, nuevoValor: string) {
  if (!row.id) return;
  try {
    await api.updateScraperStatus(row.id, nuevoValor);
    $q.notify({ color: 'positive', message: `Guardado: ${nuevoValor}`, timeout: 600, position:'top-right' });
  } catch { $q.notify({ color: 'negative', message: 'Error guardando estatus' }); }
}

async function marcarComoExtemporaneo() {
  const busqueda = busquedaRapida.value.trim().toUpperCase();
  if (!busqueda) return;
  const encontrado = results.value.find(r => r.contenedor.includes(busqueda));

  if (encontrado) {
    encontrado.clasificacion = 'Extemporaneo';
    await actualizarEstatus(encontrado, 'Extemporaneo');
    busquedaRapida.value = '';
    $q.notify({ color: 'orange', icon: 'check_circle', message: `Contenedor ${encontrado.contenedor} marcado`, position: 'top' });
  } else {
    $q.notify({ color: 'warning', message: 'Contenedor no encontrado', icon: 'search_off' });
  }
}

async function verDetallesBuzon(row: IScrapeResult) {
  contenedorEnEdicion.value = row;
  if (!contenedorEnEdicion.value.buzonesManuales) contenedorEnEdicion.value.buzonesManuales = [];
  buzonesEncontrados.value = [];
  $q.loading.show({ message: 'Buscando...' });
  try {
    const res = await api.getBuzonesPorContenedor(row.contenedor);
    buzonesEncontrados.value = res.data;
    showBuzonModal.value = true;
  } catch { $q.notify({color:'warning', message:'Sin datos de buzón'}); }
  finally { $q.loading.hide(); }
}

function esBuzonSeleccionado(buzonRow: IBuzon) {
  if (!contenedorEnEdicion.value?.buzonesManuales) return false;
  return contenedorEnEdicion.value.buzonesManuales.some((b) => b.id === buzonRow.id);
}

function toggleBuzon(buzonRow: IBuzon) {
  if (!contenedorEnEdicion.value) return;
  const list = contenedorEnEdicion.value.buzonesManuales || [];
  const index = list.findIndex((b) => b.id === buzonRow.id);
  if (index >= 0) list.splice(index, 1);
  else list.push(buzonRow);
  contenedorEnEdicion.value.buzonesManuales = list;
}

function getColorClass(s: string) {
  if (s === 'Rojo') return 'red-2';
  if (s === 'Extemporaneo') return 'orange-2';
  return 'green-1';
}
function getResultColor(r: string) {
  if (r === 'OK') return 'green';
  if (r.includes('SDD')) return 'orange';
  if (r === 'DFNE') return 'red';
  return 'grey';
}

function prepararDatosCorreo() {
  const extemporaneos = resultadosFiltrados.value.filter(r => r.clasificacion === 'Extemporaneo');
  if (extemporaneos.length === 0) {
    $q.notify({ color: 'warning', message: 'No hay extemporáneos seleccionados en la vista actual' });
    return;
  }
  listaParaCorreo.value = extemporaneos;
  listaParaCorreo.value.forEach(item => {
    if (!item.diasPlazo) item.diasPlazo = 15;
    if (!item.semaforoEmail) item.semaforoEmail = 'LIBRE';
    if (item.fechaModulacion) calcularFechaLimite(item);
  });
  showConfigModal.value = true;
}

function calcularFechaLimite(row: IScrapeResult) {
  if (row.fechaModulacion && row.diasPlazo) {
    const fechaBase = new Date(row.fechaModulacion + 'T00:00:00');
    const nuevaFecha = date.addToDate(fechaBase, { days: row.diasPlazo });
    row.fechaLimite = date.formatDate(nuevaFecha, 'YYYY-MM-DD');
  }
}

async function generarTextoFinal() {
  showConfigModal.value = false;
  $q.loading.show({ message: 'Generando HTML...' });

  try {
    const fechaHoy = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    let html = `<p>Buenas tardes.</p>
    <p>Se envía relación de extemporáneos que arribaron el día de hoy <b>${fechaHoy}</b>.</p><br/>`;

    // 1. AGRUPAR ITEMS POR TREN
    const grupos: Record<string, IScrapeResult[]> = {};

    for (const item of listaParaCorreo.value) {
      if (!item) continue;
      const tren = item.tren_arribo || 'SIN TREN';
      const origen = item.origen || 'SIN ORIGEN';
      const key = `${tren} (${origen})`;

      if (!grupos[key]) {
        grupos[key] = [];
      }
      grupos[key].push(item);
    }

    // 2. ITERAR SOBRE CADA TREN
    let trenCounter = 1;
    for (const [nombreTren, items] of Object.entries(grupos)) {
       html += `<p><b>${trenCounter}. TREN: <span style="color: #002060;">${nombreTren}</span></b></p>`;

       for (let i = 0; i < items.length; i++) {
          // 🔥 CORRECCIÓN: Validamos que 'item' exista para eliminar el error de TS
          const rawItem = items[i];
          if (!rawItem) continue;
          const item: IScrapeResult = rawItem;

          let listaBuzones: IBuzon[] = [];
          if (item.buzonesManuales && item.buzonesManuales.length > 0) {
            listaBuzones = item.buzonesManuales;
          } else {
            try {
              const res = await api.getBuzonesPorContenedor(item.contenedor);
              if (res.data?.length > 0) {
                 const conFecha = res.data.find((b: IBuzon) => b.fecha_recepcion != null);
                 listaBuzones = [conFecha || res.data[0]];
              }
            } catch { /* ignorar */ }
          }

          const primerBuzon: IBuzon = listaBuzones[0] || {};
          const numContenedor = primerBuzon.contenedor || item.contenedor;

          let patente = primerBuzon.patente;
          let pedimento = primerBuzon.no_pedimento;
          if ((!patente || !pedimento) && item.pedimento_transito) {
            const raw = item.pedimento_transito.trim();
            if (raw.length > 4) {
              patente = raw.substring(0, 4);
              pedimento = raw.substring(4);
            }
          }
          patente = patente || '____';
          pedimento = pedimento || '____';

          const fechaModTxt = item.fechaModulacion
            ? date.formatDate(item.fechaModulacion + 'T00:00:00', 'DD/MM/YYYY')
            : '<span style="color:red">[F_MOD]</span>';

          const diasTxt = item.diasPlazo ? item.diasPlazo.toString() : '15';

          const fechaLimTxt = item.fechaLimite
            ? date.formatDate(item.fechaLimite + 'T00:00:00', 'DD/MM/YYYY')
            : '<span style="color:red">[F_LIM]</span>';

          let textoFinalBuzones = '';
          if (listaBuzones.length === 0) {
            textoFinalBuzones = `<b style="color: #000000;">SIN BUZÓN</b>`;
          } else {
            const textos = listaBuzones.map(buzon => {
                let fechaStr = '____';
                if (buzon.fecha_recepcion) {
                    const d = new Date(buzon.fecha_recepcion);
                    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                    fechaStr = d.toLocaleDateString('es-MX');
                }
                const folio = buzon.folio || '____';
                return `BUZÓN ${folio} DE FECHA ${fechaStr}`;
            });
            textoFinalBuzones = `CON <b style="color: #002060;">${textos.join(' Y ')}</b>`;
          }

          let resultadoAduanaHtml = '';
          if (item.semaforoEmail === 'ROJO') {
            resultadoAduanaHtml = `<b style="color: #FF0000;">RECONOCIMIENTO ADUANERO</b>`;
          } else {
            resultadoAduanaHtml = `<b style="color: #00B050;">DESADUANAMIENTO LIBRE</b>`;
          }

          html += `
            <p>
              <b>${(i + 1).toString().padStart(2, '0')}.-</b> Contenedor
              <b style="color: #002060;">${numContenedor}</b>
              <span style="color: #002060; font-weight: bold;">pedimento</span>
              <b>${patente} &nbsp; ${pedimento}</b> , fue modulado en aduana de origen el día
              <b>${fechaModTxt}</b> con un plazo de <b>${diasTxt}</b> días, su fecha límite arribo
              <b>${fechaLimTxt}</b>, obtuvo como resultado
              ${resultadoAduanaHtml},
              ${textoFinalBuzones}.
            </p><br/>
          `;
       }
       trenCounter++;
       html += `<br/>`;
    }

    // 🔥 RESUMEN FINAL 🔥
    // (Eliminado del correo para que solo salga en la tabla)

    emailBody.value = html;
    showEmailModal.value = true;

  } catch (e) { console.error(e); $q.notify('Error generando HTML'); }
  finally { $q.loading.hide(); }
}

function copiarCorreoHTML() {
  const blobHtml = new Blob([emailBody.value], { type: 'text/html' });
  const blobText = new Blob([emailBody.value.replace(/<[^>]*>?/gm, '')], { type: 'text/plain' });
  const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
  navigator.clipboard.write(data)
    .then(() => $q.notify({ color: 'positive', message: 'Formato copiado' }))
    .catch((err) => { console.error(err); $q.notify({ color: 'negative', message: 'Error al copiar' }); });
}
</script>

<style scoped>
.my-card { max-width: 98%; margin: 0 auto; }
</style>
