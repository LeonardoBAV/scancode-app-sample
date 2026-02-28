<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, auto, *, auto" columns="*">
            <!-- Header -->
            <!--<GridLayout row="0" col="0" rows="auto" columns="*" class="header">
                <Label row="0" col="0" text="Sacola" class="header-title" />
            </GridLayout>
-->
            <!-- Busca de produto -->
            <StackLayout row="1" col="0" class="search-section">
                <TextField v-model="searchQuery" hint="Buscar produto por nome ou SKU..." class="search-field" @textChange="onSearchChange" />
                <ListView v-if="searchQuery.length > 0 && searchResults.length > 0" :items="searchResults" separatorColor="transparent" class="search-results" height="180">
                    <template #default="{ item }">
                        <GridLayout rows="auto, auto" columns="*, auto" class="search-item" @tap="addProduct(item)">
                            <Label row="0" col="0" :text="item.name" class="search-item-name" textWrap="true" />
                            <Label row="1" col="0" :text="item.sku + ' · ' + item.product_category.name" class="search-item-detail" />
                            <Label row="0" col="1" :text="formatCurrency(item.price)" class="search-item-price" />
                        </GridLayout>
                    </template>
                </ListView>
            </StackLayout>

            <!-- Lista do carrinho -->
            <ListView row="2" col="0" :items="cartItems" separatorColor="transparent" class="cart-list">
                <template #default="{ item }">
                    <GridLayout rows="auto, auto, auto" columns="*, auto" class="cart-item">
                        <Label row="0" col="0" :text="item.product.name" class="cart-item-name" textWrap="true" />
                        <Label row="0" col="1" :text="formatCurrency(item.product.price * item.quantity)" class="cart-item-total" />
                        <Label row="1" col="0" :text="item.product.sku + ' · ' + item.product.product_category.name" class="cart-item-detail" />
                        <Label row="1" col="1" :text="formatCurrency(item.product.price) + '/un'" class="cart-item-unit-price" />
                        <GridLayout row="2" col="0" colSpan="2" rows="auto" columns="auto, auto, auto, *" class="qty-row">
                            <Button row="0" col="0" text="−" class="btn-qty" @tap="decreaseQty(item)" />
                            <Label row="0" col="1" :text="String(item.quantity)" class="qty-label" />
                            <Button row="0" col="2" text="+" class="btn-qty" @tap="increaseQty(item)" />
                        </GridLayout>
                    </GridLayout>
                </template>
            </ListView>

            <!-- Rodapé com totais -->
            <GridLayout row="3" col="0" rows="auto" columns="*, *" class="footer-totals">
                <Label row="0" col="0" :text="totalItemsLabel" class="footer-label" />
                <Label row="0" col="1" :text="formatCurrency(cartTotal)" class="footer-total" />
            </GridLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Product } from '../../../types/product';

interface CartItem {
    product: Product;
    quantity: number;
}

const searchQuery = ref('');

const allProducts = ref<Product[]>([
    { id: 1, sku: 'SKU-001', barcode: '7891000100', name: 'Coca-Cola 350ml', price: 5.50, product_category_id: 1, product_category: { id: 1, name: 'Bebidas' } },
    { id: 2, sku: 'SKU-002', barcode: '7891000200', name: 'Guaraná Antarctica 350ml', price: 4.50, product_category_id: 1, product_category: { id: 1, name: 'Bebidas' } },
    { id: 3, sku: 'SKU-003', barcode: '7891000300', name: 'Água Mineral 500ml', price: 3.00, product_category_id: 1, product_category: { id: 1, name: 'Bebidas' } },
    { id: 4, sku: 'SKU-004', barcode: '7891000400', name: 'Suco de Laranja 1L', price: 8.90, product_category_id: 1, product_category: { id: 1, name: 'Bebidas' } },
    { id: 5, sku: 'SKU-005', barcode: '7891000500', name: 'Cerveja Pilsen 600ml', price: 12.00, product_category_id: 1, product_category: { id: 1, name: 'Bebidas' } },
    { id: 6, sku: 'SKU-010', barcode: '7891001000', name: 'Pão de Queijo 6un', price: 9.90, product_category_id: 2, product_category: { id: 2, name: 'Lanches' } },
    { id: 7, sku: 'SKU-011', barcode: '7891001100', name: 'Coxinha de Frango', price: 7.50, product_category_id: 2, product_category: { id: 2, name: 'Lanches' } },
    { id: 8, sku: 'SKU-012', barcode: '7891001200', name: 'Empada de Palmito', price: 6.00, product_category_id: 2, product_category: { id: 2, name: 'Lanches' } },
    { id: 9, sku: 'SKU-020', barcode: '7891002000', name: 'Bolo de Chocolate Fatia', price: 11.50, product_category_id: 3, product_category: { id: 3, name: 'Doces' } },
    { id: 10, sku: 'SKU-021', barcode: '7891002100', name: 'Brigadeiro Gourmet', price: 4.00, product_category_id: 3, product_category: { id: 3, name: 'Doces' } },
    { id: 11, sku: 'SKU-030', barcode: '7891003000', name: 'Parafuso Sextavado M8', price: 1.20, product_category_id: 4, product_category: { id: 4, name: 'Ferragens' } },
    { id: 12, sku: 'SKU-031', barcode: '7891003100', name: 'Prego 17x27 1kg', price: 18.90, product_category_id: 4, product_category: { id: 4, name: 'Ferragens' } },
    { id: 13, sku: 'SKU-040', barcode: '7891004000', name: 'Caderno Espiral 200fls', price: 22.00, product_category_id: 5, product_category: { id: 5, name: 'Papelaria' } },
    { id: 14, sku: 'SKU-041', barcode: '7891004100', name: 'Caneta Esferográfica Azul', price: 2.50, product_category_id: 5, product_category: { id: 5, name: 'Papelaria' } },
    { id: 15, sku: 'SKU-042', barcode: '7891004200', name: 'Resma Papel A4 500fls', price: 28.90, product_category_id: 5, product_category: { id: 5, name: 'Papelaria' } },
]);

const cartItems = ref<CartItem[]>([
    { product: { id: 1, sku: 'SKU-001', barcode: '7891000100', name: 'Coca-Cola 350ml', price: 5.50, product_category_id: 1, product_category: { id: 1, name: 'Bebidas' } }, quantity: 2 },
    { product: { id: 7, sku: 'SKU-011', barcode: '7891001100', name: 'Coxinha de Frango', price: 7.50, product_category_id: 2, product_category: { id: 2, name: 'Lanches' } }, quantity: 3 },
    { product: { id: 9, sku: 'SKU-020', barcode: '7891002000', name: 'Bolo de Chocolate Fatia', price: 11.50, product_category_id: 3, product_category: { id: 3, name: 'Doces' } }, quantity: 1 },
    { product: { id: 1, sku: 'SKU-001', barcode: '7891000100', name: 'Coca-Cola 350ml', price: 5.50, product_category_id: 1, product_category: { id: 1, name: 'Bebidas' } }, quantity: 2 },
    { product: { id: 7, sku: 'SKU-011', barcode: '7891001100', name: 'Coxinha de Frango', price: 7.50, product_category_id: 2, product_category: { id: 2, name: 'Lanches' } }, quantity: 3 },
    { product: { id: 9, sku: 'SKU-020', barcode: '7891002000', name: 'Bolo de Chocolate Fatia', price: 11.50, product_category_id: 3, product_category: { id: 3, name: 'Doces' } }, quantity: 1 },
    { product: { id: 1, sku: 'SKU-001', barcode: '7891000100', name: 'Coca-Cola 350ml', price: 5.50, product_category_id: 1, product_category: { id: 1, name: 'Bebidas' } }, quantity: 2 },
    { product: { id: 7, sku: 'SKU-011', barcode: '7891001100', name: 'Coxinha de Frango', price: 7.50, product_category_id: 2, product_category: { id: 2, name: 'Lanches' } }, quantity: 3 },
    { product: { id: 9, sku: 'SKU-020', barcode: '7891002000', name: 'Bolo de Chocolate Fatia', price: 11.50, product_category_id: 3, product_category: { id: 3, name: 'Doces' } }, quantity: 1 },
]);

const searchResults = computed(() => {
    const term = searchQuery.value.trim().toLowerCase();
    if (!term) return [];
    return allProducts.value.filter(
        (p) => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)
    );
});

const cartTotal = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
);

const totalItemsLabel = computed(() => {
    const count = cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
    return count === 1 ? '1 item' : `${count} itens`;
});

function formatCurrency(value: number): string {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
}

function onSearchChange(): void {
    // reactivity handles filtering
}

function addProduct(product: Product): void {
    const existing = cartItems.value.find((c) => c.product.id === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        cartItems.value.push({ product, quantity: 1 });
    }
    searchQuery.value = '';
}

function increaseQty(item: CartItem): void {
    item.quantity++;
}

function decreaseQty(item: CartItem): void {
    if (item.quantity > 1) {
        item.quantity--;
    } else {
        const idx = cartItems.value.indexOf(item);
        if (idx >= 0) cartItems.value.splice(idx, 1);
    }
}
</script>

<style scoped>
.header {
    background-color: #1e293b;
    color: white;
    padding: 16;
}

.header-title {
    font-size: 18;
    font-weight: bold;
    vertical-align: center;
    text-align: center;
}

.search-section {
    padding: 12;
    padding-bottom: 0;
    background-color: #f1f5f9;
}

.search-field {
    font-size: 15;
    padding: 12;
    background-color: white;
    border-width: 1;
    border-color: #e2e8f0;
    border-radius: 8;
}

.search-results {
    background-color: white;
    border-width: 1;
    border-color: #e2e8f0;
    border-radius: 8;
    margin-top: 4;
}

.search-item {
    padding: 10;
    border-bottom-width: 1;
    border-bottom-color: #f1f5f9;
}

.search-item-name {
    font-size: 14;
    font-weight: 600;
    color: #0f172a;
}

.search-item-detail {
    font-size: 12;
    color: #64748b;
    margin-top: 2;
}

.search-item-price {
    font-size: 14;
    font-weight: 600;
    color: #16a34a;
    vertical-align: center;
}

.cart-list {
    background-color: #f1f5f9;
}

.cart-item {
    background-color: white;
    border-radius: 10;
    padding: 12;
    margin: 6;
    margin-left: 12;
    margin-right: 12;
    border-width: 1;
    border-color: #e2e8f0;
}

.cart-item-name {
    font-size: 15;
    font-weight: 600;
    color: #0f172a;
}

.cart-item-total {
    font-size: 15;
    font-weight: 700;
    color: #16a34a;
    text-align: right;
    vertical-align: top;
}

.cart-item-detail {
    font-size: 12;
    color: #64748b;
    margin-top: 2;
}

.cart-item-unit-price {
    font-size: 12;
    color: #94a3b8;
    text-align: right;
    vertical-align: center;
}

.qty-row {
    margin-top: 8;
    column-spacing: 8;
}

.btn-qty {
    width: 36;
    height: 36;
    font-size: 18;
    font-weight: bold;
    color: white;
    background-color: #3b82f6;
    border-radius: 18;
    padding: 0;
}

.qty-label {
    font-size: 16;
    font-weight: 600;
    color: #0f172a;
    vertical-align: center;
    text-align: center;
    min-width: 32;
}

.footer-totals {
    background-color: white;
    padding: 16;
    border-top-width: 2;
    border-top-color: #e2e8f0;
}

.footer-label {
    font-size: 16;
    font-weight: 600;
    color: #0f172a;
    vertical-align: center;
}

.footer-total {
    font-size: 20;
    font-weight: 700;
    color: #16a34a;
    text-align: right;
    vertical-align: center;
}
</style>
