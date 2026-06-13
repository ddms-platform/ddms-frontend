import { Axios } from './axios';

export interface IBoatType {
  code: string;
  name_vi: string;
  name_en: string;
}

export const getBoatTypes = () => {
  return Axios.get<IBoatType[]>('/system/boat-types');
};
