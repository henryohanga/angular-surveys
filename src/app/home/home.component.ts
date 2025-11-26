import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  features: Feature[] = [
    {
      icon: 'drag_indicator',
      title: 'Drag & Drop Builder',
      description:
        'Intuitive drag-and-drop interface to create surveys quickly. Arrange questions, sections, and pages with ease.',
    },
    {
      icon: 'question_answer',
      title: '10+ Question Types',
      description:
        'Text fields, multiple choice, checkboxes, dropdowns, ratings, grids, date/time pickers, and more.',
    },
    {
      icon: 'account_tree',
      title: 'Conditional Logic',
      description:
        'Create dynamic surveys with page flows and skip logic based on respondent answers.',
    },
    {
      icon: 'visibility',
      title: 'Live Preview',
      description:
        'Preview your survey in real-time as you build. Test the complete flow before publishing.',
    },
    {
      icon: 'code',
      title: 'JSON Import/Export',
      description:
        'Export surveys as JSON for backup or import existing survey definitions. Full data portability.',
    },
    {
      icon: 'devices',
      title: 'Responsive Design',
      description:
        'Surveys look great on any device - desktop, tablet, or mobile. Accessible and user-friendly.',
    },
  ];

  templates: Template[] = [
    {
      id: 'customer-satisfaction',
      name: 'Customer Satisfaction',
      description: 'Measure customer satisfaction with your product or service',
      questionCount: 8,
      icon: 'sentiment_satisfied',
      color: '#1A73E8',
    },
    {
      id: 'employee-feedback',
      name: 'Employee Feedback',
      description: 'Gather insights from your team about workplace experience',
      questionCount: 12,
      icon: 'groups',
      color: '#34A853',
    },
    {
      id: 'event-registration',
      name: 'Event Registration',
      description: 'Collect registrations and preferences for your events',
      questionCount: 6,
      icon: 'event',
      color: '#EA4335',
    },
    {
      id: 'product-research',
      name: 'Product Research',
      description: 'Understand user needs and validate product ideas',
      questionCount: 10,
      icon: 'lightbulb',
      color: '#FBBC04',
    },
  ];

  constructor(private router: Router) {}

  startBuilding() {
    this.router.navigate(['/dashboard']);
  }

  viewDemo() {
    this.router.navigate(['/surveys']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  useTemplate(templateId: string) {
    // In a real app, this would load the template
    this.router.navigate(['/builder'], {
      queryParams: { template: templateId },
    });
  }
}
