import type {
  ServiceFormState,
  ComboForm,
  RoomForm,
  RouteForm,
  FaqForm,
} from '../service-tab';

export type ArrayName = 'combos' | 'rooms' | 'faqs' | 'routes';
export type ImageArrayName = 'combos' | 'rooms';

export interface ServiceHandlers {
  updateService: (
    id: string,
    field: keyof ServiceFormState,
    value: any,
  ) => void;
  addArrayItem: (serviceId: string, arrayName: ArrayName) => void;
  updateArrayItem: (
    serviceId: string,
    arrayName: ArrayName,
    index: number,
    field: string,
    value: string,
  ) => void;
  uploadImage: (
    serviceId: string,
    arrayName: ImageArrayName,
    index: number,
    file: File,
  ) => void;
}

export type { ComboForm, RoomForm, RouteForm, FaqForm, ServiceFormState };
