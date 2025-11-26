import { Component } from '@angular/core';
import { } from '@angular/forms';
import { FormStateService } from './form-state.service';
import { MWForm, MWQuestion } from '../surveys/models';

@Component({
  selector: 'app-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss']
})
export class BuilderComponent {
  formDef: MWForm;
  selectedPage = 0;
  editorOpen = false;

  constructor(private state: FormStateService) {
    this.formDef = this.state.getForm();
  }

  addPage() {
    this.state.addPage();
    this.selectedPage = this.formDef.pages.length - 1;
  }

  openEditor() { this.editorOpen = true; }
  closeEditor() { this.editorOpen = false; }

  addQuestion(q: MWQuestion) {
    this.state.addQuestion(this.selectedPage, q);
    this.closeEditor();
  }
}
