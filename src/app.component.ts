
import { Component, computed, signal, inject, PLATFORM_ID, EffectRef, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project, Skill, Experience, Software, QRCode, PersonalInfo, Education } from './models';
import { SupabaseService } from './supabase.service';

declare const jspdf: any;

const INITIAL_DATA = {
  personal: {
    name: "Zeinab Muslumani", // Placeholder default
    gpa: "",
    languages_es: "",
    languages_en: "",
    nationality_es: "",
    nationality_en: "",
    email: "",
    phone: "",
    location_es: "",
    location_en: "",
    bio_es: "",
    bio_en: "",
    focus_es: "",
    focus_en: "",
    photoUrl: "" 
  } as PersonalInfo,
  education: [] as Education[],
  skills: [] as Skill[],
  experience: [] as Experience[],
  softwares: [] as Software[],
  qrCodes: [] as QRCode[],
  projects: [] as Project[]
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  private platformId = inject(PLATFORM_ID);
  private supabase = inject(SupabaseService);
  
  // --- STATE ---
  // RAW Data (Structure matches DB/Interfaces with _es/_en)
  dbData = signal(JSON.parse(JSON.stringify(INITIAL_DATA)));
  
  isLoading = signal(true);
  isDarkMode = signal<boolean>(true);
  currentLang = signal<'es' | 'en'>('es'); // Language toggle

  // Admin UI State
  showLoginModal = signal(false);
  showAdminPanel = signal(false);
  loginEmail = signal('');
  loginPassword = signal('');
  loginError = signal<string | null>(null);
  isLoggingIn = signal(false);
  isSaving = signal(false);
  
  // Edit State (Copy of dbData for Forms)
  editData = signal(JSON.parse(JSON.stringify(INITIAL_DATA)));
  activeTab = signal<'personal' | 'projects' | 'skills' | 'experience' | 'education' | 'softwares' | 'qrcodes'>('personal');
  editLangTab = signal<'es' | 'en'>('es'); // Sub-tab for editing specific language fields

  // Computed View Data (Flattened for easy template usage)
  viewData = computed(() => {
    const raw = this.dbData();
    const lang = this.currentLang();
    const isEs = lang === 'es';

    // Helper to pick lang
    const txt = (es: string, en: string) => (isEs ? (es || en) : (en || es));

    // Get the first item from education for the hero subtitle (optional fallback)
    const mainEducation = raw.education && raw.education.length > 0 
        ? txt(raw.education[0].degree_es, raw.education[0].degree_en) 
        : '';

    return {
      personal: {
        ...raw.personal,
        title: mainEducation, // Using first degree as main title if dynamic title is removed
        languages: txt(raw.personal.languages_es, raw.personal.languages_en),
        nationality: txt(raw.personal.nationality_es, raw.personal.nationality_en),
        location: txt(raw.personal.location_es, raw.personal.location_en),
        bio: txt(raw.personal.bio_es, raw.personal.bio_en),
        focus: txt(raw.personal.focus_es, raw.personal.focus_en),
      },
      education: raw.education.map((e: Education) => ({
        ...e,
        degree: txt(e.degree_es, e.degree_en)
      })),
      projects: raw.projects.map((p: Project) => ({
        ...p,
        title: txt(p.title_es, p.title_en),
        description: txt(p.description_es, p.description_en)
      })),
      skills: raw.skills.map((s: Skill) => ({
        ...s,
        name: txt(s.name_es, s.name_en)
      })),
      experience: raw.experience.map((e: Experience) => ({
        ...e,
        role: txt(e.role_es, e.role_en),
        duration: txt(e.duration_es, e.duration_en),
        description: txt(e.description_es, e.description_en)
      })),
      qrCodes: raw.qrCodes.map((q: QRCode) => ({
        ...q,
        platform: txt(q.platform_es, q.platform_en)
      })),
      softwares: raw.softwares // No translation needed usually
    };
  });

  currentYear = new Date().getFullYear();

  socials = [
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/zeinab-muslumani-3992632b4/', icon: 'linkedin' },
    { name: 'GitHub', url: 'https://github.com/ZeinabAndPixel', icon: 'github' },
    { name: 'Instagram', url: 'https://instagram.com/Z3IN4AB', icon: 'instagram' },
    { name: 'WhatsApp', url: 'https://wa.me/584248244869', icon: 'whatsapp' },
    { name: 'Telegram', url: 'https://t.me/+584248244869', icon: 'telegram' }
  ];

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initTheme();
      setTimeout(() => this.loadDataFromSupabase(), 500);
    }
  }

  private initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      this.isDarkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    effect(() => {
      const isDark = this.isDarkMode();
      const html = document.documentElement;
      if (isDark) {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  toggleLanguage() {
    this.currentLang.update(l => l === 'es' ? 'en' : 'es');
  }

  async loadDataFromSupabase() {
    try {
      this.isLoading.set(true);
      
      const [profileData, eduData, projectsData, skillsData, expData, softData, qrData] = await Promise.all([
        this.supabase.getProfile().catch(err => null),
        this.supabase.getEducation().catch(err => []),
        this.supabase.getProjects().catch(err => []),
        this.supabase.getSkills().catch(err => []),
        this.supabase.getExperience().catch(err => []),
        this.supabase.getSoftwares().catch(err => []),
        this.supabase.getQRCodes().catch(err => [])
      ]);

      this.dbData.update(current => {
        const newData = { ...current };

        if (profileData) {
          newData.personal = {
            ...current.personal,
            name: profileData.name || current.personal.name,
            email: profileData.email || current.personal.email,
            phone: profileData.phone || current.personal.phone,
            gpa: profileData.gpa || current.personal.gpa,
            photoUrl: profileData.photo_url || current.personal.photoUrl,
            // Map DB columns to our Interface
            languages_es: profileData.languages || current.personal.languages_es,
            languages_en: profileData.languages_en || current.personal.languages_en,
            nationality_es: profileData.nationality || current.personal.nationality_es,
            nationality_en: profileData.nationality_en || current.personal.nationality_en,
            location_es: profileData.location || current.personal.location_es,
            location_en: profileData.location_en || current.personal.location_en,
            bio_es: profileData.bio || current.personal.bio_es,
            bio_en: profileData.bio_en || current.personal.bio_en,
            focus_es: profileData.focus || current.personal.focus_es,
            focus_en: profileData.focus_en || current.personal.focus_en,
          };
        }

        if (eduData?.length) {
            newData.education = eduData.map((e: any) => ({
                id: e.id,
                institution: e.institution,
                year: e.year,
                degree_es: e.degree,
                degree_en: e.degree_en || e.degree
            }));
        }

        if (projectsData?.length) {
            newData.projects = projectsData.map((p: any) => ({
                id: p.id,
                title_es: p.title,
                title_en: p.title_en || p.title,
                description_es: p.description,
                description_en: p.description_en || p.description,
                tags: p.tags || [],
                image: p.image,
                link: p.link
            }));
        }

        if (skillsData?.length) {
            newData.skills = skillsData.map((s: any) => ({
                id: s.id,
                icon: s.icon,
                name_es: s.name,
                name_en: s.name_en || s.name
            }));
        }

        if (expData?.length) {
            newData.experience = expData.map((e: any) => ({
                id: e.id,
                company: e.company,
                role_es: e.role,
                role_en: e.role_en || e.role,
                duration_es: e.duration,
                duration_en: e.duration_en || e.duration,
                description_es: e.description,
                description_en: e.description_en || e.description
            }));
        }

        if (softData?.length) newData.softwares = softData.map((s:any) => ({...s, imageUrl: s.image_url}));
        if (qrData?.length) {
             newData.qrCodes = qrData.map((q:any) => ({
                 id: q.id, imageUrl: q.image_url, link: q.link,
                 platform_es: q.platform,
                 platform_en: q.platform_en || q.platform
             }));
        }

        return newData;
      });

    } catch (error) {
      console.error('Error loading data from Supabase:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleTheme() {
    this.isDarkMode.update(current => !current);
  }

  scrollToSection(id: string) {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  handleImageError(event: any) {
    const name = this.dbData().personal.name || 'User';
    event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=512&color=fff`;
  }
  
  isUrl(str: string): boolean {
    return str.startsWith('http') || str.startsWith('data:image');
  }

  // --- PDF GENERATION ---
  generateCV() {
    if (!isPlatformBrowser(this.platformId) || typeof jspdf === 'undefined') {
      alert('La librería PDF no está cargada.');
      return;
    }

    // Use viewData so we print in the current language
    const d = this.viewData();
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    const margin = 20;
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);

    const addSectionTitle = (title: string) => {
      yPos += 8;
      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.text(title.toUpperCase(), margin, yPos);
      yPos += 2;
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, margin + contentWidth, yPos);
      yPos += 5;
    };

    // Header
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    const nameWidth = doc.getTextWidth(d.personal.name.toUpperCase());
    doc.text(d.personal.name.toUpperCase(), (pageWidth - nameWidth) / 2, yPos);
    yPos += 8;

    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    const contactInfo = `${d.personal.location} | ${d.personal.phone} | ${d.personal.email}`;
    const contactWidth = doc.getTextWidth(contactInfo);
    doc.text(contactInfo, (pageWidth - contactWidth) / 2, yPos);
    yPos += 5;

    // Education
    addSectionTitle(this.currentLang() === 'es' ? 'Educación' : 'Education');
    d.education.forEach(edu => {
         doc.setFont('times', 'bold');
         doc.text(edu.degree, margin, yPos);
         yPos += 5;
         doc.setFont('times', 'italic');
         doc.text(`${edu.institution} (${edu.year})`, margin, yPos);
         yPos += 6;
    });

    // Experience
    if (d.experience.length > 0) {
        addSectionTitle(this.currentLang() === 'es' ? 'Experiencia' : 'Experience');
        d.experience.forEach(exp => {
            doc.setFont('times', 'bold');
            doc.text(exp.company, margin, yPos);
            doc.setFont('times', 'normal');
            const durWidth = doc.getTextWidth(exp.duration);
            doc.text(exp.duration, pageWidth - margin - durWidth, yPos);
            yPos += 5;
            doc.setFont('times', 'italic');
            doc.text(exp.role, margin, yPos);
            yPos += 5;
            const desc = doc.splitTextToSize(exp.description, contentWidth);
            doc.text(desc, margin, yPos);
            yPos += (desc.length * 5) + 3;
        });
    }

    // Projects
    addSectionTitle(this.currentLang() === 'es' ? 'Proyectos' : 'Projects');
    d.projects.forEach(p => {
        if (yPos > 260) { doc.addPage(); yPos = 20; }
        doc.setFont('times', 'bold');
        doc.text(p.title, margin, yPos);
        yPos += 5;
        doc.setFont('times', 'normal');
        const descLines = doc.splitTextToSize(`• ${p.description}`, contentWidth - 5);
        doc.text(descLines, margin + 2, yPos);
        yPos += (descLines.length * 5) + 3;
    });

    doc.save(`CV_Zeinab_Muslumani_${this.currentLang()}.pdf`);
  }

  // --- ADMIN AUTH ---
  triggerAdminAuth() {
    this.showLoginModal.set(true);
    this.loginError.set(null);
    this.loginPassword.set('');
    this.loginEmail.set('');
  }

  closeLogin() {
    this.showLoginModal.set(false);
  }

  async attemptLogin() {
    this.isLoggingIn.set(true);
    try {
      await this.supabase.signIn(this.loginEmail(), this.loginPassword());
      this.openAdminPanel();
      this.closeLogin();
    } catch (error: any) {
      // Fallback
      try {
        const { session } = await this.supabase.signUp(this.loginEmail(), this.loginPassword());
        if (session) {
           this.openAdminPanel();
           this.closeLogin();
        } else {
           this.loginError.set('Verifica credenciales.');
        }
      } catch (signupError) {
         this.loginError.set('Credenciales inválidas.');
      }
    } finally {
      this.isLoggingIn.set(false);
    }
  }

  openAdminPanel() {
    // Clone DB data for editing
    this.editData.set(JSON.parse(JSON.stringify(this.dbData())));
    this.showAdminPanel.set(true);
  }

  closeAdminPanel() {
    this.showAdminPanel.set(false);
  }

  async saveChanges() {
    this.isSaving.set(true);
    try {
      const currentEdit = this.editData();
      await Promise.all([
        this.supabase.updateProfile(currentEdit.personal),
        this.supabase.syncEducation(currentEdit.education || []),
        this.supabase.syncProjects(currentEdit.projects),
        this.supabase.syncSkills(currentEdit.skills),
        this.supabase.syncExperience(currentEdit.experience || []),
        this.supabase.syncSoftwares(currentEdit.softwares || []),
        this.supabase.syncQRCodes(currentEdit.qrCodes || [])
      ]);
      
      this.dbData.set(currentEdit); // Update local raw data
      this.closeAdminPanel();
      alert('Cambios guardados / Changes saved!');
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      this.isSaving.set(false);
    }
  }

  onAdminFileSelected(event: Event, type: 'profile' | 'project' | 'software' | 'qr', index?: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const currentEdit = this.editData();
        if (type === 'profile') currentEdit.personal.photoUrl = result;
        else if (type === 'project' && index !== undefined) currentEdit.projects[index].image = result;
        else if (type === 'software' && index !== undefined) currentEdit.softwares[index].imageUrl = result;
        else if (type === 'qr' && index !== undefined) currentEdit.qrCodes[index].imageUrl = result;
        this.editData.set({ ...currentEdit });
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  // --- CRUD Helpers ---
  addEducation() {
     this.editData.update(d => { 
       if(!d.education) d.education = [];
       d.education.unshift({ institution: 'New Institute', degree_es: 'Título', degree_en: 'Degree', year: '2024' }); 
       return {...d}; 
     });
  }
  removeEducation(i: number) { this.editData.update(d => { d.education.splice(i, 1); return {...d}; }); }

  addProject() {
    const current = this.editData();
    current.projects.unshift({ title_es: 'Nuevo', title_en: 'New', description_es: 'Desc', description_en: 'Desc', tags: [], image: 'https://picsum.photos/400', link: '' });
    this.editData.set({ ...current });
  }
  removeProject(i: number) { this.editData.update(d => { d.projects.splice(i, 1); return {...d}; }); }

  addSkill() {
    this.editData.update(d => { d.skills.push({ name_es: 'Skill', name_en: 'Skill', icon: '' }); return {...d}; });
  }
  removeSkill(i: number) { this.editData.update(d => { d.skills.splice(i, 1); return {...d}; }); }

  addExperience() {
    this.editData.update(d => { d.experience.unshift({ company: 'Co', role_es: 'Rol', role_en: 'Role', duration_es: '2024', duration_en: '2024', description_es: '', description_en: '' }); return {...d}; });
  }
  removeExperience(i: number) { this.editData.update(d => { d.experience.splice(i, 1); return {...d}; }); }
  
  addSoftware() { this.editData.update(d => { if(!d.softwares) d.softwares=[]; d.softwares.push({ name: 'App', imageUrl: '' }); return {...d}; }); }
  removeSoftware(i: number) { this.editData.update(d => { d.softwares.splice(i, 1); return {...d}; }); }

  addQRCode() { this.editData.update(d => { if(!d.qrCodes) d.qrCodes=[]; d.qrCodes.push({ platform_es: 'Red', platform_en: 'Net', imageUrl: '', link: '' }); return {...d}; }); }
  removeQRCode(i: number) { this.editData.update(d => { d.qrCodes.splice(i, 1); return {...d}; }); }

  updateProjectTags(index: number, tagsString: string) {
    this.editData.update(d => { d.projects[index].tags = tagsString.split(',').map(t=>t.trim()); return {...d}; });
  }
}
