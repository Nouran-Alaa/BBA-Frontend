import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  emailNotifications: boolean = true;
  passwordError: string = '';

  // Password visibility toggles
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'SuperAdmin',
    company: 'BigBrother Analytics',
    phone: '+1 (555) 123-4567',
    bio: 'Analytics enthusiast and data visualization expert.',
    profileImage: 'https://ui-avatars.com/api/?name=John+Doe&background=0099cc&color=fff&size=200',
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

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.resetEditForm();
  }

  getUserInitials(): string {
    return this.user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  resetEditForm(): void {
    this.editForm = {
      name: this.user.name,
      email: this.user.email,
      phone: this.user.phone,
      bio: this.user.bio,
    };
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.resetEditForm();
  }

  saveProfile(): void {
    // Update user object
    this.user.name = this.editForm.name;
    this.user.email = this.editForm.email;
    this.user.phone = this.editForm.phone;
    this.user.bio = this.editForm.bio;

    // Update profile image URL with new name
    this.user.profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user.name)}&background=0099cc&color=fff&size=200`;

    this.isEditing = false;
    this.toastService.success('Profile updated successfully!');

    // TODO: Save to backend
    console.log('Profile saved:', this.user);
  }

  // Password Change Methods
  startPasswordChange(): void {
    this.isChangingPassword = true;
    this.resetPasswordForm();
  }

  cancelPasswordChange(): void {
    this.isChangingPassword = false;
    this.resetPasswordForm();
  }

  resetPasswordForm(): void {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    this.passwordError = '';
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  getPasswordStrength(): number {
    const password = this.passwordForm.newPassword;
    if (!password) return 0;

    let strength = 0;

    // Length
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Complexity
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    // Return 1-3 scale
    if (strength <= 2) return 1; // Weak
    if (strength <= 4) return 2; // Medium
    return 3; // Strong
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength === 1) return 'Weak password';
    if (strength === 2) return 'Medium strength';
    return 'Strong password';
  }

  isPasswordFormValid(): boolean {
    return (
      this.passwordForm.currentPassword.length > 0 &&
      this.passwordForm.newPassword.length >= 8 &&
      this.passwordForm.newPassword === this.passwordForm.confirmPassword
    );
  }

  changePassword(): void {
    // Clear previous errors
    this.passwordError = '';

    // Validate passwords match
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'Passwords do not match!';
      return;
    }

    // Validate password length
    if (this.passwordForm.newPassword.length < 8) {
      this.passwordError = 'Password must be at least 8 characters long!';
      return;
    }

    // Validate current password (mock validation)
    // TODO: In real implementation, verify with backend
    if (this.passwordForm.currentPassword !== 'demo') {
      // This is just for demo - remove in production
      console.log('Current password check would happen here');
    }

    // TODO: Send to backend
    console.log('Password change request:', {
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword,
    });

    // Success
    this.toastService.success('Password changed successfully!');
    this.cancelPasswordChange();
  }

  uploadProfileImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastService.error('Please upload an image file');
        return;
      }

      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.user.profileImage = e.target.result as string;
          this.toastService.success('Profile image updated!');

          // TODO: Upload to backend
          console.log('Profile image uploaded:', file.name);
        }
      };

      reader.readAsDataURL(file);
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
