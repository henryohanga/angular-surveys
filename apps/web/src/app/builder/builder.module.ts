import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BuilderComponent } from './builder.component';
import { QuestionEditorComponent } from './question-editor.component';
import { SurveyPreviewDialogComponent } from './survey-preview-dialog.component';
import { QuestionDialogComponent } from './question-dialog.component';
import { DeveloperPanelComponent } from './developer-panel/developer-panel.component';
import { DeveloperSettingsComponent } from './developer-settings/developer-settings.component';
import { WebhookManagementComponent } from './webhook-management/webhook-management.component';

@NgModule({
  declarations: [
    BuilderComponent,
    QuestionEditorComponent,
    SurveyPreviewDialogComponent,
    QuestionDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TextFieldModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatTabsModule,
    MatSliderModule,
    MatRadioModule,
    MatSlideToggleModule,
    DragDropModule,
    DeveloperPanelComponent,
    DeveloperSettingsComponent,
    WebhookManagementComponent,
  ],
})
export class BuilderModule {}
