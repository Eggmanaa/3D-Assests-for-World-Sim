import api from '../src/api/index';

export const onRequest: PagesFunction = async (context) => {
  return api.fetch(context.request, context.env, context);
};
