import { Axios } from './axios';

export interface IBoatType {
  code: string;
  nameVi: string;
  nameEn: string;
}

export const getBoatTypes = () => {
  return Axios.get<IBoatType[]>('/system/boat-types');
};
