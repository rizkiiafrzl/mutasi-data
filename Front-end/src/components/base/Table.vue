<script>
import { computed } from "vue";

export default {
  name: "Table",
  props: {
    header: {
      type: Array,
      default: () => [],
    },
    data: {
      type: [Array, Object],
      default: () => [],
    },
    headStyle: {
      type: String,
      default: "black",
      validator: (value) => ["black", "gray"].includes(value),
    },
    dataStyle: {
      type: String,
      default: "normal",
      validator: (value) => ["smbold", "normal"].includes(value),
    },
    // Untuk menentukan kolom mana yang menggunakan slot
    customColumns: {
      type: Array,
      default: () => [],
    },
    // Untuk mengatur lebar setiap kolom
    columnWidths: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    computedHeadStyle() {
      const headStyle = {
        black: "text-xs uppercase font-semibold text-gray-500",
        gray: "text-xs uppercase font-semibold text-gray-500",
      };
      return headStyle[this.headStyle];
    },
    computedDataStyle() {
      const dataStyle = {
        smbold: "font-medium py-1",
        normal: "font-medium py-1",
      };
      return dataStyle[this.dataStyle];
    },
    // Cek apakah data adalah array of objects atau array of arrays
    isObjectData() {
      return this.data.length > 0 && typeof this.data[0] === "object" && !Array.isArray(this.data[0]);
    },
  },
  methods: {
    // Ambil kelas lebar berdasarkan nama header
    getColumnWidth(headerCol) {
      const headerKey = headerCol.toLowerCase();
      return this.columnWidths[headerKey] || this.columnWidths[headerCol] || "";
    },
  },
};
</script>
<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm border-collapse">
      <thead>
        <tr>
          <th
            v-for="(headerCol, index) in header"
            :key="index"
            :class="[
              'border-b',
              'border-gray-200',
              'py-3',
              'px-6',
              computedHeadStyle,
              getColumnWidth(headerCol),
              // Alignment berdasarkan kolom
              headerCol.toLowerCase().includes('nominal') || headerCol.toLowerCase().includes('jumlah tk')
                ? 'text-right'
                : headerCol.toLowerCase().includes('status') || headerCol.toLowerCase().includes('aksi')
                ? 'text-center'
                : 'text-left',
            ]"
          >
            {{ headerCol }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in data"
          :key="rowIndex"
          :class="[
            'border-b',
            'border-gray-200',
            'hover:bg-gray-50',
            rowIndex % 2 === 1 ? 'bg-gray-50' : ''
          ]"
        >
          <template v-if="isObjectData">
            <!-- Jika data adalah array of objects -->
            <td
              v-for="(headerCol, colIndex) in header"
              :key="colIndex"
              :class="[
                computedDataStyle,
                'py-3',
                'px-6',
                getColumnWidth(headerCol),
                // Alignment berdasarkan kolom
                headerCol.toLowerCase().includes('nominal') || headerCol.toLowerCase().includes('jumlah tk')
                  ? 'text-right'
                  : headerCol.toLowerCase().includes('status') || headerCol.toLowerCase().includes('aksi')
                  ? 'text-center'
                  : 'text-left',
              ]"
            >
              <!-- Slot untuk kolom custom -->
              <slot
                v-if="customColumns.includes(headerCol.toLowerCase())"
                :name="`cell-${headerCol.toLowerCase()}`"
                :row="row"
                :index="rowIndex"
              >
                {{ row[headerCol.toLowerCase()] }}
              </slot>
              <!-- Default rendering -->
              <template v-else>
                {{ row[headerCol.toLowerCase()] }}
              </template>
            </td>
          </template>
          <template v-else>
            <!-- Jika data adalah array of arrays -->
            <td
              v-for="(cell, colIndex) in row"
              :key="colIndex"
              :class="[computedDataStyle, 'py-3', 'px-6']"
            >
              <!-- Slot untuk kolom custom berdasarkan index -->
              <slot
                v-if="customColumns.includes(colIndex)"
                :name="`cell-${colIndex}`"
                :row="row"
                :cell="cell"
                :index="rowIndex"
              >
                {{ cell }}
              </slot>
              <!-- Default rendering -->
              <template v-else>
                {{ cell }}
              </template>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>
