import api from '../src/api/index';

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  if (url.pathname.startsWith('/api')) {
    return api.fetch(context.request, context.env, context);
  }

  return context.next();
};
