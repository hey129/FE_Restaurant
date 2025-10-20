import { supabase } from './supabaseClient';

interface CustomerProfile {
  customer_id: string;
  customer_name: string;
  phone: string;
  address: string | null;
  created_at: string;
  email?: string;
}

export interface ProfileWithEmail extends CustomerProfile {
  email: string;
}

export interface ProfileUpdate {
  customer_name?: string;
  phone?: string;
  address?: string | null;
}

export async function getProfile(): Promise<ProfileWithEmail> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Unauthorized - User not authenticated');
    }

    const { data, error } = await supabase
      .from('customer')
      .select('*')
      .eq('customer_id', user.id)
      .single();

    if (error) {
      console.error('[ProfileService] Error loading profile:', error);
      throw new Error('Failed to load profile');
    }

    if (!data) {
      throw new Error('Profile not found');
    }

    return {
      ...data,
      email: user.email || '',
    };
  } catch (error) {
    console.error('[ProfileService] getProfile failed:', error);
    throw error;
  }
}

export async function updateProfile(updates: ProfileUpdate): Promise<void> {
  try {
    if (updates.customer_name !== undefined && !updates.customer_name.trim()) {
      throw new Error('Họ và tên là bắt buộc');
    }

    if (updates.phone !== undefined && !updates.phone.trim()) {
      throw new Error('Số điện thoại là bắt buộc');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const updateData: Partial<ProfileUpdate> = {};
    
    if (updates.customer_name !== undefined) {
      updateData.customer_name = updates.customer_name.trim();
    }
    
    if (updates.phone !== undefined) {
      updateData.phone = updates.phone.trim();
    }
    
    if (updates.address !== undefined) {
      updateData.address = updates.address?.trim() || null;
    }

    const { error } = await supabase
      .from('customer')
      .update(updateData)
      .eq('customer_id', user.id);

    if (error) {
      console.error('[ProfileService] Error updating profile:', error);
      throw new Error('Cập nhật hồ sơ thất bại');
    }

    console.log('[ProfileService] Profile updated successfully');
  } catch (error) {
    console.error('[ProfileService] updateProfile failed:', error);
    throw error;
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user || !user.email) {
      throw new Error('User not found');
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      console.error('[ProfileService] Current password verification failed:', signInError);
      throw new Error('Mật khẩu hiện tại không đúng');
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('[ProfileService] Password update failed:', updateError);
      throw new Error('Đổi mật khẩu thất bại');
    }

    console.log('[ProfileService] Password changed successfully');
  } catch (error) {
    console.error('[ProfileService] changePassword failed:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('[ProfileService] Logout failed:', error);
      throw new Error('Đăng xuất thất bại');
    }

    console.log('[ProfileService] Logged out successfully');
  } catch (error) {
    console.error('[ProfileService] logout failed:', error);
    throw error;
  }
}
