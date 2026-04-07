export type FieldType = "radio" | "checkbox" | "dropdown" | "stepper" | "text_input";

export interface Option {
    id: string;
    label: string;
    priceModifier: number;
    priceLabel?: string;
    isDefault?: boolean;
    badge?: string | null;
    showInfo?: boolean;
    tooltip?: string;
}

export interface StepperConfig {
    min: number;
    max: number | null;
    default: number;
    unitLabel: string;
    pricePerUnit: number;
    bulkDiscount?: {
        threshold: number;
        discountPercent: number;
        bannerText: string;
    };
}

export interface SidebarSection {
    id: string;
    heading: string;
    fieldType: FieldType;
    required: boolean;
    displayOrder: number;
    options?: Option[];
    stepperConfig?: StepperConfig;
    placeholder?: string;
}

export interface SpeedOption {
    enabled: boolean;
    label: string;
    priceModifier: number;
    tooltip: string;
}

export interface Review {
    id: string;
    reviewerName: string;
    rating: number;
    text: string;
    isVerified: boolean;
    date: string;
}

export interface ServiceData {
    serviceId: string;
    title: string;
    slug: string;
    gameId: string;
    category: string;
    description: string;
    heroImage: string;
    featureTags: string[];
    estimatedStartTime: string;
    estimatedCompletionTime: string;
    basePrice: number;
    currency: "EUR" | "USD";
    showVAT: boolean;
    cashbackPercent: number;
    isActive: boolean;
    speedOptions: {
        express: SpeedOption;
        superExpress: SpeedOption;
    };
    sidebarSections: SidebarSection[];
    requirements: string[];
    reviews: Review[];
}
