<template>
  <GridLayout rows="*" columns="*">
    <Frame id="root-frame" row="0" col="0">
      <LoginPage />
    </Frame>
    <ToastHostComponent
      row="0"
      col="0"
      verticalAlignment="bottom"
      horizontalAlignment="stretch"
    />
  </GridLayout>
</template>

<script lang="ts">
import LoginPage from '../pages/LoginPage.vue';
import ToastHostComponent from '../components/ToastHostComponent.vue';

export default {
  components: {
    LoginPage,
    ToastHostComponent,
  },
};
</script>
