'use client';

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { CalendarIcon, CameraIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  useGetCurrentUserQuery,
  useUpdateUserMutation,
  useUpdatePasswordMutation,
  useUpdateUserAvatarMutation,
} from '@/store/skillSwapApi/skillSwapApi';
import { updateUserProfile } from '@/store/user';
import { toast } from 'sonner';

export default function ProfilePersonal() {
  const dispatch = useDispatch();
  const { data: userData, isLoading } = useGetCurrentUserQuery();
  const [updateUser] = useUpdateUserMutation();
  const [updatePassword] = useUpdatePasswordMutation();
  const [updateUserAvatar] = useUpdateUserAvatarMutation();

  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    about: '',
    birthdate: '',
    gender: 'UNKNOWN' as 'MALE' | 'FEMALE' | 'UNKNOWN',
    city: '',
  });

  const [passwordData, setPasswordData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = React.useState<
    Record<string, string>
  >({});

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, загрузите изображение');
      return;
    }

    // Проверяем размер файла (максимум 5 МБ)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5 МБ');
      return;
    }

    // Upload file directly
    setIsUploading(true);
    updateUserAvatar(file)
      .unwrap()
      .then((result) => {
        dispatch(updateUserProfile(result));
        toast.success('Аватар успешно обновлен');
      })
      .catch((error) => {
        console.error('Failed to upload avatar:', error);
        toast.error('Не удалось загрузить аватар. Попробуйте еще раз.');
      })
      .finally(() => {
        setIsUploading(false);
        // Сбрасываем значение input, чтобы можно было загрузить тот же файл снова
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  };

  const handleRemoveAvatar = async () => {
    if (!userData) return;
    
    try {
      const result = await updateUser({
        name: userData.name,
        avatar: ''
      }).unwrap();
      dispatch(updateUserProfile(result));
      toast.success('Аватар успешно удален');
    } catch (error) {
      console.error('Failed to remove avatar:', error);
      toast.error('Не удалось удалить аватар. Попробуйте еще раз.');
    }
  };

  // Initialize form data when user data loads
  React.useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        about: userData.about || '',
        birthdate: userData.birthdate || '',
        gender: userData.gender || 'UNKNOWN',
        city: userData.city || '',
      });
    }
  }, [userData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [id]: value }));

    // Clear error when user starts typing
    if (passwordErrors[id]) {
      setPasswordErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (value: string, field: string) => {
    if (field === 'gender') {
      value = value || 'UNKNOWN';
    } else if (field === 'city') {
      value = value || '';
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно для заполнения';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (passwordData.newPassword && !passwordData.currentPassword) {
      newErrors.currentPassword = 'Введите текущий пароль';
    }

    if (passwordData.newPassword && passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Пароль должен содержать минимум 6 символов';
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Пароли не совпадают';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    if (!userData) return false;

    return (
      formData.name !== userData.name ||
      formData.email !== userData.email ||
      formData.about !== (userData.about || '') ||
      formData.birthdate !== (userData.birthdate || '') ||
      formData.gender !== (userData.gender || 'UNKNOWN') ||
      formData.city !== (userData.city || '') ||
      passwordData.newPassword !== ''
    );
  };

  const handleSave = async () => {
    const isFormValid = validateForm();
    const isPasswordFormValid = validatePasswordForm();

    if (!isFormValid || !isPasswordFormValid) {
      return;
    }

    setIsSaving(true);
    let profileDataUpdated = false;

    try {
      // Update user profile if there are changes
      if (
        formData.name !== userData?.name ||
        formData.about !== (userData?.about || '') ||
        formData.birthdate !== (userData?.birthdate || '') ||
        formData.city !== (userData?.city || '') ||
        formData.gender !== (userData?.gender || 'UNKNOWN')
      ) {
        const result = await updateUser({
          name: formData.name,
          about: formData.about || undefined,
          birthdate: formData.birthdate || undefined,
          city: formData.city || undefined,
          gender: formData.gender,
        }).unwrap();

        // Update local state
        dispatch(updateUserProfile(result));
        profileDataUpdated = true;
      }

      // Update password if there are changes
      if (passwordData.newPassword) {
        await updatePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }).unwrap();

        // Reset password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });

        toast.success('Пароль успешно изменен');
      }

      if (profileDataUpdated) {
        toast.success('Данные профиля успешно обновлены');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      // Type guard to check if error has data property
      if (
        error &&
        typeof error === 'object' &&
        'data' in error &&
        error.data &&
        typeof error.data === 'object' &&
        'message' in error.data
      ) {
        toast.error((error.data as { message: string }).message);
      } else {
        toast.error('Не удалось сохранить данные. Попробуйте еще раз.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-background p-6 lg:p-[60px]">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-background p-6 lg:p-[60px]">
      <div className="flex flex-col-reverse items-center gap-12 lg:flex-row lg:items-start lg:justify-start lg:gap-[100px] xl:gap-[196px]">
        <form className="w-full max-w-md flex-1">
          <FieldGroup className="flex flex-col gap-4">
            <div>
              <Field>
                <FieldLabel>Почта</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </InputGroup>
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="name">Имя</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </InputGroup>
                {errors.name && <FieldError>{errors.name}</FieldError>}
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <Field>
                <FieldLabel htmlFor="birthdate">Дата рождения</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                  />
                  <InputGroupAddon>
                    <InputGroupButton
                      variant="ghost"
                      size="icon-xs"
                      type="button"
                    >
                      <CalendarIcon />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="gender">Пол</FieldLabel>
                <select
                  value={formData.gender}
                  onChange={(e) => handleSelectChange(e.target.value, 'gender')}
                  className="w-full p-2 border rounded"
                >
                  <option value="FEMALE">Женский</option>
                  <option value="MALE">Мужской</option>
                  <option value="UNKNOWN">Не указан</option>
                </select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="city">Город</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Введите город"
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="about">О себе</FieldLabel>
              <InputGroup className="items-center">
                <InputGroupTextarea
                  id="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  className="min-h-[120px] resize-none"
                />
              </InputGroup>
            </Field>

            {/* Password Fields */}
            <div className="border-t pt-4 mt-2">
              <h3 className="text-lg font-medium mb-4">Изменение пароля</h3>

              <Field>
                <FieldLabel htmlFor="currentPassword">
                  Текущий пароль
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                  <InputGroupAddon>
                    <InputGroupButton
                      variant="ghost"
                      size="icon-xs"
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {passwordErrors.currentPassword && (
                  <FieldError>{passwordErrors.currentPassword}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="newPassword">Новый пароль</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                  <InputGroupAddon>
                    <InputGroupButton
                      variant="ghost"
                      size="icon-xs"
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {passwordErrors.newPassword && (
                  <FieldError>{passwordErrors.newPassword}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmNewPassword">
                  Подтвердите новый пароль
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="confirmNewPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                  />
                  <InputGroupAddon>
                    <InputGroupButton
                      variant="ghost"
                      size="icon-xs"
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {passwordErrors.confirmNewPassword && (
                  <FieldError>{passwordErrors.confirmNewPassword}</FieldError>
                )}
              </Field>
            </div>

            <Button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges() || isSaving}
              className="mt-4 w-full"
            >
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </FieldGroup>
        </form>

        <div className="relative shrink-0">
          <Avatar className="size-[244px] relative">
            <AvatarImage
              src={
                userData?.avatar
                  ? `${userData.avatar}?${new Date().getTime()}`
                  : '/assets/placeholder.svg'
              }
              alt="User avatar"
              className="object-cover"
            />
            <AvatarFallback className="text-4xl">
              {userData?.name?.charAt(0) || 'U'}
            </AvatarFallback>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
          </Avatar>
          <div className="flex gap-2 absolute bottom-0 right-0">
            <Button
              size="icon"
              className="size-14 rounded-full bg-primary hover:bg-primary/90 transition-all"
              type="button"
              onClick={handleAvatarClick}
              disabled={isUploading}
            >
              <CameraIcon className="size-6" />
              <span className="sr-only">Изменить фото</span>
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
