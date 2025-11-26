import { Component, EnvironmentInjector, Inject, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MWQuestion } from '../models';
import { QUESTION_COMPONENTS, QuestionComponentRegistry } from '../registry';

@Component({
  selector: 'app-question-host',
  template: '',
})
export class QuestionHostComponent implements OnInit {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;

  private setInputs(instance: unknown) {
    const target = instance as { question: MWQuestion; form: FormGroup };
    target.question = this.question;
    target.form = this.form;
  }

  constructor(
    private vcr: ViewContainerRef,
    private envInjector: EnvironmentInjector,
    @Inject(QUESTION_COMPONENTS) private registry: QuestionComponentRegistry,
  ) {}

  ngOnInit(): void {
    const cmp = this.registry[this.question.type];
    const ref = this.vcr.createComponent(cmp, { environmentInjector: this.envInjector });
    this.setInputs(ref.instance);
  }
}
