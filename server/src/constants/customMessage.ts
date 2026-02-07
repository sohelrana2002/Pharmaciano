export const customMessage = {
  created: (entity: string) => `${entity} created successfully.`,

  updated: (entity: string, id?: string) =>
    id
      ? `${entity} with ID ${id} updated successfully.`
      : `${entity} updated successfully.`,

  deleted: (entity: string, id?: string) =>
    id
      ? `${entity} with ID ${id} deleted successfully.`
      : `${entity} deleted successfully.`,

  found: (entity: string, id?: string) =>
    id
      ? `${entity} with ID ${id} fetched successfully.`
      : `${entity} fetched successfully.`,

  notFound: (entity: string, id?: string) =>
    id ? `${entity} with ID ${id} not found.` : `${entity} not found.`,

  invalidId: (entity: string, id?: string) => `Invalid ${entity} ID ${id}.`,

  alreadyExists: (entity: string) => `${entity} already exists.`,

  unauthorized: () => `You are not authorized to perform this action.`,

  serverError: () =>
    `Something went wrong. Internal server error. Please try again later.`,
};
