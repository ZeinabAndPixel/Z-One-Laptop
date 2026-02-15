
import { Injectable } from '@angular/core';
import { Project, Skill, Experience, Software, QRCode, PersonalInfo, Education } from './models';

declare const supabase: any;

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private client: any;
  private SUPABASE_URL = 'https://jokyqpddbiyefrfyxyaz.supabase.co';
  private SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impva3lxcGRkYml5ZWZyZnl4eWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjQ0MDcsImV4cCI6MjA4NTY0MDQwN30.UjTD3R-tBDG1v_cmGrvy9MCCbQEHET2w43BjPS9_4Rw';

  constructor() {}

  // Helper to wait for the CDN script to load
  private async getClient() {
    if (this.client) return this.client;

    // Retry up to 10 seconds (50 attempts * 200ms)
    let attempts = 0;
    while (typeof supabase === 'undefined' && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 200));
      attempts++;
    }

    if (typeof supabase === 'undefined') {
       throw new Error('Supabase SDK could not load. Please check your connection.');
    }

    this.client = supabase.createClient(this.SUPABASE_URL, this.SUPABASE_KEY);
    return this.client;
  }

  // --- AUTH ---
  async signIn(email: string, password: string) {
    const client = await this.getClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signUp(email: string, password: string) {
    const client = await this.getClient();
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  // --- DATA FETCHING ---
  async getProfile() {
    const client = await this.getClient();
    const { data, error } = await client.from('profile').select('*').single();
    if (error && error.code !== 'PGRST116') throw error; 
    return data;
  }

  async getEducation() {
    const client = await this.getClient();
    const { data, error } = await client.from('education').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getProjects() {
    const client = await this.getClient();
    const { data, error } = await client.from('projects').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getSkills() {
    const client = await this.getClient();
    const { data, error } = await client.from('skills').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  async getExperience() {
    const client = await this.getClient();
    const { data, error } = await client.from('experience').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getSoftwares() {
    const client = await this.getClient();
    const { data, error } = await client.from('softwares').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  async getQRCodes() {
    const client = await this.getClient();
    const { data, error } = await client.from('qr_codes').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  // --- DATA SAVING ---
  
  async updateProfile(profileData: PersonalInfo) {
    const client = await this.getClient();
    const dbPayload = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        gpa: profileData.gpa,
        photo_url: profileData.photoUrl,
        
        // ES
        languages: profileData.languages_es,
        nationality: profileData.nationality_es,
        location: profileData.location_es,
        bio: profileData.bio_es,
        focus: profileData.focus_es,
        
        // EN
        languages_en: profileData.languages_en,
        nationality_en: profileData.nationality_en,
        location_en: profileData.location_en,
        bio_en: profileData.bio_en,
        focus_en: profileData.focus_en
    };
    
    const { data: existing } = await client.from('profile').select('id').single();

    if (existing) {
       const { error } = await client.from('profile').update(dbPayload).eq('id', existing.id);
       if (error) throw error;
    } else {
       const { error } = await client.from('profile').insert(dbPayload);
       if (error) throw error;
    }
  }

  private async syncTable(tableName: string, items: any[], mapItemToPayload: (item: any) => any) {
    const client = await this.getClient();
    const { data: existingItems, error: fetchError } = await client.from(tableName).select('id');
    if (fetchError) throw fetchError;

    const existingIds = new Set((existingItems as any[]).map((i: any) => String(i.id)));
    const currentIds = new Set(items.filter(i => i.id).map(i => String(i.id)));

    const idsToDelete = [...existingIds].filter(id => !currentIds.has(id));
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await client.from(tableName).delete().in('id', idsToDelete);
      if (deleteError) throw deleteError;
    }

    for (const item of items) {
      const payload = mapItemToPayload(item);
      if (item.id) {
        const { error } = await client.from(tableName).update(payload).eq('id', item.id);
        if (error) throw error;
      } else {
        const { data, error } = await client.from(tableName).insert(payload).select('id').single();
        if (error) throw error;
        item.id = data.id;
      }
    }
  }

  async syncEducation(education: Education[]) {
    await this.syncTable('education', education, (e) => ({
      institution: e.institution,
      year: e.year,
      degree: e.degree_es,
      degree_en: e.degree_en
    }));
  }

  async syncProjects(projects: Project[]) {
    await this.syncTable('projects', projects, (p) => ({
      image: p.image, link: p.link, tags: p.tags,
      title: p.title_es, title_en: p.title_en,
      description: p.description_es, description_en: p.description_en
    }));
  }

  async syncSkills(skills: Skill[]) {
    await this.syncTable('skills', skills, (s) => ({
      icon: s.icon,
      name: s.name_es, name_en: s.name_en
    }));
  }

  async syncExperience(experience: Experience[]) {
    await this.syncTable('experience', experience, (e) => ({
      company: e.company, 
      role: e.role_es, role_en: e.role_en,
      duration: e.duration_es, duration_en: e.duration_en,
      description: e.description_es, description_en: e.description_en
    }));
  }

  async syncSoftwares(softwares: Software[]) {
    await this.syncTable('softwares', softwares, (s) => ({
      name: s.name, image_url: s.imageUrl
    }));
  }

  async syncQRCodes(qrCodes: QRCode[]) {
    await this.syncTable('qr_codes', qrCodes, (q) => ({
      image_url: q.imageUrl, link: q.link,
      platform: q.platform_es, platform_en: q.platform_en
    }));
  }
}
