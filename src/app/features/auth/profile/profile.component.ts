import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  isEditing: boolean = false;
  isChangingPassword: boolean = false;
  passwordError: string = '';
  passwordSuccess: boolean = false;

  user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'SuperAdmin',
    company: 'BigBrother Analytics',
    phone: '+1 (555) 123-4567',
    bio: 'Analytics enthusiast and data visualization expert.',
    profileImage: 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff&size=200',
    joinedDate: new Date('2024-01-15'),
  };

  editForm = {
    name: '',
    email: '',
    phone: '',
    bio: '',
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  constructor(
    private router: Router,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.resetEditForm();
  }

  resetEditForm(): void {
    this.editForm = {
      name: this.user.name,
      email: this.user.email,
      phone: this.user.phone,
      bio: this.user.bio,
    };
  }

  toggleEdit(): void {
    if (this.isEditing) {
      this.resetEditForm();
    }
    this.isEditing = !this.isEditing;
  }

  saveProfile(): void {
    // TODO: Save to backend
    this.user.name = this.editForm.name;
    this.user.email = this.editForm.email;
    this.user.phone = this.editForm.phone;
    this.user.bio = this.editForm.bio;

    this.isEditing = false;
    console.log('Profile saved:', this.user);
  }

  togglePasswordChange(): void {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.resetPasswordForm();
    }
  }

  resetPasswordForm(): void {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  }

  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'Passwords do not match!';
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.passwordError = 'Password must be at least 8 characters long!';
      return;
    }

    // TODO: Change password via backend
    console.log('Password changed');
    this.passwordError = '';

    // Close the password form
    this.togglePasswordChange();

    // Show success toast
    this.toastService.success('Password changed successfully!');
  }

  uploadProfileImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.user.profileImage = e.target.result as string;
          // TODO: Upload to backend
          console.log('Profile image uploaded:', file.name);
        }
      };

      reader.readAsDataURL(file);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
