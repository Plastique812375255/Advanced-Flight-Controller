/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue-router' {
  import type { RouteRecordRaw as _RouteRecordRaw } from 'vue-router'
  
  interface RouteRecordRaw extends _RouteRecordRaw {
    meta?: {
      requiresAuth?: boolean;
      [key: string]: any;
    }
  }
} 