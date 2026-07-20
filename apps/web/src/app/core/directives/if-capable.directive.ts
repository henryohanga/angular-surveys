import {
  Directive,
  Input,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CAPABILITY_SERVICE } from '../tokens';

@Directive({
  selector: '[ifCapable]',
  standalone: false,
})
export class IfCapableDirective implements OnInit, OnDestroy {
  @Input('ifCapable') capability = '';

  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly capabilityService = inject(CAPABILITY_SERVICE, { optional: true });

  private subscription?: Subscription;
  private hasView = false;

  ngOnInit(): void {
    if (!this.capabilityService) {
      return;
    }

    this.subscription = this.capabilityService
      .isCapable(this.capability)
      .subscribe((capable) => {
        if (capable && !this.hasView) {
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasView = true;
        } else if (!capable && this.hasView) {
          this.viewContainer.clear();
          this.hasView = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
