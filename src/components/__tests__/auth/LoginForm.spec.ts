import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import LoginForm from '../../auth/LoginForm.vue';
import { loginSchema } from '@/schemas/auth';
import { toast } from 'vue-sonner';

// Mock data fixtures
const validLoginData = {
  email: 'test@example.com',
  password: 'Password123!',
};

const invalidLoginData = {
  email: 'invalid-email',
  password: 'short',
};

// Mock API responses
const successResponse = {
  ok: true,
  json: () => Promise.resolve({ success: true }),
};

const errorResponse = {
  ok: false,
  json: () => Promise.resolve({ error: 'Invalid credentials' }),
};

// Mock the modules
vi.mock('@/components/ui/sonner', () => ({
  Toaster: {
    render: () => null,
  },
}));

vi.mock('vue-sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Create a shared mock that can be modified by tests
let mockValidationErrors = {};
let mockIsValid = true;
let mockHandleSubmit = vi.fn().mockReturnValue(true);

vi.mock('@/composables/useFormValidation', () => ({
  useFormValidation: () => ({
    get validationErrors() {
      return mockValidationErrors;
    },
    get isValid() {
      return mockIsValid;
    },
    setFieldTouched: vi.fn(),
    get handleSubmit() {
      return mockHandleSubmit;
    },
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock window.location
const originalLocation = window.location;
beforeEach(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: '' },
  });
  mockValidationErrors = {};
  mockIsValid = true;
  mockHandleSubmit = vi.fn().mockReturnValue(true);
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: originalLocation,
  });
  vi.resetAllMocks();
});

describe('LoginForm', () => {
  it('renders the form correctly', () => {
    const wrapper = mount(LoginForm);

    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Sign In');
  });

  it('initializes with empty form data', () => {
    const wrapper = mount(LoginForm);

    const vm = wrapper.vm as unknown as typeof LoginForm;
    expect(vm.formData).toEqual({
      email: '',
      password: '',
    });
  });

  it('shows validation errors when form is submitted with empty fields', async () => {
    mockValidationErrors = {
      email: ['Please enter a valid email address'],
      password: ['Password must be at least 8 characters long'],
    };
    mockIsValid = false;
    mockHandleSubmit = vi.fn().mockReturnValue(false);

    const wrapper = mount(LoginForm);

    await wrapper.find('[data-testid="login-form"]').trigger('submit');
    await nextTick();

    const errorMessages = wrapper.findAll('[data-testid="error-message"]');
    expect(errorMessages.length).toBeGreaterThan(0);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('submits the form when valid data is provided', async () => {
    const wrapper = mount(LoginForm);
    mockFetch.mockResolvedValueOnce(successResponse);

    await wrapper.find('[data-testid="email-input"]').setValue(validLoginData.email);
    await wrapper.find('[data-testid="password-input"]').setValue(validLoginData.password);

    await wrapper.find('[data-testid="login-form"]').trigger('submit');

    await flushPromises();

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validLoginData),
    });

    expect(window.location.href).toBe('/generate');
  });

  it('shows error toast when API returns an error', async () => {
    const wrapper = mount(LoginForm);
    mockFetch.mockResolvedValueOnce(errorResponse);
    await wrapper.find('[data-testid="email-input"]').setValue(validLoginData.email);
    await wrapper.find('[data-testid="password-input"]').setValue(validLoginData.password);

    await wrapper.find('[data-testid="login-form"]').trigger('submit');
    await flushPromises();

    expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    expect(window.location.href).not.toBe('/generate');
  });

  it('shows generic error toast when fetch throws an exception', async () => {
    const wrapper = mount(LoginForm);

    // Mock fetch throwing an error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    // Fill in valid form data
    await wrapper.find('[data-testid="email-input"]').setValue(validLoginData.email);
    await wrapper.find('[data-testid="password-input"]').setValue(validLoginData.password);

    await wrapper.find('[data-testid="login-form"]').trigger('submit');

    await flushPromises();

    expect(toast.error).toHaveBeenCalledWith('An error occurred while logging in');
  });

  it('disables the submit button during form submission and enables it afterwards', async () => {
    const wrapper = mount(LoginForm);

    vi.useFakeTimers();

    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(successResponse);
          }, 100);
        })
    );

    await wrapper.find('[data-testid="email-input"]').setValue(validLoginData.email);
    await wrapper.find('[data-testid="password-input"]').setValue(validLoginData.password);

    await wrapper.find('[data-testid="login-form"]').trigger('submit');

    const button = wrapper.find('[data-testid="login-button"]');
    expect(button.attributes('disabled')).toBeDefined();

    vi.advanceTimersByTime(100);
    await flushPromises();

    expect(button.attributes('disabled')).toBeUndefined();

    vi.useRealTimers();
  });

  it('validates form data against the login schema', () => {
    expect(loginSchema.safeParse(validLoginData).success).toBe(true);
    expect(loginSchema.safeParse(invalidLoginData).success).toBe(false);
  });
});
