import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppComponent } from './app/app';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
     provideHttpClient(withInterceptorsFromDi()),
     provideCharts(withDefaultRegisterables())
    // provideAnimations(),
  ],
});
