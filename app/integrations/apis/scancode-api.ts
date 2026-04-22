import { Device } from '@nativescript/core';

import { SCANCODE_API_URL, SCANCODE_API_VERSION } from '../../configs/scancode-config';
import type {
    ClientCreateRequestDTO,
    ClientUpdateRequestDTO,
    LoginRequestDTO,
    PaymentMethodUpdateRequestDTO,
    ProductCreateRequestDTO,
    ProductUpdateRequestDTO,
} from '../../types/dtos/scancode-request';
import type {
    ClientsResponseDTO,
    ClientResponseDTO,
    EventsResponseDTO,
    LoginResponseDTO,
    PaymentMethodResponseDTO,
    PaymentMethodsResponseDTO,
    ProductCategoriesResponseDTO,
    ProductResponseDTO,
    ProductsResponseDTO,
} from '../../types/dtos/scancode-response';
import { getToken } from '../../persistence/auth-session';
import { HttpClient } from '../http-client';


export class ScancodeApi extends HttpClient {
    public constructor() {
        super({
            baseURL: `${SCANCODE_API_URL}${SCANCODE_API_VERSION}`,
        });
        this.addRequestInterceptor((headers: Record<string, string>): Record<string, string> => {
            const token: string | null = getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            return headers;
        });
    }

    public async login(cpf: string, password: string): Promise<LoginResponseDTO> {
        const payload: LoginRequestDTO = {
            cpf,
            password,
            device_name: `${Device.manufacturer} ${Device.model}`,
        };
        const { data } = await this.post<LoginResponseDTO>('/auth/login', payload);
        return data;
    }

    public async getEvents(): Promise<EventsResponseDTO> {
        const { data } = await this.get<EventsResponseDTO>('/events');
        return data;
    }

    public async getClients(): Promise<ClientsResponseDTO> {
        const { data } = await this.get<ClientsResponseDTO>('/clients');
        return data;
    }

    public async postClient(body: ClientCreateRequestDTO): Promise<ClientResponseDTO> {
        const { data } = await this.post<ClientResponseDTO>('/clients', body);
        return data;
    }

    public async patchClient(remoteId: number, body: ClientUpdateRequestDTO): Promise<ClientResponseDTO> {
        const { data } = await this.patch<ClientResponseDTO>(`/clients/${remoteId}`, body);
        return data;
    }

    public async getProductCategories(): Promise<ProductCategoriesResponseDTO> {
        const { data } = await this.get<ProductCategoriesResponseDTO>('/product-categories');
        return data;
    }

    public async getProducts(): Promise<ProductsResponseDTO> {
        const { data } = await this.get<ProductsResponseDTO>('/products', { relations: ['productCategory'] });
        return data;
    }

    public async postProduct(body: ProductCreateRequestDTO): Promise<ProductResponseDTO> {
        const { data } = await this.post<ProductResponseDTO>('/products', body);
        return data;
    }

    public async patchProduct(remoteId: number, body: ProductUpdateRequestDTO): Promise<ProductResponseDTO> {
        const { data } = await this.patch<ProductResponseDTO>(`/products/${remoteId}`, body);
        return data;
    }

    public async getPaymentMethods(): Promise<PaymentMethodsResponseDTO> {
        const { data } = await this.get<PaymentMethodsResponseDTO>('/payment-methods');
        return data;
    }

    public async patchPaymentMethod(remoteId: number, body: PaymentMethodUpdateRequestDTO): Promise<PaymentMethodResponseDTO> {
        const { data } = await this.patch<PaymentMethodResponseDTO>(`/payment-methods/${remoteId}`, body);
        return data;
    }
}

//obs: singleton pattern padrao ouro se possivel IMITAR
export const scancodeApi: ScancodeApi = new ScancodeApi();
