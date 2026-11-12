import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.giphyApiUrl)) {
    return next(req);
  }
  return next(req.clone({ setParams: { api_key: environment.giphyApiKey } }));
};
