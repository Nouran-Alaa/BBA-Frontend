/**
 * modal-portal.service.ts
 * Place at: src/app/core/services/modal-portal.service.ts
 *
 * Renders Angular components directly onto document.body so they are
 * never trapped inside overflow:hidden / CSS-transform stacking contexts
 * (e.g. CDK drag-drop containers).
 *
 * Usage inside a widget component:
 *
 *   this.portalRef = this.modalPortal.open(NewsFullscreenModalComponent, {
 *     article: myArticle,
 *   });
 *   this.portalRef.instance.close.subscribe(() => this.modalPortal.close(this.portalRef));
 */
import {
  Injectable,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  ComponentRef,
  Type,
} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalPortalService {
  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
  ) {}

  /**
   * Creates a component, attaches it to the Angular app, and appends its
   * host element to document.body.
   *
   * @param component  The standalone component class to instantiate.
   * @param inputs     Key/value pairs mapped to the component's @Input() fields.
   * @returns          The ComponentRef — subscribe to outputs via .instance.
   */
  open<T>(component: Type<T>, inputs: Partial<T> = {}): ComponentRef<T> {
    const ref = createComponent(component, {
      environmentInjector: this.injector,
    });

    // Apply inputs
    Object.entries(inputs).forEach(([key, value]) => {
      (ref.instance as any)[key] = value;
    });

    // Register with Angular's change detection
    this.appRef.attachView(ref.hostView);

    // Append to body — outside ALL stacking contexts
    document.body.appendChild(ref.location.nativeElement);

    return ref;
  }

  /** Detach and destroy a previously opened portal component. */
  close<T>(ref: ComponentRef<T>): void {
    this.appRef.detachView(ref.hostView);
    ref.destroy();
  }
}
