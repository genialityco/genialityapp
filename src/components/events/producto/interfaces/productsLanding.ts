import { SizeContextProps } from "antd/lib/config-provider/SizeContext";

//tipeo productCard
export interface ProductCardProps {
    product: {
        _id: string;
        name: string;
        discount: number;
        price: number;
        images: string[];
        type: string
    };
    eventId: string;
    history: any;
}
// tipeo componente productDetails
export interface MatchParams {
    id: string;
    eventId: string;
    event_id: string;
}

export interface Product {
    _id: string;
    name: string;
    discount: number;
    price: number;
    images: string[];
    type: string;
    position: number;
    description: string;
    by: string;
    currency: string;
    start_price: number;
}
// export interface Product {
//     by: string;
//     description: string;
//     discount: null | number;
//     images: string[];
//     name: string;
//     price: string;
//     type: string;
//     _id: string;
// }
export interface FirestoreConfigData {
    data: {
        habilitar_subasta: boolean;
        message: string;
    };
}

// tipeo productList
export interface ProductListProps extends SizeContextProps {
    cEvent: {
        value: {
            _id: string
        };
    }
}
//tipeo oferta producto 
export interface OfertaProductProps {
    product: Product;
    eventId: string;
    cEventUser: {
        value: {
            rol_id: string;
        };
    };
    cUser: number;
    hability: boolean;
    messageF: string;
    updateValues: () => void;
    priceWithDiscount: number;
    priceWithoutDiscount: number;
}