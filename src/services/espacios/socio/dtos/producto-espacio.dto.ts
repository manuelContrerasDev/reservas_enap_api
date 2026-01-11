import { TipoEspacio, ModalidadCobro } from "@prisma/client";

export interface ProductoEspacioDTO {
  tipo: TipoEspacio;

  nombre: string;
  descripcion: string;

  capacidad: number;
  modalidadCobro: ModalidadCobro;

  precioBaseSocio: number;
  precioBaseExterno: number;

  totalUnidades: number;
  unidadesDisponibles?: number; // se activa con fecha

  imagenes: string[];

  // flags de UX
  reservable: boolean;
}
