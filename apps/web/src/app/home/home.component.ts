import { Component, OnInit, inject } from '@angular/core';
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

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly features: Feature[] = [
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
      icon: 'webhook',
      title: 'Webhooks & Integrations',
      description:
        'Real-time notifications when responses are submitted. Signed payloads with HMAC verification for security.',
    },
    {
      icon: 'code',
      title: 'Developer Mode',
      description:
        'API credentials, external ID mappings, and webhook management. Built for seamless system integration.',
    },
    {
      icon: 'bar_chart',
      title: 'Response Analytics',
      description:
        'View and analyze survey responses in real-time. Export data and track completion rates.',
    },
    {
      icon: 'devices',
      title: 'Responsive Design',
      description:
        'Surveys and builder look great on any device. Premium UI with Material Design 3 components.',
    },
  ];

  protected readonly templates: Template[] = [
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

  protected readonly isAuthenticated$: Observable<boolean> =
    this.authService.isAuthenticated$;
  protected readonly currentUser$: Observable<User | null> =
    this.authService.currentUser$;

  ngOnInit(): void {
    // Redirect to dashboard if user is already authenticated
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  protected viewDemo(): void {
    this.router.navigate(['/demo']);
  }

  protected useTemplate(templateId: string): void {
    // Redirect to dashboard with template parameter
    // Dashboard will handle creating survey from template
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard'], {
        queryParams: { template: templateId },
      });
    } else {
      // Prompt guests to register first
      this.router.navigate(['/register']);
    }
  }
}
