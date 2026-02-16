<template>
    <Page actionBarHidden="true">
        <ScrollView>
            <StackLayout class="p-4">
                <Label :text="event.nome" class="text-xl font-bold text-gray-900 mb-2" />

                <GridLayout rows="auto, auto, auto, auto" columns="auto, *" class="mt-2">
                    <Label row="0" col="0" text="Status" class="text-sm text-gray-500 mr-2" />
                    <Label row="0" col="1" :text="event.status" :class="'text-sm font-semibold ' + statusClass(event.status)" />

                    <Label row="1" col="0" text="Pedidos" class="text-sm text-gray-500 mr-2 mt-1" />
                    <Label row="1" col="1" :text="String(event.numeroPedidos)" class="text-sm font-semibold text-gray-900 mt-1" />

                    <Label row="2" col="0" text="Valor total" class="text-sm text-gray-500 mr-2 mt-1" />
                    <Label row="2" col="1" :text="formatValor(event.valor)" class="text-sm font-semibold text-blue-600 mt-1" />

                    <Label row="3" col="0" text="Data" class="text-sm text-gray-500 mr-2 mt-1" />
                    <Label row="3" col="1" :text="event.dataInicio + ' - ' + event.dataFim" class="text-sm font-semibold text-gray-900 mt-1" />
                </GridLayout>
            </StackLayout>
        </ScrollView>
    </Page>
</template>

<script setup lang="ts">
import type { Evento } from '../types/evento'

const props = defineProps<{ event: Evento }>()
const event = props.event

function formatValor(valor: number): string {
    return valor === 0 ? 'Grátis' : 'R$ ' + valor.toLocaleString('pt-BR')
}

function statusClass(status: string): string {
    switch (status) {
        case 'Ativo':
            return 'text-green-600'
        case 'Agendado':
            return 'text-blue-600'
        case 'Encerrado':
            return 'text-gray-500'
        default:
            return 'text-gray-600'
    }
}
</script>
