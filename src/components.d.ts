import 'vue';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    SvgIcon: typeof import('./components/utils/SvgIcon.vue')['default'];
    GeneralHead: typeof import('./components/utils/GeneralHead.vue')['default'];
    RouterLink: typeof import('vue-router')['RouterLink'];
    RouterView: typeof import('vue-router')['RouterView'];
  }
}

export {};
