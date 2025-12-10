import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../core/services/auth.service';
import { Observable } from 'rxjs';

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

@Component({ standalone: false,
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
      title: '18+ Question Types',
      description:
        'Text, email, phone, ratings, NPS, star ratings, file uploads, signatures, matrix grids, and more.',
    },
    {
      icon: 'auto_awesome',
      title: 'Premium Dialogs',
      description:
        'Modern, categorized question editor with live configuration. Beautiful, responsive modal interfaces.',
    },
    {
      icon: 'visibility',
      title: 'Live Preview',
      description:
        'Preview your survey in real-time with desktop/mobile toggle. Test the complete flow before publishing.',
    },
    {
      icon: 'dashboard',
      title: 'Survey Dashboard',
      description:
        'Manage all your surveys in one place. Save drafts, publish, and organize with IndexedDB storage.',
    },
    {
      icon: 'devices',
      title: 'Responsive Design',
      description:
        'Surveys and builder look great on any device. Premium UI with Material Design 3 components.',
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

  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;

  constructor(private router: Router, private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

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
