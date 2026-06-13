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
    <LoadingHostComponent
      row="0"
      col="0"
      horizontalAlignment="stretch"
      verticalAlignment="stretch"
    />
  </GridLayout>
</template>

<script lang="ts">
import LoginPage from '../pages/LoginPage.vue';
import ToastHostComponent from '../components/ToastHostComponent.vue';
import LoadingHostComponent from '../components/LoadingHostComponent.vue';

export default {
  components: {
    LoginPage,
    ToastHostComponent,
    LoadingHostComponent,
  },
};
</script>
