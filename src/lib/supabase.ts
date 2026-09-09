import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bkmnmbiqwcapczwalvsx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrbW5tYmlxd2NhcGN6d2FsdnN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NjY5MTgsImV4cCI6MjEwNDQ0MjkxOH0.Ycgj_9HtDkQlMeeWvg2N7cDtGVwkb4UKC8p1Xn7nzks';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Product {
  id: number;
  name: string;
  description: string;
  long_description: string;
  price: number;
  original_price?: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  category: string;
  origin: string;
  roast: string;
  notes: string[];
  weight: string;
  image: string;
  rating: number;
  reviews: number;
  is_active: boolean;
  stock_count: number;
}

export interface Order {
  id: number;
  user_id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_landmark?: string;
  payment_method: string;
  payment_status: string;
  mobile_banking_provider?: string;
  mobile_banking_number?: string;
  mobile_banking_transaction_id?: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
}

export interface UserAddress {
  id: number;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  landmark?: string;
  is_default: boolean;
}

// Helper functions
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createOrder(orderData: any) {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function createOrderItems(items: any[]) {
  const { data, error } = await supabase
    .from('order_items')
    .insert(items)
    .select();
  
  if (error) throw error;
  return data;
}

export async function getUserOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId: number, status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select();
  
  if (error) throw error;
  return data;
}

export async function createUserProfile(profile: any) {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([profile])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserAddresses(userId: string) {
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createUserAddress(address: any) {
  const { data, error } = await supabase
    .from('user_addresses')
    .insert([address])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
