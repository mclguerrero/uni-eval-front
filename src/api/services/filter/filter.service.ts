import { httpClient } from '../../core/HttpClient';

/**
 * @swagger
 * tags:
 *   name: Filter
 *   description: Endpoints para obtener valores únicos de filtros desde vista_academica_insitus
 */

/**
 * Interface para la respuesta de filtros completos
 */
export interface FilterOption {
  id: number;
  nombre: string;
}

export interface FilterRolOption {
  id: number;
  nombre: string;
  origen: string;
  rol_origen_id: number;
}

export interface FilterResponse {
  sedes: FilterOption[];
  periodos: FilterOption[];
  programas: FilterOption[];
  semestres: FilterOption[];
  grupos: FilterOption[];
  roles: FilterRolOption[];
}

/**
 * Interface para respuestas de un solo tipo de filtro
 */
interface SingleFilterResponse<T = string[]> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * @swagger
 * /filter:
 *   get:
 *     tags: [Filter]
 *     summary: Obtiene todos los valores únicos para filtros
 *     description: Retorna sede, periodo, programa, semestre y grupo únicos desde vista_academica_insitus
 *     responses:
 *       200:
 *         description: Filtros obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Filtros obtenidos correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     sedes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [ "SEDE A", "SEDE B", "SEDE C" ]
 *                     periodos:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [ "2024", "2023", "2022" ]
 *                     programas:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [ "Ingeniería de Sistemas", "Medicina", "Derecho" ]
 *                     semestres:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "10" ]
 *                     grupos:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [ "A", "B", "C", "D" ]
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error al obtener filtros
 */
export const getAllFiltersLocal = async (): Promise<FilterResponse> => {
  try {
    const response = await httpClient.get('/filter');
    return response;
  } catch (error) {
    throw new Error('Error al obtener filtros');
  }
};

export const getAllFilters = getAllFiltersLocal;

/**
 * @swagger
 * /filter/sedes:
 *   get:
 *     tags: [Filter]
 *     summary: Obtiene valores únicos de sede
 *     description: Retorna todas las sedes únicas desde vista_academica_insitus
 *     responses:
 *       200:
 *         description: Sedes obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Sedes obtenidas correctamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [ "SEDE A", "SEDE B", "SEDE C" ]
 */
export const getSedes = async (): Promise<SingleFilterResponse<string[]>> => {
  try {
    const response = await httpClient.get('/filter/sedes');
    return response;
  } catch (error) {
    throw new Error('Error al obtener sedes');
  }
};

/**
 * @swagger
 * /filter/periodos:
 *   get:
 *     tags: [Filter]
 *     summary: Obtiene valores únicos de periodo
 *     description: Retorna todos los periodos únicos desde vista_academica_insitus (ordenados descendentemente). Se puede filtrar por sede.
 *     parameters:
 *       - in: query
 *         name: sede
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar periodos por sede
 *         example: SEDE A
 *     responses:
 *       200:
 *         description: Periodos obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Periodos obtenidos correctamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [ "2024", "2023", "2022" ]
 */
export const getPeriodos = async (
  sede?: string
): Promise<SingleFilterResponse<string[]>> => {
  try {
    const params = new URLSearchParams();
    if (sede) {
      params.append('sede', sede);
    }
    const queryString = params.toString();
    const url = queryString ? `/filter/periodos?${queryString}` : '/filter/periodos';
    const response = await httpClient.get(url);
    return response;
  } catch (error) {
    throw new Error('Error al obtener periodos');
  }
};

/**
 * @swagger
 * /filter/programas:
 *   get:
 *     tags: [Filter]
 *     summary: Obtiene valores únicos de programa
 *     description: Retorna todos los programas únicos desde vista_academica_insitus. Se puede filtrar por sede y periodo.
 *     parameters:
 *       - in: query
 *         name: sede
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar programas por sede
 *         example: SEDE A
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar programas por periodo
 *         example: "2024"
 *     responses:
 *       200:
 *         description: Programas obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Programas obtenidos correctamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [ "Ingeniería de Sistemas", "Medicina", "Derecho" ]
 */
export const getProgramas = async (
  sede?: string,
  periodo?: string
): Promise<SingleFilterResponse<string[]>> => {
  try {
    const params = new URLSearchParams();
    if (sede) {
      params.append('sede', sede);
    }
    if (periodo) {
      params.append('periodo', periodo);
    }
    const queryString = params.toString();
    const url = queryString ? `/filter/programas?${queryString}` : '/filter/programas';
    const response = await httpClient.get(url);
    return response;
  } catch (error) {
    throw new Error('Error al obtener programas');
  }
};

/**
 * @swagger
 * /filter/semestres:
 *   get:
 *     tags: [Filter]
 *     summary: Obtiene valores únicos de semestre
 *     description: Retorna todos los semestres únicos desde vista_academica_insitus. Se puede filtrar por sede, periodo y programa.
 *     parameters:
 *       - in: query
 *         name: sede
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar semestres por sede
 *         example: SEDE A
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar semestres por periodo
 *         example: "2024"
 *       - in: query
 *         name: programa
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar semestres por programa
 *         example: Ingeniería de Sistemas
 *     responses:
 *       200:
 *         description: Semestres obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Semestres obtenidos correctamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "10" ]
 */
export const getSemestres = async (
  sede?: string,
  periodo?: string,
  programa?: string
): Promise<SingleFilterResponse<string[]>> => {
  try {
    const params = new URLSearchParams();
    if (sede) {
      params.append('sede', sede);
    }
    if (periodo) {
      params.append('periodo', periodo);
    }
    if (programa) {
      params.append('programa', programa);
    }
    const queryString = params.toString();
    const url = queryString ? `/filter/semestres?${queryString}` : '/filter/semestres';
    const response = await httpClient.get(url);
    return response;
  } catch (error) {
    throw new Error('Error al obtener semestres');
  }
};

/**
 * @swagger
 * /filter/grupos:
 *   get:
 *     tags: [Filter]
 *     summary: Obtiene valores únicos de grupo
 *     description: Retorna todos los grupos únicos desde vista_academica_insitus. Se puede filtrar por sede, periodo, programa y semestre.
 *     parameters:
 *       - in: query
 *         name: sede
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar grupos por sede
 *         example: SEDE A
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar grupos por periodo
 *         example: "2024"
 *       - in: query
 *         name: programa
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar grupos por programa
 *         example: Ingeniería de Sistemas
 *       - in: query
 *         name: semestre
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar grupos por semestre
 *         example: "1"
 *     responses:
 *       200:
 *         description: Grupos obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Grupos obtenidos correctamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [ "A", "B", "C", "D" ]
 */
export const getGrupos = async (
  sede?: string,
  periodo?: string,
  programa?: string,
  semestre?: string
): Promise<SingleFilterResponse<string[]>> => {
  try {
    const params = new URLSearchParams();
    if (sede) {
      params.append('sede', sede);
    }
    if (periodo) {
      params.append('periodo', periodo);
    }
    if (programa) {
      params.append('programa', programa);
    }
    if (semestre) {
      params.append('semestre', semestre);
    }
    const queryString = params.toString();
    const url = queryString ? `/filter/grupos?${queryString}` : '/filter/grupos';
    const response = await httpClient.get(url);
    return response;
  } catch (error) {
    throw new Error('Error al obtener grupos');
  }
};

export const filterService = {
  getAllFiltersLocal,
  getAllFilters,
  getSedes,
  getPeriodos,
  getProgramas,
  getSemestres,
  getGrupos,
};

export default filterService;
