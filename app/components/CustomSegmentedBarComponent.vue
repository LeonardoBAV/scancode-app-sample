<!--
  Dois segmentos (ícone Lucide + label i18n). Substitui o SegmentedBar nativo, que só aceita title string.
  Uso: v-model (0 | 1). Opcional: leftIcon, rightIcon (LucideIcon), leftLabelKey, rightLabelKey.
-->
<template>
    <GridLayout columns="*, auto, *" class="border border-border rounded-lg">
        <GridLayout
            col="0"
            rows="auto"
            class="p-3 rounded-l-lg"
            :class="modelValue === 0 ? 'bg-primary' : 'bg-secondary'"
            @tap="onSegmentTap(0)"
        >
            <StackLayout orientation="horizontal" horizontalAlignment="center" verticalAlignment="center">
                <Label
                    :text="Icons.lucide(leftIcon)"
                    class="lucide text-base mr-2"
                    :class="modelValue === 0 ? 'text-primary-foreground' : 'text-muted-foreground'"
                    verticalAlignment="center"
                />
                <Label
                    :text="$t(leftLabelKey)"
                    class="text-sm font-semibold"
                    :class="modelValue === 0 ? 'text-primary-foreground' : 'text-muted-foreground'"
                    verticalAlignment="center"
                    textWrap="false"
                />
            </StackLayout>
        </GridLayout>
        <StackLayout col="1" width="1" class="bg-border" verticalAlignment="stretch" />
        <GridLayout
            col="2"
            rows="auto"
            class="p-3 rounded-r-lg"
            :class="modelValue === 1 ? 'bg-primary' : 'bg-secondary'"
            @tap="onSegmentTap(1)"
        >
            <StackLayout orientation="horizontal" horizontalAlignment="center" verticalAlignment="center">
                <Label
                    :text="Icons.lucide(rightIcon)"
                    class="lucide text-base mr-2"
                    :class="modelValue === 1 ? 'text-primary-foreground' : 'text-muted-foreground'"
                    verticalAlignment="center"
                />
                <Label
                    :text="$t(rightLabelKey)"
                    class="text-sm font-semibold"
                    :class="modelValue === 1 ? 'text-primary-foreground' : 'text-muted-foreground'"
                    verticalAlignment="center"
                    textWrap="false"
                />
            </StackLayout>
        </GridLayout>
    </GridLayout>
</template>

<script setup lang="ts">
// --- Imports ---
import { Icons, type LucideIcon } from '../utils/icons';


// --- Component logic ---
withDefaults(
    defineProps<{
        modelValue: number;
        leftIcon?: LucideIcon;
        leftLabelKey?: string;
        rightIcon?: LucideIcon;
        rightLabelKey?: string;
    }>(),
    {
        leftIcon: 'eye',
        leftLabelKey: 'pages.clientShow.segmentView',
        rightIcon: 'pencil',
        rightLabelKey: 'pages.clientShow.segmentEdit',
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: number];
}>();

function onSegmentTap(index: number): void {
    emit('update:modelValue', index);
}
</script>
